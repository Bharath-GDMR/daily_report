
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

            # --- Matching Logic ---
            matched = False

            # 1. Simple direct match
            for asset in assets_data:
                if asset.get("spaceCode").lower() == processed_space_code.lower():
                    relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                    asset["image"] = "SSL_PICTURE_DOCKET" + relative_path
                    matched = True
                    # Don't break here, continue to see if other assets match

            if matched:
                continue

            # 2. Handle ranges and suffixes like 14gfv9-10.jpg or 14GFV4-5.jpg
            if '-' in processed_space_code:
                parts = processed_space_code.split('-')
                base_code = parts[0]

                # Try to match just the base code (e.g., 14gfv9)
                for asset in assets_data:
                    if asset.get("spaceCode").lower() == base_code.lower():
                        relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                        asset["image"] = "SSL_PICTURE_DOCKET" + relative_path
                        matched = True
                        break # Found a match for the base, so we are done with this file
                
                if matched:
                    continue

                # Handle numeric range like -10, -4 etc.
                if len(parts) == 2 and parts[1].isdigit():
                    # This part is tricky, because we don't know the start of the range.
                    # Assuming the base_code is the start of the range, and the filename indicates the end.
                    # This logic might need refinement based on more examples.
                    try:
                        # Attempt to extract a number from the end of the base_code
                        match = re.match(r"(.*?)(\d+)$", base_code)
                        if match:
                            prefix = match.group(1)
                            start_num = int(match.group(2))
                            end_num = int(parts[1])

                            for i in range(start_num, end_num + 1):
                                space_code_to_find = f"{prefix}{i}"
                                for asset in assets_data:
                                    if asset.get("spaceCode").lower() == space_code_to_find.lower():
                                        relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                                        asset["image"] = "SSL_PICTURE_DOCKET" + relative_path
                        else: # if no number at the end, just match the base code
                            for asset in assets_data:
                                if asset.get("spaceCode").lower() == base_code.lower():
                                    relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                                    asset["image"] = "SSL_PICTURE_DOCKET" + relative_path

                    except ValueError:
                        # Could not parse numbers, so skip range logic
                        pass

with open(assets_file_path, 'w') as f:
    json.dump(assets_data, f, indent=4)

print("assets.json has been updated with image paths (v6).")
