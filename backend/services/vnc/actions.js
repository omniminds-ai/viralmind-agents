import { VNC_KEYS } from './keys.js';

// Helper function to get VNC keycode for a character
export function getVNCKeycode(char) {
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
export async function executeComputerAction(action, args, client) {
  if (!client) {
    throw new Error('No VNC client available for computer actions');
  }

  try {
    switch (action) {
      case 'mouse_move':
        const [x, y] = args.coordinate;
        await client.sendPointerEvent(x, y, false);
        client.x = x;
        client.y = y;
        return `<mouse_move>${x},${y}</mouse_move>`;

      case 'left_click':
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false);
        return `<left_click>${client.x},${client.y}</left_click>`;

      case 'type':
        for (const char of args.text) {
          const { keycode, shift } = getVNCKeycode(char);
          
          if (shift) {
            await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, true);
          }
          
          await client.sendKeyEvent(keycode, true);
          await new Promise(resolve => setTimeout(resolve, 50));
          await client.sendKeyEvent(keycode, false);
          
          if (shift) {
            await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, false);
          }
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        return `<type>${args.text}</type>`;

      case 'key':
        const keyText = args.text.toLowerCase();
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
          'page_up': VNC_KEYS.NAVIGATION.PAGE_UP,
          'page_down': VNC_KEYS.NAVIGATION.PAGE_DOWN,
          'super': VNC_KEYS.MODIFIERS.LEFT_SUPER,
          'super_l': VNC_KEYS.MODIFIERS.LEFT_SUPER,
          'meta': VNC_KEYS.MODIFIERS.LEFT_SUPER,
          'win': VNC_KEYS.MODIFIERS.LEFT_SUPER,
          'menu': VNC_KEYS.SYSTEM.MENU,
          ...Object.fromEntries(
            Array.from({ length: 12 }, (_, i) => [`f${i + 1}`, VNC_KEYS.FUNCTION[`F${i + 1}`]])
          )
        };

        const keys = keyText.split('+').map(k => k.trim());
        const modifiers = {
          ctrl: false,
          alt: false,
          shift: false,
          super: false
        };

        let mainKey = keys[keys.length - 1];
        let mainKeyCode;

        for (const key of keys) {
          if (key === 'ctrl' || key === 'control') modifiers.ctrl = true;
          else if (key === 'alt') modifiers.alt = true;
          else if (key === 'shift') modifiers.shift = true;
          else if (key === 'super' || key === 'win' || key === 'meta') modifiers.super = true;
          else {
            if (key in specialKeys) {
              mainKeyCode = specialKeys[key];
            } else if (key.length === 1) {
              const { keycode, shift } = getVNCKeycode(key);
              mainKeyCode = keycode;
              if (shift) modifiers.shift = true;
            } else {
              console.warn(`Unknown key encountered: ${key} - skipping this key`);
              return `<warning>Unknown key: ${key} was skipped</warning>`;
            }
          }
        }

        try {
          // Press modifier keys
          if (modifiers.ctrl) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_CTRL, true);
          if (modifiers.alt) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_ALT, true);
          if (modifiers.shift) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, true);
          if (modifiers.super) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SUPER, true);

          // Press and release main key if we have one
          if (mainKeyCode) {
            await client.sendKeyEvent(mainKeyCode, true);
            await new Promise(resolve => setTimeout(resolve, 100));
            await client.sendKeyEvent(mainKeyCode, false);
          }
        } catch (err) {
          console.error('Failed to send key event:', err);
          return `<error>Failed to send key event: ${err.message}</error>`;
        } finally {
          // Always try to release modifier keys to prevent them getting stuck
          try {
            if (modifiers.super) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SUPER, false);
            if (modifiers.shift) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_SHIFT, false);
            if (modifiers.alt) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_ALT, false);
            if (modifiers.ctrl) await client.sendKeyEvent(VNC_KEYS.MODIFIERS.LEFT_CTRL, false);
          } catch (err) {
            console.error('Failed to release modifier keys:', err);
          }
        }

        return `<key>${keyText}</key>`;

      case 'left_click_drag':
        const [targetX, targetY] = args.coordinate;
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(targetX, targetY, true);
        client.x = targetX;
        client.y = targetY;
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(targetX, targetY, false);
        return `<left_click_drag>${targetX},${targetY}</left_click_drag>`;

      case 'right_click':
        await client.sendPointerEvent(client.x, client.y, false, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false, false);
        return `<right_click>${client.x},${client.y}</right_click>`;

      case 'middle_click':
        await client.sendPointerEvent(client.x, client.y, false, false, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false, false, false);
        return `<middle_click>${client.x},${client.y}</middle_click>`;

      case 'double_click':
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await client.sendPointerEvent(client.x, client.y, false);
        return `<double_click>${client.x},${client.y}</double_click>`;

      case 'cursor_position':
        return `<cursor_position>${client.x},${client.y}</cursor_position>`;

      case 'screenshot':
        return `<screenshot></screenshot>`;

      default:
        throw new Error(`Unknown computer action: ${action}`);
    }
  } catch (error) {
    console.error(`Error executing computer action ${action}:`, error);
    throw error;
  }
}
