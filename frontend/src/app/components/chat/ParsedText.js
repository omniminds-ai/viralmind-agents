import React from "react";
import Image from "next/image";

// Event name constant for emote changes
const EMOTE_CHANGE_EVENT = 'emoteChange';

export function ParsedText({ message, screenshot }) {
  // Process emotion tags at component level
  const emoteRegex = /\[(neutral|happy|think|panic|celebrate|tired|disappointed|focused|confused|excited)\]/g;
  const emoteMatch = message.match(emoteRegex);
  const currentEmote = emoteMatch ? emoteMatch[0].slice(1, -1) : null;

  // Handle emote change in useEffect
  React.useEffect(() => {
    if (currentEmote) {
      window.dispatchEvent(new CustomEvent(EMOTE_CHANGE_EVENT, { 
        detail: { emote: currentEmote }
      }));
    }
  }, [currentEmote]);

  const processMessage = (text) => {
    const processed = [];
    let currentText = '';
    let codeBlock = null;
    let language = "";

    // Helper to push accumulated text
    const pushText = () => {
      if (currentText) {
        processed.push({ type: "text", content: currentText.trim() });
        currentText = '';
      }
    };

    // Split message into lines for processing
    const lines = text.split("\n").filter(line => line.trim() !== '');
    
    lines.forEach((line, lineIndex) => {
      if (line.startsWith("```")) {
        pushText();
        if (codeBlock !== null) {
          processed.push({ type: "code", content: codeBlock, language });
          codeBlock = null;
          language = "";
        } else {
          language = line.slice(3).trim();
          codeBlock = "";
        }
        return;
      }
      
      if (codeBlock !== null) {
        codeBlock += line + "\n";
        return;
      }

      // Process the line character by character
      let i = 0;
      while (i < line.length) {
        // Match any computer action tag
        const actionMatch = line.slice(i).match(/<(click|type|scroll_down|scroll_up|mouse_move|left_click|right_click|middle_click|double_click|left_click_drag|key|cursor_position|screenshot)>/);
        
        if (actionMatch) {
          const action = actionMatch[1];
          const startTag = `<${action}>`;
          const endTag = `</${action}>`;
          
          // Find the closing tag
          const endIndex = line.indexOf(endTag, i + startTag.length);
          if (endIndex === -1) {
            currentText += line[i];
            i++;
            continue;
          }
          
          // Extract the value
          const value = line.slice(i + startTag.length, endIndex);
          
          // Push any accumulated text before the tool action
          pushText();
          
          // Push the tool action
          processed.push({
            type: "tool",
            actions: [{ action, value }]
          });
          
          // Skip past the end tag
          i = endIndex + endTag.length;
        } else {
          currentText += line[i];
          i++;
        }
      }
      
      // Add space after line if not last line
      if (lineIndex < lines.length - 1) {
        currentText += ' ';
      }
    });

    // Push any remaining text or code block
    if (codeBlock !== null) {
      processed.push({ type: "code", content: codeBlock, language });
    } else {
      pushText();
    }

    return processed;
  };

  const renderToolAction = (action, value) => {
    switch (action) {
      case 'click':
        return `🖱️ Clicked at coordinates ${value}`;
      case 'type':
        return `⌨️ Typed "${value}"`;
      case 'scroll_down':
        return '⬇️ Scrolled down';
      case 'scroll_up':
        return '⬆️ Scrolled up';
      case 'mouse_move':
        return `🖱️ Moved cursor to coordinates ${value}`;
      case 'left_click':
        return '🖱️ Left clicked';
      case 'right_click':
        return '🖱️ Right clicked';
      case 'middle_click':
        return '🖱️ Middle clicked';
      case 'double_click':
        return '🖱️ Double clicked';
      case 'left_click_drag':
        return `🖱️ Dragged to coordinates ${value}`;
      case 'key':
        return `⌨️ Pressed ${value}`;
      case 'cursor_position':
        return `🖱️ Cursor at coordinates ${value}`;
      case 'screenshot':
        return `👀 Looking at screen`;
      default:
        return `${action}: ${value}`;
    }
  };

  // Remove emotion tags from the message before processing
  const cleanedMessage = message.replace(emoteRegex, '');
  const contentBlocks = processMessage(cleanedMessage);

  return (
    <div className="parsed-text">
      <style jsx>{`
        .parsed-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .screenshot-container {
          margin: 8px 0;
          border-radius: 4px;
          overflow: hidden;
        }

        .code-block-wrapper {
          margin: 8px 0;
          background-color: var(--twitch-gray);
          border-radius: 4px;
          overflow: hidden;
        }

        .code-language {
          padding: 4px 8px;
          background-color: rgba(255,255,255,0.1);
          color: var(--twitch-text-alt);
          font-size: 12px;
        }

        .code-block {
          margin: 0;
          padding: 8px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.4;
          overflow-x: auto;
        }

        .tool-actions {
          margin: 2px 0;
          padding: 2px 8px;
          border-radius: 2px;
          display: block;
          opacity: 0.75;
        }

        .tool-action {
          padding: 2px 8px;
          margin: 2px 0;
          border-radius: 2px;
        }

        /* Mouse actions - Blue */
        .tool-action.click,
        .tool-action.mouse_move,
        .tool-action.left_click,
        .tool-action.right_click,
        .tool-action.middle_click,
        .tool-action.double_click,
        .tool-action.left_click_drag,
        .tool-action.cursor_position {
          background-color: rgba(0, 122, 255, 0.1);
          border-left: 2px solid #007AFF;
        }

        /* Keyboard actions - Yellow */
        .tool-action.type,
        .tool-action.key {
          background-color: rgba(255, 204, 0, 0.1);
          border-left: 2px solid #FFCC00;
        }

        /* Scroll actions - Purple */
        .tool-action.scroll_up,
        .tool-action.scroll_down {
          background-color: rgba(175, 82, 222, 0.1);
          border-left: 2px solid #AF52DE;
        }

        /* Screenshot action - Green */
        .tool-action.screenshot {
          background-color: rgba(52, 199, 89, 0.1);
          border-left: 2px solid #34C759;
        }

        .text-line {
          line-height: 1.5;
          word-wrap: break-word;
        }
      `}</style>

      {contentBlocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <div key={index} className="code-block-wrapper">
              {block.language && (
                <div className="code-language">
                  {block.language}
                </div>
              )}
              <pre className="code-block">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        } else if (block.type === "tool") {
          return (
            <span key={index} className="tool-actions">
              {block.actions.map((action, actionIndex) => (
                <div key={actionIndex} className={`tool-action ${action.action}`}>
                  {renderToolAction(action.action, action.value)}
                </div>
              ))}
            </span>
          );
        } else {
          return <span key={index} className="text-line">{block.content}</span>;
        }
      })}
      {screenshot?.url && (
        <div className="screenshot-container">
          <Image 
            src={screenshot.url}
            alt="Screenshot"
            width={600}
            height={400}
            style={{ maxWidth: '100%', height: 'auto' }}
            unoptimized={true}
          />
        </div>
      )}
    </div>
  );
}
