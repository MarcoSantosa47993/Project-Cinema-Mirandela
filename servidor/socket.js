const { Server } = require('socket.io'); // Import the Server class from socket.io

// Create a new instance of Server with specific configuration
const io = new Server({
  cors: {
    origin: ["https://cinema-mirandela2.onrender.com"], // Allow connection only from these origins
    methods: ["GET", "POST"], // Allow specific HTTP methods
    allowedHeaders: ["my-custom-header"], // Allow specific custom headers
    credentials: true // Allow credentials to be sent with requests
  }
});

module.exports = io; // Export the configured socket.io instance