import React from 'react';
import TextEditor from './TextEditor';
import './DocEditor.css';
import { useParams } from 'react-router-dom'; // Import useParams hook

export const DocEditor = () => {
  const { fileUrl } = useParams(); // Extract fileUrl from URL params

  return (
    <div className='main-docEditor'>
      <TextEditor fileUrl={fileUrl} /> {/* Pass fileUrl as a prop to TextEditor */}
    </div>
  );
};
