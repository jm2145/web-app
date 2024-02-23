import React, { useContext, useEffect, useState } from 'react'
import Message from './Message'
import { ChatContext } from '../../context/ChatContext';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from "../../Firebase";


const Messages = () => {
  const [messages, setMessages] = useState([])
  const { data } = useContext(ChatContext);


  useEffect(() => {
    const chatDocRef = doc(db, "Chats", data.chatId);
    console.log(data.chatId)
    const unSub = onSnapshot(chatDocRef, (doc) => {
      // doc.exists() && setMessages(doc.data().messages);
      if(doc.exists()){
        const receivedMessages = doc.data().messages
        const updatedMessages = receivedMessages.map(message => {
          if (auth.currentUser && message.senderId !== auth.currentUser.uid && !message.read){
            return { ...message, read: true};
          }
          return message;
        })
        updateDoc(chatDocRef, {
          messages: updatedMessages,
        });
        setMessages(updatedMessages);
      }
    })

    return () => {
      unSub()
    }
  }, [data.chatId])

  

  return (
    <div className='fc-messages'>
      {messages.map(m => (
        <Message message={m} key={m.id}/>
      ))}
    </div>
  )
}


export default Messages