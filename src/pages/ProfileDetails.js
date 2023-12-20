import React from "react";
import { useState } from "react";
import './ProfileDetails.css';
import { useRef } from "react";

function ProfileDetails() {

    const imageRef = useRef(null);
    const [image, setImage] = useState("");
    const [username, setUsername] = useState('');
    const [profileDescription, setProfileDescription] = useState('');

    // Handler functions to update the state as the user types
    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handleProfileDescriptionChange = (event) => {
        setProfileDescription(event.target.value);
    };

    const handleImageClick = () => {
        imageRef.current.click();
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setImage(event.target.files[0]);

    }

    return (
        <div className="proDetBg">

            {/* Display the entered content below each other */}
            <div className="results">
                <div className="image-upload-container">
                    <div className="box-decoration">

                        <div onClick={handleImageClick} style={{ cursor: "pointer" }}>
                            {image ? (
                                <img src={URL.createObjectURL(image)} alt="upload image" className="img-display-after" />
                            ) : (
                                <img src="./Ellipse 13.png" alt="upload image" className="img-display-before" />
                            )}

                            <input
                                id="image-upload-input"
                                type="file"
                                onChange={handleImageChange}
                                ref={imageRef}
                                style={{ display: "none" }}
                            />
                        </div>
                        <button onClick={handleImageClick} className="upload-pic-button">
                            Upload New Photo
                        </button>

                        {/* <button
                            className="image-upload-button"
                            onClick={handleUploadButtonClick}
                        >
                            Upload
                        </button> */}
                    </div>
                </div>
                <div>
                    <p className="realtime-text">@{username}</p>
                    <p className="realtime-text">Profile Description: {profileDescription}</p>
                </div>
            </div>

            {/* Username input box */}
            <div className="input-boxes">
                <div className="username">
                    <label className="username-label" htmlFor="username">Username:</label>
                    <input
                        className="username-inputbox"
                        type="text"
                        id="username"
                        value={username}
                        onChange={handleUsernameChange}
                        placeholder="Enter your desired username"
                    />
                </div>



                {/* Profile description input box */}
                <div className="desc">
                    <label className="profiledesc-label" htmlFor="profileDescription">Profile Description:</label>
                    <input
                        className="desc-inputbox"
                        type="text"
                        id="profileDescription"
                        value={profileDescription}
                        onChange={handleProfileDescriptionChange}
                        placeholder="A short description about yourself!"
                    />
                </div>
                <div className="interests">
                    Interests:
                </div>
                <div className="interest-choice">
                    <div> Art </div>
                    <div> Music </div>
                    <div> Technology </div>
                    <div> TV/Movies </div>
                    <div> Dance </div>
                    <div> Gaming </div>
                    <div> Sports </div>
                    <div> Cooking/Baking </div>
                </div>
            </div>
         




        </div>
        
    );
}


export default ProfileDetails