import xml.dom.minidom
import sys

file_path = sys.argv[1]

with open(file_path, 'r', encoding='utf-8') as f:
    svg_content = f.read()

dom = xml.dom.minidom.parseString(svg_content)
pretty_svg = dom.toprettyxml(indent="  ")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(pretty_svg)

print(f"Successfully prettified {file_path}")
