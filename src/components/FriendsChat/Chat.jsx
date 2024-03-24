import React, { useContext, useState, useEffect } from 'react';
import Messages from './Messages';
import Input from './Input';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faPlus, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { db } from "../../Firebase.js";
import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";

const Chat = () => {

  // Function to generate random ID
  function generateRandomID(len) {
    let result = '';
    var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
      maxPos = chars.length,
      i;
    len = len || 5;
    for (i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
  }

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const [calls, setCalls] = useState([]);
  const [latestCallLink, setLatestCallLink] = useState('');

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const userDocRef = doc(db, "Calls", currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userCalls = userDocSnapshot.data().calls || [];
          
          // Find the call with callstatus "pending"
          const pendingCall = userCalls.find(call => call.callstatus === "pending");
          if (pendingCall) {
            setCalls([pendingCall]);
            setLatestCallLink(pendingCall.calllink);
          } else {
            setCalls([]);
            setLatestCallLink('');
            console.log("No pending calls found");
          }
        }
      } catch (error) {
        console.log("Error fetching calls:", error);
      }
    };
    fetchCalls();
  }, [data.user.uid]);
  

  const handleVideoCallClick = async () => {
    const roomID = generateRandomID(5);
    const currentTime = new Date();
    const newCall = {
      caller: currentUser.uid,
      callstatus: "pending",
      calllink: window.location.origin + "/Call?roomID=" + roomID,
      time: currentTime
    };

    setCalls([...calls, newCall]);

    try {
      const userDocRef = doc(db, "Calls", data.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { calls: [...userDoc.data().calls, newCall] });
        console.log("Call added successfully");
      } else {
        await setDoc(userDocRef, { calls: [newCall] });
        console.log("Document created");
      }
      window.open("/Call?roomID=" + roomID, "_blank");

    } catch (error) {
      console.log("Error adding call:", error);
    }
  };

  const handleJoinCallClick = async () => {
    try {
      const userDocRef = doc(db, "Calls", currentUser.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        if (userDocRef.id === currentUser.uid) {
          const userCalls = userDocSnapshot.data().calls || [];
          const latestUserCall = userCalls[userCalls.length - 1];
          if (latestUserCall && latestUserCall.callstatus === "pending") {
            // Open the call link
            window.open(latestUserCall.calllink, "_blank");
            // Update the document and change the callstatus to "Call Joined"
            await updateDoc(userDocRef, {
              calls: userCalls.map(call => {
                if (call.calllink === latestUserCall.calllink) {
                  return { ...call, callstatus: "Call Joined" };
                }
                return call;
              })
            });
            console.log("Call status updated to 'Call Joined'");
          } else {
            console.log("No recent pending call available for the current user");
          }
        } else {
          console.log("Document ID does not match the current user's ID");
          console.log(currentUser.uid);
        }
      } else {
        console.log("User document not found");
      }
    } catch (error) {
      console.log("Error fetching user document:", error);
    }
  };
  
  
  
  
  

  return (
    <div className='fc-chat'>
      <div className='fc-chatinfo'>
        <span>{data.user?.displayName}</span>
        <div className="fc-chaticons">
          <FontAwesomeIcon icon={faVideo} size="xl" alt="Camera" onClick={handleVideoCallClick} />
          <button onClick={handleJoinCallClick}>Join Call</button>
          <FontAwesomeIcon icon={faPlus} size="xl" alt="Add" />
          <FontAwesomeIcon icon={faEllipsisH} size="xl" alt="More" />
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
};

export default Chat;