# MICROPYTHON code for nodeMCU esp8266 module
# Circuit diagrams are available in the folder assets

import machine
import time
import urequests
from mfrc522 import MFRC522

# Initialize SPI and RFID reader
spi = machine.SPI(1, baudrate=1000000, polarity=0, phase=0, sck=machine.Pin(14), mosi=machine.Pin(13), miso=machine.Pin(12))
rdr = MFRC522(spi, sda=machine.Pin(4), rst=machine.Pin(5))

def read_rfid():
    while True:
        rdr.init()
        stat, tag_type = rdr.request(rdr.REQIDL)
        
        if stat == rdr.OK:
            stat, raw_uid = rdr.anticoll()
            if stat == rdr.OK:
                rfid_uid = "0x%02x%02x%02x%02x" % (raw_uid[0], raw_uid[1], raw_uid[2], raw_uid[3])
                return rfid_uid
        time.sleep_ms(500)  # Pause between scans

def send_to_api(rfid_tag):
    url = "http://localhost:5000/attendance"
    headers = {"Content-Type": "application/json"}
    data = {"rfid_id": rfid_tag, "rfid_info": "some_info"}
    
    try:
        response = urequests.post(url, json=data, headers=headers)
        print("Response from API:", response.text)
    except Exception as e:
        print("Failed to send data:", e)

# Example usage
while True:
    print("Scanning for RFID tags...")
    rfid_tag = read_rfid()
    if rfid_tag:
        print("RFID Tag Found:", rfid_tag)
        send_to_api(rfid_tag)
    else:
        print("No RFID Tag Found")
    time.sleep(1)  # Pause between scans



"""
    upload the above code in the nodeMCU esp8266 module
    The Circuit diagram was available in the assets folder
 
    Importing urequests: Ensure you have urequests available on your ESP8266. If not, you can upload it using tools like ampy or WebREPL. 

    We are using urequests to use api integration. It helps to connect the hardware to our api to recieve the rfid info

    ###############################################

    Components Needed:
    ESP8266 NodeMCU
    MFRC522 RFID module
    Jumper wires
    Breadboard (optional)

    
"""
