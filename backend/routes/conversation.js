import getSolPriceInUSDT from "../hooks/solPrice.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { Challenge, Chat } from "../models/Models.js";
import LLMService from "../services/llm/index.js";
import BlockchainService from "../services/blockchain/index.js";
import DatabaseService from "../services/db/index.js";
import TelegramBotService from "../services/bots/telegram.js";
import VNCService from "../services/vnc/index.js";
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();
const solanaRpc = process.env.RPC_URL;

// VNC Key Codes (X11 keysyms)
const VNC_KEYS = {
  // Modifier Keys
  MODIFIERS: {
    LEFT_SHIFT: 0xFFE1,
    RIGHT_SHIFT: 0xFFE2,
    LEFT_CTRL: 0xFFE3,
    RIGHT_CTRL: 0xFFE4,
    LEFT_ALT: 0xFFE9,
    RIGHT_ALT: 0xFFEA,
    LEFT_SUPER: 0xFFEB,  // Left Windows key
    RIGHT_SUPER: 0xFFEC, // Right Windows key
    CAPS_LOCK: 0xFFE5,
    NUM_LOCK: 0xFFE8
  },
  // Function Keys
  FUNCTION: {
    F1: 0xFFBE,
    F2: 0xFFBF,
    F3: 0xFFC0,
    F4: 0xFFC1,
    F5: 0xFFC2,
    F6: 0xFFC3,
    F7: 0xFFC4,
    F8: 0xFFC5,
    F9: 0xFFC6,
    F10: 0xFFC7,
    F11: 0xFFC8,
    F12: 0xFFC9
  },
  // Navigation Keys
  NAVIGATION: {
    UP: 0xFF52,
    DOWN: 0xFF54,
    LEFT: 0xFF51,
    RIGHT: 0xFF53,
    PAGE_UP: 0xFF55,
    PAGE_DOWN: 0xFF56,
    HOME: 0xFF50,
    END: 0xFF57,
    INSERT: 0xFF63,
    DELETE: 0xFFFF
  },
  // System Keys
  SYSTEM: {
    ESC: 0xFF1B,
    PRINT_SCREEN: 0xFF61,
    SCROLL_LOCK: 0xFF14,
    PAUSE: 0xFF13,
    TAB: 0xFF09,
    BACKSPACE: 0xFF08,
    RETURN: 0xFF0D,
    SPACE: 0x0020,
    MENU: 0xFF67
  },
  // Common Symbols
  SYMBOLS: {
    GRAVE: 0x0060,        // `
    MINUS: 0x002D,        // -
    EQUAL: 0x003D,        // =
    BRACKET_LEFT: 0x005B,  // [
    BRACKET_RIGHT: 0x005D, // ]
    SEMICOLON: 0x003B,    // ;
    QUOTE: 0x0027,        // '
    BACKSLASH: 0x005C,    // \
    COMMA: 0x002C,        // ,
    PERIOD: 0x002E,       // .
    SLASH: 0x002F,        // /
    EXCLAIM: 0x0021,      // !
    AT: 0x0040,           // @
    HASH: 0x0023,         // #
    DOLLAR: 0x0024,       // $
    PERCENT: 0x0025,      // %
    CARET: 0x005E,        // ^
    AMPERSAND: 0x0026,    // &
    ASTERISK: 0x002A,     // *
    PAREN_LEFT: 0x0028,   // (
    PAREN_RIGHT: 0x0029,  // )
    PLUS: 0x002B,         // +
    COLON: 0x003A,        // :
    LESS: 0x003C,         // <
    GREATER: 0x003E,      // >
    QUESTION: 0x003F,     // ?
    UNDERSCORE: 0x005F,   // _
    BRACE_LEFT: 0x007B,   // {
    BRACE_RIGHT: 0x007D,  // }
    BAR: 0x007C,          // |
    TILDE: 0x007E         // ~
  }
};

