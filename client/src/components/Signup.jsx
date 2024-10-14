import React, { Fragment, useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userRegisteration } from '../services/serviceWorker';
import appContext from '../context/appContext'
import vector from '../assets/register.png';
import Navbar from './Navbar';

function Signup() {
    const { setMsg } = useContext(appContext);
    const initialState = {
        "name": "",
        "gmail": "",
        "company_uid": "",
        "rfid_id": "",
        "pwd": "",
        "cpwd": ""
    }

    const [formData, setFormData] = useState(initialState);

    const nav = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        for (const key in formData) {
            if (formData[key] === "") {
                setMsg("Enter all the fields");
                setTimeout(() => {
                    setMsg("");
                }, 4000);
                return;
            }
        }

        if (formData.pwd !== formData.cpwd) {
            setMsg("Password Mismatch");
            setTimeout(() => {
                setMsg("");
            }, 4000);
            return;
        }

        userRegisteration(formData)
            .then((response) => {
                setMsg(response.data.message);
                setTimeout(() => {
                    setMsg("");
                }, 2000);
                nav('/login');
            })
            .catch((e) => console.log(e.message));
    }

    return (
        <Fragment>
            <section className="page signup_page form_page">
                <Navbar />
                <div className="form_main">
                    <div className="form_left">

                        <div className="form_container">
                            <h1 className="form_title">Create an account</h1>

                            <form onSubmit={(e) => handleSubmit(e)}>
                                <div className="form_group">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                                        placeholder='username'
                                    />
                                </div>
                                <div className="form_group">
                                    <input
                                        type="email"
                                        name="gmail"
                                        id="gmail"
                                        value={formData.gmail}
                                        onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                                        placeholder='email'
                                    />
                                </div>
                                <div className="form_group">
                                    <input
                                        type="text"
                                        name="company_uid"
                                        id="company_uid"
                                        value={formData.company_uid}
                                        onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                                        placeholder='company unique id'
                                    />
                                </div>
                                <div className="form_group">
                                    <input
                                        type="text"
                                        name="rfid_id"
                                        id="rfid_id"
                                        value={formData.rfid_id}
                                        onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                                        placeholder='RFID id'
                                    />
                                </div>
                                <div className="form_group">
                                    <input
                                        type="password"
                                        name="pwd"
                                        id="pwd"
                                        value={formData.pwd}
                                        onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                                        placeholder='password'
                                    />
                                </div>
                                <div className="form_group">
                                    <input
                                        type="password"
                                        name="cpwd"
                                        id="cpwd"
                                        value={formData.cpwd}
                                        onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                                        placeholder='confirm password'
                                    />
                                </div>

                                <input
                                    type="submit"
                                    value="Signup"
                                    onSubmit={(e) => handleSubmit(e)}
                                />
                            </form>
                            <p>Already have an accout? <Link to={'/login'}>Login</Link></p>
                        </div>
                    </div>
                    <div className="form_right">
                        <img src={vector} alt="vector" className="vector" />
                    </div>
                </div>
            </section>
        </Fragment>
    )
}

export default Signup