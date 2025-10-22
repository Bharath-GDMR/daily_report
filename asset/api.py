import os
from flask import Flask, jsonify, request
import json

app = Flask(__name__)

# Path to the assets.json file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_FILE = os.path.join(BASE_DIR, 'assets.json')

def load_assets():
    with open(ASSETS_FILE, 'r') as f:
        return json.load(f)

@app.route('/api/assets', methods=['GET'])
def get_assets():
    assets = load_assets()
    query = request.args.get('q', '').lower()
    if query:
        filtered_assets = [
            asset for asset in assets if
            query in asset.get('storeName', '').lower() or
            query in asset.get('spaceCode', '').lower() or
            query in asset.get('category', '').lower() or
            query in asset.get('location', '').lower() or
            query in asset.get('material', '').lower() or
            query in asset.get('inventoryMedium', '').lower() or
            query in asset.get('inventoryType', '').lower()
        ]
        return jsonify(filtered_assets)
    return jsonify(assets)

if __name__ == '__main__':
    app.run(debug=True)