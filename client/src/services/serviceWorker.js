import axios from 'axios';
// const BASE_URL = "https://rfid-attendance-system-q3v8.onrender.com";
const BASE_URL = "http://localhost:5000";

// To get all the attenance data
export const getAttendaceData = async (company_details) => {
    try {
        const task = await axios.post(`${BASE_URL}/`, company_details);
        const response = {"status": true, data: task.data};
        return response;
    }   catch (e) {
        const response = {"status": false, data: e.message};
        return response;
    }
}

// User Authentication Signup
export const userRegisteration = async (formData) => {
    try {
        const task = await axios.post(`${BASE_URL}/signup`, formData);
        const response = {"status": true, data: task.data};
        return response;
    }   catch (e) {
        const response = {"status": false, data: e.message};
        return response;
    }
}

// User Login
export const userLogin = async (formData) => {
    try {
        const task = await axios.post(`${BASE_URL}/login`, formData);
        const response = {"status": true, data: task.data};
        return response;
    }   catch (e) {
        const response = {"status": false, data: e.message};
        return response;
    }
}

// To insert an attendance to the db
export const putAttendance = async (worker) => {
    try {
        const task = await axios.post(`${BASE_URL}/attendance`, worker);
        const response = {"status": true, data: task.data};
        return response;
    }   catch (e) {
        const response = {"status": false, data: e.message};
        return response;
    }
}

// to add workers data to the database
export const addWorker = async (newPerson) => {
    try {
        const task = await axios.post(`${BASE_URL}/add-worker`, newPerson);
        const response = {"status": true, data: task.data};
        return response;
    }   catch (e) {
        const response = {"status": false, data: e.message};
        return response;
    }
}

// To find the workers
export const findWorker = async (worker) => {
    try {
        const task = await axios.post(`${BASE_URL}/find_worker`, worker);
        const response = {"status": true, data: task.data};
        return response;
    }   catch (e) {
        const response = {"status": false, data: e.message};
        return response;
    }
}

// To delete the worker
export const deleteWorker = async (_id) => {
    try {
        console.log({_id});
        const task = await axios.post(`${BASE_URL}/delete_worker`, {_id});
        return task;
    }   catch (e) {
        const response = {"status": false, data: e.message};
        return response;        
    }
}