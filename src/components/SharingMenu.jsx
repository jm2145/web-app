import React, { useState, useContext, useEffect } from 'react';
import { db } from '../Firebase';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc,  updateDoc, arrayUnion, serverTimestamp,  Timestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";

import './SharingMenu.css'
function SharingMenu({ onClose, postId }) {
    const [activeTab, setActiveTab] = useState('friends'); // Default active tab is 'friends'
    const [friendsData, setFriendsData] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleShare = async () => {
        try {
          setLoading(true);
      
          // Generate the link to the post
          const shareLink = `http://localhost:3000/postPage?postId=${postId}`;
      
          // Iterate over each friend ID in the selectedFriends array
          selectedFriends.forEach(async (friendId) => {
            // Create a new message in the database for each friend
            const combinedId =
            currentUser.uid > friendId
              ? currentUser.uid + friendId
              : friendId + currentUser.uid;

              
            await updateDoc(doc(db, "Chats", combinedId), {
              messages: arrayUnion({
                id: uuid(),
                text: shareLink, // Message contains the link to the post
                senderId: currentUser.uid,
                date: Timestamp.now(),
                read: false,
              }),
            });
      
            // Update last message and date for the current user
            await updateDoc(doc(db, "userChats", currentUser.uid), {
              [combinedId + ".lastMessage"]: {
                text: shareLink, // Update last message with the link
              },
              [combinedId + ".date"]: serverTimestamp(),
            });
      
            // Update last message and date for the selected friend
            await updateDoc(doc(db, "userChats", friendId), {
              [combinedId + ".lastMessage"]: {
                text: shareLink, // Update last message with the link
              },
              [combinedId + ".date"]: serverTimestamp(),
            });
          });
      
          setLoading(false);
        } catch (error) {
          console.error("Error sharing post:", error);
          setLoading(false);
          // TODO: Handle error, show error message to the user
        }
      };
      

    const handleFriendClick = (friendId) => {
        // Check if the friend is already selected
        const index = selectedFriends.indexOf(friendId);
        if (index === -1) {
            // Friend is not selected, add to the array
            setSelectedFriends([...selectedFriends, friendId]);
        } else {
            // Friend is already selected, remove from the array
            const updatedSelectedFriends = [...selectedFriends];
            updatedSelectedFriends.splice(index, 1);
            setSelectedFriends(updatedSelectedFriends);
        }
    };

    console.log("select friends", selectedFriends)
    useEffect(() => {
        const fetchFriendsData = async () => {
            if (!currentUser || !currentUser.uid) return;

            try {
                const userRef = doc(db, "Friends", currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const friends = userDoc.data();
                    setFriendsData(friends);
                    setLoading(false);
                } else {
                    console.log("No friends document exists for the current user.");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching friends data:", error);
                setLoading(false);
            }
        };

        fetchFriendsData();

        // Cleanup function
        return () => { };
    }, [currentUser]);


    return (
        <div className="sharing-menu">
            <div className="tabs">
                <button
                    className={activeTab === 'friends' ? 'active' : ''}
                    onClick={() => handleTabClick('friends')}
                >
                    Friends
                </button>
                <button
                    className={activeTab === 'groups' ? 'active' : ''}
                    onClick={() => handleTabClick('groups')}
                >
                    Groups
                </button>
            </div>
            <div className="tab-content">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {activeTab === 'friends' && (
                            <div>
                                {/* <p>Choose Friend To Share With!!</p> */}
                                {Object.keys(friendsData).map(friendId => (
                                    <div key={friendId}
                                        className={`share-friend ${selectedFriends.includes(friendId) ? 'share-selected' : ''}`}
                                        onClick={() => handleFriendClick(friendId)}>
                                        {/* Display friend information */}
                                        <img src={friendsData[friendId].photoURL} alt={friendsData[friendId].displayName} className='share-friend-pic' />
                                        <p>{friendsData[friendId].displayName}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'groups' && (
                            <div>
                                {/* Display content for groups */}
                                <p>Groups content goes here...</p>
                                {/* Example: Display a list of groups */}
                                <ul>
                                    <li>Group 1</li>
                                    <li>Group 2</li>
                                    <li>Group 3</li>
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="footer">
                <button onClick={handleShare}>Share</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default SharingMenu;
