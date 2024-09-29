import React, { Fragment, useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userLogin } from '../services/serviceWorker';
import appContext from '../context/appContext';

function Login() {
    const {
        setMsg,
        setEmployeeUsername,
        setEmployeeGmail,
        setEmployeeType,
        setEmployeeRfid,
        setCompanyUid
    } = useContext(appContext)
    const initialState = {
        "name": "",
        "gmail": "",
        "pwd": "",
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

        userLogin(formData)
            .then((response) => {
                console.log(response.data.user_data);
                setEmployeeUsername(response.data.user_data[0].name);
                setEmployeeGmail(response.data.user_data[0].gmail);
                setEmployeeType(response.data.user_data[0].type);
                setEmployeeRfid(response.data.user_data[0].rfid_id);
                setCompanyUid(response.data.user_data[0].company_uid);
                setMsg(response.data.message);
                setTimeout(() => {
                    setMsg("");
                }, 2000);
                nav('/');
            })
            .catch((e) => {
                setMsg("Login Failed");
                setTimeout(() => {
                    setMsg("");
                }, 4000);

                console.log(e.message)
            });
    }

    return (
        <Fragment>
            <section className="page login_page form_page">
                <div className="form_main">
                    <div className="form_container left_form">
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
                    </div>
                    <div className="right_form"></div>
                </div>
            </section>
        </Fragment>
    )
}

export default Login