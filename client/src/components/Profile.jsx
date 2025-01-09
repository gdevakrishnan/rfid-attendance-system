import React, { Fragment, useContext, useEffect, useState } from 'react'
import appContext from '../context/appContext'
import { findWorker } from '../services/serviceWorker';
import ProfileImg from '../assets/profile.png'
import Navbar from './Navbar';

function Profile() {
  const {
    employeeRfid,
    setMsg
  } = useContext(appContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    employeeRfid && findWorker({ "rfid_id": employeeRfid })
      .then((response) => {
        if (response.status) {
          console.log(response.data);
          setProfile(response.data)
        } else {
          setMsg("Worker not found");
          setTimeout(() => {
            setMsg("");
          }, 4000)
        }
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, [])

  return (
    <Fragment>
      <Navbar />
      <section className="page profilesPage">
        <div className="profile">
          {
            (profile) ? (
              <Fragment>
                <div className="image">
                  <img src={ProfileImg} alt="profile" className="img" />
                </div>
                <div className="details">
                  <table>
                    <tbody>
                      <tr>
                        <th>Name</th>
                        <td>{profile.name}</td>
                      </tr>
                      <tr>
                        <th>RFID</th>
                        <td>{profile.rfid_id}</td>
                      </tr>
                      <tr>
                        <th>Age</th>
                        <td>{profile.age}</td>
                      </tr>
                      <tr>
                        <th>Mobile</th>
                        <td>{profile.mobile}</td>
                      </tr>
                      <tr>
                        <th>Role</th>
                        <td>{profile.job_role}</td>
                      </tr>
                      <tr>
                        <th>Working Hours</th>
                        <td>{profile.working_hours} hours</td>
                      </tr>
                      <tr>
                        <th>Original Salary</th>
                        <td>Rs.{profile.salary}</td>
                      </tr>
                      <tr>
                        <th>Salary</th>
                        <td>Rs.{profile.final_salary}</td>
                      </tr>
                      <tr>
                        <th>Token</th>
                        <td>{profile.token}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Fragment>
            ) : null
          }
        </div>
      </section>
    </Fragment>
  )
}

export default Profile