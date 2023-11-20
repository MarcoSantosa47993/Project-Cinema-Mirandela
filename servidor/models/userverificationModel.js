const mongoose = require('mongoose')


const userverificationSchema = new mongoose.Schema({
    userId: String,
    uniqueString: String,
    createdAt: Date,
    expiresAt:Date,
}
);



module.exports = mongoose.model("UserVerification",userverificationSchema)