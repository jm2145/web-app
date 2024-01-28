import React from 'react'
import { useState } from 'react';
import { Link } from "react-router-dom";
import Lottie from 'lottie-react'
import { useNavigate } from 'react-router-dom';
import animationData from "../Effects/Animation - 1706284431112.json"; // Update the path accordingly
import './LoginSuccessPopup.css'

function LoginSuccessPopup({ message, onClose , path, button}) {
    const navigate = useNavigate();
    const [showAnimation, setShowAnimation] = useState(true);

    const handleAnimationComplete = () => {
        // Set animationComplete to true after animation ends
        setShowAnimation(false);
    };

    const handleButtonClick = () => {
        // Close the popup and navigate to the desired location
        onClose();
        navigate(path);
    };

    return (
        <div className="su-success-popup-background">

            {showAnimation ? (
                <div className="su-success-lottie-check">
                    <Lottie animationData={animationData} loop={false} onComplete={handleAnimationComplete} />
                </div>
            ) : (
                <div className='su-success-popup-content'>
                    <p className='su-success-message'>{message}</p>
                    <button onClick={handleButtonClick} className='su-success-popup-button'>{button}</button>
                </div>
            )}

        </div>
    );
}


export default LoginSuccessPopup;