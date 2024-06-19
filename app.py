# Packages
from flask import Flask, jsonify, request
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import json

app = Flask(__name__)
CORS(app)
load_dotenv()

# DB connection
mongo_uri = os.getenv("MONGODB_URI")

try:
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client['Deploy']
    workersCollection = db['workers']
    attendanceCollection = db['attendance']
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    workersCollection = None

# Messenger
twilio_mobile_number = os.getenv("TWILIO_MOBILE_NUMBER")
twilio_sid = os.getenv("TWILIO_SID")
twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")

messenger_client = Client(twilio_sid, twilio_auth_token)

# Load public holidays data from JSON file
with open('public_holidays.json', 'r') as f:
    holidays_data = json.load(f)

# To get all attendance
@app.route('/', methods=['GET'])
def get_attendance_data():
    # Fetch all documents from the collection
    cursor = attendanceCollection.find({})
    
    # Convert ObjectId fields to string format
    attendance_data = [{**doc, '_id': str(doc['_id'])} for doc in cursor]
    
    # Close the cursor
    cursor.close()
    
    # Return the data as JSON
    return jsonify(attendance_data)

# To add a new Employee
@app.route('/add_worker', methods=['POST'])
def add_worker():
    data = request.json
    name = data.get('name')
    rfid_id = data.get('rfid_id')
    age = data.get('age')
    mobile = data.get('mobile')
    job_role = data.get('role')
    working_hours = data.get('workingHours')
    salary = data.get('salary')
    token = round(((float(salary) / 27) / float(working_hours)) / 10)
    try:
        cursor = workersCollection.insert_one({ 
            "name": name,
            "rfid_id": (rfid_id),
            "age": (age),
            "mobile": (mobile),
            "job_role": job_role,
            "working_hours": (working_hours),
            "salary": (salary),
            "token": (token)
         });
        
        message_body = f"Hello {data['name']}, welcome to Tech Vaseegrah. You are added as a worker. Happy Coding!"
        # Send the message using Twilio
        message = messenger_client.messages.create(
            from_=twilio_mobile_number,
            body=message_body,
            to="+91" + str(mobile)
        )
        return jsonify({"message": "Employee added successfully"})
    except Exception as e:
        print(f"Error add worker: {e}")
        return f"Error: {e}", 500  # Return error message with HTTP status code 500

# To find the worker by rfid
@app.route('/find_worker', methods=['POST'])
def find_worker():
    data = request.json
    rfid_id = data.get('rfid_id')

    try:
        cursor = workersCollection.find_one({"rfid_id": rfid_id})
        if cursor:
            # Convert ObjectId to string for _id field
            cursor['_id'] = str(cursor['_id'])
            return jsonify(cursor), 200
        else:
            return jsonify({"message": "Worker not found"}), 404
    except Exception as e:
        print(f"Error finding worker: {e}")
        return f"Error: {e}", 500  # Return error message with HTTP status code 500


# To find the worker by rfid and put attendance
@app.route('/attendance', methods=['POST'])
def attendance():
    data = request.json
    rfid_id = data.get('rfid_id')

    try:
        cursor = workersCollection.find_one({"rfid_id": rfid_id})
        put_attendance(cursor)
        return jsonify({"message": "Attendance added successfully"}), 200
    except Exception as e:
        print(f"Error data retrieved and attendance: {e}")
        return f"Error: {e}", 500  # Return error message with HTTP status code 500

# To put attendance to DB
def put_attendance(data):
    time_now = datetime.now()
    date_str = time_now.strftime("%Y-%m-%d")
    time_str = time_now.strftime("%H:%M:%S")

    firstTime = firstTimeAttendance(data['name'], data['rfid_id'], date_str)
    presence = presenceOfWorker(data['name'], data['rfid_id'], date_str)

    cursor = attendanceCollection.insert_one({ 
        "name": data['name'],
        "rfid_id": (data['rfid_id']),
        "age": (data['age']),
        "mobile": (data['mobile']),
        "job_role": data['job_role'],
        "working_hours": (data['working_hours']),
        "salary": (data['salary']),
        "token": data['token'],
        "date": date_str,
        "time": time_str,
        "presence": presence
    })

    if (firstTime):
        try:
            message_body = f"Hello {data['name']}, welcome to Tech Vaseegrah"
            # Send the message using Twilio
            message = messenger_client.messages.create(
                from_=twilio_mobile_number,
                body=message_body,
                to="+91" + str(data['mobile'])
            )
            print(f"Message sent successfully: SID {message.sid}")
        except TwilioRestException as e:
            print(f"Failed to send message: {e}")

# To find the attendance is first time of the day
def firstTimeAttendance(name, rfid_id, date):
    cursor = list(attendanceCollection.find({"name": name, "rfid_id": rfid_id, "date": date}))
    if (len(cursor) > 0):
        return False
    else:
        return True

