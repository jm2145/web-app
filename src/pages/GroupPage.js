import Navbar from "../components/Navbar";
import FileExplorer from "../components/FileExplorer";
import React, { useState, useEffect } from "react";
import { db, auth } from "../Firebase";
import { useNavigate, useParams } from 'react-router-dom';
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
} from "firebase/firestore";
import GroupChat from "../components/GroupChat";


import "./GroupPage.css"

function TestPage() {


  const { groupName } = useParams();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'files'
  const [groupImageURL, setGroupImageURL] = useState("");
  const [showAddWhiteboard, setShowAddWhiteboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newWhiteboardName, setNewWhiteboardName] = useState("");
  const [newWhiteboardDescription, setNewWhiteboardDescription] = useState("");
  const [whiteboards, setWhiteboards] = useState([]);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {

    const fetchGroupImage = async () => {
      const groupsCol = query(collection(db, 'Groups'), where('name', '==', groupName));
      const groupSnapshot = await getDocs(groupsCol);
      const groupList = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(groupList);
      setGroupImageURL(groupList[0].imageUrl);
    }

    const fetchWhiteboards = async () => {
      const whiteboardsCol = query(collection(db, 'Whiteboards'), where('groupName', '==', groupName));
      const whiteboardsSnapshot = await getDocs(whiteboardsCol);
      const whiteboardsList = whiteboardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(whiteboardsList);
      setWhiteboards(whiteboardsList);
    }

    fetchGroupImage();
    fetchWhiteboards();

  }, []);

  const handleStartWhiteboardClick = () => {
    setShowAddWhiteboard(true);
    document.getElementsByClassName("overlay")[0].style.display = "flex";
  }

  const handleCloseFormClick = () => {
    document.getElementsByClassName("overlay")[0].style.display = "none";
    setNewWhiteboardDescription("");
    setNewWhiteboardName("");
    setShowAddWhiteboard(false);
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


  return (
    <div className="group-page">
      <div className='group-navbar'>
        <div className="group-header">
          <img src={groupImageURL} alt='brainwave' className="group-image" />
          <h1 className="group-name">{groupName}</h1>

          <div className="group-actions">
            <button className='bob-btn-1' id="start-whiteboard-btn" onClick={() => handleStartWhiteboardClick()}>Start a Whiteboard</button>
            <button className='bob-btn-1' id="call-btn">Voice Call</button>
            <button className='bob-btn-1' id="video-btn">Video Call</button>
            <button className='bob-btn-1' id="info-btn"> Info </button>
          </div>

        </ div>

        <div className="tabs">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'active' : ''}>Chat</button>
          <button onClick={() => setActiveTab('files')} className={activeTab === 'files' ? 'active' : ''}>Files</button>
          <button onClick={() => setActiveTab('whiteboards')} className={activeTab === 'whiteboards' ? 'active' : ''}>Whiteboards</button>
        </div>
      </div>


      <div className="content">
        {activeTab === 'chat' && (
          <GroupChat groupName={groupName} />
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
                <div key={whiteboard.id} className="whiteboard">
                  <img src="/clouds.jpeg" alt={whiteboard.name} className="whiteboard-image" />
                  <h2 className="whiteboard-name">{whiteboard.wName}</h2>
                  <h3 className="whiteboard-creation-date">Created at: {whiteboard.createdAt.toDate().toLocaleDateString()}</h3>
                  <button /*onClick={() => navigate(</div>`/whiteboard/${whiteboard.id}`)}*/ className="whiteboard-grid-btn"><img src="/edit.png" alt='pencil' className='w-btn-img' /></button>
                </div>
              ))}
            </div>


          </div>
        )}


        {showAddWhiteboard && (
          <div className="popup-form">
            <form onSubmit={handleSubmitNewWhiteboard} className="popup-form-form">
              <img src={'/clouds.jpeg'} alt={'brainwave'} className="popup-form-image" />
              <button className="popup-form-close-btn" onClick={handleCloseFormClick}>X</button>
              <img className="popup-form-cloud-icon" src="/Component 1.png" alt="cloud" />
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
        <div>  </div>
      )}

      <div className="overlay"></div>
    </div >
  )
}

export default TestPage;