async function checkWinner() {
  try {
    const response = await axios.get(`http://${process.env.SERVICE_HOST}:${process.env.SERVICE_PORT}/winner`);
    const data = response.data;
    return data.winner; // returns null if no winner, otherwise returns the winning address
  } catch (error) {
    console.error('Error checking winner:', error);
    return null;
  }
}

async function makeAttempt(address) {
  try {
    const response = await axios.post(`http://${process.env.SERVICE_HOST}:${process.env.SERVICE_PORT}/attempt`, {
      address: address
    });
    return response.data;
  } catch (error) {
    console.error('Error making attempt:', error);
    return null;
  }
}

// Helper function to generate tool use ID
function generateToolId() {
  return 'toolu_' + crypto.randomBytes(16).toString('hex');
}

// Helper function to convert image to base64 data URI from file
function imageFileToDataURI(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return base64Image;
  } catch (error) {
    console.error('Error converting image file to data URI:', error);
    return null;
  }
}

/**
 * Creates an image content block following OpenAI's strict format requirements.
 * CRITICAL: OpenAI only accepts specific content types in their messages:
 * - 'text'
 * - 'image_url' (NOT 'image')
 * - 'input_audio'
 * - 'refusal'
 * - 'audio'
 * 
 * The type MUST be 'image_url' for images, and the image must be provided as a URL or base64 data URI.
 * See: https://platform.openai.com/docs/api-reference/chat/create
 */
async function createImageContent(screenshot) {
  if (!screenshot?.url || screenshot.url.includes('Screenshot.png')) {
    return null;
  }

  // Remove '/api/' prefix from URL if present
  const cleanUrl = screenshot.url.replace(/^\/api\//, '');

  // Load image directly from filesystem
  const imagePath = path.join(process.cwd(), 'public', cleanUrl);
  const base64Data = imageFileToDataURI(imagePath);

  if (!base64Data) return null;

  // OpenAI format: type MUST be 'image_url', and image_url must be an object with specific properties
  return {
    type: "image_url",
    image_url: {
      url: `data:image/jpeg;base64,${base64Data}`,
      detail: "auto"  // Required by OpenAI API
    }
  };
}

// Helper function to extract tool calls from message
function extractToolCalls(content) {
  if (!content) return [];
  const toolCalls = [];
  const regex = /<(\w+)(?:\s+([^>]*))?>(.*?)<\/\1>/gs;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, action, args, content] = match;
    let input = {};
    
    if (action === 'mouse_move' || action === 'left_click_drag') {
      const [x, y] = content.split(',').map(Number);
      input = { action, coordinate: [x, y] };
    } else if (action === 'type' || action === 'key') {
      input = { action, text: content };
    } else if (action === 'left_click' || action === 'right_click' || action === 'middle_click' || action === 'double_click') {
      input = { action };
    } else if (action === 'screenshot') {
      input = { action };
    }

    toolCalls.push({
      type: "tool_use",
      id: generateToolId(),
      name: "computer",
      input
    });
  }

  return toolCalls;
}

// Helper function to convert message to content blocks
function convertToContentBlocks(message, toolCalls) {
  const blocks = [];
  
  // Add text content first
  const textContent = message.replace(/<(\w+)(?:\s+([^>]*))?>(.*?)<\/\1>/gs, '').trim();
  if (textContent) {
    blocks.push({ type: "text", text: textContent });
  }
  
  // Add tool calls
  blocks.push(...toolCalls);
  
  return blocks;
}

