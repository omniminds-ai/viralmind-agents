import {
  Button,
  Key,
  Point,
  Region,
  centerOf,
  keyboard,
  mouse,
  sleep,
  straightTo,
} from '@computer-use/nut-js';
import Big from 'big.js';
import { clipboard } from 'electron';
import OpenAI from 'openai';
import { ActionInputs, PredictionParsed } from '../../shared/types.js';

export const FACTOR = 1000;
export const MAX_PIXELS = 1350 * 28 * 28;
export const CONTROL_POINTS = 8; // Fixed number of control points for each spline

const prompt = `You are a GUI agent. You are given a task and your action history, with screenshots. You need to perform the next action to complete the task.

## Output Format
\`\`\`
Thought: ...
Action: ...
\`\`\`

## Action Space
click(start_box='[x1, y1, x2, y2]')
left_double(start_box='[x1, y1, x2, y2]')
right_single(start_box='[x1, y1, x2, y2]')
drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')
hotkey(key='')
type(content='') #If you want to submit your input, use "\\n" at the end of \`content\`.
scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')
wait() #Sleep for 5s and take a screenshot to check for any changes.
finished()
call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help.


## Note
- Use English in \`Thought\` part.
- Write a small plan and finally summarize your next action (with its target element) in one sentence in \`Thought\` part.

## User Instruction
`;



// B-spline curve helper functions
function bsplineBasis(t: number, degree: number, i: number, knots: number[]): number {
  if (degree === 0) {
    return (t >= knots[i] && t < knots[i + 1]) ? 1 : 0;
  }
  
  let w1 = 0, w2 = 0;
  
  if (knots[i + degree] - knots[i] !== 0) {
    w1 = ((t - knots[i]) / (knots[i + degree] - knots[i])) * 
         bsplineBasis(t, degree - 1, i, knots);
  }
  
  if (knots[i + degree + 1] - knots[i + 1] !== 0) {
    w2 = ((knots[i + degree + 1] - t) / (knots[i + degree + 1] - knots[i + 1])) * 
         bsplineBasis(t, degree - 1, i + 1, knots);
  }
  
  return w1 + w2;
}

function generateBsplinePoints(controlPoints: [number, number][], numPoints = 100): [number, number][] {
  const degree = 3;
  const n = controlPoints.length - 1;
  
  // Generate knot vector
  const knots: number[] = [];
  for (let i = 0; i <= n + degree + 1; i++) {
    knots.push(i);
  }
  
  const curvePoints: [number, number][] = [];
  const tStart = knots[degree];
  const tEnd = knots[n + 1];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = tStart + (i / numPoints) * (tEnd - tStart);
    let x = 0, y = 0;
    
    for (let j = 0; j <= n; j++) {
      const basis = bsplineBasis(t, degree, j, knots);
      x += controlPoints[j][0] * basis;
      y += controlPoints[j][1] * basis;
    }
    
    curvePoints.push([x, y]);
  }
  
  return curvePoints;
}

// Normalize control points to have exactly CONTROL_POINTS points
function normalizeControlPoints(points: [number, number][]): [number, number][] {
  // if (points.length === CONTROL_POINTS) {
  //   return points;
  // }
  
  const normalized: [number, number][] = [];
  for (let i = 0; i < CONTROL_POINTS; i++) {
    const index = (i / (CONTROL_POINTS - 1)) * (points.length - 1);
    const lower = Math.floor(index);
    const upper = Math.min(lower + 1, points.length - 1);
    const fraction = index - lower;
    
    const x = points[lower][0] * (1 - fraction) + points[upper][0] * fraction;
    const y = points[lower][1] * (1 - fraction) + points[upper][1] * fraction;
    normalized.push([x, y]);
  }
  
  return normalized;
}

/**
 * boxStr convert to screen coords
 * @param boxStr box string (format: "[x1,y1,x2,y2]" or "[x,y]")
 * @param width screen width
 * @param height screen height
 * @returns calculated center point coords {x, y}
 */
