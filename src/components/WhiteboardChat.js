import React, { useState, useRef, useEffect, useContext, props } from "react";
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
import { db, auth } from "../Firebase";
import { AuthContext } from "../context/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import "./WhiteboardChat.css";

function WhiteboardChat(props) {

  var databaseReadCounter = 0;

  const messagesEndRef = useRef(null);

  const { groupId } = props;
  const { whiteboardId } = props;
  const { currentUser } = useContext(AuthContext);
  const { isMuted } = false;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showErrorForm, setShowErrorForm] = useState(false);
  const messagesRef = collection(db, "whiteboardMessages");

  const [selectedFiles, setSelectedFiles] = useState([]);

  // Reference to Firebase storage
  const storage = getStorage();

  // Function to display content based on the file type
  function renderFileContent(fileURL, fileName) {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoTypes = ['mp4', 'webm', 'ogg'];
    const pdfTypes = ['pdf'];

    const vet = fileURL.split('.').pop().split(/\#|\?/)[0].toLowerCase();
    const extension = vet.replace(/_\d+/g, '');

    // Event handler for the div click to download the file
    const handleDownloadClick = () => downloadFile(fileURL, fileName);

    if (imageTypes.includes(extension)) {
      return (
        <div onClick={handleDownloadClick}>
          <img src={fileURL} alt="image" className="whiteboard-message-image" />
        </div>
      );
    } else if (videoTypes.includes(extension)) {
      return (
        <div onClick={handleDownloadClick}>
          <video controls className="whiteboard-message-video">
            <source src={fileURL} type={`video/${extension}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (pdfTypes.includes(extension)) {
      return (
        <div onClick={handleDownloadClick}>
          <div className="whiteboard-message-other-file">
            <img src="/pdf-icon.png" alt="file" className="whiteboard-message-file-icon" />
            <span className="whiteboard-message-file-name">{fileName}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div onClick={handleDownloadClick}>
          <div className="whiteboard-message-other-file">
            <img src="/file-icon.png" alt="file" className="whiteboard-message-file-icon" />
            <span className="whiteboard-message-file-name">{fileName}</span>
          </div>
        </div>
      );
    }
  }

  function downloadFile(fileURL, fileName) {
    // Create an anchor element
    const anchor = document.createElement("a");
    anchor.href = fileURL;
    // Instead of forcing a download, open in a new tab
    anchor.target = "_blank";
    // Optional: Set the download attribute to suggest a file name
    anchor.download = fileName || 'download';

    // Append to the document
    document.body.appendChild(anchor);

    // Trigger click
    anchor.click();

    // Remove the anchor element
    document.body.removeChild(anchor);
  }

  const handleFilesChange = (event) => {
    setSelectedFiles([...event.target.files]);
  };

  const handleSelectFilesBtnClick = () => {
    document.getElementById('whiteboard-chat-file-input').click();
  }

  // A helper function to determine the icon for the file type
  function getFileIcon(file) {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      return '/video-icon.png'; // Your video icon path here
    } else if (file.type === 'application/pdf') {
      return '/pdf-icon.png'; // Your PDF icon path here
    } else {
      // You can add more checks for other file types
      return '/file-icon.png'; // Default file icon path
    }
  }

  const handleSendFiles = async () => {
    setIsSubmitting(true);
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        // Create a storage reference
        const storageRef = ref(storage, `whiteboardChatFiles/${file.name}`);
        // Upload file
        await uploadBytes(storageRef, file);
        // Get download URL
        return getDownloadURL(storageRef);
      });

      const fileURLs = await Promise.all(uploadPromises);

      // Send file URLs to the chat
      const sendFilePromises = fileURLs.map((url) => {
        return addDoc(messagesRef, {
          fileURL: url,
          whiteboardId: whiteboardId,
          groupId: groupId,
          userID: auth.currentUser.uid,
          userDisplayName: currentUser.displayName,
          userPhotoURL: currentUser.photoURL,
          createdAt: Timestamp.now()
        });
      });

      await Promise.all(sendFilePromises);

      // Reset the selected files
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error sending files: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Scroll to the bottom of the messages container
  const scrollToBottom = async () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {

    console.log("use effect triggered (1)");

    const queryMessages = query(
      messagesRef,
      where("whiteboardId", "==", whiteboardId),
      orderBy("createdAt")
    );

    console.log("message query created (2)");

    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {

      console.log("onSnapshot triggered (3)");

      databaseReadCounter++;
      console.log("Database read counter: " + databaseReadCounter + " || increased in GroupChat.js, useEffect()");

      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      console.log("Checking da group messages", messages);
      setMessages(messages);
    });

    return () => unsubscribe();

  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function getMessageTimestamp(message) {

    if (!message.createdAt) {
      return "..."; // or some placeholder text
    }

    const date = message.createdAt.toDate(); // Convert firebase timestamp to JS date object
    const hours = date.getHours().toString().padStart(2, '0'); // Convert hours to string and pad with leading zero if necessary
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Convert minutes to string and pad with leading zero if necessary

    // Construct time string in 24-hour format
    return `${hours}:${minutes}`;

  }

  const handleSendNewMessage = async (event) => {

    event.preventDefault();

    console.log("Sending message...");

    if (!newMessage && selectedFiles.length === 0) {
      setErrorMessage("Please enter a message or select a file to send.");
      setShowErrorForm(true);
      document.getElementsByClassName('overlay')[0].style.display = 'flex';
      return;
    } else if (isMuted) {
      console.log("You are muted and are therefore not allowed to send messages to the chat");
      setErrorMessage("You are muted and are therefore not allowed to send messages to the chat");
      setShowErrorForm(true);
      document.getElementsByClassName('overlay')[0].style.display = 'flex';
      return;
    }

    setIsSubmitting(true);

    try {
      // Send text message if there is one
      if (newMessage) {
        await addDoc(messagesRef, {
          text: newMessage,
          whiteboardId: whiteboardId,
          groupId: groupId,
          userID: auth.currentUser.uid,
          userDisplayName: currentUser.displayName,
          userPhotoURL: currentUser.photoURL,
          createdAt: Timestamp.now()
        });
      }

      // Handle file uploading
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const storageRef = ref(storage, `whiteboardChatFiles/${whiteboardId}/${file.name}_${Date.now()}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });

        const fileURLs = await Promise.all(uploadPromises);

        const fileMessagesPromises = fileURLs.map((url) => {
          return addDoc(messagesRef, {
            fileURL: url,
            fileName: selectedFiles[fileURLs.indexOf(url)].name,
            whiteboardId: whiteboardId,
            groupId: groupId,
            userID: auth.currentUser.uid,
            userDisplayName: currentUser.displayName,
            userPhotoURL: currentUser.photoURL,
            createdAt: Timestamp.now()
          });
        });

        await Promise.all(fileMessagesPromises);
      }
    } catch (error) {
      setErrorMessage("Error sending message or files.");
      setShowErrorForm(true);
      document.getElementsByClassName('overlay')[0].style.display = 'flex';
      console.error('Error sending message or files: ', error);
    } finally {
      // Reset the message input and selected files
      setNewMessage("");
      setSelectedFiles([]);
      setIsSubmitting(false);
    }
  };

  const handleOkClick = () => {
    setErrorMessage("");
    setShowErrorForm(false);
    document.getElementsByClassName('overlay')[0].style.display = 'none';
  }

  return (

    <div className="whiteboard-chat-container">

      <div className="whiteboard-messages-container" id={selectedFiles.length > 0 ? 'files-selected' : ""}>
        {console.log("Messages: ", messages)}
        {messages.map((message) => (
          <div key={message.id} className={currentUser.uid === message.userID ? 'whiteboard-message-container-they' : 'whiteboard-message-container-me'}>
            <img src={message.userPhotoURL} alt="user" className="whiteboard-message-user-icon" />
            <div className='whiteboard-message-text-container'>
              <div className="whiteboard-message-displayName">{message.userDisplayName}</div>

              {message.fileURL && renderFileContent(message.fileURL, message.fileName)}
              {message.text && (
                <div className="whiteboard-message-message">{message.text}</div>
              )}
            </div>
            <div className={currentUser.uid === message.userID ? 'whiteboard-message-timestamp-me' : 'whiteboard-message-timestamp-they'}>{getMessageTimestamp(message)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>



      <div className="whiteboard-input-container">
        <div className="whiteboard-selected-files-container">
          {selectedFiles.length > 0 && !isSubmitting && (
            <div className="whiteboard-selected-files-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="whiteboard-selected-file-container">
                  <img className='whiteboard-selected-file-icon' src={getFileIcon(file)} alt={file.type} />
                  <h3 className="whiteboard-selected-file-name">{file.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleSendNewMessage} className="whiteboard-message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            className="whiteboard-message-input-field"
            placeholder="Type your message here..."
          />
          <button type="button" className='whiteboard-message-select-files-btn' onClick={handleSelectFilesBtnClick}>
            <img src="/paperclip.png" alt="Choose Files" className="paperclip-icon" />
          </button>
          <button type="submit" className="bob-btn-1" id='whiteboard-message-send-btn' disabled={isSubmitting}>
            Send
          </button>
        </form>
        <input
          type="file"
          multiple
          onChange={handleFilesChange}
          id='whiteboard-chat-file-input'
          style={{ display: 'none' }}
        />
      </div>

      {showErrorForm && (
        <div className="popup-form" id="error-form">
          <form onSubmit={handleOkClick} className='popup-form-form' id='error-form-form'>
            <div className='popup-form-text' id='error-form-text'>{errorMessage}</div>
            <button type="submit" className="bob-btn-1" id='error-form-btn'>
              Okay
            </button>
          </form>
        </div>

      )}

      <div className='overlay'></div>
    </div>
  )

}

export default WhiteboardChat;