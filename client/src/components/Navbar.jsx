import React, { Fragment, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import appContext from '../context/appContext'

function Navbar() {
  const {
    employeeType,
    employeeUsername,
    setEmployeeUsername,
    setEmployeeGmail,
    setEmployeeType,
    setEmployeeRfid
  } = useContext(appContext);

  const nav = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    setEmployeeUsername(null);
    setEmployeeGmail(null);
    setEmployeeType(null);
    setEmployeeRfid(null);
    nav('/');
  }

  return (
    <Fragment>
      <nav className='nav'>
        <input type="checkbox" name="check" id="check" />
        <h1 className="logo">Attend-ie</h1>
        <label htmlFor="check"><i className="fa fa-bars"></i></label>
        <ul>
          <li>
            <Link to={'/'}>Home</Link>
          </li>
          {
            (employeeType && employeeType == "admin") ? (
              <Fragment>
                <li>
                  <Link to={'/add'}>Add</Link>
                </li>
                <li>
                  <Link to={'/find'}>Find</Link>
                </li>
              </Fragment>
            ) : null
          }
          {
            (employeeUsername && employeeUsername.trim() != "") ? (
              <Fragment>
                <li>
                  <Link to={'/attendance'}>Attendance</Link>
                </li>
                <li>
                  <Link to={'/profile'}>{employeeUsername}</Link>
                </li>
                <li>
                  <button className='logout_btn' onClick={(e) => handleLogout(e)}>Logout</button>
                </li>
              </Fragment>
            ) : (
              <Fragment>
                <li>
                  <Link to={'/login'}>Login</Link>
                </li>
                <li>
                  <Link to={'/signup'}>Signup</Link>
                </li>
              </Fragment>
            )
          }
        </ul>
      </nav>
    </Fragment>
  )
}

export default Navbar