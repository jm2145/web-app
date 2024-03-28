// UploadModal.js

import React, {useState} from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import './UploadModal.css';

function FileUploadModal({ onClose, onUploadFinish }) {
    const [files, setFiles] = useState([]);

  const handleFileUpload = async () => {
    if (files.length > 0) {
      const file = files[0].file;
      onUploadFinish(file);
      onClose();
    }
  };

  return (
    <div className="upload-modal">
      <div className="modal-content">
        <h2>Upload File</h2>
        <FilePond
          allowMultiple={false}
          onupdatefiles={(fileItems) => {
            setFiles(fileItems);
          }}
        />
        <button onClick={handleFileUpload}>Upload</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default FileUploadModal;
