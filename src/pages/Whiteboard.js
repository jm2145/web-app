import { useParams, useLocation } from 'react-router-dom';

import { db } from '../Firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import './ExcalidrawStyles.css';
import { useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const { groupId, whiteboardId, groupName } = useParams();
  const [whiteboardData, setWhiteboardData] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [thisGroup, setThisGroup] = useState(location.state.thisGroup);
  const [excalidrawKey, setExcalidrawKey] = useState(Date.now());

  const navigate = useNavigate();


  const uiOptions = {
    // ... (UI options remain the same)
  };


  useEffect(() => {


    const unsubscribe = onSnapshot(doc(db, 'whiteboards', whiteboardId), (doc) => {
      console.log('Whiteboard snapshot received:', doc.data());
      const data = doc.data();

      if (data) {
        // Convert collaborators object to Map
        const collaborators = new Map(Object.entries(data.state.collaborators || {}));

        console.log("Changes to elements detected");

        // Parse points string back to array for elements with points
        const elementsWithParsedPoints = data.elements.map(element => {
          if (element.points) {
            const parsedPoints = JSON.parse(element.points);
            return { ...element, points: parsedPoints };
          }
          return element;
        });

        console.log("About to set whiteboard data");
        setWhiteboardData(prevData => ({
          ...data,
          elements: elementsWithParsedPoints,
          state: {
            ...data.state,
            collaborators,
          },
          files: data.files || {},
        }));
        console.log("Whiteboard data set", whiteboardData);
        setExcalidrawKey(Date.now());
      } else {
        console.log("Whiteboard data is null");
      }
    }, (error) => {
      console.error('Error listening to whiteboard changes:', error);
    });

    return () => {
      console.log('Unsubscribing from onSnapshot listener for whiteboard:', whiteboardId);
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

        console.log("About to save whiteboard data", whiteboardData);


        // Save the whiteboard changes to Firestore
        await updateDoc(doc(db, 'whiteboards', whiteboardId), {
          elements: cleanedElements,
          state: cleanedState,
          files: files || {},
        });

        console.log('Whiteboard updated successfully');

      } catch (error) {
        console.error('Error updating whiteboard:', error);
      }
    }, 500),
    [whiteboardId]
  );

  const handleChange = (elements, state, files) => {
    const significantChanges = elements.some((element, index) => {
      const previousElement = whiteboardData.elements[index];

      if (!previousElement) {
        // New element added
        return true;
      }

      // Check for changes in element properties
      if (
        element.x !== previousElement.x ||
        element.y !== previousElement.y ||
        element.width !== previousElement.width ||
        element.height !== previousElement.height ||
        // Add more properties to compare as needed
        JSON.stringify(element) !== JSON.stringify(previousElement)
      ) {
        return true;
      }

      return false;
    });

    const filesChanged =
      Object.keys(files || {}).length !== Object.keys(whiteboardData.files || {}).length;

    if (significantChanges || filesChanged) {
      console.log('Significant change detected. Saving changes...');
      saveChanges(elements, state, files);
    }
  };

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  const navigateToGroup = () => {
    console.log("Navigating to group page ", thisGroup.name, thisGroup);
    const group = thisGroup;
    navigate(`/GroupPage/${group.name}`, { state: { group } });
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
            key={excalidrawKey}
            initialData={{
              elements: whiteboardData.elements || [],
              appState: whiteboardData.state || {},
              files: whiteboardData.files || {},
            }}
            elements={whiteboardData.elements || []}
            files={whiteboardData.files || {}}
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