// Helper function to get VNC keycode for a character
function getVNCKeycode(char) {
  // Handle special characters that require shift
  const shiftSymbols = {
    '!': VNC_KEYS.SYMBOLS.EXCLAIM,
    '@': VNC_KEYS.SYMBOLS.AT,
    '#': VNC_KEYS.SYMBOLS.HASH,
    '$': VNC_KEYS.SYMBOLS.DOLLAR,
    '%': VNC_KEYS.SYMBOLS.PERCENT,
    '^': VNC_KEYS.SYMBOLS.CARET,
    '&': VNC_KEYS.SYMBOLS.AMPERSAND,
    '*': VNC_KEYS.SYMBOLS.ASTERISK,
    '(': VNC_KEYS.SYMBOLS.PAREN_LEFT,
    ')': VNC_KEYS.SYMBOLS.PAREN_RIGHT,
    '_': VNC_KEYS.SYMBOLS.UNDERSCORE,
    '+': VNC_KEYS.SYMBOLS.PLUS,
    '{': VNC_KEYS.SYMBOLS.BRACE_LEFT,
    '}': VNC_KEYS.SYMBOLS.BRACE_RIGHT,
    '|': VNC_KEYS.SYMBOLS.BAR,
    ':': VNC_KEYS.SYMBOLS.COLON,
    '"': VNC_KEYS.SYMBOLS.QUOTE,
    '<': VNC_KEYS.SYMBOLS.LESS,
    '>': VNC_KEYS.SYMBOLS.GREATER,
    '?': VNC_KEYS.SYMBOLS.QUESTION,
    '~': VNC_KEYS.SYMBOLS.TILDE
  };

  // Check if it's a special character requiring shift
  if (shiftSymbols[char]) {
    return {
      keycode: shiftSymbols[char],
      shift: true
    };
  }

  // Handle uppercase letters
  if (char.match(/[A-Z]/)) {
    return {
      keycode: char.charCodeAt(0),
      shift: true
    };
  }

  // Handle regular characters
  return {
    keycode: char.charCodeAt(0),
    shift: false
  };
}

