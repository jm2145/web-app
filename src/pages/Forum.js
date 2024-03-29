import React, { useState, useContext, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useNavigate } from 'react-router-dom';
import SharingMenu from '../components/SharingMenu';
import './Forum.css';
import { FcLike } from "react-icons/fc";
import { LiaComments } from "react-icons/lia";
import UploadModal from '../components/UploadModal';
import { db, storage } from '../Firebase';
import { doc, setDoc, getDoc, getDocs, collection, query, orderBy, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import BadWordsFilter from 'bad-words';

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


  const badWordsFilter = new BadWordsFilter();
  const [newPostContent, setNewPostContent] = useState('');
  // const [isTagsOpen, setIsTagsOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  // const [selectedTag, setSelectedTag] = useState('');
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]); // State variable to track liked posts
  const [sharedPostId, setSharedPostId] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fakeUploadInProgress, setFakeUploadInProgress] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSharingMenuOpen, setIsSharingMenuOpen] = useState(false);

  const handleShareClick = (postId) => {
    setIsSharingMenuOpen(true);
    setSharedPostId(postId); // Assuming you have a state variable to store the postId in the Forum component
  };

  const handleCloseSharingMenu = () => {
    setIsSharingMenuOpen(false);
  };


  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleUploadFinish = (file) => {
    // Simulate upload delay for demonstration purposes (remove this line in production)
    setFakeUploadInProgress(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10; // Increment progress (for demonstration)
      if (progress >= 100) {
        clearInterval(interval);
        setFakeUploadInProgress(false);
        setUploadedFile(file);
      } else {
        setUploadProgress(progress); // Update upload progress
      }
    }, 500);
  };

  const handleFilePreviewClick = () => {
    // Show preview of the uploaded file (e.g., open modal with preview)
    console.log('Preview clicked');
  };

  const handleImageUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleLike = async (postId) => {
    try {
      const postRef = doc(db, 'Posts', postId);
      const postSnapshot = await getDoc(postRef);
      const post = postSnapshot.data();

      if (post.likes && post.likes.includes(currentUser.uid)) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid),
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePostPage = (postId) => {
    navigate(`/postPage?postId=${postId}`);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollection = collection(db, 'Posts');
      const q = query(postsCollection, orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postData = [];
        snapshot.forEach((doc) => {
          postData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postData);
      });
      return unsubscribe;
    };
    fetchPosts();
  }, []);

  // const tags = ["General",
  //   "Art",
  //   "Music",
  //   "Technology",
  //   "TV/Movies",
  //   "Dance",
  //   "Gaming",
  //   "Sports",
  //   "Cooking"];

  // function handleTagSelect(tag) {
  //   setSelectedTag(tag);
  //   setIsModalOpen(false);
  // }

  // function handleTagButtonClick() {
  //   setIsModalOpen(true);
  // }

  // function closeModal() {
  //   setIsModalOpen(false);
  // }

  function handleInputChange(event) {
    setNewPostContent(event.target.value);
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

    try {
      // Upload file to Firebase Storage
      let fileURL = '';
      const filteredPostContent = badWordsFilter.clean(newPostContent);
      if (uploadedFile) {
        const storageRef = ref(storage, `post-images/${uploadedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, uploadedFile);
        await uploadTask;

        // Get download URL of the uploaded file
        fileURL = await getDownloadURL(storageRef);
      }

      const currentDate = new Date();
      const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
      const postId = uuidv4();
      const userRef = doc(db, "Posts", postId);

      const postData = {
        userId: currentUser.uid,
        postId: postId,
        content: filteredPostContent,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        // tag: selectedTag,
        date: formattedDate,
        likes: [],
        fileURL: fileURL
      };

      await setDoc(userRef, postData);
      setNewPostContent('');
      // setSelectedTag('');
      setUploadedFile('');
    } catch (error) {
      console.error("Error uploading file and saving post:", error);
    }
  }

  return (
    <div className='forum-bg'>
      <div className='forum-container'>
      <div className='navbar-container'><Navbar /></div>
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
                <img src='/Image.png' alt='photo-upload' onClick={handleImageUploadClick} />
              </div>
              {(fakeUploadInProgress || uploadedFile) && ( // Show only if upload is in progress or file is uploaded
                <div className="preview-container">
                  <div className="upload-progress-container">
                    {fakeUploadInProgress && <ProgressBar animated now={uploadProgress} visuallyHidden={false} />} {/* Use ProgressBar component */}
                  </div>
                  {uploadedFile && ( // Show uploaded file info if it's available
                    <div className="uploaded-file-info" onClick={handleFilePreviewClick}>
                      {uploadedFile.name}
                    </div>
                  )}
                </div>
              )}
              {/* {selectedTag ? (
                  <span className="selected-tag" onClick={handleTagButtonClick}>{selectedTag}</span>
                ) : (
                  <button className="tags-button" onClick={handleTagButtonClick}>Tags</button>
                )} */}
              <button className="post-button" onClick={handleSubmitPost}>Post</button>
              {/* {isModalOpen && (
                  <TagSelector
                    tags={tags}
                    onSelect={handleTagSelect}
                    onClose={closeModal}
                  />
                )} */}
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
                  <div className='post-user-date'>
                    <p className='post-owner'>{post.displayName}</p>
                    <p className='post-date'>{post.date}</p>
                  </div>
                  <p>{post.content}</p>
                  {post.fileURL && (
                    <img src={post.fileURL} alt="Uploaded Image" className="uploaded-image" />
                  )}
                  <div className='post-reaction'>
                    <div className='post-like' onClick={() => handleLike(post.postId)}>
                      <FcLike
                        className='like-icon'
                      />
                      <div className='like-number'>
                        {post.likes ? post.likes.length : 0}
                      </div>
                    </div>
                    <div className='post-comments' onClick={() => handlePostPage(post.postId)}>
                      <p className='comment-title'>Comments</p>
                      <LiaComments
                        className='comments-icon'
                        color='black'
                        size={25}
                      />
                    </div>
                    <div className='post-comments' onClick={() => handleShareClick(post.postId)} >
                      <p className='comment-title' >Share</p>
                      <LiaComments
                        className='comments-icon'
                        color='black'
                        size={25}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {uploadModalOpen && (
        <UploadModal onClose={handleCloseUploadModal} onUploadFinish={handleUploadFinish} />
      )}
      {isSharingMenuOpen && (
        <SharingMenu onClose={handleCloseSharingMenu} postId={sharedPostId} />
      )}
      </div>
    </div>
  );
}

export default Forum;
