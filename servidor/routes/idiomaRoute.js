const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware")
const Idioma = require("../models/idiomaModel")
router.post("/add-idioma", authMiddleware,async (req, res) => {
    try {
        console.log("Idioma -> " + req.body.idioma)
        const idioma = new Idioma({nome : req.body.idioma})
        await idioma.save();

        
          
        res.send({
            success: true,
            message: "Idioma adicionado com Sucesso!"
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
});

router.get("/get-idiomas", authMiddleware,async (req, res) => {
    try {
        console.log("Aqui " + req.body)
        const idiomas = await Idioma.find()
        
        res.send({
            success: true,
            data: idiomas
        })
        
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
});




module.exports = router;
