const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const authMiddleware = require('../middlewares/authMiddleware');
const path = require("path")
const crypto = require("crypto")
const CryptoJS = require('crypto-js');
const ResetToken = require ('../models/ResetToken')

const nodemailer = require("nodemailer")

const { v4: uuidv4 } = require("uuid");
const { hasSubscribers } = require('diagnostics_channel');

require("dotenv").config();
const SECRET_KEY = "c5e2bf6c88a6e93b369880f1bca2d937a0b32aa5d5ed30eb9dea1df56b4a2e43";

function decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}
const decryptedUser = decrypt(process.env.USER);

const decryptedPass = decrypt(process.env.PASS);



const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: decryptedUser,
        pass: decryptedPass,
    },

})

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log(success)
    }
})







//registar um novo usuario
router.post('/register', async (req, res) => {
    try {
        //verificar se o usuario já existe ou não
        const userExists = await User.findOne({ email: req.body.email });
        /*if (userExists) {
            return res.send({
                success: false,
                message: "Usuário já existe",
            });
        }*/
        if(userExists )
        {
            return res.send({
                success: false,
                message: "Erro!! Já existe uma conta com este mail. Por favor verifique se já confirmou a conta no seu email",
            });
        }

        //encriptar password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        //criar novo usuario
        const newUser = new User(req.body)
        await newUser.save();
        
        
        var mailOptions = {
            from : ` "Verify your email" <${process.env.USER}>`,
            to: req.body.email,
            subject: 'Cinema Mirandela - verifique o seu Email!',
            html: `<h2>${req.body.nome}-Obrigado por se registar!</h2>
                  <h4>Por favor verifique o seu email para continuar....</h4>
                  <a href="http://localhost:5000/api/users/verificar-email?token=${req.body.email}">Verificar o seu Email</a>
            `
        }

        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error)
            }else{
                console.log("Verification email was send")
            }
        })
        res.send({ success: true, message: "Usuario Criado com Sucesso, Confirme o seu Email" });

    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
});

router.get('/verificar-email',async(req,res) => {

    try{
        const token = req.query.token
        const user = await User.findOne({email : token})
        if(user){
            emailToken = null
            user.isVerified = true
            await user.save()
            res.redirect('/api/users/login')
          
            
        }
        else{
            console.log("error")
        }
    }catch(error){
        console.log(error)
    }
    
})

