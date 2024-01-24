import { React, useState, useContext, useRef, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db, storage } from "../Firebase";
import './ProfileSettings.css';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


function ProfileSettings() {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedInterests, setSelectedInterests] = useState([]);
    const imageRef = useRef(null);
    const [image, setImage] = useState("");
    const [username, setUsername] = useState('');
    const [profileDescription, setProfileDescription] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');


    const navigatePath = (path) => {
        navigate(path);
    }

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

    // const handleDeleteImage = () => {
    //     // Reset the image state when the delete icon is clicked
    //     setImage("");
    // };

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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = currentUser.uid;
                const userRef = doc(db, "Users", userId);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUsername(userData.username || '');
                    setProfileDescription(userData.profileDescription || '');

                    // Set profile picture URL
                    if (currentUser.photoURL) {
                        setProfilePicUrl(currentUser.photoURL);
                    }


                    setSelectedInterests(userData.interests || []);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, [currentUser]);


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
        <div className="ps-mainBg">
            {/* <div className="ps-circle-delete" onClick={handleDeleteImage}>
                <img src="./delete.png" alt="delete" />
            </div> */}
            <div className="ps-upper">
                {/* Display the entered content below each other */}
                    {/* Username input box */}
                    <div className="ps-input-boxes">
                    <div className="ps-username">
                        <label className="ps-username-label" htmlFor="username">Your Username:</label>
                        <input
                            className="ps-username-inputbox"
                            type="text"
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Enter your desired username"
                        />
                    </div>



                    {/* Profile description input box */}
                    <div className="ps-desc">
                        <label className="ps-profiledesc-label" htmlFor="profileDescription">Your Profile Description:</label>
                        <input
                            className="ps-desc-inputbox"
                            type="text"
                            id="profileDescription"
                            value={profileDescription}
                            onChange={handleProfileDescriptionChange}
                            placeholder="A short description about yourself!"
                        />
                    </div>
                </div>
                <div className="ps-results">
                    <div className="ps-image-upload-container">
                        <div className="ps-box-decoration">
                            <div onClick={handleImageClick} style={{ cursor: "pointer" }}>
                                {image ? (
                                    <img src={URL.createObjectURL(image)} alt="upload image" className="ps-img-display-after" />
                                ) : (
                                    <img src={profilePicUrl} alt="upload image" className="ps-img-display-before" />
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
                        </div>
                    </div>
                </div>

            
            </div>

            <div className="ps-whole-interest">
                <div className="ps-interests">
                    Your Selected Interests:
                </div>
                <div className="ps-interest-choice">
                    <div className={`ps-interest-item ${selectedInterests.includes("Art") ? "selected" : ""}`} onClick={() => handleInterestClick("Art")}>
                        <img src="./art.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">Art</label>
                    </div >
                    <div className={`ps-interest-item ${selectedInterests.includes("Music") ? "selected" : ""}`} onClick={() => handleInterestClick("Music")}>
                        <img src="./music.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">Music</label>
                    </div>
                    <div className={`ps-interest-item ${selectedInterests.includes("Technology") ? "selected" : ""}`} onClick={() => handleInterestClick("Technology")}>
                        <img src="./technology.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">Technology</label>
                    </div>
                    <div className={`ps-interest-item ${selectedInterests.includes("TV/Movies") ? "selected" : ""}`} onClick={() => handleInterestClick("TV/Movies")}>
                        <img src="./tv.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">TV/Movies </label>
                    </div>
                    <div className={`ps-interest-item ${selectedInterests.includes("Dance") ? "selected" : ""}`} onClick={() => handleInterestClick("Dance")}>
                        <img src="./dance.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">Dance </label>
                    </div>
                    <div className={`ps-interest-item ${selectedInterests.includes("Gaming") ? "selected" : ""}`} onClick={() => handleInterestClick("Gaming")}>
                        <img src="./videogaming.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">Gaming </label>
                    </div>
                    <div className={`ps-interest-item ${selectedInterests.includes("Sports") ? "selected" : ""}`} onClick={() => handleInterestClick("Sports")}>
                        <img src="./sports.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">Sports </label>
                    </div>
                    <div className={`ps-interest-item ${selectedInterests.includes("Cooking/Baking") ? "selected" : ""}`} onClick={() => handleInterestClick("Cooking/Baking")}>
                        <img src="./cooking.png" className="ps-interest-icon" />
                        <label className="ps-interest-label">Cooking/Baking </label>
                    </div>
                </div>
                <div className="ps-buttons">
                    <button className="ps-back" onClick={() => navigatePath("/")}> Back to Dashboard </button>
                    <button className="ps-button" onClick={handleCreateProfile}>Create Profile</button>
                </div>
            </div>


        </div>

    );
}


export default ProfileSettings