from flask import Flask, jsonify, request
from pymongo import MongoClient
from datetime import datetime, time
import pytz
from dotenv import load_dotenv
import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from flask_cors import CORS
from cryptography.fernet import Fernet
import json
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)
load_dotenv()

# JWT
encrypted_token = b'gAAAAABcrlX....<truncated_for_brevity>....'
# ret_key = os.getenv("FERNET_KEY")
ret_key = Fernet.generate_key()
if ret_key is None:
    raise ValueError("FERNET_KEY environment variable is not set")
cipher_suite = Fernet(ret_key.decode())

# DB connection
mongo_uri = os.getenv("MONGODB_URI")
mongo_client = MongoClient(mongo_uri)
db = mongo_client['Deploy']
workersCollection = db['workers']
attendanceCollection = db['attendance']
userCollection = db['user']

# Messenger
twilio_mobile_number = os.getenv("TWILIO_MOBILE_NUMBER")
twilio_sid = os.getenv("TWILIO_SID")
twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
messenger_client = Client(twilio_sid, twilio_auth_token)

# Load public holidays data from JSON file
with open('public_holidays.json', 'r') as f:
    holidays_data = json.load(f)

@app.route('/', methods=['POST'])
def get_attendance_data():
    data = request.json
    company_uid = data.get('company_uid')
    cursor = attendanceCollection.find({'company_uid': company_uid})
    attendance_data = [{**doc, '_id': str(doc['_id'])} for doc in cursor]
    return jsonify(attendance_data)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('gmail')
    rfid_id = data.get('rfid_id')
    password = data.get('pwd')
    company_uid = data.get('company_uid')

    existing_user = userCollection.find_one({'name': name, 'email': email, 'company_uid': company_uid})
    if existing_user:
        return jsonify({'message': 'User with this name and email already exists!'}), 200

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

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    name = data.get('name')
    email = data.get('gmail')
    password = data.get('pwd')

    existing_user = userCollection.find_one({'name': name, 'email': email})
    if existing_user and password == existing_user["password"]:
        return jsonify({'message': 'User login successfully!', "user_data": [
            {
                "name": existing_user["name"],
                "gmail": existing_user["email"],
                "rfid_id": existing_user["rfid_id"],
                "type": existing_user["type"],
                "company_uid": existing_user["company_uid"]
            }
        ], "login": True}), 200
    return jsonify({'message': 'Invalid credentials!', "login": False}), 200

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
    company_uid = data.get('company_uid')

    working_minutes = (float(working_hours) * 60) * 30
    token = float(working_minutes) / 10.0

    try:
        workersCollection.insert_one({
            "name": name,
            "rfid_id": rfid_id,
            "age": age,
            "mobile": mobile,
            "job_role": job_role,
            "working_hours": working_hours,
            "salary": salary,
            "final_salary": salary,
            "token": token,
            "company_uid": company_uid
        })
        
        message_body = f"Hello {name}, welcome to Tech Vaseegrah. You are added as a worker. Happy Coding!"
        messenger_client.messages.create(
            from_=twilio_mobile_number,
            body=message_body,
            to="+91" + str(mobile)
        )
        return jsonify({"message": "Employee added successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/find_worker', methods=['POST'])
def find_worker():
    data = request.json
    rfid_id = data.get('rfid_id')

    try:
        worker = workersCollection.find_one({"rfid_id": rfid_id})
        if worker:
            worker['_id'] = str(worker['_id'])
            return jsonify(worker), 200
        return jsonify({"message": "Worker not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete_worker', methods=['POST'])
def delete_worker():
    data = request.get_json()
    worker_id = data.get('_id')

    if not worker_id:
        return jsonify({"error": "Missing '_id' in the request body"}), 400

    try:
        result = workersCollection.delete_one({"_id": ObjectId(worker_id)})
        if result.deleted_count == 1:
            return jsonify({"message": "Worker deleted successfully"}), 200
        return jsonify({"error": "Worker not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/attendance', methods=['POST'])
def attendance():
    data = request.json
    rfid_id = data.get('rfid_id')

    try:
        worker = workersCollection.find_one({"rfid_id": rfid_id})
        if worker:
            put_attendance(worker)
            return jsonify({"message": "Attendance added successfully"}), 200
        return jsonify({"message": "Worker not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def put_attendance(data):
    india_timezone = pytz.timezone('Asia/Kolkata')
    time_now = datetime.now(india_timezone)

    date_str = time_now.strftime("%Y-%m-%d")
    time_str = time_now.strftime('%H:%M:%S')

    first_time = firstTimeAttendance(data['name'], data['rfid_id'], date_str)
    presence = presenceOfWorker(data['name'], data['rfid_id'], date_str)

    attendanceCollection.insert_one({
        "name": data['name'],
        "rfid_id": data['rfid_id'],
        "age": data['age'],
        "mobile": data['mobile'],
        "job_role": data['job_role'],
        "working_hours": data['working_hours'],
        "salary": data['salary'],
        "final_salary": data['final_salary'],
        "company_uid": data['company_uid'],
        "token": data['token'],
        "date": date_str,
        "time": time_str,
        "presence": presence
    })

    if first_time:
        try:
            message_body = f"Hello {data['name']}, welcome to Tech Vaseegrah"
            messenger_client.messages.create(
                from_=twilio_mobile_number,
                body=message_body,
                to="+91" + str(data['mobile'])
            )
        except TwilioRestException as e:
            print(f"Failed to send message: {e}")

def firstTimeAttendance(name, rfid_id, date):
    return attendanceCollection.count_documents({"name": name, "rfid_id": rfid_id, "date": date}) == 0

def presenceOfWorker(name, rfid_id, date):
    cursor = list(attendanceCollection.find({"rfid_id": rfid_id, "name": name, "date": date}))
    if cursor:
        return not cursor[-1]['presence']
    return True

def send_holiday_message_to_worker():
    current_datetime = datetime.now()
    today_date = current_datetime.date()
    weekday = today_date.weekday()
    isHolidayToday = {'title': 'Not a Holiday', "isHoliday": False, "isWeekend": False, "isPublicHoliday": False}

    if weekday >= 5:
        isHolidayToday.update({'isWeekend': True, 'isHoliday': True, 'title': "Weekend"})

    for holiday in holidays_data:
        if holiday['date'] == today_date:
            isHolidayToday.update({'isWeekend': False, 'isHoliday': True, 'isPublicHoliday': True, 'title': holiday['holiday_title']})

    if isHolidayToday['isHoliday']:
        workers = workersCollection.find({})
        for worker in workers:
            mobile = worker.get('mobile')
            name = worker.get('name')

            if isHolidayToday['isHoliday'] and isHolidayToday['isWeekend'] and isHolidayToday['isPublicHoliday']:
                message_body = f"Hello {name}, Today declared as a Holiday. Today is a weekend. Not only that, Today is a {isHolidayToday['title']},\nWe wishes Happy {isHolidayToday['title']}"
            elif isHolidayToday['isHoliday'] and isHolidayToday['isWeekend']:
                message_body = f"Hello {name}, Due to weekend, today declared as a Holiday."
            elif isHolidayToday['isHoliday'] and isHolidayToday['isPublicHoliday']:
                message_body = f"Hello {name}, Today declared as a Holiday.\nWe Wishes Happy {isHolidayToday['title']}"

            if mobile:
                try:
                    messenger_client.messages.create(
                        from_=twilio_mobile_number,
                        body=message_body,
                        to="+91" + str(mobile)
                    )
                except TwilioRestException as e:
                    print(f"Failed to send message to {name}: {e}")

@app.route('/trigger_holiday', methods=['POST'])
def trigger_holiday():
    send_holiday_message_to_worker()
    return jsonify({'status': 'Holiday checked and report sent to the worker'}), 200

@app.route('/calculate_token', methods=['POST'])
def calculate_token():
    current_datetime = datetime.now()
    today_date = current_datetime.date()
    weekday = today_date.weekday()
    isHolidayToday = {"isHoliday": False}

    if weekday >= 5:
        isHolidayToday = {"isHoliday": True}

    for holiday in holidays_data:
        if holiday['date'] == today_date:
            isHolidayToday = {"isHoliday": True}

    if not isHolidayToday['isHoliday']:
        today_date_str = str(current_datetime.date())
        todays_date = today_date_str[-2:]
        cursor = workersCollection.find({})

        for worker in cursor:
            if todays_date == "01":
                salary = float(worker['salary'])
                working_hours = float(worker['working_hours'])
                working_minutes = (working_hours * 60) * 30
                new_token = working_minutes / 10.0
                workersCollection.update_one(
                    {"_id": worker["_id"]},
                    {"$set": {"token": new_token, "final_salary": worker['salary']}}
                )

            attendanceCursor = attendanceCollection.find({
                "name": worker['name'],
                "rfid_id": worker['rfid_id'],
                "date": today_date_str
            })

            delay = 0
            previous_entry = None
            onLeave = True

            lunch_break_start = time(12, 0)
            lunch_break_end = time(13, 0)

            for attendance in attendanceCursor:
                if attendance['presence']:
                    onLeave = False

                if previous_entry and not attendance['presence'] and previous_entry['presence']:
                    in_time = datetime.strptime(previous_entry['time'], '%H:%M:%S').time()
                    out_time = datetime.strptime(attendance['time'], '%H:%M:%S').time()

                    if lunch_break_start <= in_time <= lunch_break_end or lunch_break_start <= out_time <= lunch_break_end:
                        continue

                    if out_time > time(hour=17):
                        out_time = time(hour=17, minute=0, second=0)

                    if out_time < in_time:
                        out_time = time(hour=17, minute=0, second=0)

                    time_difference = datetime.combine(datetime.today(), out_time) - datetime.combine(datetime.today(), in_time)
                    minutes_difference = time_difference.total_seconds() / 60
                    if minutes_difference > 10:
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
                    {"$set": {"token": updated_token, "final_salary": reduced_salary}}
                )

                message_body = (
                    f"Hello {worker['name']}, You lost {lost_token} tokens from your tokens. "
                    f"Your monthly salary is {worker['salary']}. Your final salary for this month is {worker['final_salary']}."
                )

                if worker['mobile']:
                    try:
                        messenger_client.messages.create(
                            from_=twilio_mobile_number,
                            body=message_body,
                            to="+91" + str(worker['mobile'])
                        )
                    except TwilioRestException as e:
                        print(f"Failed to send message to {worker['name']}: {e}")

    return jsonify({"status": "success", "message": "Token calculation completed. The balance tokens and final salary of the user was send as a message successfully!"})

def send_worker_profiles():
    current_datetime = datetime.now()
    today_date = current_datetime.date()
    weekday = today_date.weekday()
    isHolidayToday = {'status': 'Not a Holiday', "isHoliday": False}

    if weekday >= 5:
        isHolidayToday = {'status': 'Weekend', "isHoliday": True}

    for holiday in holidays_data:
        if holiday['date'] == today_date:
            isHolidayToday = {'status': 'Holiday', 'holiday_title': holiday['holiday_title'], "isHoliday": True}

    if not isHolidayToday['isHoliday']:
        workers = workersCollection.find({})
        for worker in workers:
            mobile = worker.get('mobile')
            name = worker.get('name')
            age = worker.get('age')
            role = worker.get('job_role')
            working_hours = worker.get('working_hours')
            salary = worker.get('salary')
            final_salary = worker.get('final_salary')
            token = worker.get('token')

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
                    messenger_client.messages.create(
                        from_=twilio_mobile_number,
                        body=message_body,
                        to="+91" + str(mobile)
                    )
                except TwilioRestException as e:
                    print(f"Failed to send message to {name}: {e}")

@app.route('/trigger_reports', methods=['POST'])
def trigger_reports():
    send_worker_profiles()
    return jsonify({'status': 'Reports sent'}), 200

@app.route('/cron-job', methods=['GET'])
def cron_job():
    return jsonify(message="Cron-job! Hello, World!")

if __name__ == '__main__':
    app.run(debug=True)
