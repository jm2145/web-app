import { useParams } from 'react-router-dom';
import { db } from '../Firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import './ExcalidrawStyles.css';
import './Whiteboard.css';
import WhiteboardChat from "../components/WhiteboardChat";

// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Whiteboard = () => {
  const { groupId, whiteboardId } = useParams();
  const [whiteboardData, setWhiteboardData] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);


  const uiOptions = {
    // ... (UI options remain the same)
  };



  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'whiteboards', whiteboardId), (doc) => {
      const data = doc.data();
      if (data) {
        // Convert collaborators object to Map
        const collaborators = new Map(Object.entries(data.state.collaborators || {}));

        // Parse points string back to array for elements with points
        const elementsWithParsedPoints = data.elements.map(element => {
          if (element.points) {
            const parsedPoints = JSON.parse(element.points);
            return { ...element, points: parsedPoints };
          }
          return element;
        });

        setWhiteboardData({
          ...data,
          elements: elementsWithParsedPoints,
          state: {
            ...data.state,
            collaborators,
          },
          files: data.files || {},
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [whiteboardId]);

  const saveChanges = useCallback(
    debounce(async (elements, state, files) => {
      try {
        // Convert Map objects to plain JavaScript objects
        const serializedState = JSON.parse(JSON.stringify(state, (key, value) => {
          if (value instanceof Map) {
            return Object.fromEntries(value);
          }
          return value;
        }));

        // Filter out elements with undefined customData and convert points arrays
        const cleanedElements = elements.map(element => {

          const { customData, ...cleanedElement } = element;



          if (cleanedElement.points) {
            console.log("Element: " + element.type + " has points and is being converted");
            const convertedPoints = JSON.stringify(cleanedElement.points);
            return { ...cleanedElement, points: convertedPoints };
          }

          return cleanedElement;
        });

        // Check for undefined values and remove them from the state
        const cleanedState = Object.entries(serializedState).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});

        if (cleanedElements.length === 0 && Object.keys(cleanedState).length === 0) {
          console.warn('No valid data to update');
          return;
        }

        // Save the whiteboard changes to Firestore
        await updateDoc(doc(db, 'whiteboards', whiteboardId), {
          elements: cleanedElements,
          state: cleanedState,
          files: files || {},
        });
      } catch (error) {
        console.error('Error updating whiteboard:', error);
      }
    }, 500),
    [whiteboardId]
  );

  const handleChange = (elements, state, files) => {
    if (
      elements.length !== whiteboardData.elements.length ||
      Object.keys(files || {}).length !== Object.keys(whiteboardData.files || {}).length
    ) {
      // Elements or files added or removed
      console.log("Elements added or removed detected, initiating savign changes: " + elements);
      saveChanges(elements, state, files);
    } else {
      // Check if any element or file has been modified
      const modifiedElements = elements.filter((element, index) => {
        const previousElement = whiteboardData.elements[index];
        return JSON.stringify(element) !== JSON.stringify(previousElement);
      });

      const modifiedFiles = Object.keys(files || {}).some((fileId) => {
        return files[fileId] !== whiteboardData.files[fileId];
      });

      if (modifiedElements.length > 0 || modifiedFiles) {
        // Elements or files modified
        console.log("Elements modified detected, initiating savign changes: " + modifiedElements);
        saveChanges(elements, state, files);
      }
    }
  };

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  const navigateToGroup = () => {

  };


  return (
    <div className="whiteboard-page">
      <button className={`toggle-chat-btn visible`} onClick={navigateToGroup}>
        <img src="/chat-icon.png" alt="Chat Icon" className='chat-icon' />
        <h3 className="chat-btn-text"> Back </h3>
        <h3 className="chat-btn-text"> To </h3>
        <h3 className="chat-btn-text"> Group </h3>
      </button>
      <div className="whiteboard-div-container">
        {whiteboardData ? (
          <Excalidraw
            initialData={{
              elements: whiteboardData.elements || [],
              appState: whiteboardData.state || {},
              files: whiteboardData.files || {},
            }}
            onChange={(elements, state, files) => handleChange(elements, state, files)}
            UIOptions={uiOptions}
          />
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className={`whiteboard-chat-div-container ${isChatVisible ? '' : 'visible'}`}>
        <WhiteboardChat groupId={groupId} whiteboardId={whiteboardId} />
      </div>
      <button className={`toggle-chat-btn ${isChatVisible ? 'visible' : ''}`} onClick={toggleChatVisibility}>
        <img src="/chat-icon.png" alt="Chat Icon" className='chat-icon' />
        <h3 className="chat-btn-text"> {isChatVisible ? 'Close' : 'Open'} </h3>
        <h3 className="chat-btn-text"> Chat </h3>
      </button>
    </div>
  );
};

export default Whiteboard;