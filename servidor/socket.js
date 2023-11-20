const { Server } = require('socket.io');

const io = new Server({
  cors: {
    origin: ["https://3.75.158.163", "https://3.125.183.140", "https://35.157.117.28"],  // Permite a conexão apenas destes IPs
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

module.exports = io;