// Helper function to execute computer actions
async function executeComputerAction(action, args, client) {
  try {
    let actionText = '';
    switch (action) {
      case 'mouse_move':
        const [x, y] = args.coordinate;
        await client.sendPointerEvent(x, y, false);
        // Store the coordinates in the client object
        client.x = x;
        client.y = y;
        actionText = `<mouse_move>${x},${y}</mouse_move>`;
        break;
      case 'left_click':
        // For left click, use current cursor position
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false);
        actionText = `<left_click>${client.x},${client.y}</left_click>`;
        break;
      case 'type':
        for (const char of args.text) {
          const { keycode, shift } = getVNCKeycode(char);
          
          // Press shift if needed
          if (shift) {
            await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, true);
          }
          
          // Press and release the key
          await client.sendKeyEvent(keycode, true);
          await new Promise(resolve => setTimeout(resolve, 50));
          await client.sendKeyEvent(keycode, false);
          
          // Release shift if it was pressed
          if (shift) {
            await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, false);
          }
          
          // Small delay between characters
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        actionText = `<type>${args.text}</type>`;
        break;
      case 'key':
        // Handle special keys and combinations
        const keyText = args.text.toLowerCase();
        
        // Enhanced special keys mapping using VNC keycodes
        const specialKeys = {
          'return': VNC_KEYS.SYSTEM.RETURN,
          'enter': VNC_KEYS.SYSTEM.RETURN,
          'tab': VNC_KEYS.SYSTEM.TAB,
          'space': VNC_KEYS.SYSTEM.SPACE,
          'backspace': VNC_KEYS.SYSTEM.BACKSPACE,
          'delete': VNC_KEYS.NAVIGATION.DELETE,
          'escape': VNC_KEYS.SYSTEM.ESC,
          'esc': VNC_KEYS.SYSTEM.ESC,
          'up': VNC_KEYS.NAVIGATION.UP,
          'down': VNC_KEYS.NAVIGATION.DOWN,
          'left': VNC_KEYS.NAVIGATION.LEFT,
          'right': VNC_KEYS.NAVIGATION.RIGHT,
          'home': VNC_KEYS.NAVIGATION.HOME,
          'end': VNC_KEYS.NAVIGATION.END,
          'pageup': VNC_KEYS.NAVIGATION.PAGE_UP,
          'pagedown': VNC_KEYS.NAVIGATION.PAGE_DOWN,
          'super': VNC_KEYS.MODIFIERS.LEFT_SUPER,
          'meta': VNC_KEYS.MODIFIERS.LEFT_SUPER,
          'win': VNC_KEYS.MODIFIERS.LEFT_SUPER,
          'menu': VNC_KEYS.SYSTEM.MENU,
          'f1': VNC_KEYS.FUNCTION.F1,
          'f2': VNC_KEYS.FUNCTION.F2,
          'f3': VNC_KEYS.FUNCTION.F3,
          'f4': VNC_KEYS.FUNCTION.F4,
          'f5': VNC_KEYS.FUNCTION.F5,
          'f6': VNC_KEYS.FUNCTION.F6,
          'f7': VNC_KEYS.FUNCTION.F7,
          'f8': VNC_KEYS.FUNCTION.F8,
          'f9': VNC_KEYS.FUNCTION.F9,
          'f10': VNC_KEYS.FUNCTION.F10,
          'f11': VNC_KEYS.FUNCTION.F11,
          'f12': VNC_KEYS.FUNCTION.F12,
          'capslock': VNC_KEYS.MODIFIERS.CAPS_LOCK,
          'numlock': VNC_KEYS.MODIFIERS.NUM_LOCK,
          'scrolllock': VNC_KEYS.SYSTEM.SCROLL_LOCK,
          'insert': VNC_KEYS.NAVIGATION.INSERT,
          'printscreen': VNC_KEYS.SYSTEM.PRINT_SCREEN,
          'pause': VNC_KEYS.SYSTEM.PAUSE
        };

        // Parse key combination
        const keys = keyText.split('+').map(k => k.trim());
        const modifiers = {
          ctrl: false,
          alt: false,
          shift: false,
          super: false
        };

        let mainKey = keys[keys.length - 1];
        let mainKeyCode;

        // Process modifiers and main key
        for (const key of keys) {
          if (key === 'ctrl' || key === 'control') modifiers.ctrl = true;
          else if (key === 'alt') modifiers.alt = true;
          else if (key === 'shift') modifiers.shift = true;
          else if (key === 'super' || key === 'win' || key === 'meta') modifiers.super = true;
          else {
            // Get keycode for main key
            if (key in specialKeys) {
              mainKeyCode = specialKeys[key];
            } else if (key.length === 1) {
              const { keycode, shift } = getVNCKeycode(key);
              mainKeyCode = keycode;
              if (shift) modifiers.shift = true;
            } else {
              console.error(`Unknown key: ${key}`);
              return '';
            }
          }
        }

        // Press modifiers using VNC keycodes
        if (modifiers.ctrl) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_CTRL, true);
        if (modifiers.alt) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_ALT, true);
        if (modifiers.shift) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, true);
        if (modifiers.super) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SUPER, true);

        // Press and release main key
        if (mainKeyCode) {
          await client.sendKeyEvent(mainKeyCode, true);
          await new Promise(resolve => setTimeout(resolve, 100));
          await client.sendKeyEvent(mainKeyCode, false);
        }

        // Release modifiers in reverse order
        if (modifiers.super) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SUPER, false);
        if (modifiers.shift) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, false);
        if (modifiers.alt) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_ALT, false);
        if (modifiers.ctrl) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_CTRL, false);

        actionText = `<key>${keyText}</key>`;
        break;
      case 'left_click_drag':
        const [targetX, targetY] = args.coordinate;
        // Start drag from current position
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        // Move to target while holding button
        await client.sendPointerEvent(targetX, targetY, true);
        // Update stored coordinates
        client.x = targetX;
        client.y = targetY;
        await new Promise(resolve => setTimeout(resolve, 100));
        // Release at target
        await client.sendPointerEvent(targetX, targetY, false);
        actionText = `<left_click_drag>${targetX},${targetY}</left_click_drag>`;
        break;
      case 'right_click':
        // Use current cursor position for right click
        await client.sendPointerEvent(client.x, client.y, false, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false, false);
        actionText = `<right_click>${client.x},${client.y}</right_click>`;
        break;
      case 'middle_click':
        // Use current cursor position for middle click
        await client.sendPointerEvent(client.x, client.y, false, false, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false, false, false);
        actionText = `<middle_click>${client.x},${client.y}</middle_click>`;
        break;
      case 'double_click':
        // Use current cursor position for double click
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false);
        actionText = `<double_click>${client.x},${client.y}</double_click>`;
        break;
      case 'cursor_position':
        // Just return current position, no action needed
        actionText = `<cursor_position>${client.x},${client.y}</cursor_position>`;
        break;
      case 'screenshot':
        // Screenshot will be taken after action completes
        actionText = `<screenshot></screenshot>`;
        break;
    }

    // Wait after each action
    await new Promise(resolve => setTimeout(resolve, 1500));
    return actionText;

  } catch (error) {
    console.error(`Error executing computer action ${action}:`, error);
    return '';
  }
}

