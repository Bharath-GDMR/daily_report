from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import chromedriver_autoinstaller
import time

# Auto-install correct ChromeDriver
chromedriver_autoinstaller.install()

def send_message(number, message):
    print("🔹 Opening Chrome...")
    chrome_profile_path = r"C:\Users\bhara\AppData\Local\Google\Chrome\User Data"

    options = webdriver.ChromeOptions()
    options.add_argument(f"user-data-dir={chrome_profile_path}")
    options.add_argument("profile-directory=Default")  # use Default profile (your normal Chrome)

    driver = webdriver.Chrome(options=options)
    driver.get(f"https://web.whatsapp.com/send?phone={number}&text={message}")
    print("🔹 WhatsApp Web opened")

    time.sleep(10)  # give WhatsApp Web time to load fully

    try:
        print("🔹 Sending message...")
        msg_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]')
        msg_box.send_keys(Keys.ENTER)
        print(f"✅ Message sent to {number}: {message}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

    driver.quit()

# ---- Run instantly ----
send_message("918787545171", "Good Morning")  # replace with the phone number (with country code, no + sign)
