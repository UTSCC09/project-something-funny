'use client';
import { useState, useEffect, useRef } from "react";
import Cookie from 'js-cookie';
import { Button } from '@/components/ui/button';
import io from 'socket.io-client';
import styles from "styles/messages.module.css"
import MessageComponent from "./components/MessageComponent.js"
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuContent } from '../../components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'; 

export default function Messages() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentCourse, setCurrentCourse] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false); 
  const [index, setIndex] = useState(0);
  const email = Cookie.get('userEmail');
  const chatBoxRef = useRef(null);
  const socketRef = useRef(null);

  
  useEffect(() => {
    socketRef.current = io('http://localhost:5000'); 
    async function getEnrolledCourses() {
      try {
        const response = await fetch(`/api/getEnrolledCourses?email=${email}`, {
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
        const {course, message, sender, date, messageId} = messageData;
        return {...prevMessages, [course]: [...(prevMessages[course] || []), {sender, message, date, messageId}]};
      });
    });

    socketRef.current.on('receiveEditedMessage', (messageData) => {
      setMessages(prevMessages => {
        const {course, message, sender, date, messageId} = messageData;
        return {...prevMessages, [course]: prevMessages[course].map((m) => {
            if (m.messageId === messageId)
              return {...m, message: message};
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
    setIndex(0);
    socketRef.current.emit('joinCourse', course);
    const response = await fetch(`/api/getMessages?course=${course}&index=${index}`);
    if (response.ok) {
      const data = await response.json();
      setIndex(index+1);
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
      <h1 className="text-3xl mb-5">Messages</h1>
      <div className="space-y-8">
      <DropdownMenu>
        <DropdownMenuTrigger>{'Course Group Chats'}</DropdownMenuTrigger>
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
                        initialReactions={message.reactions} course={currentCourse}/>
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