router.get('/recuperar-password', async (req, res) => {
    try {
      const email = req.query.email; // Retrieve email from query parameters

      
      // Use the retrieved email to query your database or perform any necessary checks
      const user = await User.findOne({ email });
  
      if (user) {
        const token = crypto.randomBytes(20).toString('hex');

 // Salva o token no banco de dados
 const newResetToken = new ResetToken({
    email: email, // Ou email, se você optou por associar pelo email diretamente
    token: token
  });

  await newResetToken.save();


        var mailOptions = {
            from: `"Recuperação da Password"`,
            to: email,
            subject: 'Cinema Mirandela - Redefinir Password',
            html: `<h2>${email}-Recuperação de Senha</h2>
                   <h4>Por favor, siga o link abaixo para redefinir sua senha:</h4>
                   <a href="http://localhost:3000/reset?token=${token}">Redefinir Password</a>`,
          };

        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error)
            }else{
                console.log("Verification email was send")
            }
        })

        return res.send({
          success: true,
        });
        
      } else {
        return res.send({
          success: false,
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send({ success: false, error: error.message });
    }
  });

  router.post('/alterarpassword', async (req, res) => {
    try {
      const { token, password } = req.body;
      console.log(req.body);
  
      // Encontrar o reset token na base de dados
      const resetToken = await ResetToken.findOne({ token });
      console.log(resetToken);
  
      if (!resetToken) {
        return res.status(400).send({ success: false, message: 'Token inválido ou expirado.' });
      }
  
      // Usar o email para encontrar o usuário
      const user = await User.findOne({ email: resetToken.email });
      if (!user) {
        return res.status(400).send({ success: false, message: 'Usuário não encontrado.' });
      }
  
      // Comparar a senha antiga com a nova senha aqui, se necessário
  
      // Encriptar a nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Salvar a nova senha no usuário
      user.password = hashedPassword;
      await user.save();
  
      // Remover o reset token usado para que não possa ser reutilizado
      await ResetToken.deleteOne(resetToken._id)
  
      res.send({ success: true, message: 'Senha alterada com sucesso.' });
    } catch (error) {
      console.log(error);
      res.status(500).send({ success: false, error: error.message });
    }
  });
  router.get('/verify', async (req, res) => {
    const { token } = req.query;
    console.log("Aqui!!")

    try {
        const resetToken = await ResetToken.findOne({ token });

        // If the token is not found or it's expired, findOne will return null
        if (!resetToken) {
            return res.status(404).json({ success: false, message: 'Invalid or expired token.' });
        }

        // Token found and not expired
        return res.json({ success: true, message: 'Token is valid.' });
    } catch (error) {
        console.error("Error in token verification: ", error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

router.get('/login' , (req,res) => {
    res.redirect("http://localhost:3000/Login")
})


//login de um usuario
router.post('/login', async (req, res) => {
    try {
     
        //verificar se o usuario existe
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.send({
                success: false,
                message: "Usuario não existe",
            });
        }
        else if (!user.isVerified) {
            return res.send({
                success: false,
                message: "Usuario não verificado , Verifique o seu Email"
            })
        }

        //verificar se a password está correta
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password,
        );

        if (!validPassword) {
            return res.send({
                success: false,
                message: "Password inválida"
            })
        }

        //Criar um token
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, {
            expiresIn: "1d",
        });

        res.send({ success: true, message: "Usuário autenticado com sucesso", data: token });

    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
});

//receber as informações do usuario atraves do seu ID
router.get('/get-current-user', authMiddleware, async (req, res) => {
    console.log(req.body)
    try {
        const user = await User.findById(req.body.userId).select('-password')
        res.send({
            success: true,
            message: "User details fetched successfully",
            data: user,
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
})


router.post('/get-user', async (req, res) => {
    console.log(req.body.email)
   try {
        const user = await User.findOne({email: req.body.email})
        console.log("User=>" + user)
        if(user != null && user.isAdmin == false && user.isFunc == false)
        {
            res.send({
            success: true,
            message: "User Existe!!",
            data: user,
        });
        }else if(user == null){
            res.send({
                success: false,
                message: "User Não Existe!!",
             
        });
    }else if(user.isAdmin == true){
        res.send({
            success: false,
            message: "Usuário é um Admin",
         
    })
}else if(user.isFunc == true){
    res.send({
        success: false,
        message: "Usuário já é Funcionário",
     
})
} else if(user.isFunc == true){
    res.send({
        success: false,
        message: "Usuário já é um Funcionário",
     
})
}    
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
});


router.post('/user-to-func', async (req, res) => {
   try {
     const user = req.body

     user.usuario.isFunc = true



    
    
    await User.findByIdAndUpdate(user.usuario._id,user.usuario)

    var mailOptions = {
        from: ` "Bem-Vindo à Nossa Equipa!" <${process.env.USER}>`,
        to: user.usuario.email,
        subject: 'Cinema Mirandela - Bem-vindo à nossa equipa!',
        html: `
            <h2>Olá ${user.usuario.nome}!</h2>
            <h3>Parabéns por te tornares um novo funcionário no Cinema Mirandela!</h3>
            <p>Estamos entusiasmados por te ter connosco. Toda a equipa te dá as boas-vindas e deseja-te sucesso nesta nova etapa.</p>
            <p>Melhores cumprimentos,<br>Cinema Mirandela</p>
        `
    }
    
    transporter.sendMail(mailOptions, function(error,info){
        if(error){
            console.log(error);
        } else {
            console.log("Email enviado com sucesso!");
        }
    })
    res.send({
        success: true,
        message: "Usuário Agora é um Funcionário!!"
    }) 
   } catch (error) {
        res.send({
            success: false,
            message: error.message
    })

        
    
}

   
});



router.get("/get-all-func",authMiddleware, async (req, res) => {
    try {
        console.log("aqui")
        const users = await User.find({ isFunc: true }).sort({ createdAt: -1 });
        res.send({
            success: true,
            message: "Funcionários exportados com sucesso!",
            data: users,
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }

})

//criar um objeto cinema
router.post("/create-func", authMiddleware,async (req, res) => {
    try {

      
        const newFunc = new User(req.body)
        newFunc.isFunc = true
        newFunc.isVerified = true

        await newFunc.save();

        var mailOptions = {
            from: ` "Bem-Vindo à Nossa Equipa!" <${process.env.USER}>`,
            to: req.body.email,
            subject: 'Cinema Mirandela - Bem-vindo à nossa equipa!',
            html: `
                <h2>Olá ${req.body.nome}!</h2>
                <h3>Parabéns por te tornares um novo funcionário!</h3>
                <p>Estamos entusiasmados por te ter connosco. Aqui estão os detalhes da tua conta:</p>
                <ul>
                    <li><strong>Nome:</strong> ${req.body.nome}</li>
                    <li><strong>Email:</strong> ${req.body.email}</li>
                    <li><strong>Palavra-passe:</strong> ${req.body.password} (Podes alterar depois)</li>
                </ul>
                <p>Melhores cumprimentos,<br>Cinema Mirandela</p>
            `
        }
        
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            } else {
                console.log("Email enviado com sucesso!");
            }
        })

        
          
        res.send({
            success: true,
            message: "Funcionário adicionado com Sucesso!"
        })
        
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
});

router.post('/func-to-user', async (req, res) => {
    try {
      const user = req.body
 
      user.usuario.isFunc = false
 
 
 
     
     
     await User.findByIdAndUpdate(user.usuario._id,user.usuario)
 
   
     res.send({
         success: true,
         message: "Usuário Agora é um Utilizador Comum!!"
     }) 
    } catch (error) {
         res.send({
             success: false,
             message: error.message
     })
 
         
     
 }
 
    
 });
 

module.exports = router;