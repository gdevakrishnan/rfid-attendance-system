import React, { Fragment, useContext, useState } from 'react'
import appContext from '../context/appContext'
import { putAttendance } from '../services/serviceWorker';
import Navbar from './Navbar';
import vector from '../assets/attendance.png';

function Attendance() {
  const { setMsg } = useContext(appContext);
  const initialState = {
    "rfid_id": ""
  }
  const [worker, setWorker] = useState(initialState);

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
    putAttendance({ "rfid_id": (worker.rfid_id) })
      .then((response) => {
        if (response.status) {
          setMsg(response.data.message);
          setTimeout(() => {
            setMsg("");
          }, 4000);
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

          <input type="submit" value="scan" onClick={(e) => handleSubmit(e)} />
        </form>

        <img src={vector} alt="attendance" className="vector_img" />
      </section>
    </Fragment>
  )
}

export default Attendance