const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "bilhetes" collection
const bilheteSchema = new mongoose.Schema({
    sessao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sessoes' // Reference to the "sessoes" collection
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users' // Reference to the "users" collection
    },
    lugares: {
        type: Array,
        required: true, // Array of seat numbers or locations, required
    },
    pagamentoId: {
        type: String,
        required: false, // ID of the payment transaction, not required
    },
    estado: {
        type: String,
        required: true,
        default: "Comprado" // State of the ticket, default value is "Comprado" (Purchased)
    },
    dataHoraValidacao: {
        type: Date,
        required: false // Date and time of validation, not required
    },
}, { timestamps: true }); // Automatic timestamps for creation and modification

// Exporting the Mongoose model for the "bilhetes" collection
module.exports = mongoose.model("bilhetes", bilheteSchema);