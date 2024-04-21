//This code defines a Mongoose schema for the "distribuidora" (distributor) collection in a MongoDB database. It specifies 
//the structure of documents that will be stored in the "distribuidora" collection.

const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "distribuidora" collection
const DistribuidoraSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true // Name of the distributor, required
    }
}, { timestamps: true }); // Automatic timestamps for creation and modification

// Exporting the Mongoose model for the "distribuidora" collection
module.exports = mongoose.model("distribuidora", DistribuidoraSchema);