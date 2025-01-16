import React, { Fragment, useContext, useEffect, useRef, useState } from 'react'
import appContext from '../context/appContext'
import { putAttendance } from '../services/serviceWorker';
import Navbar from './Navbar';
import vector from '../assets/attendance.png';
import Webcam from "react-webcam";
import jsQR from "jsqr";

function Attendance() {
  const { setMsg } = useContext(appContext);
  const initialState = {
    "rfid_id": ""
  }
  const [worker, setWorker] = useState(initialState);

  const makeAttendance = (workerData) => {
    // To find the worker
    putAttendance(workerData)
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (worker.rfid_id.trim() === "") {
      setMsg("Enter all the fields");

      setTimeout(() => {
        setMsg("");
      }, 2000);
      return;
    }

    makeAttendance({ "rfid_id": worker.rfid_id });
  }

  const webcamRef = useRef(null);
  const [qrText, setQrText] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      scanQRCode();
    }, 2000); // Scans every 100ms

    return () => clearInterval(interval);
  }, []);

  const scanQRCode = () => {
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Create a canvas to capture the video frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");

        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Extract the image data from the canvas
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Use jsQR to decode the QR code from the image
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          setQrText(code.data); // Set the decoded QR code text
          console.log("QR Code Data:", code.data);
          setWorker({ ...worker, "rfid_id": code.data });
          makeAttendance({ "rfid_id": code.data });
        }
      }
    }
  };

  return (
    <Fragment>
      <section className="page profilesPage singleFormPage" >
        <Navbar />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '40px' }}>
          <div className="form" style={{ display: 'flex', flexDirection: "column", alignItems: 'center' }}>
            <form onSubmit={(e) => handleSubmit(e)}>
              <input type="text" name="rfid_id" id="rfid_id" onChange={(e) => setWorker({ ...worker, [e.target.id]: e.target.value })} placeholder='RFID' />

              <input type="submit" value="scan" onClick={(e) => handleSubmit(e)} />
            </form>
            <img src={vector} alt="attendance" className="vector_img" />
          </div>


          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Webcam
              ref={webcamRef}
              style={{
                width: "350px",
                maxWidth: "350px",
                margin: "0 auto",
                border: "1px solid #ddd",
              }}
              videoConstraints={{
                facingMode: "environment", // Use the rear camera on mobile devices
              }}
            />
            {qrText && (
              <div style={{ marginTop: "20px" }}>
                <h1>RFID: {qrText}</h1>
              </div>
            )}
          </div>
        </div>
      </section>
    </Fragment>
  )
}

export default Attendance