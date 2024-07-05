import React, { Fragment, useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { userLogin } from '../services/serviceWorker';
import appContext from '../context/appContext';

function Login() {
    const {
        setMsg,
        setEmployeeUsername,
        setEmployeeGmail,
        setEmployeeType
    } = useContext(appContext)
    const initialState = {
        "name": "",
        "gmail": "",
        "pwd": "",
    }

    const [formData, setFormData] = useState(initialState);

    const handleSubmit = (e) => {
        e.preventDefault();
        userLogin(formData)
            .then((response) => {
                setEmployeeUsername(response.data.user_data[0].name);
                setEmployeeGmail(response.data.user_data[0].gmail);
                setEmployeeType(response.data.user_data[0].type);
                setMsg(response.data.message);
                setTimeout(() => {
                    setMsg("");
                }, 2000);
            })
            .catch((e) => console.log(e.message));
    }

    return (
        <Fragment>
            <section className="page login_page trainPage">
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

                    <input
                        type="submit"
                        value="Login"
                        onSubmit={(e) => handleSubmit(e)}
                    />
                </form>
                <p>Don't have an account? <Link to={'/signup'}>Signup</Link></p>
            </section>
        </Fragment>
    )
}

export default Login