export function parseBoxToScreenCoords(
  boxStr: string,
  width: number,
  height: number,
): { x: number; y: number } {
  const coords = boxStr
    .replace('[', '')
    .replace(']', '')
    .split(',')
    .map((num) => parseFloat(num.trim()));

  const [x1, y1, x2 = x1, y2 = y1] = coords;

  return {
    x: Math.round(((x1 + x2) / 2) * width * FACTOR) / FACTOR,
    y: Math.round(((y1 + y2) / 2) * height * FACTOR) / FACTOR,
  };
}

const moveStraightTo = async (startX: number | null, startY: number | null) => {
  if (startX === null || startY === null) {
    return;
  }
  await mouse.move(straightTo(new Point(startX, startY)));
};

const parseBoxToScreenCoordsWithScaleFactor = ({
  boxStr,
  screenWidth,
  screenHeight,
  scaleFactor,
}: {
  boxStr: string;
  screenWidth: number;
  screenHeight: number;
  scaleFactor: number;
}) => {
  const { x: _x, y: _y } = boxStr
    ? parseBoxToScreenCoords(boxStr, screenWidth, screenHeight)
    : { x: null, y: null };

  const x = _x ? _x * scaleFactor : null;
  const y = _y ? _y * scaleFactor : null;
  return {
    x,
    y,
  };
};

function parseAction(actionStr: string) {
  try {
    const functionPattern = /^(\w+)\((.*)\)$/;
    const match = actionStr.trim().match(functionPattern);

    if (!match) {
      throw new Error('Not a function call');
    }

    const [_, functionName, argsStr] = match;
    const kwargs: Record<string, string> = {};

    if (argsStr.trim()) {
      // Handle quoted strings with possible newlines
      const regex = /([^=,]+)=(?:'([^']*)'|"([^"]*)"|\[([^\]]*)\]|([^,]*))/g;
      let argMatch;
      
      while ((argMatch = regex.exec(argsStr)) !== null) {
        const key = argMatch[1].trim();
        // Get the first non-undefined capture group (quoted or unquoted value)
        const value = argMatch.slice(2).find(v => v !== undefined) || '';
        
        kwargs[key] = value.replace(/\\n/g, '\n'); // Convert \n string to actual newline
      }
    }

    return {
      function: functionName,
      args: kwargs,
    };
  } catch (e) {
    console.error(`Failed to parse action '${actionStr}': ${e}`);
    return null;
  }
}

