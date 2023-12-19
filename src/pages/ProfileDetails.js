import React from "react";
import { useState } from "react";
import './ProfileDetails.css';


function ProfileDetails() {
    const [username, setUsername] = useState('');
    const [profileDescription, setProfileDescription] = useState('');

    // Handler functions to update the state as the user types
    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handleProfileDescriptionChange = (event) => {
        setProfileDescription(event.target.value);
    };

    return (
        <div className="proDetBg">
            <div>
                {/* Username input box */}
                <div className="input-boxes">
                    <div>
                        <label className="username-label" htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Enter your desired username"
                        />
                    </div>

                    {/* Profile description input box */}
                    <div>
                        <label className="profiledesc-label" htmlFor="profileDescription">Profile Description:</label>
                        <input
                            type="text"
                            id="profileDescription"
                            value={profileDescription}
                            onChange={handleProfileDescriptionChange}
                            placeholder="A short description about yourself!"
                        />
                    </div>
                </div>

                {/* Display the entered content below each other */}
                <div className="results">
                    <p className="realtime-text">Username: @{username}</p>
                    <p className="realtime-text">Profile Description: {profileDescription}</p>
                </div>
            </div>
        </div>
    );
}


export default ProfileDetails