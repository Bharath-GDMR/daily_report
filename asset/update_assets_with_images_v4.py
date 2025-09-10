
import json
import os
import re

assets_file_path = "C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\assets.json"
images_base_path = "C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_PICTURE_DOCKET"

with open(assets_file_path, 'r') as f:
    assets_data = json.load(f)

for root, dirs, files in os.walk(images_base_path):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            space_code_from_filename = os.path.splitext(file)[0]

            # Handle suffixes like (1), (2), etc.
            space_code_from_filename = re.sub(r'\(\d+\)$', '', space_code_from_filename)

            # Handle cases like '269SFV2 A'
            space_code_from_filename = space_code_from_filename.split(' ')[0]

            # Simple direct match
            for asset in assets_data:
                if asset.get("spaceCode") == space_code_from_filename:
                    relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                    asset["image"] = "SSL_PICTURE_DOCKET" + relative_path

            # Handle ranges like 16V3-4.jpg
            if '-' in space_code_from_filename:
                parts = space_code_from_filename.split('-')
                if len(parts) == 2:
                    match = re.match(r"([a-zA-Z0-9_]+?)([0-9]+)$", parts[0])
                    if match:
                        prefix = match.group(1)
                        start_num_str = match.group(2)
                        end_num_str = parts[1]
                        if start_num_str.isdigit() and end_num_str.isdigit():
                            start_num = int(start_num_str)
                            end_num = int(end_num_str)
                            for i in range(start_num, end_num + 1):
                                space_code_to_find = f"{prefix}{i}"
                                for asset in assets_data:
                                    if asset.get("spaceCode") == space_code_to_find:
                                        relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                                        asset["image"] = "SSL_PICTURE_DOCKET" + relative_path

with open(assets_file_path, 'w') as f:
    json.dump(assets_data, f, indent=4)

print("assets.json has been updated with image paths (v4).")
