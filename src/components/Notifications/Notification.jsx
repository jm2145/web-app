import React, { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { collection, where, getDoc, doc, getDocs, onSnapshot, query, orderBy, } from 'firebase/firestore';
import { db, auth } from "../../Firebase";
import { useNavigate } from "react-router-dom";
import './Notification.css'
import { NavLink } from 'react-router-dom'

function Notifications () {
  const { data } = useContext(ChatContext);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const[senderUsernames, setSenderUsernames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      try{
        if(user){
          console.log("Userid:",user.uid)

          const useruid = user.uid;

          const querySnapshot = await getDocs(collection(db, 'Chats'));

          const unreadMessagesData = querySnapshot.docs.filter(doc => doc.id.startsWith(useruid) || doc.id.endsWith(useruid)).map(doc => {
            if (doc.exists()){
              const messages = doc.data().messages;
              return messages.filter(message => message.read === false && message.senderId !== useruid);
            } else{
              console.log("User doc not found")
              return [];
            }
          }).flat();

            setUnreadMessages(unreadMessagesData);
            if(unreadMessagesData.length == 0){
              console.log("No messages and senders")
              
            } else{
              console.log("Senders:",unreadMessagesData.map(m => m.senderId).join(", "))
              console.log("Messages:",unreadMessagesData);
            }
            

            const senderUsernamesData = await Promise.all(unreadMessagesData.map(async (message) => {
              const senderDocRef = doc(db, "Users", message.senderId);
              const senderDocSnapshot = await getDoc(senderDocRef);
              if(senderDocSnapshot.exists()){
                return senderDocSnapshot.data().username;
              } else{
                console.log('User doc not found for senderId: ${message.senderId}');
                return null;
              }
            }));
            setSenderUsernames(senderUsernamesData)
            console.log("Sender Usernames:", senderUsernames);
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

  useEffect(() => {
    const getUpcomingEvents = async () => {
      const currentTime = new Date();
      const twentyFourHours = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
      const eventsRef = collection(db, "events");
      const q = query(
        eventsRef,
        where("StartTime", ">=", currentTime),
        where("StartTime", "<=", twentyFourHours),
        orderBy("StartTime", "asc")
      );

      return onSnapshot(q, (querySnapshot) => {
        const events = querySnapshot.docs.map((doc) => ({
          Id: doc.id,
          Subject: doc.data().Subject,
          StartTime: new Date(doc.data().StartTime.seconds * 1000),
          EndTime: new Date(doc.data().EndTime.seconds * 1000),
          IsAllDay: doc.data().IsAllDay,
          Description: doc.data().Description,
          Location: doc.data().Location,
          RecurrenceRule: doc.data().RecurrenceRule,
          RecurrenceID: doc.data().RecurrenceID,
          RecurrenceException: doc.data().RecurrenceException,
        }));
        setUpcomingEvents(events);
      });
    };

    getUpcomingEvents();
  }, []);

  const notifslen = upcomingEvents.length + unreadMessages.length;
  console.log(notifslen);

  return (
    <div className='fc-unread-messages'>
      <h1>Notifications</h1>
      <div className="notifications-container">
        {upcomingEvents.length > 0 && (
          <>
          <h2>Upcoming Events</h2>
          {upcomingEvents.map((event) => (
            <div key={event.Id} className="event-item-link">
            <NavLink to="/Calender" className="no-underline-events">
              <div key={event.id} className="event-item">
                <p>{new Date(event.StartTime).toLocaleDateString()} - {event.Subject}</p>
              </div>
            </NavLink>
            </div>          
          ))}  
          </>         
        )}

        {unreadMessages.length > 0 && (
          <>
          <h2>Unread Chats</h2>
          {unreadMessages.map((m,index) => (
              <div key={index} className='chat-item-link'>
                <NavLink to="/friendschat" className="no-underline-messages">
                  <div key={index} className='messages-box'>
                    <p>Text: {m.text}</p>
                    <p>Username: {senderUsernames[index]}</p>
                  </div>
                </NavLink>          
              </div>
            ))
          }        
          </>        
        )}        
      </div>
    </div>
  );
}

export default Notifications;