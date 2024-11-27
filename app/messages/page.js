'use client';
import { useState, useEffect, useRef } from "react";
import Cookie from 'js-cookie';
import { Button } from '@/components/ui/button';
import io from 'socket.io-client';
import styles from "styles/messages.module.css"

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
        const {course, message, sender, time} = messageData;
        return {...prevMessages, [course]: [...(prevMessages[course] || []), {sender, message, time}]};
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [email]);

  const joinCourse = async (course) => {
    setCurrentCourse(course);
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
    const countMessages = messages[course].length;
    try {
      const response = await fetch(`/api/getMessages?course=${course}&index=${index}`);
      if (response.ok) {
        const data = await response.json();
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

  const dateFormatter = (str) => {
    const date = new Date(str);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}:${h}:${min}`;
  }
    
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
      <h1>Messages</h1>
      <div className="space-y-8">
        <div>
          {enrolledCourses.map((course, idx) => (
            <Button key={idx} variant="primary" onClick={() => joinCourse(course)}> {course} </Button>
          ))}
        </div>
        
        {currentCourse && (
          <div>
            <h2>{currentCourse} Groupchat</h2>
            <div className="space-y-4">
              <div className={styles.chat_container} ref={chatBoxRef}>
                <div> 
                {(messages[currentCourse] || []).map((message, idx) => {
                  return (
                  <div key={idx}>
                    <p>{message.sender} {dateFormatter(message.date)}</p>{message.message}
                  </div>
                  )
                })}
                </div>
              </div>
              <div className="message-input">
                <input 
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
