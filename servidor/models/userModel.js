//This code defines a Mongoose schema for the "users" collection in a MongoDB database. 
//It specifies the structure of documents that will be stored in the "users" collection.
const mongoose = require('mongoose'); // Importing Mongoose library for MongoDB interaction

// Defining the schema for the "users" collection
const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true // Name of the user, required
    },
    email: {
        type: String,
        required: true, // Email address of the user, required
        unique: true // Email address must be unique
    },
    password: {
        type: String,
        required: true // Password of the user, required
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false // Indicates whether the user is an administrator, default is false
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false // Indicates whether the user's email is verified, default is false
    },
    isFunc: {
        type: Boolean,
        required: true,
        default: false // Indicates whether the user is a functionary, default is false
    }
}, {
    timestamps: true // Automatic timestamps for creation and modification
});

// Exporting the Mongoose model for the "users" collection
module.exports = mongoose.model("users", userSchema);