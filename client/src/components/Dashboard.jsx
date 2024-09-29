import React, { Fragment } from 'react'
import app_logo from '../assets/app_logo.png';
import { Link } from 'react-router-dom';
import img1 from '../assets/icons/dashboard/img1.png';
import img2 from '../assets/icons/dashboard/img2.png';
import img3 from '../assets/icons/dashboard/img3.png';
import img4 from '../assets/icons/dashboard/img4.png';

function Dashboard() {
  return (
    <Fragment>
      <section className="page hero_page">
        <header>
          <div className="logo_container">
            <img src={app_logo} alt="Tech Vaseegrah" className="logo" />
            <h1 className="logo_title">Attend-io</h1>
          </div>

          <nav>
            <ul>
              <li>
                <Link to={'/'}>Resourced</Link>
              </li>
              <li>
                <Link to={'/'}>About</Link>
              </li>
              <li>
                <Link to={'/'}>
                  <button className='pricing_btn btn'>pricing</button>
                </Link>
              </li>
              <li>
                <Link to={'/'}>
                  <button className='discover_btn btn'>Discover the platform</button>
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <div className="main_container">
          <div className="container">
            <img src={img1} alt="img1" className="img1" />
            <img src={img2} alt="img2" className="img2" />
            <img src={img3} alt="img3" className="img3" />
            <img src={img4} alt="img4" className="img4" />
            
            <div className="content">
              <h1 className="hero_title"><span>Smart</span> Attendance, </h1>
              <h1 className="hero_title">Smarter Workforce</h1>
              <p className="hero_content">With our software, attendance is more than just a check-in. Leverage  comprehensive analytics to understand productivity trends, improve scheduling, and make smarter workforce decisions</p>
            </div>

            <div className="button">
              <button className="btn">Continue Login</button>
            </div>
          </div>
        </div>

        <div className="ellipse"></div>
      </section>
    </Fragment>
  )
}

export default Dashboard