function parseActionVlm(text: string, factor = 1000): PredictionParsed[] {
  let reflection: string | null = null;
  let thought: string | null = null;
  let actionStr = '';

  text = text.trim();

  // Parse thought/reflection based on different text patterns
  if (text.startsWith('Thought:')) {
    const thoughtMatch = text.match(/Thought: ([\s\S]+?)(?=\s*Action:|$)/);
    if (thoughtMatch) {
      thought = thoughtMatch[1].trim();
    }
  } else if (text.startsWith('Reflection:')) {
    const reflectionMatch = text.match(
      /Reflection: ([\s\S]+?)Action_Summary: ([\s\S]+?)(?=\s*Action:|$)/,
    );
    if (reflectionMatch) {
      thought = reflectionMatch[2].trim();
      reflection = reflectionMatch[1].trim();
    }
  } else if (text.startsWith('Action_Summary:')) {
    const summaryMatch = text.match(/Action_Summary: (.+?)(?=\s*Action:|$)/);
    if (summaryMatch) {
      thought = summaryMatch[1].trim();
    }
  }

  // Extract content from markdown code blocks if present
  const codeBlockMatch = text.match(/```[\s\S]*?```/g);
  if (codeBlockMatch) {
    // Get the last code block (which should contain the action)
    const lastCodeBlock = codeBlockMatch[codeBlockMatch.length - 1];
    // Remove the ``` markers
    text = lastCodeBlock.replace(/```/g, '').trim();
  }

  // Extract action from the text
  const actionMatch = text.match(/Action:[ \t]*\n?\s*([\s\S]*?)(?=\n\s*(?:```|$)|$)/);
  if (actionMatch) {
    actionStr = actionMatch[1].trim();
  } else {
    // If no Action: prefix found, try to find a function call directly
    const functionMatch = text.match(/\b\w+\([^)]*\)/);
    if (functionMatch) {
      actionStr = functionMatch[0].trim();
    } else {
      // If no function call found, use the entire text
      actionStr = text.trim();
    }
  }

  // Parse actions
  const allActions = actionStr.split('\n\n');
  const actions: PredictionParsed[] = [];

  for (const rawStr of allActions) {
    const actionInstance = parseAction(rawStr.trimStart());
    if (!actionInstance) {
      console.log(`Action can't parse: ${rawStr}`);
      continue;
    }

    const actionType = actionInstance.function;
    const params = actionInstance.args;
    const actionInputs: ActionInputs = {};

    for (const [paramName, param] of Object.entries(params)) {
      if (!param) continue;
      const trimmedParam = param.trim();
      actionInputs[paramName.trim()] = trimmedParam;

      if (paramName.includes('start_box') || paramName.includes('end_box')) {
        const oriBox = trimmedParam;
        // Remove parentheses and split
        const numbers = oriBox.replace(/[()[\]]/g, '').split(',');

        // Convert to float and scale
        const floatNumbers = numbers.map(
          (num: string) => Number.parseFloat(num) / factor,
        );

        if (floatNumbers.length === 2) {
          floatNumbers.push(floatNumbers[0], floatNumbers[1]);
        }

        actionInputs[paramName.trim()] = JSON.stringify(floatNumbers);
      }
    }

    actions.push({
      reflection: reflection || '',
      thought: thought || '',
      action_type: actionType,
      action_inputs: actionInputs,
    });
  }

  return actions;
}

export interface Prediction {
  action_type: string;
  action_inputs: ActionInputs;
  reflection?: string;
  thought?: string;
}

export interface ExecuteParams {
  scaleFactor?: number;
  prediction: Prediction;
  screenWidth: number;
  screenHeight: number;
  logger?: Console;
}

