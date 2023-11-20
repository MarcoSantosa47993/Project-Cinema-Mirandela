const mongoose = require('mongoose')

const IdiomaSchema = new mongoose.Schema({
      nome:{
        type: String,
        require:true
      }
    
}, {timestamps: true})


module.exports = mongoose.model("idioma", IdiomaSchema) 