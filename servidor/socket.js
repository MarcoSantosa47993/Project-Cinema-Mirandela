const { Server } = require('socket.io');

const io = new Server({
  cors: {
    origin: ["https://cinema-mirandela2.onrender.com"],  // Permite a conexão apenas destes IPs
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

module.exports = io;