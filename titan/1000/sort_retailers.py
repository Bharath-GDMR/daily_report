import csv
import json

# Define the paths
csv_file_path = r'D:\GDMR\GDMR\Report\titan\all-region\all-region.csv'
json_file_path = r'D:\GDMR\GDMR\Report\titan\1000\retailers.json'

# Define the multi-tiered sorting hierarchy
city_priority = {
    'DELHI': 0,
    'NOIDA': 1,
    'BANGALORE': 2,
    'HYDERABAD': 3,
    # State Capitals
    'JAIPUR': 4,
    'LUCKNOW': 4,
    'BHOPAL': 4,
    'GANDHINAGAR': 4,
    'RAIPUR': 4,
    'SHIMLA': 4,
    'SRINAGAR': 4,
    # Major Cities
    'PUNE': 5,
    'AHMEDABAD': 5,
    'GURUGRAM': 5,
    'CHANDIGARH': 5,
    'LUDHIANA': 5,
    'AMRITSAR': 5,
    'KANPUR': 5,
    'NAGPUR': 5,
    'SURAT': 5,
    'INDORE': 5,
    'VISAKHAPATNAM': 5,
    'VIJAYAWADA': 5
}
# Anything not in this list gets a default priority of 6

def get_sort_key(retailer):
    city = retailer['city'].upper()
    # Get the tier priority, default to 6 for smaller cities
    tier = city_priority.get(city, 6)
    name = retailer['name'].upper()
    return (tier, city, name)

retailers = []
try:
    with open(csv_file_path, mode='r', encoding='utf-8') as csvfile:
        # Use DictReader to handle columns by name, robustly
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Clean up the data
            city = row.get('Location', '').strip().upper()
            retailers.append({
                "sapCode": row.get('SAP Code', '').strip(),
                "name": row.get('Retailer Name', '').strip().upper(),
                "area": row.get('Location', '').strip().upper(),
                "city": city,
                "mapLink": row.get('Google Map Link', '').strip(),
                "contact": row.get('Contact Number', '').strip()
            })

    # Sort the data using the defined hierarchy
    retailers.sort(key=get_sort_key)

    # Write the sorted data to the JSON file
    with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(retailers, jsonfile, indent=2)

    print(f"Successfully processed and wrote {len(retailers)} records to {json_file_path}")

except FileNotFoundError:
    print(f"Error: The file was not found at {csv_file_path}")
except Exception as e:
    print(f"An error occurred: {e}")
