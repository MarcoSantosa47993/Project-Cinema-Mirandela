//This code defines a Mongoose schema for the "sessoes" (sessions) collection in a 
//MongoDB database. It specifies the structure of documents that will be stored in the "sessoes" collection.

const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "sessoes" collection
const sessaoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true // Name or title of the session, required
    },
    data: {
        type: Date,
        required: true // Date of the session, required
    },
    hora: {
        type: String,
        required: true // Time of the session, required
    },
    filme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'movies', // Reference to the "movies" collection
        required: true // Required field
    },
    precobilhete: {
        type: Number,
        required: true // Price of each ticket for the session, required
    },
    totallugares: {
        type: Number,
        default: 440, // Total number of seats available for the session, default value is 440
        required: true // Required field
    },
    cinema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cinemas', // Reference to the "cinemas" collection
        required: true // Required field
    },
    estado: {
        type: String,
        required: true,
        default: "Criada" // State of the session, default value is "Criada" (Created)
    }
}, { timestamps: true }); // Automatic timestamps for creation and modification

// Creating the Mongoose model for the "sessoes" collection
const Sessao = mongoose.model('sessoes', sessaoSchema);

module.exports = Sessao; // Exporting the model