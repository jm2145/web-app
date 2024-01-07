import React from "react";
import './Navbar.css';
import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../Firebase";


function Navbar() {

    const [userInfo, setUserInfo] = useState({ username: "", email: "" });

    useEffect(() => {
        const fetchUserData = async () => {
            // Check if user is logged in
            const user = auth.currentUser;
            if (user) {
                console.log("dude is signed in")
                // Get the UID of the logged-in user
                const uid = user.uid;

                // Query Firestore for the user document
                try {
                    const userDocRef = doc(db, "Users", uid);
                    const userDocSnapshot = await getDoc(userDocRef);

                    // If user document exists, update state with username
                    if (userDocSnapshot.exists()) {
                        const userData = userDocSnapshot.data();
                        setUserInfo({
                            username: userData.username,
                            email: user.email,
                            profilePicUrl: userData.imageURL || "",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, []);


    return (
        <div className="nb-main">
            <div className="nb-user">
                <div className="nb-user-profile">
                    <img src={userInfo.profilePicUrl} alt="profile-pic" className="nb-profile-pic" />
                </div>
                <div className="user-info">
                    <div className="nb-user-username"> {userInfo.username}</div>
                    <div className="nb-user-email"> {userInfo.email} </div>
                </div>
            </div>
            <div className="nb-icons">
                <div className="dashboard-icon">
                    <img src="./dashboard.png" alt="dashboard-icon" className="nb-dashboard-icon" />
                    <div>Dashboard</div>
                </div>
                <div className="dashboard-icon">
                    <img src="./forum.png" alt="forum-icon" className="nb-dashboard-icon" />
                    <div>Forum</div>
                </div>
                <div className="dashboard-icon">
                    <img src="./groups.png" alt="group-icon" className="nb-dashboard-icon" />
                    <div>Groups</div>
                </div>
                <div className="dashboard-icon">
                    <img src="./group_add.png" alt="friends-icon" className="nb-dashboard-icon" />
                    <div>Friends</div>
                </div>
                <div className="dashboard-icon">
                    <img src="./mode_comment.png" alt="comments-icon" className="nb-dashboard-icon" />
                    <div>Messages</div>
                </div>
                <div className="dashboard-icon">
                    <img src="./apps.png" alt="components-icon" className="nb-dashboard-icon" />
                    <div>Components</div>
                </div>
            </div>
            <div className="nb-options">
                <div className="nb-settings">
                    <img src="./settings.png" alt="setting-icon" className="nb-dashboard-icon" />
                    <div>Settings</div>
                </div>
                <div className="nb-settings">
                    <img src="./logout.png" alt="logout-icon" className="nb-dashboard-icon" />
                    <div>Logout</div>
                </div>
            </div>
        </div>
    )

}

export default Navbar;