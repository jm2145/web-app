import React, { useContext, useState } from 'react'
import { AuthContext } from "../../context/AuthContext"
import { ChatContext } from '../../context/ChatContext';
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../Firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const Input = () => {

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    try {
      setIsLoading(true);
  
      if (img) {
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, img);
  
        uploadTask.on(
          (error) => {
            console.error("Error uploading image:", error);
            setIsLoading(false);
          },
          async () => {
            try {
              // Wait for a short duration to ensure that the download URL is available
              await new Promise(resolve => setTimeout(resolve, 1000));
        
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
              await updateDoc(doc(db, "Chats", data.chatId), {
                messages: arrayUnion({
                  id: uuid(),
                  text,
                  senderId: currentUser.uid,
                  date: Timestamp.now(),
                  img: downloadURL,
                }),
              });
            } catch (error) {
              console.error("Error getting download URL:", error);
            } finally {
              setIsLoading(false);
            }
          }
        );
        
      } else {
        await updateDoc(doc(db, "Chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
          }),
        });
      }
      
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
  
      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });

      setText("");
      setImg(null);
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: Handle error, show error message to the user
    } finally {
      setIsLoading(false); // Ensure to set loading state to false in case of an error
    }
  };
  

  return (
    <div className='fc-input'>
      <input
        type="text"
        placeholder='Type something...'
        className='fc-input-input'
        onChange={(e) => setText(e.target.value)} 
        value={text}/>
      <div className='fc-send'>
        <img src='' alt='attach' />
        <input
          type='file'
          style={{ display: "none" }}
          id='file'
          onChange={(e) => setImg(e.target.files[0])} />
        <label htmlFor='file'>
          <img src='' alt='img' />
        </label>
        <button className='fc-send-button' onClick={handleSend}> Send </button>

      </div>
    </div>
  )
}

export default Input;