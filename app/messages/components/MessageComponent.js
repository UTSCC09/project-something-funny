import {useState, useEffect, useRef} from 'react';
import Picker from 'emoji-picker-react';
import styles from "styles/messages.module.css"
import { Card } from '@/components/ui/card'; 
import { Textarea } from '@/components/ui/textarea'; 
import Dateformatter from './DateFormatter.js'
import io from 'socket.io-client';

const MessageComponent = ({messageId, course, message, date, sender, initialReactions, currentUser, originalMessage,
  originalSender, originalMessageId, replied, socket, editStatus}) => {

  // used for reactions
  const [displayEmojis, setDisplayEmojis] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(null);
  const [reactions, setReactions] = useState(initialReactions || []);
  // used for message editing
  const [editing, setEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);
  // used for message reply
  const [replying, setReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    socket.on('updatedReactions', (data) => {
      if (data.messageId === messageId && data.course === course)
        setReactions(data.reactions);
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
        setReactions(null);
      }
    };
    fetchReactions();
  }, [course]);

  const handleEmojiClick = async (event) => {
    const emoji = event.emoji;
    setCurrentEmoji(emoji);
    socket.emit('reactedToMessage', { course, messageId, emoji });
  };

  const handleReply = async (sender, message, currentUser, replyMessage, originalMessageId) => {
    let trimOldMessage = message.length > 100 ? message.substring(0, 100) : message;
    socket.emit('replyMessage', {course: course, message: replyMessage, sender: currentUser,
      date: date, originalMessage: trimOldMessage, originalSender: sender, originalMessageId: originalMessageId});
    setReplyMessage('');
    setReplying(false);
  };

  const handleEdit = async () => {
    socket.emit('editMessage', {course: course, message:editedMessage, sender:currentUser,
    messageId: messageId, date:date});
    setEditing(false);
  };

  const scrollToOriginalMessage = (messageId) => {
    const elem = document.getElementById(messageId);
    if (elem)
      elem.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <div className={sender === currentUser ? 'flex justify-end' : 'flex justify-start'}>
    <Card id={messageId} 
      className={sender === currentUser ? 'mb-6 mx-5 p-4 inline-block bg-sky-200' : 'mb-6 mx-5 p-4 inline-block'}>
      <p className="font-semibold mb-2">{sender}</p> <p className="text-xs">{Dateformatter(date)}</p>
      {editing ?(
          <div>
            <Textarea value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)}/>
            <button onClick={handleEdit}>Save</button>
          </div>
        ): 
        (<div>
        {replied && <p className="text-xs">Replied to: {originalSender}</p>}
        <p className="text-lg">{message}</p>
        {replied && <p className="text-xs">
          <button onClick={() => scrollToOriginalMessage(originalMessageId)}>
            Original Message: {originalMessage}
          </button> </p>}
        {editStatus && <p className="text-xs text-gray-500">(Edited)</p>}</div>)} 
      <div>
        {currentUser === sender && !editing && (
          <button className="text-sm mr-1" onClick={() => setEditing(true)}>Edit</button>
        )}
        <button className="font-semibold text-sm mx-1" onClick={() => setDisplayEmojis(!displayEmojis)}>React</button>
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
          <button className="text-sm mx-1" onClick={()=>setReplying(!replying)}>Reply</button>
          {replying && (
            <div>
              <Textarea onChange={(e)=>setReplyMessage(e.target.value)}
                value={replyMessage} placeholder="Enter in your reply"/>
              <button onClick={()=>handleReply(sender, message, currentUser, replyMessage, messageId)}>
                Submit Reply
              </button>
            </div>
          )}
      </div>
    </Card>
    </div>
    );
  };

export default MessageComponent;
