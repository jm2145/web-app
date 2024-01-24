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
  const [whiteboards, setWhiteboards] = useState([]);
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
      setShowAddWhiteboard(false);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
    setIsSubmitting(false);
  }


  return (
    <div className="group-page-title">
      <div className='group-navbar'>
        <header className="group-header">
          <img src={groupImageURL} alt='brainwave' className="group-image" />
          <h1 className="group-name">{groupName}</h1>

          <div className="group-actions">
            <button className='bob-btn-1' id="start-whiteboard-btn" onClick={() => handleStartWhiteboardClick()}>Start a Whiteboard</button>
            <button className='bob-btn-1' id="call-btn">Voice Call</button>
            <button className='bob-btn-1' id="video-btn">Video Call</button>
            <button className='bob-btn-1' id="info-btn"> Info </button>
          </div>

        </ header>

        <div className="tabs">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'active' : ''}>Chat</button>
          <button onClick={() => setActiveTab('files')} className={activeTab === 'files' ? 'active' : ''}>Files</button>
          <button onClick={() => setActiveTab('whiteboards')} className={activeTab === 'whiteboards' ? 'active' : ''}>Whiteboards</button>
        </div>
      </div>


      <div className="content">
        {activeTab === 'chat' && (
          <GroupChat />
        )}


        {activeTab === 'files' && (
          <div className="files-container">
            <FileExplorer />
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
          <div className="new-whiteboard-form">
            <form onSubmit={handleSubmitNewWhiteboard}>

              <img src={'/clouds.jpeg'} alt={'brainwave'} className="create-whiteboard-image" />
              <button claassName="close-button" onClick={() => setShowAddWhiteboard(false)}>X</button>
              <input
                type="text"
                placeholder="Whiteboard name"
                value={newWhiteboardName}
                onChange={(e) => setNewWhiteboardName(e.target.value)}
                disabled={isSubmitting}
              />
              <button type="submit" disabled={isSubmitting}>Start Whiteboard</button>
            </form>
          </div>
        )}

      </div>
    </div >
  )
}

export default TestPage;