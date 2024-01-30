import FileExplorer from "../components/FileExplorer";
import React, { useState, useEffect, useContext } from "react";
import { db, auth } from "../Firebase";
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
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";


import "./GroupPage.css"

function GroupPage() {

  var databaseReadCount = 0;
  const { currentUser } = useContext(AuthContext);
  const { groupName } = useParams();
  const location = useLocation();
  const thisGroup = location.state.group;

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
    fetchWhiteboards();

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


  return (
    <div className="group-page">

      <div className='group-page-container'>
        <div className='group-navbar'>
          <div className="group-header">
            <img src={groupImageURL} alt='brainwave' className="group-image" />
            <h1 className="group-name">{groupName}</h1>

            <div className="group-actions">
              <button className='bob-btn-1' id="start-whiteboard-btn" onClick={() => handleStartWhiteboardClick()}>Start a Whiteboard</button>
              <button className='bob-btn-1' id="call-btn">Voice Call</button>
              <button className='bob-btn-1' id="video-btn">Video Call</button>
              <button className='bob-btn-1' id="info-btn" onClick={handleInfoClick}> Info </button>
            </div>

          </ div>

          <div className="tabs">
            <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'active' : ''}>Chat</button>
            <button onClick={() => setActiveTab('files')} className={activeTab === 'files' ? 'active' : ''}>Files</button>
            <button onClick={() => setActiveTab('whiteboards')} className={activeTab === 'whiteboards' ? 'active' : ''}>Whiteboards</button>
            <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''} id='group-page-users-btn'>Users</button>
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

              <div className='group-page-users-container'>

                {groupMemberPermissions.map((member) => (
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

            <img src={thisGroup.imageUrl} alt={thisGroup.name} className='popup-form-image' />
            <button type="button" className="popup-form-close-btn" onClick={handleCloseFormClick}>X</button>
            <img src="/Component 1.png" alt="cloud-icon" className="popup-form-cloud-icon" />

            <form onSubmit={(e) => handleLeaveGroupClick(e, currentUser.uid)} className='popup-form-form'>


              <div className='popup-form-container'>

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
                  <h2 className="popup-form-subtitle">Group Members ({thisGroup.members.length}):</h2>

                  <div className="popup-form-member-icons-container">

                    {thisGroup.members.length === 0 ? (
                      <img className="popup-form-member-icon" src="/cross.png" alt="Default" />
                    ) : (
                      thisGroup.members.map((member) => (
                        <img className="popup-form-member-icon" src={member.userPhotoURL} alt="user" />
                      )))}

                  </div>
                </div>

                <button type="submit" className='bob-btn-1' id="leave-group-btn" disabled={isSubmitting}>Leave Group</button>
              </div>

            </form>
          </div>
        )}

        <div className="overlay"></div>
      </div >
    </div>
  )
}

export default GroupPage;