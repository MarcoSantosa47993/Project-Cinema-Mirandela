const mongoose = require('mongoose')

const resetTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: {
          expires: 60,
        }


    }
},
        { timestamps: true }
    );


module.exports = mongoose.model("resettoken", resetTokenSchema) 