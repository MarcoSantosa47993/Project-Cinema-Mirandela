// Importing required modules
const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB connection
const CryptoJS = require('crypto-js'); // Importing CryptoJS library for encryption
const SECRET_KEY = "c5e2bf6c88a6e93b369880f1bca2d937a0b32aa5d5ed30eb9dea1df56b4a2e43"; // Predefined secret key for encryption

// Function to decrypt ciphertext using AES encryption
function decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY); // Decrypting ciphertext using AES and the secret key
    return bytes.toString(CryptoJS.enc.Utf8); // Converting decrypted bytes to UTF-8 encoded string
}

// Usage of the decrypt function
const decryptedMongoUrl = decrypt(process.env.mongo_url); // Decrypting MongoDB connection URL from environment variable
mongoose.connect(decryptedMongoUrl); // Connecting to MongoDB using decrypted URL
const connection = mongoose.connection; // Creating MongoDB connection object

// Event listener for MongoDB connection established
connection.on('connected', () => {
    console.log('Mongo DB connection established'); // Logging success message when connection is established
});

// Event listener for MongoDB connection error
connection.on('error', (err) => {
    console.log('Mongo DB connection failed', err); // Logging error message when connection fails
});