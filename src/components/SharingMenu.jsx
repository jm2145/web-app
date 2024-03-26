import React, { useState, useContext, useEffect } from 'react';
import { db } from '../Firebase';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, addDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { v4 as uuid } from "uuid";

import './SharingMenu.css'
function SharingMenu({ onClose, postId }) {
    const [activeTab, setActiveTab] = useState('friends'); // Default active tab is 'friends'
    const [friendsData, setFriendsData] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [groupsData, setGroupsData] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleShare = async () => {
        try {
            setLoading(true);

            const shareLink = `http://localhost:3000/postPage?postId=${postId}`;

            if (activeTab === 'friends') {
                // Share with selected friends
                await Promise.all(selectedFriends.map(async (friendId) => {
                    const combinedId = currentUser.uid > friendId ? currentUser.uid + friendId : friendId + currentUser.uid;

                    await updateDoc(doc(db, "Chats", combinedId), {
                        messages: arrayUnion({
                            id: uuid(),
                            text: shareLink,
                            senderId: currentUser.uid,
                            date: Timestamp.now(),
                            read: false,
                        }),
                    });

                    await updateDoc(doc(db, "userChats", currentUser.uid), {
                        [combinedId + ".lastMessage"]: {
                            text: shareLink,
                        },
                        [combinedId + ".date"]: serverTimestamp(),
                    });

                    await updateDoc(doc(db, "userChats", friendId), {
                        [combinedId + ".lastMessage"]: {
                            text: shareLink,
                        },
                        [combinedId + ".date"]: serverTimestamp(),
                    });
                }));
            } else if (activeTab === 'groups') {
                // Share with selected groups
                await Promise.all(selectedGroups.map(async (groupName) => {
                    await addDoc(collection(db, 'Messages'), {
                        text: shareLink,
                        groupName: groupName,
                        userID: currentUser.uid,
                        userDisplayName: currentUser.displayName,
                        userPhotoURL: currentUser.photoURL,
                        createdAt: Timestamp.now()
                    });

                }));
                console.log("successs")
            }

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

    const handleGroupClick = (groupName) => {
        const index = selectedGroups.indexOf(groupName);
        if (index === -1) {
            setSelectedGroups([...selectedGroups, groupName]);
        } else {
            const updatedSelectedGroups = [...selectedGroups];
            updatedSelectedGroups.splice(index, 1);
            setSelectedGroups(updatedSelectedGroups);
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

    useEffect(() => {
        const fetchGroupsData = async () => {
            if (!currentUser || !currentUser.uid) return;

            try {
                // Query userToGroups collection where userDisplayName equals currentUser.displayName
                const userToGroupsRef = collection(db, 'UsersToGroup');
                const q = query(userToGroupsRef, where('userDisplayName', '==', currentUser.displayName));
                const userToGroupsSnapshot = await getDocs(q);



                const groupsData = [];
                console.log("ohaiyo")
                for (const docSnap of userToGroupsSnapshot.docs) {
                    const groupData = docSnap.data();
                    const groupID = groupData.groupID;

                    console.log("snapshot", groupData)

                    // Query the Groups collection to find the group details
                    const groupRef = doc(db, 'Groups', groupID);
                    const groupDoc = await getDoc(groupRef);

                    if (groupDoc.exists()) {
                        const groupDetails = groupDoc.data();
                        const groupName = groupDetails.name;
                        const imageUrl = groupDetails.imageUrl;

                        // Add the group details to the groupsData array
                        groupsData.push({ groupID, groupName, imageUrl });
                    }
                }

                // Update state with the fetched groups data
                setGroupsData(groupsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching groups data:', error);
                setLoading(false);
            }
        };

        fetchGroupsData();

        // Cleanup function
        return () => { };
    }, [currentUser]);




    console.log("groupstuff", selectedGroups)
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
                                {groupsData.map(group => (
                                    <div key={group.groupID}
                                        className={`share-friend ${selectedGroups.includes(group.groupName) ? 'share-selected' : ''}`}
                                        onClick={() => handleGroupClick(group.groupName)}>
                                        <img src={group.imageUrl} alt={group.groupName} className='share-friend-pic' />
                                        <p>{group.groupName}</p>
                                    </div>
                                ))}
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
