import json

def fix_treks():
    try:
        with open('data/treks.json', 'r') as f:
            content = f.read()
        
        # Manual cleanup of the broken parts identified in the previous read
        # The sed commands likely left it in a weird state
        # Let's try to reconstruct a valid list by finding all objects
        
        # First, let's fix the specific "imageFilename": "whw" missing comma
        content = content.replace('"imageFilename": "whw"\n', '"imageFilename": "whw",\n')
        
        # Fix potential double commas or comma before closing brace
        import re
        content = re.sub(r',\s*}', '}', content)
        content = re.sub(r',\s*,', ',', content)
        
        # Now try to parse it. If it fails, we'll do a more aggressive recovery.
        try:
            data = json.loads(content)
            # Remove duplicates by ID
            seen = set()
            unique_data = []
            for item in data:
                if item['id'] not in seen:
                    unique_data.append(item)
                    seen.add(item['id'])
            
            with open('data/treks.json', 'w') as f:
                json.dump(unique_data, f, indent=2)
            print("Successfully fixed and deduplicated JSON")
        except json.JSONDecodeError as e:
            print(f"JSON still invalid: {e}")
            # Fallback: try to find all { ... } blocks that look like treks
            # This is risky but might recover most data
            blocks = re.findall(r'\{[^{}]+\}', content, re.DOTALL)
            recovered = []
            for block in blocks:
                try:
                    # Clean up the block to make it valid JSON
                    block_clean = re.sub(r',\s*}', '}', block)
                    item = json.loads(block_clean)
                    if 'id' in item and item['id'] not in seen:
                        recovered.append(item)
                        seen.add(item['id'])
                except:
                    continue
            
            if recovered:
                with open('data/treks.json', 'w') as f:
                    json.dump(recovered, f, indent=2)
                print(f"Recovered {len(recovered)} treks")
            else:
                print("Failed to recover any treks")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_treks()
