import pywhatkit
import schedule
import datetime
import time

# Your target contact or group
TARGET = "+918787545171"  # Replace with the contact number (include country code)

def send_good_morning():
    today = datetime.datetime.today().weekday()
    # Monday = 0, Sunday = 6
    if today < 5:  # 0-4 = Mon-Fri
        now = datetime.datetime.now()
        hour = now.hour
        minute = now.minute + 1  # Send 1 minute from now (pywhatkit restriction)
        
        print(f"Sending Good Morning at {hour}:{minute}...")
        pywhatkit.sendwhatmsg(TARGET, "Good Morning 🌞", hour, minute)
    else:
        print("It's weekend — not sending message.")

# Schedule for 10:00 AM
schedule.every().monday.at("10:00").do(send_good_morning)
schedule.every().tuesday.at("10:00").do(send_good_morning)
schedule.every().wednesday.at("10:00").do(send_good_morning)
schedule.every().thursday.at("10:00").do(send_good_morning)
schedule.every().friday.at("10:00").do(send_good_morning)

print("Scheduler started. Waiting for 10:00 AM...")

while True:
    schedule.run_pending()
    time.sleep(1)
