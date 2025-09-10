
import json
import csv

assets_file_path = "C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\assets.json"
east_csv_path = "C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_Recce_Pan India.xlsx - East.csv"
west_csv_path = "C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_Recce_Pan India.xlsx - West.csv"

# Read existing assets
with open(assets_file_path, 'r', encoding='utf-8') as f:
    assets_data = json.load(f)

existing_space_codes = {asset.get('spaceCode') for asset in assets_data}

def process_csv(csv_path, assets_data, existing_space_codes):
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            space_code = row.get('Space Code')
            if space_code and space_code not in existing_space_codes:
                new_asset = {
                    "id": len(assets_data) + 1,
                    "zone": row.get('Zone'),
                    "grade": row.get('Grade'),
                    "storeName": row.get('Store Name'),
                    "spaceCode": space_code,
                    "width": row.get('W'),
                    "height": row.get('H'),
                    "material": row.get('Material'),
                    "depth": row.get('D'),
                    "qty": row.get('Qty'),
                    "cost": row.get('Cost'),
                    "level": row.get('Level'),
                    "inventoryMedium": row.get('Inventory Medium'),
                    "inventoryType": row.get('Inventory Type'),
                    "location": row.get('Location'),
                    "category": row.get('Category'),
                    "beautySOHType": "",
                    "image": ""
                }
                assets_data.append(new_asset)
                existing_space_codes.add(space_code)

process_csv(east_csv_path, assets_data, existing_space_codes)
process_csv(west_csv_path, assets_data, existing_space_codes)

with open(assets_file_path, 'w', encoding='utf-8') as f:
    json.dump(assets_data, f, indent=4)

print("Successfully merged CSV data into assets.json")
