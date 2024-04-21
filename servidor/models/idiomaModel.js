//This code defines a Mongoose schema for the "idioma" (language) collection in a 
//MongoDB database. It specifies the structure of documents that will be stored in the "idioma" collection.
const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "idioma" collection
const IdiomaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true // Name of the language, required
    }
}, { timestamps: true }); // Automatic timestamps for creation and modification

// Exporting the Mongoose model for the "idioma" collection
module.exports = mongoose.model("idioma", IdiomaSchema);