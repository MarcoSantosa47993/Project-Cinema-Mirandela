const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
    nome: {
        type:String,
        required: true,
    },
    morada: {
        type: String,
        require: true,
    },
    telefone: {
        type: Number,
        require: true
    },
    email: {
        type: String,
        require: false,
    },
    estado: {
        type: String,
        required: true,
        default: "Criado",
    }
},
 {timestamps: true}
)

module.exports = mongoose.model("cinemas",cinemaSchema)