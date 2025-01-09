import React, { Fragment } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Attendance from '../components/Attendance';
import Message from '../components/Message';
import Footer from '../components/Footer';
import Profile from '../components/Profile';
import Add from '../components/Add';
import Login from '../components/Login';
import Signup from '../components/Signup';
import Find from '../components/Find';
import AttendanceDashboard from '../components/AttendanceDashboard';
import Dashboard from '../components/Dashboard';

function Router() {
  return (
    <Fragment>
        <BrowserRouter>
            <Message />
            <Routes>
                <Route path='/' index element={<Dashboard />}/>
                <Route path='/reports' element={<AttendanceDashboard />}/>
                <Route path='/add' element={<Add />}/>
                <Route path='/attendance' element={<Attendance />}/>
                <Route path='/find' element={<Find />}/>
                <Route path='/login' element={<Login />}/>
                <Route path='/signup' element={<Signup />}/>
                <Route path='/profile' element={<Profile />}/>
            </Routes>
            <Outlet />
            <Footer />
        </BrowserRouter>
    </Fragment>
  )
}

export default Router