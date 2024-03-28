import React from 'react'
import './SettingSelect.css'
import { VscAccount } from "react-icons/vsc";
import { AiOutlineCluster } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { FaQuestion } from "react-icons/fa";
import StarryBackground from '../components/StarryBg';

export const SettingSelect = () => {
    const navigate = useNavigate();

    const navigatePath = (path) => {
        navigate(path);

    }
    
    return (
        <div className='ss-mainbg'>
            <StarryBackground/>
            <div className='ss-select-box'>
                <div className='ss-prof' onClick={() => navigatePath("/profilesetting")} >
                    <div className='ss-prof-icon'>
                        <VscAccount size={350} />
                    </div>
                    <div className='ss-prof-title'>
                        Profile Settings
                    </div>
                </div>
                <div className='ss-app'>
                    <div className='ss-app-icon'>
                        <AiOutlineCluster size={350} />
                    </div>
                    <div className='ss-app-title'>
                        Analytics
                    </div>
                </div>
                <div className='ss-app' onClick={() => navigatePath("/faqs")}>
                    <div className='ss-app-icon'>
                        <FaQuestion size={350} />
                    </div>
                    <div className='ss-app-title'>
                        FAQs
                    </div>
                </div>
            </div>
            <div className="ss-buttons">
                <button className="ss-button" onClick={() => navigatePath("/")}>Back to Dashboard</button>
            </div>
        </div>
    )
}