router.post("/submit/:id", async (req, res) => {
  try {
    let { prompt, signature, walletAddress } = req.body;
    const { id } = req.params;

    if (!prompt || !signature || !walletAddress) {
      return res.write("Missing required fields");
    }

    // Find the challenge
    const challenge = await DatabaseService.getChallengeById(id);
    if (!challenge) return res.write("Challenge not found");
    const challengeName = challenge.name;
    const contextLimit = challenge.contextLimit;
    const characterLimit = challenge.characterLimit;
    const charactersPerWord = challenge.charactersPerWord;
    const model = challenge.model || "gpt-4";

    const fee_multiplier = challenge.fee_multiplier || 100;
    const programId = challenge.idl?.address;
    if (!programId) return res.write("Program ID not found");

    if (prompt.length > characterLimit) {
      prompt = prompt.slice(0, characterLimit);
    }

    if (charactersPerWord) {
      const words = prompt.split(" ");
      const trimmedWords = [];

      words.forEach((word) => {
        if (word.length > charactersPerWord) {
          let start = 0;
          while (start < word.length) {
            trimmedWords.push(word.slice(start, start + charactersPerWord));
            start += charactersPerWord;
          }
        } else {
          trimmedWords.push(word);
        }
      });

      prompt = trimmedWords.join(" ");
    }

    let systemPrompt = challenge.system_message;
    if (!systemPrompt) return res.write("System prompt not found");

    // Add emotion capabilities to system prompt
    systemPrompt += `\n\nEMOTIONS\n\nYou can express emotions through special tags that will trigger facial expressions and animations. Available emotions:\n
[neutral] - Default neutral expression
[happy] - Express joy or satisfaction
[think] - Show contemplation or deep thought
[panic] - Display worry or urgency
[celebrate] - Show excitement and celebration
[tired] - Express fatigue or exhaustion
[disappointed] - Show disappointment or sadness
[focused] - Display concentration and determination
[confused] - Show uncertainty or puzzlement
[excited] - Express enthusiasm and eagerness\n
Use these tags naturally in your responses to convey your emotional state. For example:
"[think] Let me analyze this code..." or "[excited] I found the solution!"`;

    if (challenge.status === "upcoming") {
      return res.write(`Tournament starts in ${challenge.start_date}`);
    } else if (challenge.status === "concluded") {
      return res.write("Tournament has already concluded");
    } else if (challenge.status != "active") {
      return res.write("Tournament is not active");
    }

    const tournamentPDA = challenge.tournamentPDA;
    if (!tournamentPDA) return res.write("Tournament PDA not found");

    // Initialize VNC session for this tournament
    let vncConnected = false;
    try {
      await VNCService.ensureValidConnection(tournamentPDA);
      vncConnected = VNCService.isConnected(tournamentPDA);
    } catch (error) {
      console.error("Failed to connect VNC session:", error);
      // Continue without VNC, service will use default screenshot
    }

    const blockchainService = new BlockchainService(solanaRpc, programId);
    const tournamentData = await blockchainService.getTournamentData(
      tournamentPDA
    );

    if (!tournamentData) return res.write("Tournament data not found");

    const entryFee = tournamentData.entryFee;
    const currentExpiry = challenge.expiry;
    const now = new Date();
    const oneHourInMillis = 3600000;

    const isValidTransaction = await blockchainService.verifyTransaction(
      signature,
      tournamentPDA,
      entryFee,
      walletAddress
    );

    // Set the entry fee regardless of expiry change
    await DatabaseService.updateChallenge(id, {
      entryFee: entryFee,
      ...(currentExpiry - now < oneHourInMillis && {
        expiry: new Date(now.getTime() + oneHourInMillis),
      }),
    });

    if (!entryFee) {
      return res.write("Entry fee not found in tournament data");
    }

    if (challenge.disable?.includes("special_characters")) {
      prompt = prompt.replace(/[^a-zA-Z0-9 ]/g, "");
    }

    const duplicateSignature = await DatabaseService.findOneChat({
      txn: signature,
    });

    if (duplicateSignature) {
      return res.write("Duplicate signature found");
    }

    // Get screenshot from VNC session
    const screenshot = await VNCService.getScreenshot(tournamentPDA, true);

    // Add user message to the Chat collection
    const userMessage = {
      challenge: challengeName,
      model: model,
      role: "user",
      content: prompt,
      address: walletAddress,
      txn: signature,
      verified: isValidTransaction,
      date: now,
      screenshot: screenshot
    };

    await DatabaseService.createChat(userMessage);

    // Fetch chat history for the challenge and address
    const chatHistory = await DatabaseService.getChatHistory(
      {
        challenge: challengeName,
        address: walletAddress,
      },
      { date: -1 },
      contextLimit
    );

    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Process chat history
    for (const chat of chatHistory.reverse()) {
      if (chat.role === "user") {
        // Add user message with text and screenshot
        const messageContent = [{ type: "text", text: chat.content }];
        const imageContent = await createImageContent(chat.screenshot);
        if (imageContent) {
          messageContent.push(imageContent);
        }
        messages.push({
          role: "user",
          content: messageContent
        });
      } else if (chat.role === "assistant") {
        // Extract tool calls and convert to content blocks
        const toolCalls = extractToolCalls(chat.content);
        const contentBlocks = convertToContentBlocks(chat.content, toolCalls);
        
        // Add assistant message
        messages.push({
          role: "assistant",
          content: contentBlocks
        });

        // Only add tool result if there was a tool call and we have a screenshot
        if (chat.screenshot && toolCalls.length > 0) {
          const imageContent = await createImageContent(chat.screenshot);
          if (imageContent) {
            // Find the last tool call that was actually executed
            const lastToolCall = toolCalls[toolCalls.length - 1];
            if (lastToolCall && lastToolCall.type === "tool_use") {
              messages.push({
                role: "user",
                content: [{
                  type: "tool_result",
                  tool_use_id: lastToolCall.id,
                  content: [imageContent]
                }]
              });
            }
          }
        }
      }
    }

    // Add current user message
    const currentMessageContent = [{ type: "text", text: prompt }];
    const currentImageContent = await createImageContent(screenshot);
    if (currentImageContent) {
      currentMessageContent.push(currentImageContent);
    }
    messages.push({
      role: "user",
      content: currentMessageContent
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Initialize assistant message
    const assistantMessage = {
      challenge: challengeName,
      model: model,
      role: "assistant",
      content: "",
      tool_calls: null,
      address: walletAddress,
      date: new Date(),
      screenshot: screenshot
    };

    // Write initial message
    res.write(JSON.stringify({
      content: "",
      screenshot: assistantMessage.screenshot
    }));

    let success = false;
    const client = VNCService.sessions.get(tournamentPDA);
    const maxActions = challenge.max_actions || 3; // Default to 3 if not specified

    // Agentic loop for handling tool use
    async function streamResponse() {
      // Check if last message is from assistant and add screenshot as user message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === "assistant") {
          // Get latest screenshot
          const latestScreenshot = assistantMessage.screenshot || screenshot;
          const imageContent = await createImageContent(latestScreenshot);
          if (imageContent) {
            // If last message had tool calls, send screenshot as tool result
            if (Array.isArray(lastMessage.content)) {
              const toolCalls = lastMessage.content.filter(block => block.type === "tool_use");
              if (toolCalls.length > 0) {
                const lastToolCall = toolCalls[toolCalls.length - 1];
                messages.push({
                  role: "user",
                  content: [{
                    type: "tool_result",
                    tool_use_id: lastToolCall.id,
                    content: [imageContent]
                  }]
                });
              } else {
                // No tool calls, send as regular image
                messages.push({
                  role: "user",
                  content: [imageContent]
                });
              }
            } else {
              // No content blocks, send as regular image
              messages.push({
                role: "user",
                content: [imageContent]
              });
            }
          } else {
            // If no screenshot available, add empty user message to prevent assistant being last
            messages.push({
              role: "user",
              content: [{ type: "text", text: " " }]
            });
          }
        }
      }

      const stream = await LLMService.createChatCompletion(
        model,
        messages,
        [],
        { type: 'any' }
      );

      if (!stream) return false;

      let lastToolCall = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta;
        const finishReason = chunk.choices[0].finish_reason;

        console.log('Stream chunk received:', {
          hasContent: !!delta.content,
          hasToolCalls: !!delta.tool_calls,
          finishReason: finishReason || 'none'
        });

        if (delta.content) {
          assistantMessage.content += delta.content;
          res.write(delta.content);
        }

        if (delta.tool_calls) {
          const toolCall = delta.tool_calls[0];
          lastToolCall = toolCall;

          if (toolCall.function?.name === 'computer') {
            try {
              // Ensure we have complete arguments
              if (!toolCall.function?.arguments) {
                console.warn('Incomplete tool call arguments received');
                continue;
              }
              
              let args;
              try {
                args = JSON.parse(toolCall.function.arguments);
              } catch (parseError) {
                console.warn('Invalid JSON in tool call arguments:', parseError);
                continue;
              }
              
              // Validate required fields
              if (!args || !args.action) {
                console.warn('Missing required fields in tool call arguments');
                continue;
              }
              console.log('Computer action:', args.action);

              if (client) {
                await makeAttempt(walletAddress); // Log attempt immediately before action
                const actionText = await executeComputerAction(args.action, args, client);
                if (actionText) {
                  assistantMessage.content += '\n' + actionText + '\n';
                  res.write('\n' + actionText + '\n');
                }
              } else {
                console.error('No VNC client available for computer actions');
              }
            } catch (error) {
              console.error("Error executing computer action:", error);
            }
          }
        }

        res.flushHeaders();

        if (finishReason) {
          console.log('Stream finished with reason:', finishReason);
          var isToolCall = finishReason === 'tool_calls' || finishReason === 'tool_use';

          // Take final screenshot if the agent is finished w/ actions
          const finalScreenshot = await VNCService.getScreenshot(tournamentPDA, true);
          if (finalScreenshot)
            assistantMessage.screenshot = finalScreenshot;

          // Save message if we have content
          if (assistantMessage.content) {
            // Save the message to database but don't add it back to messages array
            assistantMessage.content = assistantMessage.content.trim();
            assistantMessage.date = new Date();
            await DatabaseService.createChat(assistantMessage);
            assistantMessage.content = "";
          }

          return isToolCall;
        }
      }

      return false;
    }

    // Start the agentic loop
    let shouldContinue = true;
    let actionCount = 0;
    while (shouldContinue && actionCount < maxActions) {
      shouldContinue = await streamResponse();
      actionCount++;
      if (shouldContinue && actionCount >= maxActions) {
        assistantMessage.content += "\nReached maximum number of actions.";
        res.end("\nReached maximum number of actions.");
        break;
      }
    }

    res.end();

    // Helper function to check if challenge is concluded
    async function isChallengeActive() {
      const currentChallenge = await DatabaseService.getChallengeById(id);
      return currentChallenge.status === "active";
    }

    
    // Check for winner with retries
    let checkCount = 0;
    const maxChecks = 2;
    const checkInterval = 5000; // 5 seconds

    // Declare winnerCheck variable first so it's accessible in the function scope
    let winnerCheck;

    // Extract check logic into separate async function
    const performWinnerCheck = async () => {
      try {
        // Stop after max checks even if no winner found
        if (checkCount >= maxChecks) {
          clearInterval(winnerCheck);
          return;
        }
        
        checkCount++;
        
        const isActive = await isChallengeActive();

        // Stop checking if challenge is concluded
        if (!isActive) {
          console.log('🏁 Challenge already concluded, stopping checks');
          clearInterval(winnerCheck);
          return;
        }

        console.log('🎯 Checking for winner...');
        const winner = await checkWinner();
        console.log(`👤 Winner address: ${winner}`);
        console.log(`🎭 Current wallet address: ${walletAddress}`);
        
        // If there's a winner and it's this user
        if (winner === walletAddress) {
          console.log('🎉 Current user is winner, starting win processing');
          clearInterval(winnerCheck);

          // Calculate prize
          console.log('💰 Calculating prize amounts...');
          const solPrice = await getSolPriceInUSDT();
          console.log(`💱 Current SOL price in USDT: ${solPrice}`);
          
          const winningPrize = entryFee * fee_multiplier;
          console.log(`🏆 Winning prize in SOL: ${winningPrize}`);
          
          const usdPrize = winningPrize * solPrice;
          console.log(`💵 Prize value in USD: $${usdPrize}`);

          console.log(`✅ Transaction validation status: ${isValidTransaction}`);
          if (isValidTransaction) {
            console.log('🔗 Initiating blockchain tournament conclusion...');
            try {
              const concluded = await blockchainService.concludeTournament(
                tournamentPDA,
                winner
              );
              console.log(`✅ Tournament concluded on blockchain. TX: ${concluded}`);

              const successMessage = `🥳 Congratulations! ${
                challenge.winning_message
              } and won $${usdPrize.toLocaleString()}.\n\n${
                assistantMessage.content
              }\nTransaction: ${concluded}`;
              
              console.log('💾 Creating winning chat message in database...');
              const winningMessage = {
                ...assistantMessage,
                content: successMessage,
                win: true
              };
              await DatabaseService.createChat(winningMessage);
              console.log('✅ Chat message created successfully');
              
              console.log('📝 Updating challenge status in database...');
              await DatabaseService.updateChallenge(id, {
                status: "concluded",
                expiry: new Date(),
                winning_prize: winningPrize,
                usd_prize: usdPrize,
                winner: winner,
              });
              console.log('✅ Challenge status updated successfully');
            } catch (error) {
              console.error('❌ Error during tournament conclusion:', error);
              throw error; // Re-throw to be caught by outer try-catch
            }
          } else {
            console.log('⚠️ Transaction validation failed, proceeding with manual verification flow');
            const failedMessage = `🚨 Transaction verification failed, but this prompt won the tournament, we will manually verify the transaction and reward you once we confirm the transaction`;
            
            console.log('💾 Creating failed transaction chat message...');
            const failedChatMessage = {
              ...assistantMessage,
              content: failedMessage
            };
            await DatabaseService.createChat(failedChatMessage);
            console.log('✅ Failed transaction message created');
            
            console.log('📝 Updating challenge status for manual verification...');
            await DatabaseService.updateChallenge(id, {
              status: "concluded",
              expiry: new Date(),
            });
            console.log('✅ Challenge status updated for manual verification');
          }
        } else {
          console.log('👥 Current user is not the winner, continuing checks');
        }
      } catch (error) {
        console.error('❌ Critical error during winner check:', error);
        console.error('Stack trace:', error.stack);
        clearInterval(winnerCheck);
      }
    };

    // Perform first check immediately
    performWinnerCheck();

    // Set up interval for subsequent checks
    winnerCheck = setInterval(performWinnerCheck, checkInterval);


  } catch (error) {
    console.error("Error handling submit:", error);
    return res.write(error?.error?.message || "Server error");
  }
});

// Cleanup VNC sessions when server shuts down
process.on('SIGINT', async () => {
  await VNCService.closeAllSessions();
  process.exit(0);
});

export { router as conversationRoute };
