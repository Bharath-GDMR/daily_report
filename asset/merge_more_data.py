
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

assets_json_path = 'C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\assets.json'
csv_files = [
    'C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_Recce_Pan India.xlsx - East.csv',
    'C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_Recce_Pan India.xlsx - North.csv',
    'C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_Recce_Pan India.xlsx - West.csv'
]

# Load existing assets
try:
    with open(assets_json_path, 'r', encoding='utf-8') as f:
        assets = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    assets = []

# Find the last id
last_id = 0
if assets:
    last_id = max(asset.get('id', 0) for asset in assets)

for csv_file_path in csv_files:
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            csv_data = f.read()
    except FileNotFoundError:
        print(f"Warning: File not found, skipping: {csv_file_path}")
        continue

    csv_lines = csv_data.strip().splitlines()
    if not csv_lines:
        continue

    header = [h.strip() for h in csv_lines[0].split(',')]
    
    for line in csv_lines[1:]:
        if not line.strip() or line.strip().startswith(','):
            continue
        
        values = parse_csv_line(line)
        
        if len(values) < len(header):
            continue

        last_id += 1
        try:
            asset = {
                "id": last_id,
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
            print(f"Skipping malformed row in {csv_file_path}: {line}")
            last_id -= 1 # revert id increment
            continue

with open(assets_json_path, 'w') as f:
    json.dump(assets, f, indent=4)

print(f"Successfully merged data into {assets_json_path}. Total assets: {len(assets)}")
