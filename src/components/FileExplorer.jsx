import React, { useState, useContext, useEffect } from 'react';
import "./FileExplorer.css";
import { db } from '../Firebase';
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

function FileExplorer() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const q = query(collection(db, 'Messages'), where('fileName', '!=', null));
      const querySnapshot = await getDocs(q);
      const filesData = [];
      querySnapshot.forEach(doc => {
        const fileData = doc.data();

        filesData.push({
          id: doc.id,
          fileUrl: fileData.fileURL,
          fileName: fileData.fileName,
          createdAt: fileData.createdAt.toDate(),
          groupName: fileData.groupName
        });
      });
      setFiles(filesData);
    };

    fetchFiles();

  }, []);

  const handleFileItemClick = (fileUrl, fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension !== 'pdf') {
      window.open(fileUrl, '_blank'); // Open in new tab if not a PDF
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-item header">
        <div>File Name</div>
        <div>Group Name/Owner</div>
        <div>Created At</div>
      </div>
      {files.map(file => (
        <div key={file.id} className="file-item"  onClick={() => handleFileItemClick(file.fileUrl, file.fileName)}>
          <div>{file.fileName}</div>
          <div>{file.groupName}</div>
          <div>{file.createdAt.toString()}</div>
          {/* {file.fileType === 'pdf' && <FileEditor fileUrl={file.fileUrl} />} Conditionally render FileEditor for PDF files */}
        </div>
      ))}
    </div>
  );
}

export default FileExplorer;
