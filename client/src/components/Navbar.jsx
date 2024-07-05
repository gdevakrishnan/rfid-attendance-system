import React, { Fragment, useContext } from 'react'
import { Link } from 'react-router-dom'
import appContext from '../context/appContext'

function Navbar() {
  const {
    employeeType,
    employeeUsername
  } = useContext(appContext);

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
          <li>
            <Link to={'/attendance'}>Attendance</Link>
          </li>
          {
            (employeeType && employeeType == "admin") ? (
              <Fragment>
                <li>
                  <Link to={'/add'}>Add</Link>
                </li>
              </Fragment>
            ) : null
          }
          {
            (employeeUsername && employeeUsername.trim() != "") ? (
              <Fragment>
                <li>
                  <Link to={'/profiles'}>{employeeUsername}</Link>
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