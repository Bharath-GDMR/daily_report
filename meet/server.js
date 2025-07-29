const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store active rooms and users
const rooms = new Map();
const users = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

app.post('/create-room', (req, res) => {
  const roomId = uuidv4();
  rooms.set(roomId, {
    id: roomId,
    users: [],
    createdAt: new Date()
  });
  res.json({ roomId });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userName }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        createdAt: new Date()
      });
    }

    const room = rooms.get(roomId);
    const user = {
      id: socket.id,
      name: userName || `User ${room.users.length + 1}`,
      joined: new Date()
    };

    users.set(socket.id, { ...user, roomId });
    room.users.push(user);
    
    socket.join(roomId);
    
    // Notify user of successful join
    socket.emit('joined-room', { roomId, userId: socket.id, users: room.users });
    
    // Notify other users in room
    socket.to(roomId).emit('user-joined', user);
    
    console.log(`User ${userName} joined room ${roomId}`);
  });

  // Handle WebRTC signaling
  socket.on('offer', ({ offer, targetUserId }) => {
    socket.to(targetUserId).emit('offer', {
      offer,
      senderUserId: socket.id
    });
  });

  socket.on('answer', ({ answer, targetUserId }) => {
    socket.to(targetUserId).emit('answer', {
      answer,
      senderUserId: socket.id
    });
  });

  socket.on('ice-candidate', ({ candidate, targetUserId }) => {
    socket.to(targetUserId).emit('ice-candidate', {
      candidate,
      senderUserId: socket.id
    });
  });

  // Handle media controls
  socket.on('toggle-audio', ({ isAudioEnabled }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-audio-toggle', {
        userId: socket.id,
        isAudioEnabled
      });
    }
  });

  socket.on('toggle-video', ({ isVideoEnabled }) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-video-toggle', {
        userId: socket.id,
        isVideoEnabled
      });
    }
  });

  // Handle chat messages
  socket.on('chat-message', ({ message }) => {
    const user = users.get(socket.id);
    if (user) {
      const chatMessage = {
        id: uuidv4(),
        userId: socket.id,
        userName: user.name,
        message,
        timestamp: new Date()
      };
      
      io.to(user.roomId).emit('chat-message', chatMessage);
    }
  });

  // Handle screen sharing
  socket.on('start-screen-share', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-screen-share', {
        userId: socket.id,
        isSharing: true
      });
    }
  });

  socket.on('stop-screen-share', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user-screen-share', {
        userId: socket.id,
        isSharing: false
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const room = rooms.get(user.roomId);
      if (room) {
        room.users = room.users.filter(u => u.id !== socket.id);
        socket.to(user.roomId).emit('user-left', { userId: socket.id });
        
        // Remove empty rooms
        if (room.users.length === 0) {
          rooms.delete(user.roomId);
        }
      }
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});