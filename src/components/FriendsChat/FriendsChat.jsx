import React from 'react'
import Sidebar from './Sidebar'
import Chat from './Chat'
import './FriendsChat.css'
import Navbar from '../Navbar'
import StarryBackground from '../StarryBg'


export const FriendsChat = () => {
    return (
        <div className='fc-home'>
            <StarryBackground/>
            <div className="db-navbar">
                <Navbar />
            </div>
            <div className='fc-container'>
            
                <Sidebar />
                <Chat />
            </div>
        </div>


    )
}
