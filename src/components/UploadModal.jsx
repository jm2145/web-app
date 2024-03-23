// UploadModal.js

import React from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import './UploadModal.css';

function UploadModal({ onClose, onUploadFinish }) {
    const handleFileUpload = (files) => {
        // Assuming you want to handle only one file at a time
        if (files.length > 0) {
            const uploadedFile = files[0].file;
            onUploadFinish(uploadedFile);
            onClose();
        }
    };

    return (
        <div className="upload-modal">
            <div className="modal-content">
                <h2>Upload File</h2>
                <FilePond
                    allowMultiple={false}
                    onupdatefiles={handleFileUpload}
                    server={{
                        url: 'http://localhost:3000/upload',
                        process: {
                            url: '/process',
                        },
                    }}
                />
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default UploadModal;
