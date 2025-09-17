
import json
import os
import re

assets_file_path = "D:\\GDMR\\GDMR\\Report\\asset\\assets.json"
images_base_path = "D:\\GDMR\\GDMR\\Report\\asset\\SSL_PICTURE_DOCKET"

with open(assets_file_path, 'r') as f:
    assets_data = json.load(f)

for root, dirs, files in os.walk(images_base_path):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            space_code_from_filename = os.path.splitext(file)[0]

            # Handle suffixes like (1), (2), etc.
            processed_space_code = re.sub(r'\(\d+\)$', '', space_code_from_filename).strip()

            # Handle cases like '269SFV2 A'
            processed_space_code = processed_space_code.split(' ')[0]

            # First, try a direct match
            matched = False
            for asset in assets_data:
                if asset.get("spaceCode") == processed_space_code:
                    relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                    asset["image"] = "SSL_PICTURE_DOCKET" + relative_path
                    matched = True
                    break
            
            if matched:
                continue

            # If no direct match, handle hyphenated cases like 14GFV4-5.jpg
            if '-' in processed_space_code:
                base_code = processed_space_code.split('-')[0]
                for asset in assets_data:
                    if asset.get("spaceCode") == base_code:
                        relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                        asset["image"] = "SSL_PICTURE_DOCKET" + relative_path
                        break


with open(assets_file_path, 'w') as f:
    json.dump(assets_data, f, indent=4)

print("assets.json has been updated with image paths (v5).")
