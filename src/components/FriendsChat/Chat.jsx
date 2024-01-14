import React, {useContext} from 'react'
import Messages from './Messages';
import Input from './Input';
import { ChatContext } from '../../context/ChatContext';


const Chat = () => {

  const { data } = useContext(ChatContext);
  return (
    <div className='fc-chat'>
      <div className='fc-chatinfo'>
        <span>{data.user?.displayName}</span>
        <div className="fc-chaticons">
          <img src='' alt='cam'/>
          <img src='' alt='add'/>
          <img src='' alt='more'/>
        </div>
      </div>
      <Messages/>
      <Input/>
    </div>
  )
}

export default Chat;
