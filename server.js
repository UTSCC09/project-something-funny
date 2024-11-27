const Redis = require('ioredis');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);

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
  console.log('New user is now connected');

  socket.on('joinCourse', (course) => {
    socket.join(course);
    console.log(`A new user has joined the chat for ${course}`);
  });

  socket.on('sendMessage', async ({course, message, sender}) => {
    const date = new Date().toISOString();
    const dbData = {message, sender, date};
    const data = JSON.stringify(dbData);
    const db = `courses:${course}:messages`;
    await redis.sadd(db, data);
    io.emit('receiveMessage', {course, ...data});
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(5000, () => {
  console.log('Backend is running on port 5000');
});
