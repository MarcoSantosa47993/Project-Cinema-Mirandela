const mongoose = require('mongoose')

const DistribuidoraSchema = new mongoose.Schema({
      nome:{
        type: String,
        require:true
      }
    
}, {timestamps: true})


module.exports = mongoose.model("distribuidora", DistribuidoraSchema) 