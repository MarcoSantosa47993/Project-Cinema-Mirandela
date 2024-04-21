//This code defines a Mongoose schema for the "movies" collection in a MongoDB database. 
//It specifies the structure of documents that will be stored in the "movies" collection.

const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "movies" collection
const movieSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true // Title of the movie, required
    },
    realizador: {
        type: String,
        required: false // Director of the movie, not required
    },
    elenco: {
        type: String,
        required: false // Cast of the movie, not required
    },
    descricao: {
        type: String,
        required: false // Description of the movie, not required
    },
    duracao: {
        type: Number,
        required: false // Duration of the movie (in minutes), not required
    },
    data: {
        type: Date,
        required: false // Release date of the movie, not required
    },
    genero: {
        type: String,
        required: false // Genre of the movie, not required
    },
    distribuidora: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'distribuidora', // Reference to the "distribuidora" collection
        required: true // Required field
    },
    idioma: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'idioma', // Reference to the "idioma" collection
        required: true // Required field
    },
    idade: {
        type: String,
        required: false // Recommended age for the movie, not required
    },
    avaliacao: {
        type: String,
        required: false // Rating or evaluation of the movie, not required
    },
    poster: {
        type: String,
        required: false // URL of the movie poster, not required
    },
    trailer: {
        type: String,
        required: false // URL of the movie trailer, not required
    },
    estado: {
        type: String,
        default: "Criado" // State of the movie, default value is "Criado" (Created)
    }
}, { timestamps: true }); // Automatic timestamps for creation and modification

// Exporting the Mongoose model for the "movies" collection
module.exports = mongoose.model("movies", movieSchema);