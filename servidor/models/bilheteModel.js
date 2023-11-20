const mongoose = require('mongoose')

const bilheteSchema = new mongoose.Schema({

    sessao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sessoes'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    lugares: {
        type: Array,
        required: true,
    },
    pagamentoId: {
        type: String,
        required: false,
    },
    estado: {
        type: String,
        required: true,
        default: "Comprado"
    },
    dataHoraValidacao: {
        type: Date, // Armazene a data e a hora da validação
        required:false
    },

}, {timestamps: true})


module.exports = mongoose.model("bilhetes", bilheteSchema) 