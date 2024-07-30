import React, { Fragment, useContext, useState } from 'react'
import { addWorker } from '../services/serviceWorker';
import appContext from '../context/appContext';

function Add() {
  const { setMsg } = useContext(appContext);

  const initialState = {
    "name": "",
    "rfid_id": "",
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
      setNewPerson({ ...newPerson, "name": check.processedText });
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
            <label htmlFor="rfid_id">RFID</label>
            <input
              type="number"
              name="rfid_id"
              id="rfid_id"
              value={newPerson.rfid_id}
              onChange={(e) => setNewPerson({ ...newPerson, [e.target.id]: e.target.value })}
            />
          </div>

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