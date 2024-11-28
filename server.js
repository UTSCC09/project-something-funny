const Redis = require('ioredis');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const {v4: uuidv4} = require('uuid');

const redis = new Redis({
  host: 'localhost', 
  port: 6379, 
});

const io = socketIo(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'], 
    }
  });

app.use(cors({
    origin: 'http://localhost:3000', 
    allowedHeaders: ['Content-Type'],
    methods: ['GET', 'POST'],
  }));

  
io.on('connection', (socket) => {

  socket.on('joinCourse', (course) => {
    socket.join(course);
    console.log(`A new user has joined the chat for ${course}`);
  });

  socket.on('sendMessage', async ({course, message, sender}) => {
    const messageId = uuidv4(); 
    const date = new Date().toISOString();
    const dbData = {messageId, message, sender, date};;
    const db = `courses:${course}:messages`;
    await redis.hset(db, messageId, JSON.stringify(dbData));
    io.emit('receiveMessage', {course, ...dbData});
  });

  socket.on('editMessage', async ({course, message, sender, messageId, date}) => {
    const dbData = {messageId, message, sender, date};
    const db = `courses:${course}:messages`;
    await redis.hset(db, messageId, JSON.stringify(dbData));
    io.emit('receiveEditedMessage', {course, ...dbData});
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(5000, () => {
  console.log('Backend is running on port 5000');
});
