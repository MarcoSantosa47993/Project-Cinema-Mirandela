const router = require("express").Router();

const Cinema = require("../models/cinemamodel")
const authMiddleware = require("../middlewares/authMiddleware")
const Sessao = require("../models/sessaoModel")
const Bilhete = require("../models/bilheteModel")
const Funcionarios_Sessoes = require("../models/Funcionarios_Sessoes")
const User = require("../models/userModel")
const CryptoJS = require('crypto-js');

const nodemailer = require("nodemailer")

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


setInterval(async function() {
  try {
 
   
     

     
     //encontrar todas as sessoes de um filme
     const sessoes = await Sessao.find()
         .populate("filme")
         .populate("cinema")
         .sort({ createdAt: -1 })

    

       for(let i = 0; i< sessoes.length ; i++)
       {
        if(sessoes[i].estado === "Criada" ||sessoes[i].estado === "A decorrer" )
        {

     
         const date = new Date(sessoes[i].data)

     

         const dataFormata = Intl.DateTimeFormat('pt-br', {
             dateStyle: 'short'
         })
        
      
 
         var dataString1 = dataFormata.format(date);
         var horaString1 = sessoes[i].hora;
         
       
         
         var partesData1 = dataString1.split("/");
         var partesHora1 = horaString1.split(":");
         
         
         
         var dataHora1 = new Date(
           partesData1[2],
           partesData1[1] - 1,
           partesData1[0],
           partesHora1[0],
           partesHora1[1]
         );
        var dataAtual = new Date()
         var dataHora2 = new Date(
             dataAtual.getFullYear(),
             dataAtual.getMonth(),
             dataAtual.getDate(),
             dataAtual.getHours(),
             dataAtual.getMinutes()
          
         );
         
         // Obter o deslocamento do fuso horário em minutos (considerando Portugal)
         var fusoHorarioMinutos = -(dataHora1.getTimezoneOffset());
         
         // Ajustar a hora considerando o deslocamento do fuso horário
         dataHora1.setMinutes(dataHora1.getMinutes() + fusoHorarioMinutos);
         dataHora2.setMinutes(dataHora2.getMinutes() + fusoHorarioMinutos);
       
         // Calcular a diferença em minutos
         var diferencaMilissegundos = dataHora2 - dataHora1;
         var diferencaMinutos = Math.floor(diferencaMilissegundos / 1000 / 60);

         if(diferencaMinutos >= 10 && sessoes[i].estado === "Criada" )
         {
           sessoes[i].estado = "A decorrer"

           await Sessao.findByIdAndUpdate(sessoes[i]._id,sessoes[i])
         }
         
         
 
 
  if(diferencaMinutos >= (30 + sessoes[i].filme.duracao )&& sessoes[i].estado === "A decorrer")
 {
     
     sessoes[i].estado = "Terminada"

     await Sessao.findByIdAndUpdate(sessoes[i]._id,sessoes[i])
    
     try {
         console.log('Historico salvo com sucesso');
     } catch (error) {
         console.error('Erro ao salvar o histórico:', error);
     }

     // Agora, vamos buscar os emails dos clientes desses bilhetes
try {
 const bilhetesDaSessao = await Bilhete.find({ sessao: sessoes[i]._id }).populate("sessao").populate("user");
     console.log("Bilhetes -> " + bilhetesDaSessao)
 
     if(bilhetesDaSessao.length != 0 )
     {

   
 if(!bilhetesDaSessao[i].user.isFunc && !bilhetesDaSessao[i].user.isAdmin)
 {
     const mailOptions = {
     from: `"Cinema Mirandela" <seuemail@example.com>`,
     to:bilhetesDaSessao[i].user.email,
     subject: 'Agradecimento pela Sessão de Cinema',
     text: `Prezado(a) Cliente,
   
   Gostaríamos de agradecer por ter assistido à sessão do filme "${sessoes[i].filme.titulo}" no Cinema Mirandela. Esperamos que tenha desfrutado da sua experiência conosco.
   
   A sessão do filme foi concluída com sucesso, e estamos ansiosos para recebê-lo novamente em nossas próximas exibições.
   
   Atenciosamente,
   Equipe do Cinema Mirandela`,
   };

   transporter.sendMail(mailOptions, function (error, info) {
     if (error) {
       console.log('Erro ao enviar e-mail de agradecimento:', error);
     } else {
       console.log('E-mail de agradecimento enviado com sucesso para:', bilhete.user.email);
     }
   });
   
 }
 

 bilhetesDaSessao.forEach(async (bilhete) => {
     if (bilhete.estado === "Validado") {
       bilhete.estado = "Terminado";
     } else if (bilhete.estado === "Comprado") {
       bilhete.estado = "Expirado";
     }
   
     try {
       await Bilhete.findByIdAndUpdate(bilhete._id, bilhete);
     } catch (error) {
       console.error('Erro ao salvar o histórico:', error);
     }
   });
 }

} catch (error) {
 console.error('Erro ao buscar os bilhetes:', error);
}

}
 
  
 
  
     
 }

} 
    
       
      


     
 } catch (error) {
     res.send({
         success: false,
         message: error.message
     })
 }
}, 10000);  // 10000 milissegundos = 10 segundos