import type { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type Message = ChatCompletionMessageParam & {
  content: string | ChatCompletionContentPart[];
};

export class UIModel {
  private client: OpenAI;
  private model: string;
  private messages: Message[] = [];
  private MAX_HISTORY = 10;

  constructor(client: OpenAI, model: string) {
    this.client = client;
    this.model = model;
  }

  private addMessage(message: Message) {
    // For existing messages in history, keep only text content
    if (this.messages.length > 0) {
      this.messages = this.messages.map(msg => {
        if (Array.isArray(msg.content)) {
          // Keep only text parts, remove image parts
          const textContent = (msg.content as ChatCompletionContentPart[])
            .filter(part => part.type === 'text')
            .map(part => ({
              type: 'text',
              text: (part as { text: string }).text
            }));
            
          return {
            ...msg,
            content: textContent.length === 0 ? '' : textContent
          } as Message;
        }
        return msg;
      });
    }

    // Add new message
    this.messages.push(message);

    // Keep last MAX_HISTORY messages
    if (this.messages.length > this.MAX_HISTORY) {
      this.messages = this.messages.slice(-this.MAX_HISTORY);
    }
  }

  async generate(message: string, base64Image: string): Promise<PredictionParsed[]> {
    console.log('[UIModel] Generating predictions for message:', message);
    
    // Add user message to history with system prompt prefix
    this.addMessage({
      role: 'user',
      content: [
        { type: 'text', text: prompt + message },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
          },
        },
      ]
    });
  
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: this.messages,
      max_tokens: 500,
    });
  
    const content = response.choices[0]?.message?.content || '';
    console.log('[UIModel] Raw model response:', content);
    const predictions = parseActionVlm(content);
    console.log('[UIModel] Parsed predictions:', predictions);
  
    // Add assistant response to history
    this.addMessage({
      role: 'assistant',
      content: content
    });
  
    return predictions;
  }
  async runAgentLoop(
    message: string, 
    base64Image: string, 
    onPrediction: (prediction: PredictionParsed) => Promise<void>,
    getScreenshot: () => Promise<string>
  ) {
    console.log('[UIModel] Starting agent loop');
    const MAX_ACTIONS = 8;
    let actionCount = 0;
    let currentImage = base64Image;
    
    try {
      while (actionCount < MAX_ACTIONS) {
        console.log(`[UIModel] Action ${actionCount + 1}/${MAX_ACTIONS}`);
        const predictions = await this.generate(message, currentImage);
        
        // Execute first prediction
        if (predictions.length > 0) {
          const prediction = predictions[0];
          console.log('[UIModel] Executing prediction:', prediction);
          
          // Call the callback with the prediction
          await onPrediction(prediction);
          actionCount++;

          // If it's a finished or call_user action, stop the loop
          if (prediction.action_type === 'finished' || prediction.action_type === 'call_user') {
            console.log('[UIModel] Agent loop finished:', prediction.action_type);
            break;
          }

          // Get new screenshot for next iteration
          currentImage = await getScreenshot();
        } else {
          console.log('[UIModel] No predictions returned');
          break;
        }
      }

      if (actionCount >= MAX_ACTIONS) {
        console.log('[UIModel] Reached max actions limit');
      }
    } catch (error) {
      console.error('[UIModel] Agent loop error:', error);
      throw error;
    }
  }

  async execute(executeParams: ExecuteParams) {
    const {
      prediction,
      screenWidth,
      screenHeight,
      logger = console,
      scaleFactor = 1,
    } = executeParams;

    logger.info(
      '[execute] executeParams',
      JSON.stringify({
        scaleFactor,
        prediction,
        screenWidth,
        screenHeight,
      }),
    );

    const { action_type, action_inputs } = prediction;

    const startBoxStr = action_inputs?.start_box || '';

    logger.info('[execute] action_type', action_type, 'startBoxStr', startBoxStr);

    const { x: startX, y: startY } = parseBoxToScreenCoordsWithScaleFactor({
      boxStr: startBoxStr,
      screenWidth,
      screenHeight,
      scaleFactor,
    });

    logger.info(`[execute] [Position] (${startX}, ${startY})`);

    // execute configs
    mouse.config.mouseSpeed = 1500;

    // if (startBoxStr) {
    //   const region = await nutScreen.highlight(
    //     new Region(startX, startY, 100, 100),
    //   );
    //   logger.info('[execute] [Region]', region);
    // }

    switch (action_type) {
      case 'wait':
        logger.info('[device] wait', action_inputs);
        await sleep(1000);
        break;

      case 'mouse_move':
      case 'hover':
        logger.info('[device] mouse_move');
        await moveStraightTo(startX, startY);
        break;

      case 'click':
      case 'left_click':
      case 'left_single':
        logger.info('[device] left_click');
        await moveStraightTo(startX, startY);
        await sleep(100);
        await mouse.click(Button.LEFT);
        break;

      case 'left_double':
      case 'double_click':
        logger.info(`[device] ${action_type}(${startX}, ${startY})`);
        await moveStraightTo(startX, startY);
        await sleep(100);
        await mouse.doubleClick(Button.LEFT);
        break;

      case 'right_click':
      case 'right_single':
        logger.info('[device] right_click');
        await moveStraightTo(startX, startY);
        await sleep(100);
        await mouse.click(Button.RIGHT);
        break;

      case 'middle_click':
        logger.info('[device] middle_click');
        await moveStraightTo(startX, startY);
        await mouse.click(Button.MIDDLE);
        break;

      case 'left_click_drag':
      case 'drag':
      case 'select': {
        logger.info('[device] drag', action_inputs);
        // end_box
        if (action_inputs?.end_box) {
          const { x: endX, y: endY } = parseBoxToScreenCoordsWithScaleFactor({
            boxStr: action_inputs.end_box,
            screenWidth,
            screenHeight,
            scaleFactor,
          });

          if (startX && startY && endX && endY) {
            // calculate x and y direction difference
            const diffX = Big(endX).minus(startX).toNumber();
            const diffY = Big(endY).minus(startY).toNumber();

            await mouse.drag(
              straightTo(centerOf(new Region(startX, startY, diffX, diffY))),
            );
          }
        }
        break;
      }
      
      case 'spline_drag': {
        logger.info('[device] spline_drag', action_inputs);
        const controlPointsStr = action_inputs?.control_points;
        
        if (controlPointsStr) {
          const controlPoints: [number, number][] = JSON.parse(controlPointsStr).map(
            (point: string) => {
              const coords = parseBoxToScreenCoords(point, screenWidth, screenHeight);
              return [coords.x * scaleFactor, coords.y * scaleFactor];
            }
          );

          // Generate curve points from control points
          const curvePoints = generateBsplinePoints(controlPoints);
          
          // Move to start position
          await moveStraightTo(curvePoints[0][0], curvePoints[0][1]);
          await mouse.pressButton(Button.LEFT);
          
          // Follow the curve
          for (const [x, y] of curvePoints.slice(1)) {
            await moveStraightTo(x, y);
            await sleep(10); // Small delay for smoother drawing
          }
          
          await mouse.releaseButton(Button.LEFT);
        }
        break;
      }

      case 'type': {
        const content = action_inputs?.content?.trim();
        logger.info('[device] type', content);
        if (content) {
          const stripContent = content.replace(/\\n$/, '').replace(/\n$/, '');
          keyboard.config.autoDelayMs = 0;
          if (process.platform === 'win32') {
            const originalClipboard = clipboard.readText();
            clipboard.writeText(stripContent);
            await keyboard.pressKey(Key.LeftControl, Key.V);
            await keyboard.releaseKey(Key.LeftControl, Key.V);
            await sleep(500);
            clipboard.writeText(originalClipboard);
          } else {
            await keyboard.type(stripContent);
          }

          if (content.endsWith('\n') || content.endsWith('\\n')) {
            await keyboard.pressKey(Key.Enter);
            await keyboard.releaseKey(Key.Enter);
          }

          keyboard.config.autoDelayMs = 500;
        }
        break;
      }

      case 'hotkey': {
        const keyStr = action_inputs?.key || action_inputs?.hotkey;
        if (keyStr) {
          const keyMap: Record<string, Key> = {
            return: Key.Enter,
            enter: Key.Enter,
            ctrl: Key.LeftControl,
            shift: Key.LeftShift,
            alt: Key.LeftAlt,
            space: Key.Space,
            'page down': Key.PageDown,
            pagedown: Key.PageDown,
            'page up': Key.PageUp,
            pageup: Key.PageUp,
          };

          const keys = keyStr
            .split(/[\s+]/)
            .map((k: string) => keyMap[k.toLowerCase()] || Key[k as keyof typeof Key]);
          logger.info('[hotkey]: ', keys);
          await keyboard.pressKey(...keys);
          await keyboard.releaseKey(...keys);
        }
        break;
      }

      case 'scroll': {
        const { direction } = action_inputs || {};
        // if startX and startY is not null, move mouse to startX, startY
        if (startX !== null && startY !== null) {
          await moveStraightTo(startX, startY);
        }

        switch (direction?.toLowerCase()) {
          case 'up':
            await mouse.scrollUp(5 * 100);
            break;
          case 'down':
            await mouse.scrollDown(5 * 100);
            break;
          default:
            console.warn(`Unsupported scroll direction: ${direction}`);
        }
        break;
      }

      case 'call_user':
      case 'finished':
        break;

      default:
        logger.warn(`Unsupported action: ${action_type}`);
    }
  }
}