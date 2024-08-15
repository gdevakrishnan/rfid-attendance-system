import React, { Fragment, useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userRegisteration } from '../services/serviceWorker';
import appContext from '../context/appContext'

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
            <section className="page signup_page trainPage">
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="form_group">
                        <label htmlFor="name">User Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                        />
                    </div>
                    <div className="form_group">
                        <label htmlFor="gmail">E-Mail</label>
                        <input
                            type="email"
                            name="gmail"
                            id="gmail"
                            value={formData.gmail}
                            onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                        />
                    </div>
                    <div className="form_group">
                        <label htmlFor="company_uid">Company Unique ID</label>
                        <input
                            type="text"
                            name="company_uid"
                            id="company_uid"
                            value={formData.company_uid}
                            onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                        />
                    </div>
                    <div className="form_group">
                        <label htmlFor="rfid_id">RFID</label>
                        <input
                            type="text"
                            name="rfid_id"
                            id="rfid_id"
                            value={formData.rfid_id}
                            onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                        />
                    </div>
                    <div className="form_group">
                        <label htmlFor="pwd">Password</label>
                        <input
                            type="password"
                            name="pwd"
                            id="pwd"
                            value={formData.pwd}
                            onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                        />
                    </div>
                    <div className="form_group">
                        <label htmlFor="cpwd">Re-Password</label>
                        <input
                            type="password"
                            name="cpwd"
                            id="cpwd"
                            value={formData.cpwd}
                            onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                        />
                    </div>

                    <input
                        type="submit"
                        value="Signup"
                        onSubmit={(e) => handleSubmit(e)}
                    />
                </form>
                <p>Already have an accout? <Link to={'/login'}>Login</Link></p>
            </section>
        </Fragment>
    )
}

export default Signup