'use client';
import { useState, useEffect, useRef } from "react";
import { Button } from '@/components/ui/button';
import io from 'socket.io-client';
import styles from "styles/messages.module.css"
import MessageComponent from "./components/MessageComponent.js"
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuContent } from '../../components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'; 
import useAuthStore from '../../hooks/useAuthStore'
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function Messages() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentCourse, setCurrentCourse] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false); 
  const [index, setIndex] = useState(0);
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);
  const router = useRouter();
  
  const user = useAuthStore((state) => state.user);
  const email = user.email;
  const uid = user.uid;
  
  useEffect(() => {
    socketRef.current = io('http://localhost:5000'); 
    async function getEnrolledCourses() {
      try {
        const response = await fetch(`/api/getEnrolledCourses?uid=${uid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok)
          setEnrolledCourses(data.enrolledCourses);
        else
          setEnrolledCourses([]);
      } 
      catch (error) {
        setEnrolledCourses([]);
      }
    }
    getEnrolledCourses();
    
    socketRef.current.on('receiveMessage', (messageData) => {
      setMessages((prevMessages) => {
        const {course, message, sender, date, messageId, originalMessage, 
               originalSender, replied, originalMessageId} = messageData;
        return {...prevMessages, [course]: [...(prevMessages[course] || []), {sender, message, date, messageId,
                                              originalMessageId, originalMessage, originalSender, replied}]};
      });
    });

    socketRef.current.on('receiveEditedMessage', (messageData) => {
      setMessages(prevMessages => {
        const {course, message, sender, date, messageId, replied, editStatus} = messageData;
        return {...prevMessages, [course]: prevMessages[course].map((m) => {
            if (m.messageId === messageId)
              return {...m, message: message, editStatus: editStatus};
            else
              return m;
          }),
        };
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [email]);

  const joinCourse = async (course) => {
    setCurrentCourse(course);
    socketRef.current.emit('joinCourse', course);
    const response = await fetch(`/api/getMessages?course=${course}&index=0`);
    if (response.ok) {
      const data = await response.json();
      setIndex(1);
      setMessages((pastMessages) => ({...pastMessages, [course]: data.messages}));
    }
  };


  const loadMessages = async (course) => {
    if (loading) 
      return;
    setLoading(true);
    try {
      const response = await fetch(`/api/getMessages?course=${course}&index=${index}`);
      if (response.ok) {
        const data = await response.json();
        setIndex(index+1);
        setMessages((pastMessages) => ({...pastMessages, [course]: [...data.messages, ...(pastMessages[course] || [])]}));
      }
    } 
    catch (err) {
        console.error(err);
    } 
    finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (newMessage) {
        socketRef.current.emit('sendMessage', {course: currentCourse, message: newMessage, sender: email});
        setNewMessage('');
      }
    };
    
  // chat scroll feature
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) 
      return;
    const handleScroll = () => {
      const scrollTop = chatBox.scrollTop;
      const maxScrollTop = chatBox.scrollHeight - chatBox.clientHeight;
      if (!loading && (scrollTop) + maxScrollTop <= 1 &&  (scrollTop) + maxScrollTop >= -1) {
        loadMessages(currentCourse);
      }
    };
    chatBox.addEventListener("scroll", handleScroll);
    return () => {
      chatBox.removeEventListener("scroll", handleScroll);
    };
  }, [loading, messages]);

  return (
    <div>
      <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
        Main Menu
      </Button>
      <Navbar/>
      <h1 className="text-3xl m-5">Messages</h1>
      <div className="space-y-8 border-2 rounded-md w-fit m-5">
      <DropdownMenu>
        <DropdownMenuTrigger><p className="m-2">{'Select a Course Group Chat'}</p></DropdownMenuTrigger>
        <DropdownMenuContent>
          {enrolledCourses.map((course, idx) => (
            <div key={idx}>
            <DropdownMenuLabel>
              <Button key={idx} onClick={() => joinCourse(course)}> {course} </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
      <div >
        
        {currentCourse && (
          <div>
            <h2 className="mt-5">{currentCourse} Groupchat</h2>
            <div className="space-y-4">
              <div className={styles.chat_container} ref={chatBoxRef}>
                <div> 
                {(messages[currentCourse] || []).map((message, idx) => {            
                  return (
                  <div key={idx}>
                    <MessageComponent key={message.messageId} messageId={message.messageId}
                        message={message.message} date={message.date} sender={message.sender} currentUser={email}
                        initialReactions={message.reactions} course={currentCourse} replied={message.replied}
                        originalMessage={message.originalMessage} originalSender={message.originalSender}
                        socket={socketRef.current} editStatus={message.editStatus}
                        originalMessageId = {message.originalMessageId}/>
                    </div>
                  )
                })}
                </div>
              </div>
              <div className="message-input">
                <Textarea 
                  type="text" value={newMessage} 
                  onChange={(change) => setNewMessage(change.target.value)} 
                  placeholder="Enter in a message" />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

