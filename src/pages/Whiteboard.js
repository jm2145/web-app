import { useParams } from 'react-router-dom';
import { db } from '../Firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import './ExcalidrawStyles.css';
import './Whiteboard.css';

const Whiteboard = () => {
  const { groupId, whiteboardId } = useParams();
  const [whiteboardData, setWhiteboardData] = useState(null);

  const uiOptions = {
    canvasActions: {
      loadScene: false,
      export: false,
      saveAsImage: false,
      saveToActiveFile: false,
      theme: false,
    },
    viewModeEnabled: false,
  };

  useEffect(() => {
    // Subscribe to real-time updates of the whiteboard data
    const unsubscribe = onSnapshot(doc(db, 'whiteboards', whiteboardId), (doc) => {
      setWhiteboardData(doc.data());
    });

    console.log(whiteboardData)

    return () => {
      // Unsubscribe from real-time updates when component unmounts
      unsubscribe();
    };
  }, [whiteboardId]);

  const handleChange = async (elements, state) => {
    try {
      console.log('Elements:', elements);
      console.log('State:', state);

      // Convert Map objects to plain JavaScript objects
      const serializedState = JSON.parse(JSON.stringify(state, (key, value) => {
        if (value instanceof Map) {
          return Object.fromEntries(value);
        }
        return value;
      }));

      // Check for undefined values and remove them
      const cleanedElements = elements.filter(element => element !== undefined);
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

      console.log('Whiteboard ID:', whiteboardId);

      // Save the whiteboard changes to Firestore
      await updateDoc(doc(db, 'whiteboards', whiteboardId), {
        elements: cleanedElements ?? [],
        state: cleanedState ?? {},
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
          }}
          onChange={handleChange}
          UIOptions={uiOptions}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Whiteboard;