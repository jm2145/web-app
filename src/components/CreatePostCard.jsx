import React, { useState } from 'react';
import './CreatePostCard.css';

function CreatePostCard({ onClose, onSubmit }) {
    const [postType, setPostType] = useState('Post');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

    function handleCreatePost() {
        onSubmit({
            type: postType,
            topic: selectedTopic,
            content: newPostContent,
        });
    }

    return (
        <div className='overlay'>
            <div className="create-post-card">
                <button className="close-button" onClick={onClose}>x</button>
                <label>
                    Type:
                    <select value={postType} onChange={(e) => setPostType(e.target.value)}>
                        <option value="Post">Post</option>
                        <option value="Thread">Thread</option>
                    </select>
                </label>
                <label>
                    Topic:
                    <input
                        type="text"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        placeholder="Enter topic"
                    />
                </label>

                <textarea
                    placeholder="Enter your post content..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                />
                <button onClick={handleCreatePost}>Submit</button>
            </div>
        </div>
    );
}

export default CreatePostCard;