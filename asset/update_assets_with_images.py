
import json
import os

assets_file_path = "C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\assets.json"
images_base_path = "C:\\Users\\bhara\\Desktop\\GDMR\\Report\\asset\\SSL_PICTURE_DOCKET"

with open(assets_file_path, 'r') as f:
    assets_data = json.load(f)

for root, dirs, files in os.walk(images_base_path):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            space_code_from_filename = os.path.splitext(file)[0]
            for asset in assets_data:
                if asset.get("spaceCode") == space_code_from_filename:
                    relative_path = os.path.join(root, file).replace(images_base_path, "").replace("\\", "/")
                    asset["image"] = "asset/SSL_PICTURE_DOCKET" + relative_path

with open(assets_file_path, 'w') as f:
    json.dump(assets_data, f, indent=4)

print("assets.json has been updated with image paths.")
