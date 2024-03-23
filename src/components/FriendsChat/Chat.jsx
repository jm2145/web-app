import React, {useContext, useState, useEffect} from 'react'
import Messages from './Messages';
import Input from './Input';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faPlus, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import Call from "../../pages/Call.js"

import { auth, db } from "../../Firebase.js";
import { getDoc, doc, setDoc, onSnapshot, updateDoc, deleteDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";



const Chat = ({randomID}) => {

  function randomID(len) {
    let result = '';
    if (result) return result;
    var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
      maxPos = chars.length,
      i;
    len = len || 5;
    for (i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
  }



  const [calls, setCalls] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  console.log("Data.user",data.user);
  console.log("Data.user.uid",data.user.uid);
  const receiver = data.user.uid;
  console.log("Receiver const",data.user.uid);
  console.log("Meee:",currentUser.uid);

  const currentTime = new Date();


  const handleVideoCallClick = async() => {
    const roomID = randomID(5);
    const newCall = {
      caller: currentUser.uid,
      callstatus: "pending",
      calllink: window.location.origin + "/Call?roomID=" + roomID,
      time: currentTime
    };

    setCalls([...calls, newCall]);

    try{
      const userDocRef = doc(db, "Calls", data.user.uid);
      const userDoc = await getDoc(userDocRef);
      if(userDoc.exists()){
        await updateDoc(userDocRef, { calls: [...userDoc.data().calls, newCall] })
        console.log("Call added successfully");
      } else{
        await setDoc(userDocRef, {
          calls: [newCall]
        })
        console.log("Document created");
      }
      window.open("/Call?roomID=" + roomID, "_blank")

      
    } catch(error){
      console.log("Error adding call:", error);
    }

    
  }

  return (
    <div className='fc-chat'>
      <div className='fc-chatinfo'>
        <span>{data.user?.displayName}</span>
        <div className="fc-chaticons">
          {/* <img src='' alt='cam'/> */}
          < FontAwesomeIcon icon={faVideo} size="xl" alt = "Camera" onClick={handleVideoCallClick}/>
          {/* <img src='' alt='add'/> */}
          < FontAwesomeIcon icon={faPlus} size="xl" alt = "Add"/>
          {/* <img src='' alt='more'/> */}
          < FontAwesomeIcon icon={faEllipsisH} size="xl" alt = "Add"/>
        </div>
      </div>
      <Messages/>
      <Input/>
    </div>
  )
}

export default Chat;
