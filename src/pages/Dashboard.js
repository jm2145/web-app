import React from "react";
import './Dashboard.css';
import Navbar from "../components/Navbar";


function Dashboard() {
    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div className="db-main-container">
                <div className="calender-container">
                    <div className="calender-top">
                        <img src="./component 1.png" alt="clouds" className="db-calender-clouds" />
                        <div className="calender-title">
                            Calender
                        </div>
                    </div>
                </div>
                <div className="todolist-container">
                    <div className="todolist-top">
                        <img src="./component 1.png" alt="clouds" className="db-todolist-clouds" />
                        <div className="todolist-title">
                            To-Do List
                        </div>
                    </div>
                </div>
            </div>
            <img src="./image 1.png" alt="moon" className="moon-icon" />

        </div>
    )
}

export default Dashboard;