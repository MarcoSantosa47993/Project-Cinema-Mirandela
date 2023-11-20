const { Server } = require('socket.io');

const io = new Server({
  cors: {
    origin: ["http://3.75.158.163", "http://3.125.183.140", "http://35.157.117.28"],  // Permite a conexão apenas destes IPs
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

module.exports = io;