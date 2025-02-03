import React, { Fragment, useContext, useEffect, useState } from 'react';
import appContext from '../context/appContext';
import { findWorker } from '../services/serviceWorker';
import ProfileImg from '../assets/profile.png';
import Navbar from './Navbar';

function Profile() {
  const { employeeRfid, setMsg } = useContext(appContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [rfidId, setRfidId] = useState(null);

  const fetchWorkerData = () => {
    const rfid_id = JSON.parse(localStorage.getItem('attendie-user')).rfid_id;

    if (rfid_id) {
      setRfidId(rfid_id);
      findWorker({ rfid_id })
        .then((response) => {
          if (response.status) {
            setProfile(response.data);
          } else {
            setMsg('Worker not found');
            setTimeout(() => {
              setMsg(null);
            }, 4000);
            setProfile(null);
          }
        })
        .catch((error) => {
          console.error('Error fetching worker data:', error);
          setMsg('An error occurred while fetching the worker data');
          setProfile(null);
        })
        .finally(() => {
          setLoading(false); // Set loading to false after API call
        });
    } else {
      setMsg('No RFID provided');
      setLoading(false);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchWorkerData();
    }, 5000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [employeeRfid, setMsg]);

  if (loading) {
    return (
      <Fragment>
        <Navbar />
        <section className="page profilesPage">
          <div className="profile">
            <p>Loading profile data...</p>
          </div>
        </section>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Navbar />
      <section className="page profilesPage">
        <div className="profile">
          {profile ? (
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
          ) : (
            <p>Profile data not found. Please check the RFID or try again.</p>
          )}
        </div>
      </section>
    </Fragment>
  );
}

export default Profile;
