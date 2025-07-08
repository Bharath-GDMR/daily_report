from bs4 import BeautifulSoup

with open("index.html", "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

report = "Daily Report\n\n"
count = 1

# Select all top-level <li> under the main <ol>
top_level_items = soup.select("body > ol > li")

for section in top_level_items:
    title = section.find("h3")
    if not title:
        continue

    report += f"{title.text.strip().upper()}:\n"

    # Get nested list items
    nested_items = section.find("ol")
    if nested_items:
        for item in nested_items.find_all("li", recursive=False):
            line = item.text.strip().replace('\n', ' ').replace('  ', ' ')
            report += f"{count}. {line}\n"
            count += 1

    report += "\n"

print(report)
