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
  const [employeeRfid, setEmployeeRfid] = useState(null);
  const [companyUid, setCompanyUid] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    getAttendaceData({"company_uid": companyUid}).then((response) => {
      if (response.status) {
        setAttendance(response.data);
      }
    });
  }, [attendance, setAttendance]);

  const context = {
    attendance,
    msg,
    employeeUsername,
    employeeGmail,
    employeeType, 
    employeeRfid, 
    companyUid,
    isLogin,
    setAttendance,
    setMsg,
    setEmployeeUsername,
    setEmployeeGmail,
    setEmployeeType,
    setEmployeeRfid,
    setCompanyUid,
    setIsLogin
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