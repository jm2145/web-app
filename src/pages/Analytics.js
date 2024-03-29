import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import { auth, db } from '../Firebase';
import { where, collection, query, getDocs, getDoc, doc } from "firebase/firestore";
import './Analytics.css'
import StarryBackground from '../components/StarryBg';

const Analytics = () => {
    const navigate = useNavigate();
    const [postCount, setPostCount] = useState(0);
    const [friendCount, setFriendCount] = useState(0);
    const [lastLogin, setLastLogin] = useState(null);
    const [elapsedHours, setElapsedHours] = useState(null);
    const { currentUser } = useContext(AuthContext);
    const [userGroupCount, setUserGroupCount] = useState(0);


    useEffect(() => {
        // Fetch posts count for the current user
        const fetchPostCount = async () => {

            if (currentUser) {
                const userId = currentUser.uid;
                const postsRef = collection(db, 'Posts');
                const userPostsQuery = query(postsRef, where('userId', '==', userId));

                try {
                    const snapshot = await getDocs(userPostsQuery);
                    setPostCount(snapshot.size); // Set the count of user's posts
                } catch (error) {
                    console.error('Error fetching user posts:', error);
                }
            }
        };

        // Fetch friend count for the current user
        const fetchFriendCount = async () => {

            if (currentUser) {
                const userId = currentUser.uid;
                const friendsDocRef = doc(db, 'Friends', userId); // Assuming the document ID is the same as the user ID
                try {
                    const docSnapshot = await getDoc(friendsDocRef);
                    if (docSnapshot.exists()) {
                        // Get data from the document
                        const friendsData = docSnapshot.data();
                        // Count the number of maps representing friends
                        const count = Object.keys(friendsData).length;
                        setFriendCount(count);
                    } else {
                        // Document doesn't exist or doesn't contain any friends
                        setFriendCount(0);
                    }
                } catch (error) {
                    console.error('Error fetching user friends:', error);
                }
            }
        };

        const fetchUserInfo = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const metadata = currentUser.metadata;
                if (metadata.lastSignInTime) {
                    // Convert string timestamp to Date object
                    const lastLoginTime = new Date(metadata.lastSignInTime);
                    setLastLogin(lastLoginTime);

                    // Set elapsed time of current session
                    const currentTime = new Date();
                    const elapsedSeconds = Math.floor((currentTime - lastLoginTime) / 1000); // Elapsed time in seconds
                    const elapsedHours = elapsedSeconds / 3600; // Convert seconds to hours
                    setElapsedHours(elapsedHours);
                }
            }
        };

        const fetchUserGroupCount = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userId = currentUser.uid;
                const usersToGroupRef = collection(db, 'UsersToGroup');
                const q = query(usersToGroupRef, where('userID', '==', userId));

                try {
                    const querySnapshot = await getDocs(q);
                    setUserGroupCount(querySnapshot.size);
                } catch (error) {
                    console.error('Error fetching user group count:', error);
                }
            }
        }
        fetchUserGroupCount();
        fetchPostCount();
        fetchFriendCount();
        fetchUserInfo();


    }, []);
    const navigatePath = (path) => {
        navigate(path);

    }

    return (
        <div className='analytics-bg'>
            <StarryBackground/>
            <div className='analytics-main'>
                <div className='analytics-main-under'>
                    <div className='analytics-child'>
                        <h2>Your Posts: {postCount}</h2>
                    </div>
                    <div className='analytics-child'>
                        <h2>Your Friends: {friendCount}</h2>
                    </div>
                    <div className='analytics-child'>
                        <h2>Your Groups: {userGroupCount}</h2>
                    </div>
                </div>
                <div className='analytics-main-under'>
                    <div className='analytics-child-other'>
                        <h2>Last Login: {lastLogin ? lastLogin.toLocaleString() : 'Loading...'}</h2>
                    </div>
                    <div className='analytics-child-other'>
                        <h2>Session Elapsed Time: {elapsedHours !== null ? `${elapsedHours.toFixed(2)} hours` : 'Loading...'}</h2>
                    </div>
                </div>
            </div>
            <div className="aa-buttons">
                <button className="aa-button" onClick={() => navigatePath("/")}>Back to Dashboard</button>
            </div>
        </div>
    )
}

export default Analytics
