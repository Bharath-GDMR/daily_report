# How to Update Asset Images

This document describes the manual steps to update the `assets.json` file with new image paths.

## Prerequisites

- Make sure you have Python installed on your system.

## Steps

1.  **Place New Images**:
    - Add your new image files (e.g., `.jpg`, `.png`) to the `D:\GDMR\GDMR\Report\asset\SSL_PICTURE_DOCKET` directory. You can create sub-folders within this directory to organize your images (e.g., by region).

2.  **Run the Update Script**:
    - Open a command prompt or terminal.
    - Navigate to the `D:\GDMR\GDMR\Report\asset` directory.
    - Run the following command:
      ```
      python update_assets_with_images_v6.py
      ```

3.  **Verification**:
    - After the script finishes, it will print a message: `assets.json has been updated with image paths (v6).`
    - You can open the `assets.json` file to verify that the `image` fields for the corresponding assets have been updated with the new file paths.

## Script Logic

The script `update_assets_with_images_v6.py` will automatically find the new images and update the `assets.json` file. It handles several filename formats:

- **Direct Match**: `spacecode.jpg` will match the asset with `spaceCode: "spacecode"`.
- **Hyphenated Suffix**: `spacecode-1.jpg` will also match the asset with `spaceCode: "spacecode"`.
- **Hyphenated Range**: `spacecode-10.jpg` will match assets with `spaceCode` from `spacecode` up to `spacecode-10` if the script can determine a numerical range.
