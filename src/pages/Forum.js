import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import './Forum.css';
import { FcLike } from "react-icons/fc";
import { LiaComments } from "react-icons/lia";
import { db } from '../Firebase';
import { doc, setDoc, getDoc, getDocs, collection, query, orderBy, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

function TagSelector({ tags, onSelect, onClose }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Select a Tag</h2>
        <div className="tag-list">
          {tags.map(tag => (
            <button key={tag} onClick={() => onSelect(tag)}>{tag}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Forum() {
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const { currentUser } = useContext(AuthContext);

  const [selectedTag, setSelectedTag] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]); // State variable to track liked posts

  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, 'Posts', postId);
      const postSnapshot = await getDoc(postRef);
      const post = postSnapshot.data();

      if (post.likes && post.likes.includes(currentUser.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
        setLikedPosts(likedPosts.filter(id => id !== postId)); // Remove postId from likedPosts
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
        setLikedPosts([...likedPosts, postId]); // Add postId to likedPosts
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollection = collection(db, 'Posts');
      const q = query(postsCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const postData = [];
      querySnapshot.forEach(doc => {
        postData.push(doc.data());
      });
      setPosts(postData);
    };
    fetchPosts();
  }, []);

  const tags = ["General",
    "Art",
    "Music",
    "Technology",
    "TV/Movies",
    "Dance",
    "Gaming",
    "Sports",
    "Cooking"];

  function handleTagSelect(tag) {
    setSelectedTag(tag);
    setIsModalOpen(false);
  }

  function handleTagButtonClick() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleInputChange(event) {
    setNewPostContent(event.target.value);
  }

  function handleImageUpload(event) {
    setSelectedImage(event.target.files[0]);
  }

  function handleEmojiSelect(emoji) {
    setSelectedEmoji(emoji);
  }

  const handleSubmitPost = async () => {
    if (!currentUser) {
      console.error("User not logged in.");
      return;
    }

    if (!newPostContent.trim()) {
      console.error("Post content cannot be empty.");
      return;
    }

    if (!currentUser.displayName || !currentUser.photoURL) {
      console.error("User data not available.");
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    const postId = uuidv4();
    const userRef = doc(db, "Posts", postId);

    const postData = {
      userId: currentUser.uid,
      postId: postId,
      content: newPostContent,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      tag: selectedTag,
      date: formattedDate,
      likes: [],
    };

    await setDoc(userRef, postData);
    setNewPostContent('');
    setSelectedImage(null);
    setSelectedEmoji('');
  }

  return (
    <div>
      <Navbar />
      <div className='forum'>
        <div className='forum-main'>
          <div className='create-post'>
            <div className='user-forum-pic'>
              {currentUser.photoURL && <img src={currentUser.photoURL} alt='User Profile' className='forum-pic' />}
            </div>
            <div className='post-box'>
              <input
                className='post-input'
                value={newPostContent}
                onChange={handleInputChange}
                placeholder='What’s on your mind?'
              />
              <div className='post-bottom'>
                <div className='forum-icons'>
                  <img src='/Image.png' alt='photo-upload' />
                  <img src='/Cinema.png' alt='video-upload' />
                  <img src='/Happy.png' alt='emoji-upload' />
                </div>
                {selectedTag ? (
                  <span className="selected-tag" onClick={handleTagButtonClick}>{selectedTag}</span>
                ) : (
                  <button className="tags-button" onClick={handleTagButtonClick}>Tags</button>
                )}
                <button className="post-button" onClick={handleSubmitPost}>Post</button>
                {isModalOpen && (
                  <TagSelector
                    tags={tags}
                    onSelect={handleTagSelect}
                    onClose={closeModal}
                  />
                )}
              </div>
            </div>
          </div>
          {posts.map(post => (
            <div key={post.id} className="post">
              <div className='main-post'>
                <div className='post-userpic'>
                  <img src={post.photoURL} alt="User Profile" className='post-prof-pic' />
                </div>
                <div className="post-info">
                  <div>
                    <p className='post-owner'>{post.displayName}</p>
                    <p>{post.content}</p>
                    <div className='post-reaction'>
                      <div className='post-like' onClick={() => handleLike(post.postId)}>
                        <FcLike
                          className='like-icon'
                          style={{ color: likedPosts.includes(post.postId) ? 'red' : 'white' }} // Change color based on whether the post is liked or not
                        />
                        <div className='like-number'>
                          {post.likes ? post.likes.length : 0}
                        </div>
                      </div>
                      <div className='post-comments' onClick={() => handleLike(post.postId)}>
                        <p className='comment-title'>Comments</p>
                        <LiaComments 
                          className='comments-icon'
                          color='black'
                          size={25}
                          // style={{ color: likedPosts.includes(post.postId) ? 'red' : 'white' }} // Change color based on whether the post is liked or not
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p>{post.date}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='forum-trend'>
          <input
            className='forum-search'
            placeholder='Search'
          />
          <div className='forum-browse'>
            Or browse trending topics!
          </div>
          <div className='button-forum-grid'>
            {tags.map(tag => (
              <button key={tag}>{tag}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forum;
