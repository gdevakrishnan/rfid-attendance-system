import React, { Fragment, useContext, useState } from 'react'
import { addWorker } from '../services/serviceWorker';
import appContext from '../context/appContext';

function Add() {
  const { 
    setMsg,
    companyUid
  } = useContext(appContext);

  const initialState = {
    "company_uid": companyUid,
    "name": "",
    "rfid_id": "",
    "employee_id": "",
    "role": "",
    "age": "",
    "mobile": "",
    "workingHours": "",
    "salary": ""
  }

  const [newPerson, setNewPerson] = useState(initialState);

  function processText(inputText) {
    let processedText = inputText.toLowerCase();
    processedText = processedText.replace(/\s+/g, '_');
    const specialCharactersRegex = /[^a-zA-Z0-9_]/g;
    const hasSpecialCharacters = specialCharactersRegex.test(processedText);

    return { processedText, hasSpecialCharacters };
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const check = processText(newPerson.name);
    setNewPerson({ ...newPerson, "name": check.processedText});

    for (const key in newPerson) {
      if (newPerson[key] === "") {
        setMsg("Enter all the fields");
        setTimeout(() => {
          setMsg("");
        }, 4000);
        return;
      }
    }

    if (!check.hasSpecialCharacters) {
      
      addWorker(newPerson)
        .then((response) => {
          setMsg(response.data.message);
          setTimeout(() => {
            setMsg("");
          }, 4000);
          setNewPerson(initialState);
        })
        .catch((e) => console.log(e.message));
    } else {
      console.log("Please enter the name without special charachters");
    }
  }
  return (
    <Fragment>
      <section className="page trainPage">
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="form_group">
            <label htmlFor="name">Worker Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={newPerson.name}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value })}
            />
          </div>

          <div className="form_group">
            <label htmlFor="employee_id">ID</label>
            <input
              type="number"
              name="employee_id"
              id="employee_id"
              value={newPerson.employee_id}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value, 'rfid_id': companyUid + '_' + e.target.value })}
            />
          </div>

          <p>RFID: {companyUid + '_' + newPerson.employee_id}</p>

          <div className="form_group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              name="age"
              id="age"
              value={newPerson.age}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value })}
            />
          </div>

          <div className="form_group">
            <label htmlFor="mobile">{"Mobile"}</label>
            <input
              type="text"
              name="mobile"
              id="mobile"
              value={newPerson.mobile}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value })}
            />
          </div>

          <div className="form_group">
            <label htmlFor="role">Job Role</label>
            <input
              type="text"
              name="role"
              id="role"
              value={newPerson.role}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value })}
            />
          </div>

          <div className="form_group">
            <label htmlFor="workingHours">Working Hours</label>
            <input
              type="number"
              name="workingHours"
              id="workingHours"
              value={newPerson.workingHours}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value })}
            />
          </div>

          <div className="form_group">
            <label htmlFor="salary">Salary</label>
            <input
              type="number"
              name="salary"
              id="salary"
              value={newPerson.salary}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value })}
            />
          </div>

          <input
            type="submit"
            value="Add Worker"
            onSubmit={(e) => handleSubmit(e)}
          />
        </form>
        <p>* Please don't give white space for your name, instead you can use underscore for white spaces. Please don't use any special charachters</p>
      </section>
    </Fragment>
  )
}

export default Add