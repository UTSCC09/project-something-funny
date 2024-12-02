import {useState, useEffect, useRef} from 'react';
import Picker from 'emoji-picker-react';
import styles from "styles/messages.module.css"
import { Card } from '@/components/ui/card'; 
import { Textarea } from '@/components/ui/textarea'; 

const ChatComponent = ({messageId, chatId, message, date, sender, initialReactions, currentUser, socket}) => {

  // used for reactions
  const [displayEmojis, setDisplayEmojis] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState(null);
  const [reactions, setReactions] = useState(initialReactions || []);
 
  const dateFormatter = (str) => {
    if (str === undefined)
      return;
    const date = new Date(str);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    return (`${year}-${month}-${day}:${hour}:${min}`);
  }

  useEffect(() => {
    socket.on('updatedPrivateReactions', (data) => {
      if (data.messageId === messageId && data.chatId === chatId)
        setReactions(data.reactions);
    });
  });

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/submitPrivateReaction?messageId=${messageId}&chatId=${chatId}`);
        const data = await response.json();
        if (response.ok)
          setReactions(data.reactions);
      } 
      catch (error) {
        setReactions([]);
      }
    };
    fetchReactions();
  }, [chatId]);

  const handleEmojiClick = async (event) => {
    const emoji = event.emoji;
    setCurrentEmoji(emoji);
    socket.emit('reactedToPrivateMessage', { chatId, messageId, emoji });
  };

  return (
    <div className={sender === currentUser ? 'flex justify-end' : 'flex justify-start'}>
    <Card id={messageId} 
      className={sender === currentUser ? 'mb-6 mx-5 p-4 inline-block bg-sky-200' : 'mb-6 mx-5 p-4 inline-block'}>
      <p className="text-xs">{dateFormatter(date)}</p>
      <div>
        <p className="text-lg">{message}</p>
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
      </div>
    </Card>
    </div>
    );
  };

export default ChatComponent;
