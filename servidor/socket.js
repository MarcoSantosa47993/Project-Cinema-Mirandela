const { Server } = require('socket.io');

const io = new Server({
  cors: {
    origin: "http://localhost:3000",  // Permite a conexão do localhost na porta 3000
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

module.exports = io;