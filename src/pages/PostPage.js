import React, { useState, useEffect, useContext } from 'react'
import './PostPage.css'
import Navbar from '../components/Navbar'
import { useLocation } from 'react-router-dom'
import Comment from '../components/Comment'
import { FcLike } from "react-icons/fc";
import { LiaComments } from "react-icons/lia";
import useNode from '../hooks/useNode'
import { db } from '../Firebase'
import { doc, setDoc, getDoc, getDocs, collection, query, orderBy, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { AuthContext } from '../context/AuthContext'



const comments = {
    id: 1,
    items: []
}
export const PostPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const { currentUser } = useContext(AuthContext);
    const postId = searchParams.get("postId");
    const [commentsData, setCommentsData] = useState(comments);
    const [post, setPost] = useState([]); // State to store the fetched post
    const { insertNode, editNode, deleteNode } = useNode();

    const handleInsertNode = (folderId, item) => {
        const finalStructure = insertNode(commentsData, folderId, item);
        setCommentsData(finalStructure);
    };

    const handleEditNode = (folderId, value) => {
        const finalStructure = editNode(commentsData, folderId, value);
        setCommentsData(finalStructure);
    };

    const handleDeleteNode = (folderId) => {
        const finalStructure = deleteNode(commentsData, folderId);
        const temp = { ...finalStructure };
        setCommentsData(temp);
    };



    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postRef = doc(db, 'Posts', postId);
                const postSnapshot = await getDoc(postRef);
                if (postSnapshot.exists()) {
                    setPost(postSnapshot.data());
                } else {
                    console.log('No such document!');
                }   
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);


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


    return (
        <div>
            <Navbar />
            <div className='forum'>
                <div className='postpage-main'>
                    <div className='postPage-upper'>
                        <div className='postPage-userInfo'>
                            <img src={post.photoURL} alt='post-user' className='postPage-userpic' />
                            <p className='postPage-owner'>{post.displayName}</p>
                        </div>
                        <div className='postPage-content'>
                            <p className='postPage-content-content'>{post.content}</p>
                            {post.fileURL && (
                                <img src={post.fileURL} alt="Uploaded " className="post-Page-uploaded-image" />
                            )}
                        </div>
                        <div className='postPage-reaction'>
                            <div className='post-like' onClick={() => handleLike(post.postId)}>
                                <FcLike
                                    className='like-icon'
                                />
                                <div className='like-number'>
                                    {post.likes ? post.likes.length : 0}
                                </div>
                            </div>
                            {/* onClick={() => handlePostPage(post.postId)} */}
                            <div className='post-comments' >
                                <p className='comment-title'>Comments</p>
                                <LiaComments
                                    className='comments-icon'
                                    color='black'
                                    size={25}
                                />
                            </div>
                            <div className='post-comments' >
                                <p className='comment-title'>Share</p>
                                <LiaComments
                                    className='comments-icon'
                                    color='black'
                                    size={25}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='postPage-Comments'>
                        <Comment
                            handleInsertNode={handleInsertNode}
                            handleEditNode={handleEditNode}
                            handleDeleteNode={handleDeleteNode}
                            profilePicture={currentUser.photoURL}
                            displayName={currentUser.displayName}
                            comment={commentsData}
                            postId={postId}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
