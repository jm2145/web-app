import React from 'react'
import './SettingSelect.css'
//import { VscAccount } from "react-icons/vsc";
//import { AiOutlineCluster } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export const SettingSelect = () => {
    const navigate = useNavigate();

    const navigatePath = (path) => {
        navigate(path);

    }
    /*
    return (
        <div className='ss-mainbg'>
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
                        Application Settings
                    </div>
                </div>
            </div>
            <div className="ss-buttons">
                <button className="ss-button" onClick={() => navigatePath("/")}>Back to Dashboard</button>
            </div>
        </div>
    )*/
}
