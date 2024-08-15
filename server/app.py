# Packages
from flask import Flask, jsonify, request
from pymongo import MongoClient
from datetime import datetime, time, timedelta
from dotenv import load_dotenv
import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import base64
from cryptography.fernet import Fernet, InvalidToken
import json

app = Flask(__name__)
CORS(app)
load_dotenv()

# JWT
# Example encrypted token
encrypted_token = b'gAAAAABcrlX....<truncated_for_brevity>....'

# Example key (ensure this matches the key used for encryption)
ret_key = "smPJpKz8nsqSFjW6lhfUuSGqrQHhwR8lAl_ChnB_V0s="
cipher_suite = Fernet(ret_key.encode())

# DB connection
mongo_uri = os.getenv("MONGODB_URI")

try:
    mongo_client = MongoClient(mongo_uri)
    db = mongo_client['Deploy']
    workersCollection = db['workers']
    attendanceCollection = db['attendance']
    userCollection = db['user']
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
@app.route('/', methods=['POST'])
def get_attendance_data():
    data = request.json
    company_uid = data.get('company_uid')
    # Fetch all documents from the collection
    cursor = attendanceCollection.find({'company_uid': company_uid})
    
    # Convert ObjectId fields to string format
    attendance_data = [{**doc, '_id': str(doc['_id'])} for doc in cursor]
    
    # Close the cursor
    cursor.close()
    
    # Return the data as JSON
    return jsonify(attendance_data)

##############################################################################

