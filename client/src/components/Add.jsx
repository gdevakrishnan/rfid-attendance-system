import React, { Fragment, useContext, useState } from 'react';
import QRCode from 'qrcode';
import { addWorker } from '../services/serviceWorker';
import appContext from '../context/appContext';
import vector from '../assets/worker.png';
import Navbar from './Navbar';

function Add() {
  const { setMsg, companyUid } = useContext(appContext);

  const initialState = {
    company_uid: companyUid,
    name: "",
    rfid_id: "",
    employee_id: "",
    role: "",
    age: "",
    mobile: "",
    workingHours: "",
    salary: ""
  };

  const [newPerson, setNewPerson] = useState(initialState);

  function processText(inputText) {
    let processedText = inputText.toLowerCase();
    processedText = processedText.replace(/\s+/g, '_');
    const specialCharactersRegex = /[^a-zA-Z0-9_]/g;
    const hasSpecialCharacters = specialCharactersRegex.test(processedText);

    return { processedText, hasSpecialCharacters };
  }

  const generateQRCode = async (text) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(text, { width: 300 });
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `${text}.png`;
      link.click();
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const check = processText(newPerson.name);
    setNewPerson({ ...newPerson, name: check.processedText });

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

          // Generate and download QR code
          generateQRCode(newPerson.rfid_id);
        })
        .catch((e) => console.log(e.message));
    } else {
      console.log("Please enter the name without special characters");
    }
  };

  return (
    <Fragment>
      <section className="page add_worker_page form_page">
        <Navbar />
        <div className="form_main">
          <div className="form_left">
            <div className="form_container">
              <h1 className="form_title">Create a worker</h1>
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="form_group">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Username"
                    value={newPerson.name}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, [e.target.id]: e.target.value })
                    }
                  />
                </div>

                <div className="form_group">
                  <input
                    type="number"
                    name="employee_id"
                    id="employee_id"
                    placeholder="Employee Id"
                    value={newPerson.employee_id}
                    onChange={(e) =>
                      setNewPerson({
                        ...newPerson,
                        [e.target.id]: e.target.value,
                        rfid_id: companyUid + '_' + e.target.value
                      })
                    }
                  />
                </div>

                <div className="form_group">
                  <p>RFID: {companyUid + '_' + newPerson.employee_id}</p>
                </div>

                <div className="form_group">
                  <input
                    type="number"
                    name="age"
                    id="age"
                    placeholder="Age"
                    value={newPerson.age}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, [e.target.id]: e.target.value })
                    }
                  />
                </div>

                <div className="form_group">
                  <input
                    type="text"
                    name="mobile"
                    id="mobile"
                    placeholder="Mobile no."
                    value={newPerson.mobile}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, [e.target.id]: e.target.value })
                    }
                  />
                </div>

                <div className="form_group">
                  <input
                    type="text"
                    name="role"
                    id="role"
                    placeholder="Job Role"
                    value={newPerson.role}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, [e.target.id]: e.target.value })
                    }
                  />
                </div>

                <div className="form_group">
                  <input
                    type="number"
                    name="workingHours"
                    id="workingHours"
                    placeholder="Working Hours"
                    value={newPerson.workingHours}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, [e.target.id]: e.target.value })
                    }
                  />
                </div>

                <div className="form_group">
                  <input
                    type="number"
                    name="salary"
                    id="salary"
                    placeholder="Salary"
                    value={newPerson.salary}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, [e.target.id]: e.target.value })
                    }
                  />
                </div>

                <input type="submit" value="Add Worker" />
              </form>
            </div>
          </div>

          <div className="form_right">
            <img src={vector} alt="vector" className="vector" />
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default Add;
