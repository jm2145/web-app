import React from 'react'
import Sidebar from './Sidebar'
import Chat from './Chat'
import './FriendsChat.css'
import Navbar from '../Navbar'


export const FriendsChat = () => {
    return (
        <div className='fc-home'>
            <div className='fc-container'>
            
                <Sidebar />
                <Chat />
            </div>
        </div>


    )
}
