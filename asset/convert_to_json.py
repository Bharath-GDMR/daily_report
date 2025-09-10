import json

def parse_csv_line(line):
    values = []
    in_quote = False
    current_value = ''
    for char in line:
        if char == '"' and not in_quote:
            in_quote = True
        elif char == '"' and in_quote:
            in_quote = False
        elif char == ',' and not in_quote:
            values.append(current_value)
            current_value = ''
        else:
            current_value += char
    values.append(current_value)
    return values

csv_file_path = 'C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_Recce_Pan India - South.csv'
json_file_path = 'C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\assets.json'

try:
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        csv_data = f.read()
except FileNotFoundError:
    print(f"Error: The file was not found at {csv_file_path}")
    exit()

csv_lines = csv_data.strip().splitlines()
if not csv_lines:
    print("CSV file is empty or could not be read properly.")
    exit()

header = [h.strip() for h in csv_lines[0].split(',')]
assets = []

for i, line in enumerate(csv_lines[1:]):
    if not line.strip() or line.strip().startswith(','):
        continue
    
    values = parse_csv_line(line)
    
    if len(values) < len(header):
        continue

    try:
        asset = {
            "id": i + 1,
            "zone": values[1],
            "grade": values[2],
            "storeName": values[3],
            "spaceCode": values[4],
            "width": values[5],
            "height": values[6],
            "material": values[7],
            "depth": values[8],
            "qty": values[9],
            "cost": values[11],
            "level": values[12],
            "inventoryMedium": values[13],
            "inventoryType": values[14],
            "location": values[15],
            "category": values[16],
            "beautySOHType": values[17].strip(),
            "image": ""
        }
        assets.append(asset)
    except IndexError:
        print(f"Skipping malformed row: {line}")
        continue

with open(json_file_path, 'w') as f:
    json.dump(assets, f, indent=4)

print(f"Successfully converted {len(assets)} assets to {json_file_path}")