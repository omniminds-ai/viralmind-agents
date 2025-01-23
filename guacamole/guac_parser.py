import json
import re
from collections import defaultdict
import argparse

def parse_length_prefix(text):
    """Parse a length-prefixed string in Guacamole format."""
    match = re.match(r'^(\d+)\.(.*)', text)
    if not match:
        return None, text
    length = int(match.group(1))
    remaining = match.group(2)
    if len(remaining) < length:
        return None, text
    value = remaining[:length]
    rest = remaining[length:]
    return value, rest

def parse_guac_instruction(instruction):
    """Parse a single Guacamole instruction."""
    if not instruction:
        return None
        
    # Split instruction into parts
    parts = instruction.split(',')
    if not parts:
        return None
    
    # Parse opcode with length prefix
    opcode, _ = parse_length_prefix(parts[0])
    if not opcode:
        return None
        
    # Parse arguments
    args = []
    for part in parts[1:]:
        if not part:
            continue
        arg, _ = parse_length_prefix(part)
        if arg is not None:
            args.append(arg)
    
    return {
        'opcode': opcode,
        'args': args
    }

def extract_input_events(filename):
    """Extract keyboard and mouse events from a Guacamole recording file."""
    events = defaultdict(list)
    
    try:
        print(f"Attempting to open file: {filename}")
        with open(filename, 'rb') as f:
            content = f.read()
            try:
                text = content.decode('utf-8')
            except UnicodeDecodeError:
                print("Failed UTF-8 decode, trying ISO-8859-1")
                text = content.decode('iso-8859-1')
            
            # Split by semicolon for instructions
            instructions = text.split(';')
            print(f"Found {len(instructions)} instructions")
            
            instruction_count = 0
            for instruction in instructions:
                if not instruction.strip():
                    continue
                    
                parsed = parse_guac_instruction(instruction.strip())
                if not parsed:
                    continue
                
                opcode = parsed['opcode']
                args = parsed['args']
                
                instruction_count += 1
                if instruction_count <= 5 or instruction_count % 100 == 0:
                    print(f"Instruction {instruction_count}: {opcode} with {len(args)} args")
                
                # Handle different input events
                if opcode == 'key' and len(args) >= 2:
                    events['keyboard'].append({
                        'type': 'key',
                        'keysym': args[0],
                        'pressed': args[1] == '1',
                        'timestamp': args[2] if len(args) > 2 else None
                    })
                
                elif opcode == 'mouse' and len(args) >= 3:
                    events['mouse'].append({
                        'type': 'mouse',
                        'x': args[0],
                        'y': args[1],
                        'button_mask': args[2],
                        'timestamp': args[3] if len(args) > 3 else None
                    })
                    
                elif opcode == 'scroll' and len(args) >= 2:
                    events['scroll'].append({
                        'type': 'scroll',
                        'x': args[0],
                        'y': args[1],
                        'timestamp': args[2] if len(args) > 2 else None
                    })
            
            print(f"\nFound events:")
            for event_type, event_list in events.items():
                print(f"{event_type}: {len(event_list)} events")
                if event_list:
                    print(f"Sample {event_type} event: {event_list[0]}")
    
    except Exception as e:
        import traceback
        print(f"Error processing file: {str(e)}")
        print("\nFull traceback:")
        traceback.print_exc()
        return None
    
    return events

def save_events(events, output_filename):
    """Save extracted events to a JSON file."""
    with open(output_filename, 'w') as f:
        json.dump(events, f, indent=2)

def main():
    parser = argparse.ArgumentParser(description='Parse Guacamole recording file for input events')
    parser.add_argument('input_file', help='Path to the input .guac file')
    parser.add_argument('-o', '--output', default='input_events.json',
                      help='Output JSON file path (default: input_events.json)')
    parser.add_argument('-v', '--verbose', action='store_true',
                      help='Print verbose debugging information')
    
    args = parser.parse_args()
    
    print("Extracting input events...")
    events = extract_input_events(args.input_file)
    
    if events:
        save_events(events, args.output)
        print(f"\nEvents saved to {args.output}")
    else:
        print("Failed to extract events")

if __name__ == "__main__":
    main()