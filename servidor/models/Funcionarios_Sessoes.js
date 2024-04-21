//This code defines a Mongoose schema for the "funcionarios_sessoes" (employee_sessions) collection in a MongoDB database. 
//It specifies the structure of documents that will be stored in the "funcionarios_sessoes" collection.

const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "funcionarios_sessoes" collection
const funcionarios_sessoesSchema = new mongoose.Schema({
    sessao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sessoes', // Reference to the "sessoes" collection
        required: true // Required field
    },
    funcionario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Reference to the "user" collection
        required: true // required field
    }
}, { timestamps: true }); // Automatic timestamps for creation and modification

// Creating the Mongoose model for the "funcionarios_sessoes" collection
const Funcionarios_sessoes = mongoose.model('funcionarios_sessoes', funcionarios_sessoesSchema);

module.exports = Funcionarios_sessoes; // Exporting the model