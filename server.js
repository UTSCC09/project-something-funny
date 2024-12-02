const Redis = require('ioredis');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const {v4: uuidv4} = require('uuid');

const allSockets = {};

// external ip address
const external_ip = 'http://34.0.41.88';
function getSocketOfSendTo(userId) {
  return allSockets[userId];
}

const redis = new Redis({
  host: 'localhost', 
  port: 6379, 
});

const io = socketIo(server, {
    cors: {
      origin: ['http://localhost:3000', external_ip + ':5000'],
      methods: ['GET', 'POST'], 
    }
  });

app.use(cors({
    origin: ['http://localhost:3000', external_ip + ':5000'], 
    allowedHeaders: ['Content-Type'],
    methods: ['GET', 'POST'],
  }));

  
io.on('connection', (socket) => {

  socket.on('joinCourse', (course) => {
    socket.join(course);
    console.log(`A new user has joined the chat for ${course}`);
  });

  socket.on('joinChat', (chatId, uid) => {
    allSockets[uid] = socket.id;
    socket.join(chatId);
  });

  // private messaging
  socket.on('sendPrivateMessage', async ({chatId, message, sender, sendTo}) => {
    if (!chatId || !message || !sender)
      return socket.emit('status', {status: 400, message: 'Must include all fields'});
    const messageId = uuidv4(); 
    const date = new Date().toISOString();
    const dbData = {messageId, message, sender, date};;
    const db = `privateMessages:${chatId}:messages`;
    await redis.hset(db, messageId, JSON.stringify(dbData));
    socket.emit('receivePrivateMessage', {chatId, ...dbData});
    const sendToSocket = getSocketOfSendTo(sendTo);
    if (sendToSocket)
      socket.to(sendToSocket).emit('receivePrivateMessage', {chatId, ...dbData});
    else
      console.log('Cannot find user to send message to');

    let count = await redis.hget(`notifications:${sendTo}`, `sender:${sender}`);
    count = count ? JSON.parse(count).count : 0;
    count += 1;

    const notification = {sender, count};
    await redis.hset(`notifications:${sendTo}`, `sender:${sender}`, JSON.stringify(notification));
    socket.to(sendToSocket).emit('new_notification', notification); 
  });

  socket.on('reactedToPrivateMessage', async (data) => {
    const {chatId, messageId, emoji} = data;
    if (!chatId || !messageId || !emoji) 
      return socket.emit('status', {status: 400, message: 'Must include all fields'});
    const db = `privateMessages:${chatId}:messages:${messageId}:reactions`;
    await redis.hincrby(db, emoji, 1);
    const reactions = await redis.hgetall(`privateMessages:${chatId}:messages:${messageId}:reactions`);
    io.emit('updatedPrivateReactions', {messageId, chatId, reactions});
  });

  // group messaging 
  socket.on('sendMessage', async ({course, message, sender}) => {
    if (!course || !message || !sender)
      return socket.emit('status', {status: 400, message: 'Must include all fields'});
    const messageId = uuidv4(); 
    const date = new Date().toISOString();
    const dbData = {messageId, message, sender, date};;
    const db = `courses:${course}:messages`;
    await redis.hset(db, messageId, JSON.stringify(dbData));
    io.emit('receiveMessage', {course, ...dbData});
  });

  socket.on('replyMessage', async ({course, message, sender, originalMessage, originalSender, originalMessageId}) => {
    if (!course || !message || !sender || !originalMessage || !originalSender || !originalMessageId)
      return socket.emit('status', {status: 400, message: 'Must include all fields'});
    if (message.trim() === "")
      return socket.emit('status', {status: 400, message: 'Message cannot be blank'});
    const messageId = uuidv4(); 
    const date = new Date().toISOString();
    const replied = true;
    const dbData = {messageId, message, sender, date, originalMessage, originalSender, originalMessageId, replied};
    const db = `courses:${course}:messages`;
    await redis.hset(db, messageId, JSON.stringify(dbData));
    io.emit('receiveMessage', {course, ...dbData});
  });

  socket.on('editMessage', async ({course, message, sender, messageId, date}) => {
    if (!course || !message || !sender || !messageId || !date)
      return socket.emit('status', {status: 400, message: 'Must include all fields'});
    const editStatus = true;
    const dbData = {messageId, message, sender, date, editStatus};
    const db = `courses:${course}:messages`;
    await redis.hset(db, messageId, JSON.stringify(dbData));
    io.emit('receiveEditedMessage', {course, ...dbData});
  });

  socket.on('reactedToMessage', async (data) => {
    const {course, messageId, emoji} = data;
    if (!course || !messageId || !emoji) 
      return socket.emit('status', {status: 400, message: 'Must include all fields'});
    const db = `courses:${course}:messages:${messageId}:reactions`;
    await redis.hincrby(db, emoji, 1);
    const reactions = await redis.hgetall(`courses:${course}:messages:${messageId}:reactions`);
    io.emit('updatedReactions', {messageId, course, reactions});
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(5000, '0.0.0.0', () => {
  console.log('Backend is running on port 5000');
});
