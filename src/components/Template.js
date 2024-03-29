import React, { useState, useEffect } from "react";
import Navbar from "./Navbar"; // Import your Navbar component
import { useNavigate } from "react-router-dom";
import './Navbar.css';

function Template({ children }) {
    const navigate = useNavigate();

    const navigatePath = (path) => {
        navigate(path);
    };

    return (
        <div className="template">
            <Navbar />
            {children}
        </div>
    );
}

export default Template;
