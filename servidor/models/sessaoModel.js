const mongoose = require('mongoose')

const sessaoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    data: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true,
    },
    filme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'movies',
        required: true,
    },
    precobilhete: {
        type: Number,
        required: true,
    },
    totallugares: {
        type: Number,
        default: 440,
        required: true,
    },
    cinema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cinemas',
        required: true,
    },
    estado: {
        type: String,
        required: true,
        default: "Criada",
    },

}, { timestamps: true })

const Sessao = mongoose.model('sessoes', sessaoSchema)

module.exports = Sessao