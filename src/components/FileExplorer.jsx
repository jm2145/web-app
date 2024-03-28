import React, { useState, useContext, useEffect } from 'react';
import "./FileExplorer.css";
import { AuthContext } from '../context/AuthContext';
import { db, storage } from '../Firebase';
import UploadModal from './UploadModal';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { IoMdRefreshCircle } from "react-icons/io";
// import FileEditor from './FileEditor';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import TextEditor from './TextEditor';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from './LoadingScreens/LoadingScreen';

function FileExplorer() {
  const { currentUser } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchFiles = async () => {
      const publicFilesData = await fetchPublicFiles();
      const privateFilesData = await fetchPrivateFiles();
      const messagesData = await fetchMessages();

      // Combine all files data
      const allFilesData = [...publicFilesData, ...privateFilesData, ...messagesData];
      setFiles(allFilesData);
    };

    fetchFiles();
  }, []);

  const fetchPublicFiles = async () => {
    const publicFilesQuery = query(
      collection(db, 'PublicFiles')
    );

    const snapshot = await getDocs(publicFilesQuery);
    const filesData = [];
    snapshot.forEach(doc => {
      const fileData = doc.data();
      const fileId = doc.id;
      if (!files.find(file => file.id === fileId)) {
        filesData.push({
          id: fileId,
          visibility: fileData.visibility,
          fileUrl: fileData.fileURL,
          fileName: fileData.fileName,
          createdAt: fileData.createdAt.toDate(),
          groupName: fileData.userDisplayName
        });
      }
    });
    return filesData;
  };

  const fetchPrivateFiles = async () => {
    const privateFilesQuery = query(
      collection(db, 'PrivateFiles'),
      where('userID', '==', currentUser.uid)
    );
    console.log("private running")
    const snapshot = await getDocs(privateFilesQuery);
    const filesData = [];
    snapshot.forEach(doc => {
      const fileData = doc.data();
      const fileId = doc.id;
      if (!files.find(file => file.id === fileId)) {
        filesData.push({
          id: fileId,
          visibility: fileData.visibility,
          fileUrl: fileData.fileURL,
          fileName: fileData.fileName,
          createdAt: fileData.createdAt.toDate(),
          groupName: fileData.userDisplayName
        });
      }
      console.log("private running")
    });
    return filesData;
  };

  const fetchMessages = async () => {
    const messagesQuery = query(
      collection(db, 'Messages'),
      where('fileName', '!=', null),
      where('userID', '==', currentUser.uid)
    );

    const snapshot = await getDocs(messagesQuery);
    const filesData = [];
    snapshot.forEach(doc => {
      const fileData = doc.data();
      filesData.push({
        id: doc.id,
        visibility: fileData.visibility,
        fileUrl: fileData.fileURL,
        fileName: fileData.fileName,
        createdAt: fileData.createdAt.toDate(),
        groupName: fileData.groupName
      });
      setLoading(false);
    });
    return filesData;
  };

  const handleFileUpload = async (file, visibility) => {
    try {
      const storageRef = ref(storage, `userFiles/${file.name}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      const fileRef = collection(db, visibility === 'Private' ? 'PrivateFiles' : 'PublicFiles');
      const docRef = await addDoc(fileRef, {
        fileURL: fileURL,
        fileName: file.name,
        userID: currentUser.uid,
        visibility: visibility,
        userDisplayName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        createdAt: Timestamp.now()
      });

      console.log("File uploaded with ID: ", docRef.id);
      // Redirect or update UI as needed after successful upload
    } catch (error) {
      console.error("Error uploading file: ", error);
      // Handle error
    }
  };


  // Function to handle file selection
  const handleFileSelection = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (uploadType === 'Private' || uploadType === 'Public') {
        await handleFileUpload(file, uploadType);
      } else {
        // Notify user to select upload type
        console.error("Please select upload type (private or public).");
      }
    }
  };

  const handleFileItemClick = (fileUrl, fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'docx') {
      // Navigate to the editor route with fileUrl as URL parameter
      navigate(`/editor?fileUrl=${(fileUrl)}`);
    } else {
      window.open(fileUrl, '_blank'); // Open in new tab if not a .docx file
    }
  };


  const handleUploadFinish = (file) => {
    // Handle file upload finish
    console.log('Uploaded file:', file);
  };

  const handlePrivateUploadClick = () => {
    setUploadType("Private")
    setIsModalOpen(true);
  };

  const handlePublicUploadClick = () => {
    setUploadType("Public")
    setIsModalOpen(true);
  };

  const handleRefreshClick = () => {
    window.location.reload(); // Reload the page
  };

  console.log(uploadType)
  console.log("files", files)
  return (
    <div className="file-explorer">
      {!currentUser ? (
        <LoadingScreen/>
      ) : (
        <>
          <p className='fe-title'>File Explorer</p>
          <div className="upload-midbar">
            <div className="upload-options">
              <button className='fe-upload' onClick={handlePrivateUploadClick}>Upload Private</button>
              <button className='fe-upload' onClick={handlePublicUploadClick}>Upload Public</button>
            </div>
            <div className='refresh' onClick={handleRefreshClick}>
              <IoMdRefreshCircle size={50} color='#6b3aff' />
            </div>
          </div>
          <input type="file" onChange={handleFileSelection} />
          <div className="file-item header">
            <div>File Name</div>
            <div>Group Name/Owner</div>
            <div>Access</div>
            <div>Created At</div>
          </div>
          {files.map(file => (
            <div key={file.id} className="file-item" onClick={() => handleFileItemClick(file.fileUrl, file.fileName)}>
              <div>{file.fileName}</div>
              <div>{file.groupName}</div>
              <div>{file.visibility}</div>
              <div>{file.createdAt.toString()}</div>
              {/* {file.fileType === 'pdf' && <FileEditor fileUrl={file.fileUrl} />} Conditionally render FileEditor for PDF files */}
            </div>
          ))}
        </>
      )}
    </div>
  );

}
export default FileExplorer;
