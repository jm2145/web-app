import React from "react";
import "./Popup.css"; // Import CSS for styling the pop-up
import { Link } from "react-router-dom";
import Lottie from 'lottie-react'
import animationData from "../Effects/Animation - 1706284431112.json"; // Update the path accordingly

function Popup({ message, onClose }) {
  return (
    <div className="popup-background">
      <div className="popup-content">

        <p>{message}</p>
        <Lottie animationData={animationData}/>
        <Link className="popup-button" to="/"> Sign In</Link>
      </div>
    </div>
  );
}


export default Popup;