const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const SECRET_KEY = "c5e2bf6c88a6e93b369880f1bca2d937a0b32aa5d5ed30eb9dea1df56b4a2e43";

function decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Uso da função decrypt
const decryptedMongoUrl = decrypt(process.env.mongo_url);
mongoose.connect(decryptedMongoUrl)
const connection = mongoose.connection;

connection.on('connected', () => {
    console.log('Mongo DB connection established')
})

connection.on('error', (err) => {
    console.log('Mongo DB connection failed', err)
})