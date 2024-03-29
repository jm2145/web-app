import React, { useState, useEffect, useContext } from "react";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "../Firebase";
import { AuthContext } from "../context/AuthContext";
import "./FileExplorer.css";
import Navbar from "./Navbar";
import Explorer from "../containers/explorer";

function FileExplorer() {
  const [groupsData, setGroupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchGroupsData = async () => {
      if (!currentUser || !currentUser.uid) return;

      try {
        const userToGroupsRef = collection(db, 'UsersToGroup');
        const q = query(userToGroupsRef, where('userDisplayName', '==', currentUser.displayName));
        const userToGroupsSnapshot = await getDocs(q);

        const fetchedGroupsData = [];
        for (const docSnap of userToGroupsSnapshot.docs) {
          const groupData = docSnap.data();
          const groupID = groupData.groupID;
          const groupRef = doc(db, 'Groups', groupID);
          const groupDoc = await getDoc(groupRef);

          if (groupDoc.exists()) {
            const groupDetails = groupDoc.data();
            const groupName = groupDetails.name;
            const imageUrl = groupDetails.imageUrl;
            fetchedGroupsData.push({ groupID, groupName, imageUrl });
          }
        }

        setGroupsData(fetchedGroupsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching groups data:', error);
        setLoading(false);
      }
    };

    fetchGroupsData();

    // Cleanup function
    return () => { };
  }, [currentUser]);

  return (
    <div className="file-explorer">
      <h2>File Explorer</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="folders-container">
          {groupsData.map(group => (
            <div key={group.groupID} className="folder">
              <img src='./images/folder_icon.png' alt={group.groupName} />
              <span>{group.groupName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileExplorer;