# User Authentication Register
@app.route('/signup', methods=['POST'])
def signup():
    # Extract data from JSON request
    data = request.json
    name = data.get('name')
    email = data.get('gmail')
    rfid_id = data.get('rfid_id')
    password = data.get('pwd')
    company_uid = data.get('company_uid')

    # Check if user already exists
    existing_user = userCollection.find_one({'name': name, 'email': email, 'company_uid': company_uid})

    if existing_user:
        return jsonify({'message': 'User with this name and email already exists!'}), 200

    # Store user data in MongoDB
    user_data = {
        'name': name,
        'email': email,
        'password': password,
        'rfid_id': rfid_id,
        'company_uid': company_uid,
        'type': 'staff'
    }

    try:
        userCollection.insert_one(user_data)
        return jsonify({'message': 'User signed up successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

##############################################################################

@app.route('/login', methods=['POST'])
def login():
    # Extract data from JSON request
    data = request.json
    name = data.get('name')
    email = data.get('gmail')
    password = data.get('pwd')

    # Check if user already exists
    existing_user = userCollection.find_one({'name': name, 'email': email})
    if (password != existing_user["password"]):
        return jsonify({'message': 'password mismatch', "login": False}), 200

    if existing_user:
        return jsonify({'message': 'User login successfully!', "user_data": [
            {
                "name": existing_user["name"],
                "gmail": existing_user["email"],
                "rfid_id": existing_user["rfid_id"],
                "type": existing_user["type"],
                "company_uid": existing_user["company_uid"]
            }
            ], "login": True}), 200
    else:
        return jsonify({'message': 'User not registered!', "login": False}), 200

##############################################################################

# To add a new Employee
@app.route('/add-worker', methods=['POST'])
def add_worker():
    data = request.json
    name = data.get('name')
    rfid_id = data.get('rfid_id')
    age = data.get('age')
    mobile = data.get('mobile')
    job_role = data.get('role')
    working_hours = data.get('workingHours')
    salary = data.get('salary')
    final_salary = data.get('salary')
    company_uid = data.get('company_uid')

    working_minutes = (float(working_hours) * 60) * 30 # working minutes per month
    token = float(working_minutes) / 10.0    # Per month token for (10 min)

    # token = round((((float(salary) / 30) / 60) * 30) / 10)   # token generation

    try:
        cursor = workersCollection.insert_one({ 
            "name": name,
            "rfid_id": (rfid_id),
            "age": (age),
            "mobile": (mobile),
            "job_role": job_role,
            "working_hours": (working_hours),
            "salary": (salary),
            "final_salary": (final_salary),
            "token": (token),
            "company_uid": (company_uid)
         })
        
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

##############################################################################
    
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


##############################################################################
    
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

##############################################################################

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
        "final_salary": (data['final_salary']),
        "company_uid": (data['company_uid']),
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

##############################################################################

# To find the attendance is first time of the day
def firstTimeAttendance(name, rfid_id, date):
    cursor = list(attendanceCollection.find({"name": name, "rfid_id": rfid_id, "date": date}))
    if (len(cursor) > 0):
        return False
    else:
        return True

##############################################################################

# To find the worker is in or out of work
def presenceOfWorker(name, rfid_id, date):
    cursor = list(attendanceCollection.find({"rfid_id": rfid_id, "name": name, "date": date}))        
    if (len(cursor) > 0):
        for element in cursor:
            if (cursor.index(element) == len(cursor) - 1):
                return (not (element['presence']))
    else:
        return True
##############################################################################

# To send message to an employess about holidays at 6am
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
@app.route('/trigger_holiday', methods=['POST'])
def trigger_holiday():
    send_holiday_message_to_worker()
    return jsonify({'status': 'Holiday checked and report sent to the worker'}), 200

##############################################################################

@app.route('/calculate_token', methods=['POST'])
def calculate_token():
    current_datetime = datetime.now()
    today_date = current_datetime.date()
    weekday = today_date.weekday()  # Monday is 0, Sunday is 6
    isHolidayToday = {"isHoliday": False}

    if weekday >= 5:  # 5 and 6 represent Saturday and Sunday respectively
        isHolidayToday = {"isHoliday": True}

    for holiday in holidays_data:
        if holiday['date'] == today_date:
            isHolidayToday = {"isHoliday": True}

    if not isHolidayToday['isHoliday']:
        today_date_str = str(current_datetime.date())   # 2024-08-12
        todays_date = today_date_str[-2:]  # 12
        cursor = workersCollection.find({})

        for worker in cursor:
            if todays_date == "01":
                salary = float(worker['salary'])
                working_hours = float(worker['working_hours'])
                working_minutes = (working_hours * 60) * 30  # working minutes per month
                new_token = working_minutes / 10.0  # Per month token for (10 min)
                workersCollection.update_one(
                    {"_id": worker["_id"]},
                    {"$set": {"token": new_token, "final_salary": worker['salary']}}  # Re-initialize the token and salary
                )

            attendanceCursor = attendanceCollection.find({
                "name": worker['name'],
                "rfid_id": worker['rfid_id'],
                "date": today_date_str
            })

            delay = 0
            previous_entry = None
            onLeave = True

            lunch_break_start = time(12, 0)  # 12:00 PM
            lunch_break_end = time(13, 0)    # 1:00 PM

            for attendance in attendanceCursor:
                if attendance['presence']:
                    onLeave = False

                if previous_entry and not attendance['presence'] and previous_entry['presence']:
                    in_time = datetime.strptime(previous_entry['time'], '%H:%M:%S').time()
                    out_time = datetime.strptime(attendance['time'], '%H:%M:%S').time()

                    if lunch_break_start <= in_time <= lunch_break_end or lunch_break_start <= out_time <= lunch_break_end:
                        continue  # Skip this entry as it's during lunch break

                    if out_time > time(hour=17):
                        out_time = time(hour=17, minute=0, second=0)  # Set out_time to 17:00

                    if out_time < in_time:
                        out_time = time(hour=17, minute=0, second=0)  # Adjust for crossing midnight

                    time_difference = datetime.combine(datetime.today(), out_time) - datetime.combine(datetime.today(), in_time)
                    minutes_difference = time_difference.total_seconds() / 60
                    if (minutes_difference > 10):
                        delay = minutes_difference - 10

                previous_entry = attendance

            if onLeave:
                delay = float(worker['working_hours']) * 60

            lost_token = round(float(delay) / 10.0)

            cost_per_token = ((float(worker['salary']) / 30.0) / (float(worker['working_hours']) * 60)) * 10

            if lost_token > 0:
                updated_token = float(worker['token']) - float(lost_token)
                reduced_salary = float(worker['final_salary']) - float(lost_token * cost_per_token)

                workersCollection.update_one(
                    {"_id": worker["_id"]},
                    {"$set": {"token": updated_token, "final_salary": reduced_salary}}  # update the token and salary after reduction
                )

                message_body = (
                    f"Hello {worker['name']}, You lost {lost_token} tokens from your tokens. "
                    f"Your monthly salary is {worker['salary']}. Your final salary for this month is {worker['final_salary']}."
                )

                if worker['mobile']:
                    try:
                        message = messenger_client.messages.create(
                            from_=twilio_mobile_number,
                            body=message_body,
                            to="+91" + str(worker['mobile'])
                        )
                        print(f"Message sent successfully to {worker['name']}: SID {message.sid}")
                    except TwilioRestException as e:
                        print(f"Failed to send message to {worker['name']}: {e}")

    return jsonify({"status": "success", "message": "Token calculation completed. The balance tokens and final salary of the user was send as a message successfully!"})

##############################################################################

# To send daily reports to an appropriate employee at 7pm
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
            role = worker.get('job_role')
            working_hours = worker.get('working_hours')
            salary = worker.get('salary')
            final_salary = worker.get('final_salary')
            token = worker.get('token')

            # Construct the message
            message_body = (
                f"Profile for {name}:\n"
                f"Name: {name}\n"
                f"Age: {age}\n"
                f"Role: {role}\n"
                f"Working Hours: {working_hours}\n"
                f"Salary: {salary}\n"
                f"Reduced Salary: {final_salary}\n"
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

@app.route('/trigger_reports', methods=['POST'])
def trigger_reports():
    send_worker_profiles()
    return jsonify({'status': 'Reports sent'}), 200

##############################################################################

# Cron-job to make the site active
@app.route('/cron-job', methods=['GET'])
def cron_job():
    return jsonify(message="Cron-job! Hello, World!")

##############################################################################

if __name__ == '__main__':
    app.run(debug=True)
