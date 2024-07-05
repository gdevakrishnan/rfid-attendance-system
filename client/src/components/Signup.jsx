import React, { Fragment, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { userRegisteration } from '../services/serviceWorker';
import appContext from '../context/appContext'

function Signup() {
    const { setMsg } = useContext(appContext);
    const initialState = {
        "name": "",
        "gmail": "",
        "pwd": "",
        "cpwd": ""
    }

    const [formData, setFormData] = useState(initialState);

    const handleSubmit = (e) => {
        e.preventDefault();
        userRegisteration(formData)
            .then((response) => {
                console.log(response.data.message);
                setMsg(response.data.message);
                setTimeout(() => {
                    setMsg("");
                }, 2000);
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