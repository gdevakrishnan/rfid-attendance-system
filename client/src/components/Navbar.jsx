import React, { Fragment, useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBarsStaggered } from "react-icons/fa6";
import { GrClose } from "react-icons/gr";
import appContext from '../context/appContext'
import app_logo from '../assets/app_logo.png';

function Navbar() {
  const [menuBtn, setMenuBtn] = useState(true);

  const {
    employeeType,
    employeeUsername,
    setEmployeeUsername,
    setEmployeeGmail,
    setEmployeeType,
    setEmployeeRfid,
    setIsLogin
  } = useContext(appContext);

  const nav = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('attendie-user');
    setEmployeeUsername(null);
    setEmployeeGmail(null);
    setEmployeeType(null);
    setEmployeeRfid(null);
    setIsLogin(false);
    nav('/');
  }

  return (
    <Fragment>
      <header>
        <div className="logo_container">
          <Link to={'/'}>
            <img src={app_logo} alt="Tech Vaseegrah" className="logo" />
          </Link>
          <h1 className="logo_title">Attend-io</h1>
        </div>
        <nav>
          {/* <input type="checkbox" id="check" onClick={() => setMenuBtn(!menuBtn)} />
          <label htmlFor='check' className="overlay"></label>
          <label htmlFor='check' className="checkbtn">
            {
              (menuBtn) ? <FaBarsStaggered className='fa' /> : <GrClose className='fa' />
            }
          </label>

          <Link to={'/'} className='logo'>
            <h1>Attend-ie</h1>
          </Link> */}

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
                    <button className='logout_btn discover_btn' onClick={(e) => handleLogout(e)}>Logout</button>
                  </li>
                </Fragment>
              ) : (
                <Fragment>
                  <li>
                    <Link to={'/signup'}>Signup</Link>
                  </li>
                  <li>
                    <Link to={'/login'}>Login</Link>
                  </li>
                </Fragment>
              )
            }
          </ul>
        </nav>
      </header>
    </Fragment>
  )
}

export default Navbar