# TO find the worker is in or out of work
def presenceOfWorker(name, rfid_id, date):
    cursor = list(attendanceCollection.find({"rfid_id": rfid_id, "name": name, "date": date}))        
    if (len(cursor) > 0):
        for element in cursor:
            if (cursor.index(element) == len(cursor) - 1):
                return (not (element['presence']))
    else:
        return True

def send_worker_profiles():
    # To check to day is a holiday or not
    current_datetime = datetime.now()
    today_date = current_datetime.date()
    weekday = today_date.weekday()  # Monday is 0, Sunday is 6
    isHolidayToday = {'status': 'Not a Holiday', "isHoliday": False}

    if weekday >= 5:  # 5 and 6 represent Saturday and Sunday respectively
        isHolidayToday = {'status': 'Weekend', "isHoliday": True}

    for holiday in holidays_data:
        if holiday['date'] == today_date:
            isHolidayToday = {'status': 'Holiday', 'holiday_title': holiday['holiday_title'], "isHoliday": True}

    if (not (isHolidayToday['isHoliday'])):
        # Fetch all workers from the collection
        workers = workersCollection.find({})

        for worker in workers:
            # Extract mobile number and details from worker
            mobile = worker.get('mobile')
            name = worker.get('name')
            age = worker.get('age')
            role = worker.get('role')
            working_hours = worker.get('working_hours')
            salary = worker.get('salary')
            token = worker.get('token')

            # Construct the message
            message_body = (
                f"Profile for {name}:\n"
                f"Name: {name}\n"
                f"Age: {age}\n"
                f"Role: {role}\n"
                f"Working Hours: {working_hours}\n"
                f"Salary: {salary}\n"
                f"Token: {token}"
            )

            if mobile:
                try:
                    # Send the message using Twilio
                    message = messenger_client.messages.create(
                        from_=twilio_mobile_number,
                        body=message_body,
                        to="+91" + str(mobile)
                    )
                    print(f"Message sent successfully to {name}: SID {message.sid}")
                except TwilioRestException as e:
                    print(f"Failed to send message to {name}: {e}")

# Schedule the task to run daily at 6 PM to send the daily reports
scheduler = BackgroundScheduler()
trigger = CronTrigger(hour=18, minute=0)  # 6 PM
scheduler.add_job(send_worker_profiles, trigger)
scheduler.start()

def send_holiday_message_to_worker():
    # To check to day is a holiday or not
    current_datetime = datetime.now()
    today_date = current_datetime.date()
    weekday = today_date.weekday()  # Monday is 0, Sunday is 6
    isHolidayToday = {'title': 'Not a Holiday', "isHoliday": False, "isWeekend": False, "isPublicHoliday": False}

    if weekday >= 5:  # 5 and 6 represent Saturday and Sunday respectively
        isHolidayToday['isWeekend'] = True
        isHolidayToday['isHoliday'] = True
        isHolidayToday['isPublicHoliday'] = False
        isHolidayToday['title'] = "Weekend"

    for holiday in holidays_data:
        if holiday['date'] == today_date:
            isHolidayToday['isWeekend'] = False
            isHolidayToday['isHoliday'] = True
            isHolidayToday['isPublicHoliday'] = True
            isHolidayToday['title'] = holiday['holiday_title']

    if (isHolidayToday['isHoliday']):
        # Fetch all workers from the collection
        workers = workersCollection.find({})

        for worker in workers:
            # Extract mobile number and details from worker
            mobile = worker.get('mobile')
            name = worker.get('name')

            # Construct the message
            if (isHolidayToday['isHoliday'] and isHolidayToday['isWeekend'] and isHolidayToday['isPublicHoliday']):
                message_body = (
                    f"Hello {name}, Today declared as a Holiday. Today is a weekend. Not only that, Today is a {isHolidayToday['title']},\nWe wishes Happy {isHolidayToday['title']}"
                )

            elif (isHolidayToday['isHoliday'] and isHolidayToday['isWeekend'] and (not isHolidayToday['isPublicHoliday'])):
                message_body = (
                    f"Hello {name}, Due to weekend, today declared as a Holiday."
                )
            
            elif (isHolidayToday['isHoliday'] and (not isHolidayToday['isWeekend']) and isHolidayToday['isPublicHoliday']):
                message_body = (
                    f"Hello {name}, Today declared as a Holiday.\nWe Wishes Happy {isHolidayToday['title']}"
                )

            if mobile:
                try:
                    # Send the message using Twilio
                    message = messenger_client.messages.create(
                        from_=twilio_mobile_number,
                        body=message_body,
                        to="+91" + str(mobile)
                    )
                    print(f"Message sent successfully to {name}: SID {message.sid}")
                except TwilioRestException as e:
                    print(f"Failed to send message to {name}: {e}")

# Schedule to send the message at 4am. To inform today office is a holiday or not
scheduler = BackgroundScheduler()
trigger = CronTrigger(hour=4, minute=0)  # 4 AM
scheduler.add_job(send_holiday_message_to_worker, trigger)
scheduler.start()


if __name__ == '__main__':
    app.run(debug=True)
