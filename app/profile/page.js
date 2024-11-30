'use client';
import { useState, useEffect, useRef } from "react";
import { Button } from '@/components/ui/button';
import styles from "styles/messages.module.css"
import io from 'socket.io-client';
import { Textarea } from '@/components/ui/textarea'; 
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuContent } from '../../components/ui/dropdown-menu'
import useAuthStore from '../../hooks/useAuthStore'
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatComponent from "./components/ChatComponent.js"

export default function Messages() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const user = useAuthStore((state) => state.user);
  const email = user ? user.email : null;
  const uid = user ? user.uid : null;

  const [messages, setMessages] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [chatEmail, setChatEmail] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);
  
  // scroll up to get more messages
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) 
      return;
    const handleScroll = () => {
      const scrollTop = chatBox.scrollTop;
      const maxScrollTop = chatBox.scrollHeight - chatBox.clientHeight;
      if (!loading && (scrollTop) + maxScrollTop <= 1 &&  (scrollTop) + maxScrollTop >= -1) {
        loadMessages(currentChat);
      }
    };
    chatBox.addEventListener("scroll", handleScroll);
    return () => {
      chatBox.removeEventListener("scroll", handleScroll);
    };
  }, [loading, messages]);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000'); 
    async function getAllUsers() {
      try {
        const response = await fetch(`/api/getAllUsers`);
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users);
        }
      } 
      catch (err) {
          console.error(err);
      } 
    };
    getAllUsers();

    socketRef.current.on('receivePrivateMessage', (messageData) => {
      setMessages((prevMessages) => {
        const {chatId, message, sender, date, messageId} = messageData;
        return {...prevMessages, [chatId]: [...(prevMessages[chatId] || []), {sender, message, date, messageId}]};
      });
    });
  }, [email]);

  useEffect(() => {
    if (allUsers.length > 0) {
      async function checkIfChatStarted() {
        const newChat = [];
        const existingUsers = [];
        for (let i = 0; i < allUsers.length; i++) {
            const response = await fetch(`/api/getExistingChatUsers?uid=${uid}&userId=${allUsers[i].userId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.chatExists)
                existingUsers.push({userId: allUsers[i].userId, email: allUsers[i].email});
              else
                newChat.push({userId: allUsers[i].userId, email: allUsers[i].email});
          }}
          setChatUsers(existingUsers);
          setNewUsers(newChat);
        }

      checkIfChatStarted(); 
    }}, [allUsers, uid]); 
  
  const loadMessages = async (currentChat) => {
    if (loading) 
      return;
    setLoading(true);
    try {
      const response = await fetch(`/api/getPrivateMessages?chatId=${currentChat}&index=${index}`);
      if (response.ok) {
        const data = await response.json();
        setIndex(index+1);
        setMessages((pastMessages) => ({...pastMessages, [currentChat]: [...data.messages, ...(pastMessages[currentChat] || [])]}));
      }
    } 
    catch (err) {
        console.error(err);
    } 
    finally {
      setLoading(false);
    }
  };

  const chatToUser = async (userEmail, userId, currentChat) => {
    let chatId = currentChat;
    if (currentChat == null) {
      chatId = userId < uid ? userId+uid : uid+userId;
      setCurrentChat(chatId);
      setChatEmail(userEmail);
    }
    if (loading) 
      return;
    setLoading(true);
    socketRef.current.emit('joinChat', currentChat);

    const response = await fetch(`/api/getPrivateMessages?chatId=${chatId}&index=0`);
    if (response.ok) {
      const data = await response.json();
      setIndex(1);
      setMessages((pastMessages) => ({...pastMessages, [chatId]: data.messages}));
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (newMessage) {
        socketRef.current.emit('sendPrivateMessage', {chatId: currentChat, message: newMessage, sender: email});
        setNewMessage('');
      }
    };
  return (
    <div>
      <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
        Main Menu
      </Button>
      <Navbar/>
      <h1 className="text-3xl m-5">Profile:</h1>
      <p className="m-5">Email: {email}</p>
      <h1 className="text-3xl m-5">Private Messages:</h1>

      <DropdownMenu>
        <DropdownMenuTrigger><p className="ml-5 border-2 rounded-sm">{'Start a New Chat'}</p></DropdownMenuTrigger>
        <DropdownMenuContent>
        {newUsers.map((user, idx) => (
            <div key={idx}>
            <DropdownMenuLabel>
              <Button key={idx} onClick={() => chatToUser(user.email, user.userId, null)}> {user.email} </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex w-full">
        <div className="flex flex-col">
          <p className="m-5">{'Select an Existing Chat'}</p>
          {chatUsers.map((user, idx) => (
            <Button className="ml-5 mb-1" key={idx} onClick={() => chatToUser(user.email, user.userId, null)}> {user.email} </Button>
          ))}
        </div>

        <div className="flex-1">
          {currentChat && (
            <div>
              <h2 className="m-5">Chat with: {chatEmail}</h2>
              <div className="space-y-4">
                <div className={styles.chat_container} ref={chatBoxRef}>
                  <div>
                  {(messages[currentChat] || []).map((message, idx) => {            
                    return (
                    <div key={idx}>
                      <ChatComponent key={message.messageId} messageId={message.messageId}
                        message={message.message} date={message.date} sender={message.sender} currentUser={email}
                        initialReactions={message.reactions} chatId={currentChat} socket={socketRef.current}/>
                    </div>)
                  })}
              </div>
              </div>
              <div className="message-input">
                <Textarea type="text" value={newMessage} onChange={(change) => setNewMessage(change.target.value)} 
                  placeholder="Enter in a message" />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

