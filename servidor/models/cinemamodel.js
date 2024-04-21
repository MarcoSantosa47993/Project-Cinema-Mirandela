const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "cinemas" collection
const cinemaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true, // Name of the cinema, required
    },
    morada: {
        type: String,
        required: true, // Address of the cinema, required
    },
    telefone: {
        type: Number,
        required: true // Phone number of the cinema, required
    },
    email: {
        type: String,
        required: false, // Email address of the cinema, not required
    },
    estado: {
        type: String,
        required: true,
        default: "Criado", // State of the cinema, default value is "Criado" (Created)
    }
}, { timestamps: true }); // Automatic timestamps for creation and modification

// Exporting the Mongoose model for the "cinemas" collection
module.exports = mongoose.model("cinemas", cinemaSchema);
