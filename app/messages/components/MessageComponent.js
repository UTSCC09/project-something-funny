import {useState, useEffect, useRef} from 'react';
import Picker from 'emoji-picker-react';
import styles from "styles/messages.module.css"
import { Card } from '@/components/ui/card'; 
import { Textarea } from '@/components/ui/textarea'; 
import io from 'socket.io-client';

const MessageComponent = ({messageId, course, message, date, sender, initialReactions, currentUser}) => {
  const [displayEmojis, setDisplayEmojis] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(null);
  const [reactions, setReactions] = useState(initialReactions || []);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  const [editStatus, setEditStatus] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const socketRef = useRef(null);
    
  useEffect(() => {
    socketRef.current = io('http://localhost:5000'); 
    socketRef.current.on('messageUpdated', (update) => {
      if (update.messageId === messageId) {
        setEditStatus(true);
        setEditedMessage(update.editedMessage);
      }
    });
  });

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/submitReaction?messageId=${messageId}&course=${course}`);
        const data = await response.json();
        if (response.ok)
          setReactions(data.reactions);
      } 
      catch (error) {
        setEmojiReactions(null);
      }
    };

    fetchReactions();
  }, [messageId, course]);

  const handleEmojiClick = async (event) => {
    const emoji = event.emoji;
    setCurrentEmoji(emoji);
    const response = await fetch(`/api/submitReaction`, {
        method: 'POST',
        body: JSON.stringify({messageId, course, emoji}),
        headers: {'Content-Type': 'application/json'},
    });

    if (response.ok) {
      setReactions((r) => {
        const newReactions = { ...r};
        newReactions[emoji] = (newReactions[emoji] || 0) + 1; 
        return newReactions;
      });
      setDisplayEmojis(false);
    }
  };

  const dateFormatter = (str) => {
    if (str === undefined)
      return;
    const date = new Date(str);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}:${h}:${min}`;
  }

  const handleReply = async (sender, message, currentUser, replyMessage) => {
    let trimOldMessage = message.length > 100 ? message.substring(0, 100) : message;
    let newMessage = "Reply to: " + sender + " " + replyMessage + "\n Original content: " + trimOldMessage;
    socketRef.current.emit('sendMessage', {course: course, message: newMessage, sender: currentUser,
      date: date});
    setReplyMessage('');
    setReplying(false);
  };

  const handleEdit = async () => {
    socketRef.current.emit('editMessage', {course: course, message:editedMessage, sender:currentUser,
    messageId: messageId, date:date});
    setEditStatus(true);
    setEditing(false);
  };

  return (
    <div className={sender === currentUser ? 'flex justify-end' : 'flex justify-start'}>
    <Card className={sender === currentUser ? 'mb-6 mx-5 p-4 inline-block bg-sky-200' : 'mb-6 mx-5 p-4 inline-block'}>
      <p className="font-semibold mb-2">{sender}</p> <p className="text-xs">{dateFormatter(date)}</p>
      {editing ?(
          <div>
            <Textarea value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)}/>
            <button onClick={handleEdit}>Save</button>
          </div>
        ): 
        (<div>{message} {editStatus && <p className="text-xs text-gray-500">(Edited)</p>}</div>)} 
        {currentUser === sender && !editing && (
          <button className="text-sm" onClick={() => setEditing(true)}>Edit</button>
        )}
      <div>
        <button className="font-semibold text-sm" onClick={() => setDisplayEmojis(!displayEmojis)}>React</button>
        {displayEmojis && (
          <div className="emoji-picker">
            <Picker reactionsDefaultOpen={true} onEmojiClick={handleEmojiClick} />
          </div>
        )}
        {Object.entries(reactions).map(([emoji, count]) => (
            <div key={emoji} className={styles.emoji_reactions}>
              <p className="text-sm">{emoji}({count}) </p>
            </div>
          ))}
          <button className="text-sm" onClick={()=>setReplying(!replying)}>Reply</button>
          {replying && (
            <div>
              <Textarea onChange={(e)=>setReplyMessage(e.target.value)}
                value={replyMessage} placeholder="Enter in your reply"/>
              <button onClick={()=>handleReply(sender, message, currentUser, replyMessage)}>Submit Reply</button>
            </div>
          )}
      </div>
    </Card>
    </div>
    );
  };

export default MessageComponent;
