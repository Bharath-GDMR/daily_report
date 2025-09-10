
import json

# Load existing store data
with open('C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\stores.json', 'r') as f:
    store_data = json.load(f)

# Read CSV data
with open('C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_Recce_Pan India - South.csv', 'r') as f:
    csv_data = f.read()

csv_lines = csv_data.strip().split('\r\n')
header = [h.strip() for h in csv_lines[0].split(',')]
try:
    store_name_index = header.index('Store Name')
    space_code_index = header.index('Space Code')
    w_index = header.index('W')
    h_index = header.index('H')
    d_index = header.index('D')
    material_index = header.index('Material')
    inventory_medium_index = header.index('Inventory Medium')
    location_index = header.index('Location')
    category_index = header.index('Category')
except ValueError as e:
    print(f"Error: Missing expected column in CSV header - {e}")
    exit()

new_store_code_counter = 300
processed_stores = {}

for line in csv_lines[1:]:
    if not line.strip() or line.strip().startswith(','):
        continue
    
    values = line.split(',')
    
    if len(values) < len(header):
        continue

    store_name = values[store_name_index].strip()
    space_code = values[space_code_index].strip()

    if not store_name or not space_code:
        continue

    if store_name not in processed_stores:
        existing_store_code = None
        for fmt in store_data:
            for code, store in store_data[fmt].items():
                if store['name'] == store_name:
                    existing_store_code = code
                    break
            if existing_store_code:
                break
        
        if existing_store_code:
             processed_stores[store_name] = existing_store_code
             store_code = existing_store_code
        else:
            store_code = str(new_store_code_counter)
            new_store_code_counter += 1
            processed_stores[store_name] = store_code
            store_data['shoppers'][store_code] = {
                "name": store_name,
                "address": "",
                "phone": "",
                "manager": "",
                "email": "",
                "assets": []
            }
    else:
        store_code = processed_stores[store_name]

    width = values[w_index].strip().replace("''", '"')
    height = values[h_index].strip().replace("''", '"')
    depth = values[d_index].strip().replace("''", '"')

    asset = {
        "id": space_code,
        "type": values[inventory_medium_index].strip(),
        "title": values[category_index].strip(),
        "size": f"{width} x {height}",
        "location": values[location_index].strip(),
        "status": "Active",
        "installation": "",
        "maintenance": "",
        "image": None,
        "measurements": {
            "width": width,
            "height": height,
            "depth": depth,
            "material": values[material_index].strip()
        }
    }
    
    store_format = None
    for fmt, stores in store_data.items():
        if store_code in stores:
            store_format = fmt
            break
    
    if store_format:
        store_data[store_format][store_code]['assets'].append(asset)

with open('C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\stores.json', 'w') as f:
    json.dump(store_data, f, indent=4)

print("Successfully updated stores.json")
