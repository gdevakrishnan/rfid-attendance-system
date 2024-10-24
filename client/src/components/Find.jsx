import React, { Fragment, useContext, useState } from 'react'
import appContext from '../context/appContext';
import { findWorker } from '../services/serviceWorker';
import Profile from '../assets/profile.png'
import Navbar from './Navbar';
import vector from '../assets/find.png';

function Find() {
    const { setMsg } = useContext(appContext);
    const initialState = {
        "rfid_id": ""
    }
    const [worker, setWorker] = useState(initialState);
    const [profile, setProfile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (worker.rfid_id.trim() === "") {
            setMsg("Enter all the fields");

            setTimeout(() => {
                setMsg("");
            }, 2000);
            return;
        }

        // To find the worker
        findWorker({ "rfid_id": (worker.rfid_id) })
            .then((response) => {
                if (response.status) {
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
    }

    return (
        <Fragment>
            <section className="page profilesPage singleFormPage">
                <Navbar />

                <form onSubmit={(e) => handleSubmit(e)}>
                    <input type="text" name="rfid_id" id="rfid_id" onChange={(e) => setWorker({ ...worker, [e.target.id]: e.target.value })} placeholder='RFID' />

                    <input type="submit" value="Find" onClick={(e) => handleSubmit(e)} />
                </form>

                {
                    (profile) ? (
                        <div className="profile">
                            <div className="image">
                                <img src={Profile} alt="profile" className="img" />
                            </div>
                            <div className='profile_component'>
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
                            </div>
                        </div>
                    ) : <img src={vector} alt="attendance" className="vector_img" />
                }
            </section>
        </Fragment>
    )
}

export default Find