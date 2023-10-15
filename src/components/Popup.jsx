import React from "react";
import "./Popup.css"; // Import CSS for styling the pop-up
import { Link } from "react-router-dom";

function Popup({ message, onClose }) {
  return (
    <div className="popup-background">
      <div className="popup-content">
        <p>{message}</p>
        <Link className="popup-button" to="/login"> Sign In</Link>
      </div>
    </div>
  );
}

export default Popup;