import React, { Fragment, useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userLogin } from '../services/serviceWorker';
import appContext from '../context/appContext';
import vector from '../assets/login.png';
import Navbar from './Navbar';

function Login() {
    const {
        setMsg,
        setEmployeeUsername,
        setEmployeeGmail,
        setEmployeeType,
        setEmployeeRfid,
        setCompanyUid,
        setIsLogin,
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
                setIsLogin(true);
                setTimeout(() => {
                    setMsg("");
                }, 2000);
                nav('/add');
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
                <Navbar />

                <div className="form_main">
                    <div className="form_left">
                        <div className="form_container">
                            <h1 className="form_title">Signin your account</h1>
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
                                        type="password"
                                        name="pwd"
                                        id="pwd"
                                        value={formData.pwd}
                                        onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                                        placeholder='password'
                                    />
                                </div>

                                <div className="form_group">
                                    <input type="checkbox" name="terms" id="terms" />
                                    <label htmlFor="terms">
                                        By clicking you accept our terms and policies/this infoprmation wil be securely transferred to attend ie
                                    </label>
                                </div>

                                <input
                                    type="submit"
                                    value="Login"
                                    onSubmit={(e) => handleSubmit(e)}
                                />
                            </form>
                            <p>Don't have an account? <Link to={'/signup'}>Signup</Link></p>
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

export default Login