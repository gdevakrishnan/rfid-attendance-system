import React, { Fragment, useContext, useState } from 'react';
import appContext from '../context/appContext';

function AttendanceDashboard() {
  const { attendance } = useContext(appContext);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [status, setStatus] = useState(false);

  const Template = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>RFID</th>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Presence</th>
          </tr>
        </thead>
        <tbody>
          {
            attendance.map((aData) => {
              return (
                <tr key={aData._id}>
                  <td>{aData.rfid_id}</td>
                  <td>{aData.name}</td>
                  <td>{aData.date}</td>
                  <td>{aData.time}</td>
                  <td>{(aData.presence) ? "IN" : "OUT"}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  }


  const FilterTemplate = () => {
    return (
      (filteredAttendance.length > 0) ? (
        <Fragment>
          <table className='filterTable'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Presence</th>
              </tr>
            </thead>
            <tbody>
              {
                filteredAttendance.map((aData) => {
                  return (
                    <tr key={aData._id}>
                      <td>{aData.name}</td>
                      <td>{aData.date}</td>
                      <td>{aData.time}</td>
                      <td>{(aData.presence) ? "IN" : "OUT"}</td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </Fragment>
      ) : <h1 className='notFound'>No Data Found</h1>
    );
  }

  const handleFilter = (e) => {
    e.preventDefault();
    if (filterDate.trim() !== "" || filterName.trim() !== "") {
      let filter = attendance.filter((aData) => aData.date === filterDate && aData.name === filterName);
      setFilteredAttendance(filter);
      setStatus(true);
    }
  }

  const handleReset = (e) => {
    e.preventDefault();
    setStatus(false);
    setFilteredAttendance([]);
    setFilterDate(""); // Clear the input field
    setFilterName(""); // Clear the input field
  }

  return (
    <Fragment>
      <section className="page tablePage">
        <form onSubmit={(e) => handleFilter(e)}>
          <div className="form_group" style={{ display: "flex", gap: "20px" }}>
            <input type="date" name="filteredDate" id="setFilteredDate" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            <input type="text" name="filterName" id="filterName" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder='name' />
          </div>
          <div className="btn">
            <input type="submit" value="Filter" onClick={(e) => handleFilter(e)} />
            <button onClick={handleReset}>Reset</button>
          </div>
        </form>
        {status ? <FilterTemplate /> : null}
        {
          (attendance.length > 0) ? <Template /> : <h1 className='notFound'>No Data Found</h1>
        }
      </section>
    </Fragment>
  )
}

export default AttendanceDashboard;
