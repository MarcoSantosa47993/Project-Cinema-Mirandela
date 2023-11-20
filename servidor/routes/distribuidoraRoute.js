const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware")
Distribuidora = require("../models/distribuidoraModel")

router.post("/add-distribuidora", authMiddleware,async (req, res) => {
    try {
        console.log("Distribuidora -> " + req.body.distribuidora)
        const distr = new Distribuidora({nome : req.body.distribuidora})
        await distr.save();

        
          
        res.send({
            success: true,
            message: "Distribuidora adicionada com Sucesso!"
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
});


router.get("/get-distribuidoras", authMiddleware,async (req, res) => {
    try {
        console.log("Aqui " + req.body)
        const distr = await Distribuidora.find()
        
        res.send({
            success: true,
            data: distr
        })
        
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
});


module.exports = router;