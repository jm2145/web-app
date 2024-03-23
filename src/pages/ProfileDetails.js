import React from "react";
import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db, storage } from "../Firebase";
import './ProfileDetails.css';
import SuccessPopup from "../popups/SuccessPopup";
import LoginSuccessPopup from "../popups/LoginSuccessPopUp";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Navigate, useNavigate } from "react-router-dom";
import { getStorage } from "firebase/storage";

import { useRef } from "react";
import StarryBackground from "../components/StarryBg";
import { Path } from "three";

function ProfileDetails() {

    const [selectedInterests, setSelectedInterests] = useState([]);
    const imageRef = useRef(null);
    const [image, setImage] = useState("");
    const [username, setUsername] = useState('');
    const [profileDescription, setProfileDescription] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

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

    const handleDeleteImage = () => {
        // Reset the image state when the delete icon is clicked
        setImage("");
    };

    const handleInterestClick = (interest) => {
        setSelectedInterests((prevSelectedInterests) => {
            if (prevSelectedInterests.includes(interest)) {
                // If interest is already selected, remove it
                return prevSelectedInterests.filter((selectedInterest) => selectedInterest !== interest);
            } else {
                // If interest is not selected, add it
                return [...prevSelectedInterests, interest];
            }
        });
    };

    const handleCreateProfile = async () => {
        try {
            // Get the current user
            const currentUser = auth.currentUser;

            // Check if the user is logged in
            if (currentUser) {
                // Get the user's ID
                const userId = currentUser.uid;

                // Reference to the user's document in the "Users" collection
                const userRef = doc(db, "Users", userId);

                // Image upload to Firebase Storage
                if (image) {
                    const storageRef = ref(storage, `user-profiles/${userId}/profile-image`);
                    await uploadBytes(storageRef, image);

                    // Listen for state changes, errors, and completion of the upload.
                    const url = await getDownloadURL(storageRef);

                    // Retrieve existing data
                    const userDoc = await getDoc(userRef);
                    const existingData = userDoc.data() || {};

                    console.log("photo",url)
                    updateProfile(currentUser, {
                        displayName: username,
                        photoURL: url,
                    });

                    // Update the user's document with the merged data
                    const updatedData = {
                        ...existingData,
                        photoURL: url, // Fields for update
                        // Add other fields if they are not empty
                        ...(username && { username }),
                        ...(profileDescription && { profileDescription }),
                        ...(selectedInterests.length > 0 && { interests: selectedInterests }),
                        profileSetup: true
                    };

                    await setDoc(userRef, updatedData);

                    // Optionally, you can do something after the profile is created, e.g., redirect to another page
                    setSuccess(true);
                    console.log("Profile created successfully!");
                } else {

                    updateProfile(currentUser, {
                        displayName: username,
                    });
                    // Retrieve existing data
                    const userDoc = await getDoc(userRef);
                    const existingData = userDoc.data() || {};

                    // Update the user's document with the merged data
                    const updatedData = {
                        ...existingData,
                        // Add other fields if they are not empty
                        ...(username && { username }),
                        ...(profileDescription && { profileDescription }),
                        ...(selectedInterests.length > 0 && { interests: selectedInterests }),
                        profileSetup: true
                    };

                    await setDoc(userRef, updatedData);

                    // Optionally, you can do something after the profile is created, e.g., redirect to another page
                    setSuccess(true);
                    console.log("Profile created successfully!");
                }
            } else {
                console.error("User not logged in.");
            }
        } catch (error) {
            console.error("Error creating profile:", error);
        }
    };


    return (
        <div className="proDetBg">
            <StarryBackground />
            <div className="circle-delete" onClick={handleDeleteImage}>
                <img src="./delete.png" alt="delete" />
            </div>
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
                    <p className="realtime-text-username" >@{username || 'YourUsername'}</p>
                    <p className="realtime-text"> {profileDescription || 'Your Profile Description!'}</p>
                    {selectedInterests.length > 0 && (
                        <>
                            <p className="realtime-text">Interested in:</p>
                            <p className="realtime-text">{selectedInterests.join(", ")}</p>
                        </>
                    )}
                </div>
                <img className="clouds" src="./image_2023-12-19_233830828-removebg-preview.png" alt="clouds" />
                <img className="arrow" src="./image 4.png" alt="arrow" />
                <div className="centered-text">This is a preview of what your <br /> profile looks like to others!</div>
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
                    <div className={`interest-item ${selectedInterests.includes("Art") ? "selected" : ""}`} onClick={() => handleInterestClick("Art")}>
                        <img src="./art.png" className="interest-icon" />
                        <label className="interest-label">Art</label>
                    </div >
                    <div className={`interest-item ${selectedInterests.includes("Music") ? "selected" : ""}`} onClick={() => handleInterestClick("Music")}>
                        <img src="./music.png" className="interest-icon" />
                        <label className="interest-label">Music</label>
                    </div>
                    <div className={`interest-item ${selectedInterests.includes("Technology") ? "selected" : ""}`} onClick={() => handleInterestClick("Technology")}>
                        <img src="./technology.png" className="interest-icon" />
                        <label className="interest-label">Technology</label>
                    </div>
                    <div className={`interest-item ${selectedInterests.includes("TV/Movies") ? "selected" : ""}`} onClick={() => handleInterestClick("TV/Movies")}>
                        <img src="./tv.png" className="interest-icon" />
                        <label className="interest-label">TV/Movies </label>
                    </div>
                    <div className={`interest-item ${selectedInterests.includes("Dance") ? "selected" : ""}`} onClick={() => handleInterestClick("Dance")}>
                        <img src="./dance.png" className="interest-icon" />
                        <label className="interest-label">Dance </label>
                    </div>
                    <div className={`interest-item ${selectedInterests.includes("Gaming") ? "selected" : ""}`} onClick={() => handleInterestClick("Gaming")}>
                        <img src="./videogaming.png" className="interest-icon" />
                        <label className="interest-label">Gaming </label>
                    </div>
                    <div className={`interest-item ${selectedInterests.includes("Sports") ? "selected" : ""}`} onClick={() => handleInterestClick("Sports")}>
                        <img src="./sports.png" className="interest-icon" />
                        <label className="interest-label">Sports </label>
                    </div>
                    <div className={`interest-item ${selectedInterests.includes("Cooking/Baking") ? "selected" : ""}`} onClick={() => handleInterestClick("Cooking/Baking")}>
                        <img src="./cooking.png" className="interest-icon" />
                        <label className="interest-label">Cooking/Baking </label>
                    </div>
                </div>
                <div className="pd-buttons">
                    <button className="back"> Back </button>
                    <button className="create-profile-button" onClick={handleCreateProfile}>Create Profile</button>
                </div>
            </div>
            {/* Conditionally render the Popup component */}
            {success && (
                <LoginSuccessPopup
                    message="Profile Created Succesfully"
                    onClose={() => setSuccess(false)}
                    path = "/"
                    button="Lets Dream"
                />
            )}  
        </div>

    );
}


export default ProfileDetails