import React, { Fragment, useContext, useEffect, useState } from 'react'
import { getAttendaceData } from './services/serviceWorker';
import appContext from './context/appContext';
import Router from './router/Router';

function App() {
  const [msg, setMsg] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [employeeUsername, setEmployeeUsername] = useState(null);
  const [employeeGmail, setEmployeeGmail] = useState(null);
  const [employeeType, setEmployeeType] = useState(null);
  useEffect(() => {
    getAttendaceData().then((response) => {
      if (response.status) {
        setAttendance(response.data);
      }
    });
  }, [attendance, setAttendance]);

  const context = {
    attendance,
    setAttendance,
    msg,
    setMsg,
    employeeUsername,
    setEmployeeUsername,
    employeeGmail,
    setEmployeeGmail,
    employeeType, 
    setEmployeeType
  }

  return (
    <appContext.Provider value={context}>
      <Fragment>
        <Router />
      </Fragment>
    </appContext.Provider>
  )
}

export default App