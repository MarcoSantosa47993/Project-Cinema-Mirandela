const mongoose = require('mongoose')


const movieSchema = new mongoose.Schema({

    titulo: {
        type: String,
        required: true,
    },
    realizador: {
        type: String,
        required: false,
    },
    elenco: {
        type: String,
        required: false,
    },
    descricao: {
        type: String,
        required: false
    },
    duracao: {
        type: Number,
        required: false,
    },
    data: {
        type: Date,
        required: false,
    },
    genero: {
        type: String,
        required: false,
    },
    distribuidora: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'distribuidora',
        require: true
    },
    idioma: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'idioma',
        require: true
    },
    idade: {
        type: String,
        required: false,
    },
    avaliacao: {
       type: String,
       require: false
    },
    poster: {
        type: String,
        required: false,
    },
    trailer: {
        type: String,
        require: false,
    },
    estado: {
       type:String,
       default: "Criado",
       
    }


},
    { timestamps: true }
);

module.exports = mongoose.model("movies", movieSchema);