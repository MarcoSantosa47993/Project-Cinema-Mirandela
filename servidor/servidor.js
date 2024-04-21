const express = require('express'); // Import the Express framework
const { default: mongoose } = require('mongoose'); // Import mongoose to interact with MongoDB
mongoose.set('strictQuery', true); // Set strict query mode for mongoose
const app = express(); // Create an instance of Express application
require('dotenv').config(); // Load environment variables from the .env file
const dbconfig = require("./config/dbconfig"); // Import database configuration
const WebSocket = require('ws'); // Import WebSocket module for real-time communication
const crypto = require('crypto'); // Import crypto module for cryptographic operations
const cors = require('cors'); // Import cors middleware for CORS handling

const CryptoJS = require('crypto-js'); // Import CryptoJS library for encryption
const http = require('http').createServer(app); // Create an HTTP server with the Express app

// Attach socket.io to the HTTP server
const io = require('./socket');

io.attach(http);

// Use cors middleware
app.use(cors());
// Parse JSON requests
app.use(express.json());

// Import routes for different resources
const usersRoute = require('./routes/usersRoute')
const distribuidoraRoute = require('./routes/distribuidoraRoute')
const idiomaRoute = require('./routes/idiomaRoute')
const moviesRoute = require('./routes/moviesRoute')
const cinemasRoute = require('./routes/cinemasRoute')
const bilhetesRoute = require('./routes/bilhetesRoute')

// Define routes for different resources
app.use("/api/users", usersRoute);
app.use("/api/movies",moviesRoute);
app.use("/api/cinemas",cinemasRoute);
app.use("/api/bilhetes",bilhetesRoute);
app.use("/api/distribuidora",distribuidoraRoute);
app.use("/api/idioma",idiomaRoute);

// Configuration for socket.io
io.on('connection', (socket) => {
    console.log('A client connected with ID:', socket.id);

    // When the client disconnects
    socket.on('disconnect', () => {
        console.log('The client with ID', socket.id, 'disconnected');
    });
});

const port = process.env.PORT || 5000; // Define the server port

const path = require("path");
__dirname = path.resolve(); // Define the base directory

// Render deployment for production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/cliente/build"))); // Set static directory for the client build
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "cliente", "build", "index.html")); // Send the main HTML file
  });
}

http.listen(port, () => console.log('Listening on port ' + port)); // Start the server on the specified port