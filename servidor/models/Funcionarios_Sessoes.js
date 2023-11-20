const mongoose = require('mongoose')

const funcionarios_sessoesSchema = new mongoose.Schema({
    sessao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'sessoes',
        required: true,
    },
    funcionario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    }

}, { timestamps: true })

const Funcionarios_sessoes = mongoose.model('funcionarios_sessoes', funcionarios_sessoesSchema)

module.exports = Funcionarios_sessoes