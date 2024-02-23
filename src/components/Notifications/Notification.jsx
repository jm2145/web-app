import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { collection, where, getDoc, doc, getDocs } from 'firebase/firestore';
import { db, auth } from "../../Firebase";
import Message from '../FriendsChat/Message'; 
import './Notification.css'

function Notifications () {
  const { data } = useContext(ChatContext);
  const [unreadMessages, setUnreadMessages] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      try{
        if(user){
          console.log("Userid:",user.uid)

          const useruid = user.uid;

          const querySnapshot = await getDocs(collection(db, 'Chats'));

          const unreadMessagesData = querySnapshot.docs.filter(doc => doc.id.startsWith(useruid) || doc.id.endsWith(useruid)).map(doc => {
            if (doc.exists()){
              return doc.data().messages.filter(message => message.read === false);
            } else{
              console.log("User doc not found")
              return [];
            }
          }).flat();

            setUnreadMessages(unreadMessagesData);
            console.log("Messages:",unreadMessagesData);
          } else{
            console.log("User not signed in");
          }
      } catch (error){
        console.error("Error fetching unread messages:", error);
      }      
    })
    return () => {
      unsubscribeAuth();
    }    
  }, []);

  return (
    <div className='fc-unread-messages'>
      <h1>Notifications</h1>
      {unreadMessages.map(m => (
        <div key={m.id}>
          <p>Text: {m.text}</p>
          <p>SenderId: {m.senderId}</p>
        </div>
      ))}
    </div>
  );
}

export default Notifications;