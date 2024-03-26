import { useParams } from 'react-router-dom';
import { db } from '../Firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import './ExcalidrawStyles.css';
import './Whiteboard.css';
import WhiteboardChat from "../components/WhiteboardChat";



const Whiteboard = () => {
  const { groupId, whiteboardId } = useParams();
  const [whiteboardData, setWhiteboardData] = useState(null);

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

  const handleChange = async (elements, state, files) => {
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
  };

  return (

    <div className="whiteboard-container">
      {whiteboardData ? (
        <Excalidraw
          initialData={{
            elements: whiteboardData.elements || [],
            appState: whiteboardData.state || {},
            files: whiteboardData.files || {},
          }}
          onChange={handleChange}
          onLibraryChange={(files) => handleChange(whiteboardData.elements, whiteboardData.state, files)}
          UIOptions={uiOptions}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Whiteboard;