//criar um objeto cinema
router.post("/add-cinema", authMiddleware,async (req, res) => {
    try {
        const newCinema = new Cinema(req.body)
        await newCinema.save();

        
          
        res.send({
            success: true,
            message: "Cinema adicionado com Sucesso!"
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }
});
//carregar todos os cinemas
router.get("/get-all-cinemas",authMiddleware, async (req, res) => {
    try {
        const cinemas = await Cinema.find().sort({ createdAt: -1 })
        res.send({
            success: true,
            message: "Cinemas exportados com sucesso!",
            data: cinemas,
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }

})
//atualizar cinema

router.post("/update-cinema",authMiddleware, async (req, res) => {
    try {
        await Cinema.findByIdAndUpdate(req.body.cinemaId, req.body)
        res.send({
            success: true,
            message: "Cinema atualizado com sucesso"
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

//eliminar cinema

router.post("/delete-cinema",authMiddleware, async (req, res) => {
    try {
 
        const sessao = await Sessao.findOne({ cinema: req.body.cinemaId }).populate('filme').sort({ createdAt: -1 })
        
        
          if(!sessao)
          {
             await Cinema.findByIdAndDelete(req.body.cinemaId, req.body)
            res.send({
            success: true,
            message: "Cinema eliminado com sucesso"
          })}
          else{
            res.send({
                success: false,
                message: "Existem sessões ativas neste cinema, por favor elimine primeiramente as sessões"
            })
        }
          
         


        
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


//adicionar show
router.post("/add-sessao",authMiddleware, async (req, res) => {
    try {
    
        

        const newSessao = new Sessao({
          nome: req.body.nome,
          data: req.body.data,
          hora: req.body.hora,
          precobilhete: req.body.precobilhete,
          filme: req.body.filme,
          totallugares: req.body.totallugares,
          cinema: req.body.cinema,
          userId: req.body.userId
       })

              // Obtenha todos os funcionários
              const funcionarios = await User.find({ isFunc: true });

              // Para cada funcionário, crie um novo registro em Funcionarios_Sessoes
              for (let funcionario of funcionarios) {
                  const newfuncionario_sessao = new Funcionarios_Sessoes({
                      sessao: newSessao._id,
                      funcionario: funcionario._id
                  });
                  await newfuncionario_sessao.save();
              }
       
       await newSessao.save();
        res.send({
            success: true,
            message: "Sessão criada com sucesso!"
        })
        console.log(req.body)
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


router.post("/get-all-sessoes-by-cinema", authMiddleware, async (req, res) => {
  try {
      
      const sessoes = await Sessao.find({ cinema: req.body.cinemaId }).populate('filme').populate('cinema').sort({ createdAt: -1 });
      
      const sessoesValidas = sessoes.filter((sessao) => sessao.estado === "Criada" || sessao.estado === "A decorrer");

      const bilhetesPorSessao = {};

      for (let sessao of sessoesValidas) {
          bilhetesPorSessao[sessao._id] = await Bilhete.find({ sessao: sessao._id }).populate("user");
      }
      console.log(bilhetesPorSessao)
      res.send({
          success: true,
          message: "Sessões carregadas com sucesso!",
          data: {
              sessoesValidas,
              bilhetesPorSessao
          }
      });
  } catch (error) {
      res.send({
          success: false,
          message: error.message
      });
  }
});
router.post("/get-all-sessoes-by-cinema-func", authMiddleware, async (req, res) => {
  try {
      console.log("Estou aqui||")

      // Encontre todas as entradas em Funcionarios_Sessao para o funcionarioId fornecido e preencha as informações da sessão
      const funcionariosSessao = await Funcionarios_Sessoes.find({ funcionario: req.body.funcionarioId })
          .populate({
              path: 'sessao',
              match: { cinema: req.body.cinemaId }, // Filtrar apenas sessões para o cinema desejado
              populate: ['filme', 'cinema'] // Supondo que você queira preencher informações de 'filme' e 'cinema' também
          });
          console.log("Estou aqui||")
      // Filtrar quaisquer entradas onde a sessão não foi preenchida (porque não estava no cinema desejado)
      const sessoes = funcionariosSessao
          .map(fs => fs.sessao)
          .filter(sessao => !!sessao);

       

          const bilhetes = await Bilhete.find({
            sessao: { $in: sessoes.map(s => s._id) },
            estado: { $in: ["Comprado", "Validado"] }
        }).populate('user').populate('sessao');

      

      res.send({
          success: true,
          message: "Sessões carregadas com sucesso!",
          data: {
            sessoes,
            bilhetes
        }
      });
  } catch (error) {
      res.send({
          success: false,
          message: error.message
      });
  }
});



//conseguir todos os cinemas que têm uma sessão com determinado filme
router.post("/get-all-cinemas-by-movie",authMiddleware, async (req, res) => {
    try {
        
        const {filme} = req.body

        console.log(filme)
        
        //encontrar todas as sessoes de um filme
        const sessoes = await Sessao.find({filme})
            .populate("cinema")
            .sort({ createdAt: -1 })

          for(let i = 0; i< sessoes.length ; i++)
          {
            const date = new Date(sessoes[i].data)

        

            const dataFormata = Intl.DateTimeFormat('pt-br', {
                dateStyle: 'short'
            })
           
         
    
            var dataString1 = dataFormata.format(date);
            var horaString1 = sessoes[i].hora;
            
          
            
            var partesData1 = dataString1.split("/");
            var partesHora1 = horaString1.split(":");
            
            
            
            var dataHora1 = new Date(
              partesData1[2],
              partesData1[1] - 1,
              partesData1[0],
              partesHora1[0],
              partesHora1[1]
            );
           var dataAtual = new Date()
            var dataHora2 = new Date(
                dataAtual.getFullYear(),
                dataAtual.getMonth(),
                dataAtual.getDate(),
                dataAtual.getHours(),
                dataAtual.getMinutes()
             
            );
            
            // Obter o deslocamento do fuso horário em minutos (considerando Portugal)
            var fusoHorarioMinutos = -(dataHora1.getTimezoneOffset());
            
            // Ajustar a hora considerando o deslocamento do fuso horário
            dataHora1.setMinutes(dataHora1.getMinutes() + fusoHorarioMinutos);
            dataHora2.setMinutes(dataHora2.getMinutes() + fusoHorarioMinutos);
          
            // Calcular a diferença em minutos
            var diferencaMilissegundos = dataHora2 - dataHora1;
            var diferencaMinutos = Math.floor(diferencaMilissegundos / 1000 / 60);
            
            
    
    console.log(dataHora1)
    console.log(dataHora2)
    console.log("Diferença em minutos:", diferencaMinutos);

   
          }  

          
          let uniquecinemas = [];

          sessoes.forEach((sessao) => {
            // Verifique se a sessão não está "Terminada"
            if (sessao.estado !== "Terminada") {
              const cinema = uniquecinemas.find(
                (cinema) => cinema._id == sessao.cinema._id
              );
          
              if (!cinema) {
                const sessoesForThisCinema = sessoes.filter(
                  (sessaoobj) => sessaoobj.cinema._id == sessao.cinema._id
                );
                
                const sessoesValidas = sessoesForThisCinema.filter(
                  (sessaoobj) => sessaoobj.estado !== "Terminada" && sessaoobj.estado !== "Cancelada"
                );
          
                // Adicionar apenas se houver sessões válidas
                if (sessoesValidas.length > 0) {
                  uniquecinemas.push({
                    ...sessao.cinema._doc,
                    sessoes: sessoesValidas,
                  });
                }
              }
            }
          });

        res.send({
            success: true,
            message: "Cinemas encontrados com sucesso!!",
            data: uniquecinemas
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        })
    }

})

router.post("/get-sessao-by-id" , authMiddleware, async(req,res) =>{
    try {
   console.log("Aqui")
        const sessao = await Sessao.findById(req.body.sessaoId).populate({
          path: 'filme',
          populate: { path: 'idioma' }
      }).populate("cinema")

 
      // Buscar os bilhetes relacionados a essa sessão
      const bilhetes = await Bilhete.find({ sessao: req.body.sessaoId });
        

    res.send({
        success: true,
        message: "Sessao carregada com sucesso",
        data:{
          sessao,
          bilhetes
        }
    })
    } catch (error) {
        res.send({
            success: false,
            message: error.message,

        })
    }
    
})

//carregar todos os cinemas
router.get("/get-sessoes",authMiddleware, async (req, res) => {
    try {
        console.log("aqui");
        const sessao = await Sessao.find({
          estado: { $in: ["Cancelada", "Terminada"] }
      }).populate("filme").sort({ createdAt: -1 });
      
      const bilhetes = await Bilhete.find({ sessao: { $in: sessao.map(s => s._id) } });
        res.send({
          success: true,
          message: "Histórico atualizado com sucesso!",
          data: {
            sessao,bilhetes
          }
        });
      } catch (error) {
        res.send({
          success: false,
          message: error.message,
        });
      }
})

//carregar todos os cinemas
router.post("/get-sessoes-historico-func", authMiddleware, async (req, res) => {
    try {
      console.log("Aqui", { userId: req.body.usuario._id });
  
      const historico = await Funcionarios_Sessoes.find({
        funcionario: req.body.usuario._id
    })
    .populate({
        path: 'sessao', 
        match: { estado: { $in: ["Terminada", "Cancelada"] } }, // Filtrando sessões com os estados "Terminada" ou "Cancelada"
        populate: {
            path: 'filme'
        }
    })
    .sort({ createdAt: -1 });

    const historicoFiltrado = historico.filter(item => item.sessao !== null);

    const bilhetes = await Bilhete.find({
      user: req.body.usuario._id
  })


      console.log(historico);
      console.log(bilhetes)
  
      res.send({
        success: true,
        message: "Histórico atualizado com sucesso!",
        data: {
          historico: historicoFiltrado,bilhetes
        }
      });
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  });


router.post("/get-sessoes-by-func", authMiddleware, async (req, res) => {
    try {
      console.log("Aqui222", { userId: req.body.usuario._id });

 // 1. Busque todos os registros de Funcionarios_Sessoes para o ID do funcionário
 const funcionarioSessoes = await Funcionarios_Sessoes.find({
  funcionario : req.body.usuario._id
}).populate({
  path: 'sessao',
  match: { estado: { $in: ["Criada", "a Decorrer"] } },  // Filtrando as sessões pelo estado
  populate: {
      path: 'filme', // Asumindo que o campo 'bilhetes' na sua model Sessao contém os IDs dos bilhetes
  }
});


const sessaoIds = funcionarioSessoes
  .filter(fs => fs.sessao !== null)
  .map(fs => fs.sessao._id);

// Filtra novamente para remover as entradas onde sessao é null
const filteredFuncionarioSessoes = funcionarioSessoes.filter(fs => fs.sessao !== null);


  console.log(funcionarioSessoes)
  console.log(sessaoIds)

  const bilhetes = await Bilhete.find({
    sessao: { $in: sessaoIds } // Assumindo que o campo na tabela Bilhetes que referencia a sessão é chamado sessaoId
}).populate("sessao");

console.log(bilhetes)

  
  
      res.send({
        success: true,
        message: "Histórico atualizado com sucesso!",
        data: {
          sessoes: filteredFuncionarioSessoes.map(fs => fs.sessao),
          bilhetes: bilhetes
        }
      });
    } catch (error) {
      res.send({
        success: false,
        message: error.message,
      });
    }
  });

  router.post("/delete-sessao-historico", authMiddleware, async (req, res) => {
    const sessaoId = req.body.sessaoId;
  
   
  
    try {
       if (!sessaoId) {
      res.send({
        success: false,
        message: "Erro!",
       
      });
    }
  
     // Remover a sessão específica
      await Sessao.deleteOne({ _id: sessaoId })
  
      // Remover bilhetes relacionados a essa sessão
      await Bilhete.deleteMany({ sessao: sessaoId })
  
      // Remover relações de funcionários com essa sessão
      await Funcionarios_Sessoes.deleteMany({ sessao: sessaoId })
  
  
  
      res.send({
        success: true,
        message: "Sessão Removida com sucesso!",
       
      });
  
    } catch (error) {
     
  
      res.send({
        success: false,
        message: error,
       
      });
    }
  });




module.exports = router;