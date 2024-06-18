import React, { Fragment } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Dashboard from '../components/Dashboard';
import Navbar from '../components/Navbar';
import Attendance from '../components/Attendance';
import Message from '../components/Message';
import Footer from '../components/Footer';
import Profiles from '../components/Profiles';
import Add from '../components/Add';

function Router() {
  return (
    <Fragment>
        <BrowserRouter>
            <Navbar />
            <Message />
            <Routes>
                <Route path='/' index element={<Dashboard />}/>
                <Route path='/add' element={<Add />}/>
                <Route path='/attendance' element={<Attendance />}/>
                <Route path='/profiles' element={<Profiles />}/>
            </Routes>
            <Outlet />
            <Footer />
        </BrowserRouter>
    </Fragment>
  )
}

export default Router