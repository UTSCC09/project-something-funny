'use client';
import { useState, useEffect, useRef } from "react";
import Cookie from 'js-cookie';
import { Button } from '@/components/ui/button';
import io from 'socket.io-client';

export default function Messages() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [messages, setMessages] = useState({});
  const [currentCourse, setCurrentCourse] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const email = Cookie.get('userEmail');
  
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
    
    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prevMessages) => {
        const {course, message, sender} = message;
        return {
          ...prevMessages, [course]: [...(prevMessages[course] || []), {sender, message}],
        };
      });
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [email]);

  const joinCourse = (course) => {
    setCurrentCourse(course);
    socketRef.current.emit('joinCourse', course);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socketRef.current.emit('sendMessage', {
        course: currentCourse,
        message: newMessage,
        sender: email,
      });
      setNewMessage('');
    }
  };

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
              <div>
                {(messages[currentCourse] || []).map((msg, idx) => (
                  <div key={idx} className="message">
                    <p>{msg.sender}</p>: {msg.message}
                  </div>
                ))}
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
