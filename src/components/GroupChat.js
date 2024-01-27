import React, { useState, useEffect, useContext, props } from "react";
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

import "./GroupChat.css";

function GroupChat(props) {

  const { groupName } = props;
  const { currentUser } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const messagesRef = collection(db, "Messages");

  useEffect(() => {

    const queryMessages = query(
      messagesRef,
      where("groupName", "==", groupName),
      orderBy("createdAt")
    );
    const unsuscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      //console.log(messages);
      setMessages(messages);
    });

    return () => unsuscribe();

  }, []);

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

    if (newMessage === "") {
      console.log("Please enter a message" + groupName.groupName);
      console.log(currentUser);
      return;
    }
    await addDoc(messagesRef, {
      text: newMessage,
      groupName: groupName,
      userID: auth.currentUser.uid,
      userDisplayName: currentUser.displayName,
      userPhotoURL: currentUser.photoURL,
      createdAt: Timestamp.now()
    });

    setNewMessage("");
  };

  return (

    <div className="group-chat-container">
      <div className="group-messages-container">
        {messages.map((message) => (
          <div key={message.id} className={currentUser.uid === message.userID ? 'group-message-container-me' : 'group-message-container-they'}>
            <img src={message.userPhotoURL} alt="user" className="group-message-user-icon" />
            <div className='group-message-text-container'>
              <div className="group-message-displayName">{message.userDisplayName}</div>
              <div className="group-message-message">{message.text}</div>
            </div>
            <div className={currentUser.uid === message.userID ? 'group-message-timestamp-me' : 'group-message-timestamp-they'}>{getMessageTimestamp(message)}</div>
          </div>
        ))}
      </div>



      <div className="group-message-input-container">
        <form onSubmit={handleSendNewMessage} className="group-message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            className="group-message-input-field"
            placeholder="Type your message here..."
          />
          <button type="submit" className="bob-btn-1" id='group-message-send-btn'>
            Send
          </button>
        </form>
      </div>
    </div>
  )

  {
    showGroupInfo && (
      <div>  </div>
    )
  }

}

export default GroupChat;