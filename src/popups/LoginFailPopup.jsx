import React from 'react'
import { useState } from 'react';
import { Link } from "react-router-dom";
import Lottie from 'lottie-react'
import { useNavigate } from 'react-router-dom';
import animationData from "../Effects/Animation - 1706284431112.json"; // Update the path accordingly
import './LoginSuccessPopup.css'

function LoginFailPopup({ message, onClose }) {
    const handleButtonClick = () => {
        // Close the popup and navigate to the desired location
        onClose();
    };

    return (
        <div className="su-success-popup-background">
            <div className='su-success-popup-content'>
                <p>{message}</p>
                <button onClick={handleButtonClick} className='su-success-popup-button'>Retry</button>
            </div>
        </div>
    );
}


export default LoginFailPopup;