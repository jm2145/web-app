import React from "react";
import "./SuccessPopup.css"; // Import CSS for styling the pop-up
import { Link } from "react-router-dom";
import Lottie from 'lottie-react'
import animationData from "../Effects/Animation - 1706284431112.json"; // Update the path accordingly

function SuccessPopup({ message, onClose }) {
  const handleAnimationComplete = () => {
    // Close the popup after animation ends
    onClose();
  };
  return (
    <div className="popup-background">
      {/* <div className="popup-content"> */}

        {/* <p>{message}</p> */}
        <div className="lottie-check">
        <Lottie animationData={animationData} loop={false} onComplete={handleAnimationComplete}/>
        </div>
        
      {/* </div> */}
    </div>
  );
}


export default SuccessPopup;