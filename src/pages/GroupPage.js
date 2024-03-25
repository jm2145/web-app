import FileExplorer from "../components/FileExplorer";
import React, { useState, useEffect, useContext } from "react";
import { db, auth, storage } from "../Firebase";
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import GroupChat from "../components/GroupChat";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";


import "./GroupPage.css"

function GroupPage() {

  var databaseReadCount = 0;
  const { currentUser } = useContext(AuthContext);
  const { groupName } = useParams();
  const location = useLocation();
  const groupMembers = location.state.group.members;
  //const thisGroup = location.state.group;

  const [thisGroup, setThisGroup] = useState(location.state.group);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'files'
  const [groupImageURL, setGroupImageURL] = useState("");
  const [showAddWhiteboard, setShowAddWhiteboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWhiteboardName, setNewWhiteboardName] = useState("");
  const [newWhiteboardDescription, setNewWhiteboardDescription] = useState("");
  const [whiteboards, setWhiteboards] = useState([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [currentUserPermission, setCurrentUserPermission] = useState('');
  const [groupMemberPermissions, setGroupMemberPermissions] = useState([]);
  const [currentUserIsMuted, setCurrentUserIsMuted] = useState(false);
  const navigate = useNavigate();

  const [editingInfo, setEditingInfo] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDetails, setNewGroupDetails] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('/brainwave.png'); // This is the URL of the uploaded image
  const [categories, setCategories] = useState([]);
  const [outsideUsers, setOutsideUsers] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectedUsersChange = (selectedUsers) => {
    console.log("Selected Users:", selectedUsers);
    // Update state or perform actions with the full list of selected user objects
    // For example, if you're storing just the IDs somewhere else, you'd extract them here
    const selectedUserIds = selectedUsers.map(user => user.id);
    setSelectedUserIds(selectedUserIds); // If you still need just the IDs somewhere
  };

  const handleSelectUser = (selectedUser) => {
    setSelectedUsers(prevSelected => {
      // Check if the user is already selected
      const isSelected = prevSelected.some(user => user.id === selectedUser.id);

      if (isSelected) {
        // If selected, remove them from the selection
        return prevSelected.filter(user => user.id !== selectedUser.id);
      } else {
        // If not selected, add them to the selection
        return [...prevSelected, selectedUser];
      }
    });
  };




  const fetchOutsideUsers = async (groupId) => {
    console.log("Group with ID: " + groupId);
    // Step 1: Fetch user IDs of members already in the group
    const usersToGroupRef = collection(db, 'UsersToGroup');
    const groupMembersSnapshot = await getDocs(query(usersToGroupRef, where('groupID', '==', thisGroup.id)));
    const memberIds = groupMembersSnapshot.docs.map(doc => doc.data().userID);

    // Step 2: Fetch users who are not part of the group
    const usersRef = collection(db, 'Users');
    const allUsersSnapshot = await getDocs(usersRef);
    const localOutsideUsers = allUsersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => !memberIds.includes(user.id) && user.id !== currentUser.uid); // Exclude users already in the group and the current user

    console.log(localOutsideUsers);
    setOutsideUsers(localOutsideUsers);
  };




  const handleImageChange = async (e) => {
    const file = e.target.files[0]; // Directly use the file from the event
    if (file) {
      console.log('Image selected: ', file);
      setImage(file); // You can still set the image to state if needed elsewhere
      try {
        const imageUploadResult = await uploadImage(file); // Pass the file directly
        setImageUrl(imageUploadResult); // Update the state with the URL of the uploaded image
        console.log('Image uploaded successfully: ', imageUploadResult);
      } catch (error) {
        console.error('Error uploading image: ', error);
        setImageUrl('/brainwave.png'); // Reset image URL on error
        setIsSubmitting(false);
      }
    } else {
      console.log('No image selected');
    }
  };

  const uploadImage = async (file) => {
    // Create a storage reference
    const storageRef = ref(storage, `groupImages/${file.name}`);

    // Start the file upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Wait for the upload to complete
    await uploadTask.then();

    // Get the URL of the uploaded file
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    return downloadURL; // Return the URL of the uploaded file
  };

  const fetchThisGroup = async () => {
    try {
      const thisGroupRef = collection(db, 'Groups');
      const q = query(thisGroupRef, where('name', '==', newGroupName));
      const thisGroupSnapshot = await getDocs(q);
      if (!thisGroupSnapshot.empty) {
        // Assuming there's only one group with this name
        const thisGroupByName = thisGroupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0];
        return thisGroupByName; // Ensure we're returning the group data
      } else {
        console.log('No group found with the given name.');
        return null; // Explicitly return null or an appropriate value if no group is found
      }
    } catch (error) {
      console.error('Error fetching group: ', error);
      return null; // Return null or an appropriate error indicator
    }
  };

  const fetchCategories = async () => {

    const categoriesCol = collection(db, 'GroupCategories');
    const categoriesSnapshot = await getDocs(categoriesCol);
    const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(categoriesList);
  };


  const fetchGroupMemberPermissions = async () => {

    const userGroupCol = query(collection(db, 'UsersToGroup'), where('groupID', '==', thisGroup.id));
    const userGroupSnapshot = await getDocs(userGroupCol);
    const userGroupList = userGroupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setGroupMemberPermissions(userGroupList);

    databaseReadCount++;
    console.log("Database read count increased: " + databaseReadCount + " || in fetchGroupMemberPermissions");
  }


  useEffect(() => {

    if (!thisGroup) {
      console.error('Group data is not available');
      navigate('/groupsPanel');
    } else {
      setNewGroupName(thisGroup.name);
      setNewGroupDetails(thisGroup.details);
      setNewGroupCategory(thisGroup.category);
      setImageUrl(thisGroup.imageUrl);
    }

    const fetchGroupImage = async () => {
      const groupsCol = query(collection(db, 'Groups'), where('name', '==', groupName));
      const groupSnapshot = await getDocs(groupsCol);
      const groupList = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(groupList);
      setGroupImageURL(groupList[0].imageUrl);

      databaseReadCount++;
      console.log("Database read count increased: " + databaseReadCount + " || in fetchGroupImage");
    }

    const fetchWhiteboards = async () => {
      const whiteboardsCol = query(collection(db, 'Whiteboards'), where('groupName', '==', groupName));
      const whiteboardsSnapshot = await getDocs(whiteboardsCol);
      const whiteboardsList = whiteboardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(whiteboardsList);
      setWhiteboards(whiteboardsList);

      databaseReadCount++;
      console.log("Database read count increased: " + databaseReadCount + " || in fetchWhiteboards");
    }

    const fetchCurrentUserGroupPermissions = async () => {

      if (!currentUser || !currentUser.uid) {
        console.error("Current user data is not available.");
        return;
      }

      const userGroupCol = query(collection(db, 'UsersToGroup'), where('userID', '==', currentUser.uid), where('groupID', '==', thisGroup.id));
      const userGroupSnapshot = await getDocs(userGroupCol);
      const userGroupList = userGroupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      databaseReadCount++;
      console.log("Database read count increased: " + databaseReadCount + " || in fetchCurrentUserGroupPermissions");


      if (userGroupList.length !== 0) {

        setCurrentUserPermission(userGroupList[0].userPermission);
        console.log(userGroupList[0].userPermission);
        setCurrentUserIsMuted(userGroupList[0].isMuted);

        if (userGroupList[0].userPermission === 'group-owner' || userGroupList[0].userPermission === 'group-moderator' || userGroupList[0].userPermission === 'group-admin') {
          setShowUserMenu(true);
        } else {
          document.getElementById("start-whiteboard-btn").style.display = "none";
          setShowUserMenu(true);
        }

      } else {

        console.log("Current user is not a member of this group.");
        document.getElementById("start-whiteboard-btn").style.display = "none";
        document.getElementById("group-page-users-btn").style.display = "none";
        navigate('/groupsPanel');

      }

    }



    fetchCurrentUserGroupPermissions();
    fetchGroupMemberPermissions();
    fetchGroupImage();
    fetchCategories();
    fetchWhiteboards();
    fetchOutsideUsers(thisGroup.id);
    setNewGroupCategory(thisGroup);

  }, []);



  const handleStartWhiteboardClick = () => {
    setShowAddWhiteboard(true);
    document.getElementsByClassName("overlay")[0].style.display = "flex";
  }

  const handleInfoClick = () => {
    setShowGroupInfo(true);
    document.getElementsByClassName("overlay")[0].style.display = "flex";
  }

  const removeUserFromGroup = async (userID) => {

    const userGroupsRef = collection(db, 'UsersToGroup');
    const q = query(
      userGroupsRef,
      where('userID', '==', userID),
      where('groupID', '==', thisGroup.id)
    );

    databaseReadCount++;
    console.log("Database read count increased: " + databaseReadCount + " || in removeUserFromGroup");

    const userGroupsSnapshot = await getDocs(q);

    if (!userGroupsSnapshot.empty) {
      const deletePromises = userGroupsSnapshot.docs.map(docSnapshot =>
        deleteDoc(doc(db, 'UsersToGroup', docSnapshot.id))
      );

      Promise.all(deletePromises)
        .then(() => {
          console.log("All matching documents successfully deleted!");
        })
        .catch((error) => {
          console.error("Error removing documents: ", error);
        });
    } else {
      console.log("No such documents found!");
    }

  }

  const handleLeaveGroupClick = async (e, userID) => {

    e.preventDefault();
    setIsSubmitting(true);

    console.log("Still running fine");

    removeUserFromGroup(userID).then(() => {
      setShowGroupInfo(false);
      document.getElementsByClassName("overlay")[0].style.display = "none";
      setIsSubmitting(false);
      navigate('/groupsPanel');
    });

    setIsSubmitting(false);

  }

  const handleKickClick = async (userID) => {

    setIsSubmitting(true);

    removeUserFromGroup(userID).then(() => {
      fetchGroupMemberPermissions();
    });

    setIsSubmitting(false);

  }

  const handleCloseFormClick = () => {
    document.getElementsByClassName("overlay")[0].style.display = "none";
    setNewWhiteboardDescription("");
    setNewWhiteboardName("");
    setShowAddWhiteboard(false);
    setShowGroupInfo(false);
  }

  const handlePermissionChange = async (e, member) => {

    e.preventDefault();
    setIsSubmitting(true);

    member.userPermission = e.target.value;
    const memberId = member.userID;

    const userGroupRef = collection(db, "UsersToGroup");
    const q = query(userGroupRef, where("userID", "==", memberId), where("groupID", "==", thisGroup.id));

    databaseReadCount++;
    console.log("Database read count increased: " + databaseReadCount + " || in handlePermissionChange");

    console.log(memberId + " " + e.target.value);
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        for (const docSnapshot of querySnapshot.docs) {
          const docRef = doc(db, "UsersToGroup", docSnapshot.id);
          await updateDoc(docRef, { userPermission: e.target.value });
        }
        console.log("Permission updated successfully");

        // Update the local state to reflect the change
        setGroupMemberPermissions(prevPermissions => {
          return prevPermissions.map(member => {
            if (member.id === memberId) {
              return { ...member, userPermission: e.target.value };
            }
            return member;
          });
        });
      } else {
        console.log("No matching document found");
      }
    } catch (error) {
      console.error("Error updating permission: ", error);
    }

    setIsSubmitting(false);

  };

  const handleMuteClick = async (member) => {
    console.log("Mute clicked: " + currentUserPermission);
    if (currentUserPermission !== "group-owner" && currentUserPermission !== "group-admin" && currentUserPermission !== "group-moderator") {
      return console.log("You do not have permission to mute users.");
    } else {

      setIsSubmitting(true);
      const memberId = member.userID;

      const userGroupRef = collection(db, "UsersToGroup");
      const q = query(userGroupRef, where("userID", "==", memberId), where("groupID", "==", thisGroup.id));

      databaseReadCount++;
      console.log("Database read count increased: " + databaseReadCount + " || in handleMuteClick");

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          for (const docSnapshot of querySnapshot.docs) {
            const docRef = doc(db, "UsersToGroup", docSnapshot.id);
            await updateDoc(docRef, { isMuted: !member.isMuted });
          }

          console.log("User muted successfully");
          member.isMuted = !member.isMuted;
        } else {
          console.log("No matching document found");
        }
      } catch (error) {
        console.error("Error muting user: ", error);
      }
      setIsSubmitting(false);

    }
  }

  const handleSubmitNewWhiteboard = async (e) => {

    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'Whiteboards'), {
        wName: newWhiteboardName,
        groupName: groupName,
        createdBy: auth.currentUser.uid, // Replace with actual image path or logic
        createdAt: Timestamp.now()
      });

      databaseReadCount++;
      console.log("Database read count increased: " + databaseReadCount + " || in handleSubmitNewWhiteboard");

      const whiteboardsCol = query(collection(db, 'Whiteboards'), where('groupName', '==', groupName));
      const whiteboardsSnapshot = await getDocs(whiteboardsCol);
      const whiteboardsList = whiteboardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWhiteboards(whiteboardsList);

      setNewWhiteboardName("");
      setNewWhiteboardDescription("");
      document.getElementsByClassName("overlay")[0].style.display = "none";
      setShowAddWhiteboard(false);
    } catch (error) {
      console.error('Error adding document: ', error);
    }

    setIsSubmitting(false);
  }

  const handleImgBtnClick = () => {
    // Programmatically click the hidden file input
    document.getElementById('fileInput').click();
  };


  const determineVisibilityForKick = (member) => {
    if (currentUserPermission !== "group-owner" && currentUserPermission !== "group-admin") {
      console.log("You do not have permission to kick users.")
      return "removed";
    } else if (currentUserPermission === "group-owner") {
      if (member.userPermission === "group-owner") {
        return "hidden";
      } else {
        return "visible";
      }
    } else if (currentUserPermission === "group-admin") {
      if (member.userPermission === "group-owner" || member.userPermission === "group-admin") {
        return "hidden";
      } else {
        return "visible";
      }
    }
  }

  const determineVisibilityForMute = (member) => {
    if (currentUserPermission === "group-owner") {
      if (member.userPermission === "group-owner") {
        return "hidden";
      } else {
        return "visible";
      }
    } else if (currentUserPermission === "group-admin") {
      if (member.userPermission === "group-owner" || member.userPermission === "group-admin") {
        return "hidden";
      } else {
        return "visible";
      }
    } else if (currentUserPermission === "group-moderator") {
      if (member.userPermission === "group-owner" || member.userPermission === "group-admin" || member.userPermission === "group-moderator") {
        return "hidden";
      } else {
        return "visible";
      }
    } else {
      return "removed";
    }
  }


  const handleSaveInfoChanges = async (e) => {

    e.preventDefault();
    setIsSubmitting(true);

    if (!newGroupName) {
      //setErrorMessage("Please enter a group name to create a group");
      console.log("Please enter a group name");
      //setShowErrorForm(true);
      document.getElementsByClassName("overlay")[0].style.display = "flex";
      setIsSubmitting(false); // Make sure to reset this if exiting early
      return;
    }

    //handleCloseFormClick();

    // Step 2.2: Create Group Document with Image URL
    try {
      const docRef = doc(db, "Groups", thisGroup.id);

      await updateDoc(docRef, {
        // Fields and values you want to update
        name: newGroupName,
        details: newGroupDetails,
        category: newGroupCategory.category,
        imageUrl: imageUrl, // New image URL
      });

      fetchThisGroup().then(fetchedGroup => {
        if (fetchedGroup) {
          setThisGroup(fetchedGroup);
          console.log("Group fetched: " + fetchedGroup.name);
        } else {
          console.error("Failed to fetch group or group doesn't exist.");
        }
      });


    } catch (error) {
      console.error('Error adding group document: ', error);
    }


    //setThisGroup(fetchThisGroup());
    console.log("About to fetch thisGroup");


    setIsSubmitting(false);
    setEditingInfo(false);

  }

  const handleCancelInfoChanges = async (e) => {

    setNewGroupName(thisGroup.name);
    setNewGroupDetails(thisGroup.details);
    setNewGroupCategory(thisGroup.category);
    setImageUrl(thisGroup.imageUrl);
    setEditingInfo(false);

    console.log("Changes cancelled: " + newGroupName + " " + newGroupDetails + " " + newGroupCategory);

  }

  const handleAddUsersClick = async (e) => {

    setIsSubmitting(true);

    try {

      const userToGroupPromises = selectedUsers.map(user => {
        console.log("Adding user to group: " + user)
        return addDoc(collection(db, 'UsersToGroup'), {
          groupID: thisGroup.id,
          groupName: thisGroup.name,
          userID: user.id,
          userPermission: "group-member",
          isMute: false,
          userDisplayName: user.username,
          userPhotoURL: user.photoURL ? user.photoURL : '/cross.png'
        });
      });

      await Promise.all(userToGroupPromises);

      fetchGroupMemberPermissions();
      fetchOutsideUsers(thisGroup.id);

      // Reset the selectedUsers to an empty array to clear the selection
      setSelectedUsers([]);

    } catch (error) {
      console.error('Error adding users to group: ', error);
    } finally {
      // This ensures that setIsSubmitting is called even if there's an error
      setIsSubmitting(false);
    }

  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleVideoCallClick = () => {
    window.open("/Call", "_blank")
  }


  return (
    <div className="group-page">

      <div className='group-page-container'>
        <div className='group-navbar'>
          <div className="group-header">
            <img src={thisGroup.imageUrl} alt='brainwave' className="group-image" />
            <h1 className="group-name">{thisGroup.name}</h1>

            <div className="group-actions">
              <button className='bob-btn-1' id="start-whiteboard-btn" onClick={() => handleStartWhiteboardClick()}>Start a Whiteboard</button>
              {/* <button className='bob-btn-1' id="call-btn">Voice Call</button> */}
              <button className='bob-btn-1' id="video-btn" onClick={handleVideoCallClick}>Call</button>
              <button className='bob-btn-1' id="info-btn" onClick={handleInfoClick}> Info </button>
            </div>

          </ div>

          <div className="tabs">
            <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'active' : ''}>Chat</button>
            <button onClick={() => setActiveTab('files')} className={activeTab === 'files' ? 'active' : ''}>Files</button>
            <button onClick={() => setActiveTab('whiteboards')} className={activeTab === 'whiteboards' ? 'active' : ''}>Whiteboards</button>
            <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''} id='group-page-users-btn'>Users</button>
            <button onClick={() => setActiveTab('Add users')} className={activeTab === 'Add users' ? 'active' : ''} id='group-page-users-btn'>Add Users</button>
          </div>
        </div>


        <div className="content">
          {activeTab === 'chat' && (
            <GroupChat groupName={groupName} isMuted={currentUserIsMuted} />
          )}


          {activeTab === 'files' && (
            <div className="files-container">

              {/* Files would be listed here */}
            </div>
          )}


          {activeTab === 'whiteboards' && (
            <div className="whiteboards-container">

              <div className="whiteboards-grid">
                {whiteboards.map((whiteboard) => (
                  <div key={whiteboard.id} className="whiteboard-item">
                    <img src="/clouds.jpeg" alt={whiteboard.name} className="whiteboard-image" />
                    <h2 className="whiteboard-name">{whiteboard.wName}</h2>
                    <h3 className="whiteboard-creation-date">Created at: {whiteboard.createdAt.toDate().toLocaleDateString()}</h3>
                    <button /*onClick={() => navigate(</div>`/whiteboard/${whiteboard.id}`)}*/ className="whiteboard-grid-btn"><img src="/edit.png" alt='pencil' className='w-btn-img' /></button>
                  </div>
                ))}
              </div>


            </div>
          )}

          {activeTab === 'users' && (

            <div className='group-page-users-tab-container'>

              <div className="group-add-users-header">

                <h1> Users in the group: </h1>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="users-search-bar"
                />

              </div>

              <div className='group-page-users-container'>

                {groupMemberPermissions.filter((member) =>
                  member.userDisplayName?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((member) => (
                  <div key={member.id} className='group-page-user-container'>

                    <img src={member.userPhotoURL} alt='user' className='group-page-user-image' />

                    <h2 className='group-page-user-name'>{member.userDisplayName}</h2>

                    <div className='group-page-permissions-container'>

                      <h3 className='group-page-user-text'>Permission: </h3>
                      <select disabled={(member.userID === currentUser.uid) || (currentUserPermission === "group-admin" && member.userPermission === "group-admin") || (member.userPermission === "group-owner") || (currentUserPermission !== "group-owner" && currentUserPermission !== "group-admin") || isSubmitting} onChange={(e) => handlePermissionChange(e, member)} value={member.userPermission}>
                        <option value="group-member" >Group Member</option>
                        <option value="group-moderator">Group Moderator</option>
                        {!(currentUserPermission === "group-admin" && (member.userPermission === "group-member" || member.userPermission === "group-moderator")) && (<option value="group-admin" >Group Admin</option>)}
                        {!(currentUserPermission === "group-admin" || currentUserPermission === "group-owner" && (member.userPermission === "group-member" || member.userPermission === "group-moderator" || member.userPermission === "group-admin")) && (<option value="group-owner" >Group Owner</option>)}
                      </select>

                      <img src={member.isMuted ? "/mute.png" : "/mic.png"} id={determineVisibilityForMute(member)} alt='mic' className='group-page-mute-btn' onClick={() => handleMuteClick(member)} />

                    </div>

                    <button className='group-page-kick-btn' id={determineVisibilityForKick(member)} disabled={isSubmitting || ((currentUserPermission === "group-owner" ? false : true) && (currentUserPermission === "group-admin" ? false : true))} onClick={() => handleKickClick(member.userID)}>Remove</button>

                  </div>
                ))}

              </div>
            </div>
          )}

          {activeTab === 'Add users' && (
            <div className="group-page-users-tab-container">

              <div className="group-add-users-header">

                <h1> Add users to group: </h1>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="users-search-bar"
                />

              </div>

              <div className="user-list-component">
                {outsideUsers.filter((user) =>
                  user.username?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((user) => (
                  <div
                    key={user.id}
                    className={`user-name ${selectedUsers.some(selectedUser => selectedUser.id === user.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectUser(user)} // Toggle selection on div click
                  >
                    <div className='user-list-container'>
                      <img src={user.photoURL ? user.photoURL : "/cross.png"} alt={user.username} className="user-list-user-icon" />
                      <div className='user-list-text'> {user.username} </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="bob-btn-1" id={selectedUsers.length === 0 ? "add-users-btn-unselected" : "add-users-btn"} onClick={() => handleAddUsersClick()} disabled={isSubmitting}>Add Users</button>

            </div>
          )}



          {showAddWhiteboard && (
            <div className="popup-form">
              <img src={'/clouds.jpeg'} alt={'brainwave'} className="popup-form-image" />
              <button className="popup-form-close-btn" onClick={handleCloseFormClick}>X</button>
              <img className="popup-form-cloud-icon" src="/Component 1.png" alt="cloud" />
              <form onSubmit={handleSubmitNewWhiteboard} className="popup-form-form">

                <div className="popup-form-container">

                  <h1 className="popup-form-title">Start a Whiteboard!</h1>
                  <div className="popup-form-div">
                    <h2 className="popup-form-subtitle">Whiteboard Name:</h2>

                    <input
                      type="text"
                      placeholder="Enter name"
                      className="popup-form-input"
                      value={newWhiteboardName}
                      onChange={(e) => setNewWhiteboardName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="popup-form-div">
                    <h2 className="popup-form-subtitle">Whiteboard Description:</h2>

                    <textarea
                      type="text"
                      placeholder="Enter description"
                      className="popup-form-input"
                      value={newWhiteboardDescription}
                      onChange={(e) => setNewWhiteboardDescription(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <button type="submit" className="bob-btn-1" id="start-whiteboard-btn" disabled={isSubmitting}>Start Whiteboard</button>
                </div>
              </form>
            </div>
          )}

        </div>

        {showGroupInfo && (
          <div className="popup-form">

            <img src={imageUrl} alt={thisGroup.name} className='popup-form-image' />
            <button type="button" className="popup-form-close-btn" onClick={handleCloseFormClick}>X</button>
            <img src="/Component 1.png" alt="cloud-icon" className="popup-form-cloud-icon" />
            <input type="file" onChange={handleImageChange} id="fileInput" style={{ display: 'none' }} />
            <button className="upload-img-btn" id={editingInfo ? "visible" : "removed"} onClick={handleImgBtnClick}>
              <img className="upload-img-icon" src="/camera.png" alt="Upload" />
            </button>

            <div className="popup-form-container">

              {!editingInfo && (

                < form className='popup-form-form'>

                  <div className='popup-form-form-container'>

                    <h1 className="popup-form-title">{thisGroup.name}</h1>

                    <div className='popup-form-div'>
                      <h2 className="popup-form-subtitle">Group Description:</h2>
                      <div className="popup-form-text">{thisGroup.details}</div>
                    </div>

                    <div className='popup-form-div'>
                      <h2 className="popup-form-subtitle">Group Category:</h2>
                      <div className="popup-form-selected-tag">{thisGroup.category}</div>
                    </div>

                    <div className='popup-form-div'>
                      <h2 className="popup-form-subtitle">Group Members ({groupMembers.length}):</h2>

                      <div className="popup-form-member-icons-container">

                        {groupMembers.length === 0 ? (
                          <img className="popup-form-member-icon" src="/cross.png" alt="Default" />
                        ) : (
                          groupMembers.map((member) => (
                            <img className="popup-form-member-icon" src={member.userPhotoURL} alt="user" />
                          )))}

                      </div>
                    </div>

                  </div>

                </form>
              )}

              {editingInfo && (

                <form className='popup-form-form'>

                  <div className='popup-form-form-container'>

                    <div className="popup-form-div">
                      <h2 className="popup-form-subtitle">Group Name:</h2>
                      <input
                        className="popup-form-input"
                        type="text"
                        placeholder="Enter name here"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="popup-form-div">
                      <h2 className="popup-form-subtitle">Group Details:</h2>
                      <textarea
                        className="popup-form-input"
                        placeholder="Enter details here"
                        value={newGroupDetails}
                        onChange={(e) => setNewGroupDetails(e.target.value)}
                        disabled={isSubmitting}
                      ></textarea>
                    </div>

                    <div className="popup-form-div">
                      <h2 className="popup-form-subtitle">Group Category:</h2>
                      <div className="popup-form-tags-container">
                        {categories.map((category) => (
                          <div key={category.id} className={newGroupCategory.category === category.category ? "popup-form-selected-tag" : "popup-form-unselected-tag"} onClick={() => setNewGroupCategory(category)}>
                            {category.category}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </form>
              )}

              <div className="group-btns-container">
                {(currentUserPermission === "group-admin" || currentUserPermission === "group-owner") && (<button type="button" className="bob-btn-2" onClick={() => setEditingInfo(true)} id={editingInfo ? "removed" : "edit-group-btn"}>Edit Info</button>)}
                <button type="button" className="bob-btn-2" onClick={(e) => handleSaveInfoChanges(e)} id={!editingInfo ? "removed" : "edit-group-btn"}>Save Changes</button>
                <button type="button" className="bob-btn-2" onClick={(e) => handleCancelInfoChanges(e)} id={editingInfo ? "leave-group-btn" : "removed"}> Cancel Changes</button>
                <button type="button" className='bob-btn-2' onClick={(e) => handleLeaveGroupClick(e, currentUser.uid)} id={editingInfo ? "removed" : "leave-group-btn"} disabled={isSubmitting || editingInfo}>Leave Group</button>
              </div>
            </div>
          </div>

        )}

        <div className="overlay"></div>
      </div >
    </div >
  )
}

export default GroupPage;