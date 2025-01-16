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

  const getUserDetails = async () => {
    const data = await JSON.parse(localStorage.getItem("attendie-user"));
    setEmployeeUsername(data.name);
    setEmployeeGmail(data.email);
    setEmployeeRfid(data.rfid_id);
    setEmployeeType(data.type);
    setIsLogin(data.isLogin);
    setCompanyUid(data.company_uid);
  }

  useEffect(() => {
    if (employeeUsername && employeeGmail && employeeType && employeeRfid && companyUid && employeeUsername.trim() != "" && employeeGmail.trim() != "" && employeeType.trim() != "" && employeeRfid.trim() != "" && companyUid.trim() != "") {
      setIsLogin(true);
    }
  }, [employeeUsername, employeeGmail, employeeType, employeeRfid, companyUid]);

  useEffect(() => {
    getUserDetails();
    getAttendaceData({ "company_uid": companyUid }).then((response) => {
      if (response.status) {
        setAttendance(response.data);
      }
    })
  }, [companyUid, setCompanyUid]);

  // setInterval(() => [
  //   getAttendaceData({ "company_uid": companyUid }).then((response) => {
  //     if (response.status) {
  //       setAttendance(response.data);
  //     }
  //   })
  // ], 1000)

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