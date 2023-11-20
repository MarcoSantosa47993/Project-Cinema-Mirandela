const router = require("express").Router();
const CryptoJS = require('crypto-js');
const SECRET_KEY = "c5e2bf6c88a6e93b369880f1bca2d937a0b32aa5d5ed30eb9dea1df56b4a2e43";
function decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}
const decryptedStripe = decrypt(process.env.stripe_key);
const stripe = require('stripe')(decryptedStripe)
const authMiddleware = require("../middlewares/authMiddleware")
const Bilhete = require("../models/bilheteModel")
const Sessao = require("../models/sessaoModel")
const User = require("../models/userModel")
const qr = require('qrcode')
const pdfKit = require('pdfkit'); // Importe o módulo pdfkit
const fs = require('fs'); // Importe o módulo fs (File System) para salvar os PDFs temporariamente
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const multer = require('multer');
const io = require('../socket');


const storage = multer.memoryStorage(); // Usaremos a storage em memória já que não precisamos salvar o arquivo no disco
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Não é uma imagem válida!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: fileFilter
});



const nodemailer = require("nodemailer")

const { v4: uuidv4 } = require("uuid");
const { hasSubscribers } = require('diagnostics_channel');
const { findByIdAndDelete } = require("../models/cinemamodel");




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




//fazer pagamento
router.post("/make-pagamento", authMiddleware, async (req, res) => {
    try {
        const { token, amount } = req.body;
        //criar um cliente
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        //cobrar o pagamento
        const charge = await stripe.charges.create({
            amount: amount,
            currency: "eur",
            customer: customer.id,
            receipt_email: token.email,
            description: "Comprou um bilhete para o cinema"
        }, {
            idempotencyKey: Math.random().toString(36).substring(7)

        })
        const idtransacao = charge.id
        res.send({
            success: true,
            message: "Pagamento feito com sucesso",
            data: idtransacao
        })



    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})



router.post("/comprar-sessao", authMiddleware, async (req, res) => {
        try {
            const lugares = req.body.lugares;
            console.log("Lugares -> " + lugares)
            const pathToImage = path.join(__dirname, 'imagens', 'Mirandela-logo-tr.png');
            // Criar um bilhete para cada lugar no array de lugares
            const newCompras = await Promise.all(lugares.map(async (lugar) => {
                // Buscar o bilhete correspondente
                const bilhete = await Bilhete.findOne({ lugares: lugar.id });
                if (!bilhete) {
                    console.error(`Nenhum bilhete encontrado para o lugar id ${lugar.id}`);
                    return null;
                }
            
                // Atualizar o bilhete
                const newCompra = await Bilhete.findByIdAndUpdate(bilhete._id, {
                    ...req.body,
                    estado:"Comprado",
                    lugares: [lugar.id],  // ou apenas lugar dependendo da estrutura desejada
                }, { new: true });  // Retorna o documento atualizado
            
                return newCompra;
            }));
            console.log("")
            const sessaoId = req.body.sessao;
            const sessao = await Sessao.findById(sessaoId).populate("filme").populate("cinema");
            if (sessao.estado == "A decorrer") {
                res.send({
                    success:false,
                    message: "Sessão já não está a vender bilhetes!"
                })
           
            }
            else{

           


          
               await Sessao.findByIdAndUpdate(sessaoId, {
            $push: { bilhetes: { $each: newCompras } }
        });
            console.log("aqui")
            const bilhetes = newCompras; // Bilhetes do req.body
            console.log("aqui")
            const pdfKit = require('pdfkit');
            const doc = new pdfKit();
            console.log("aqui")
            const attachments = []; // Array para armazenar os anexos PDF
            const lineHeight = 10;
            const marginLeft = 10;
            let marginTop = 10;
            const valorEmEuros = sessao.precobilhete 
      
      
            const valorFormatado = valorEmEuros.toLocaleString('pt-PT', {
            style: 'currency',
            currency: 'EUR',
          });
            // Criar um PDF separado para cada bilhete
            for (let bilheteIndex = 0; bilheteIndex < newCompras.length; bilheteIndex++) {
              const newCompra = newCompras[bilheteIndex];
              // Criar um novo objeto doc para cada bilhete
              const doc = new pdfKit({
                size: [80, 95], // Tamanho do PDF (largura x altura)
                margin: 10, // Margem em todos os lados
              });
              const imgWidth = 20; // A largura desejada da imagem
const imgHeight = 20; // A altura desejada da imagem
const pageWidth2 = doc.page.width; // Largura da página do PDF
const xPosition2 = pageWidth2 - imgWidth - 5; // Calcula a posição x para alinhar a imagem ao canto superior direito com uma pequena margem de 10

doc.image(pathToImage, xPosition2, 2, { width: imgWidth });
              doc.fontSize(3);
              doc.text(`Detalhes do Bilhete ${bilheteIndex + 1}:`);
              doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
              doc.text(`  - Cinema: ${sessao.cinema.nome}`);
              doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
              doc.text('  - Sessão: ' + sessao.nome);
              doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
              doc.text('  - Filme: ' + sessao.filme.titulo);
              doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
              const formatDate = (dateObj) => {
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');  // Os meses variam de 0 (janeiro) a 11 (dezembro), então adicionamos 1
                const year = dateObj.getFullYear();
              
                return `${day}-${month}-${year}`;
              };
              
              doc.text("  - " + formatDate(sessao.data) + " / " + sessao.hora);
              doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
              doc.text('  - Total: ' + valorFormatado); // Adicionar uma linha vazia para separar os bilhetes
              doc.moveDown(2);
              console.log("Lugares -> 2222")
              const selectedPlaces = newCompra.lugares;

if (selectedPlaces) {
    let lugarText = ''; // Vamos armazenar o texto do lugar aqui

    const formatLugar = (place) => {
        let fila = place.charAt(0); // Pega o primeiro caractere
        let numero = place.substring(1); // Pega todos os caracteres após o primeiro
        return `Fila: ${fila}  Lugar: ${numero}`;
    }

    if (typeof selectedPlaces === 'object') {
        // Se for um objeto, trate-o como um objeto
        if (selectedPlaces[0].id) {
            console.log(selectedPlaces[0].id);
            let places = selectedPlaces[0].id.split(',').map(place => place.trim()); // Divida o string por ',' e remova espaços em branco
            lugarText = places.map(formatLugar).join(' e '); // Formata e junta com 'e'
        } else {
            lugarText = formatLugar(selectedPlaces[0]);
        }
    } else {
        // Se não for um objeto, trate-o como um array
        if (selectedPlaces.length > 0) {
            console.log(selectedPlaces[0].id);
            let places = selectedPlaces[0].id.split(',').map(place => place.trim());
            lugarText = places.map(formatLugar).join(' e ');
        } else {
            console.log('O array de lugares está vazio.');
        }
    }
            
                if (lugarText) { // Se tivermos um texto válido para o lugar
                    const textWidth = doc.widthOfString(lugarText);
                    const textHeight = doc.currentLineHeight();
                    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
                    const xPosition = (pageWidth / 2) - (textWidth / 2) + 10;
                    const yPosition = doc.y;
            
                    // Desenha o retângulo preto
                    doc.rect(xPosition - 2, yPosition - 2, textWidth + 4, textHeight + 4).fill('black');
            
                    // Adiciona o texto do lugar em branco centralizado sobre o retângulo
                    doc.fillColor('white').text(lugarText, xPosition, yPosition);
                }
            } else {
                console.log('Nenhum lugar selecionado.');
            }


            doc.moveDown(2);
            // Gere o código de barras usando jsbarcode
            const canvas = createCanvas();
JsBarcode(canvas, newCompra._id.toString(), {
    format: 'CODE128',
    width: 4,
    height: 100,
});

// Converta o código de barras renderizado em um buffer
const barcodeBuffer = canvas.toBuffer('image/png');

// Calcule a posição x para alinhar a imagem ao centro
const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const imageWidth = 70;  // largura da imagem
const xPosition = (pageWidth / 2) - (imageWidth / 2) + 10;

// Adicione a imagem do código de barras ao PDF
doc.image(barcodeBuffer, xPosition, doc.y, {
    fit: [70, 50],
});
doc.moveDown(1,5);


// Suponha que esta seja a hora de início e a duração em minutos
let startTime = sessao.hora;
let durationMinutes = sessao.filme.duracao;
console.log(startTime)
console.log(durationMinutes)

// Converta a hora de início em um objeto Date
let startTimeParts = startTime.split(":");
let startDate = new Date();
startDate.setHours(parseInt(startTimeParts[0]));
startDate.setMinutes(parseInt(startTimeParts[1]));

// Adicione a duração
let endDate = new Date(startDate.getTime() + durationMinutes * 60000); 
// Formate a hora de término
let endTime = endDate.getHours().toString().padStart(2, '0') + ':' + endDate.getMinutes().toString().padStart(2, '0');
console.log("Acaba às " + endTime);  // Isso mostrará "16:30" se a hora de início for "14:30" e a duração for 120 minutos
// Primeiro, defina o tamanho da fonte e a cor do texto
doc.fontSize(2).fillColor('black');

// Calcule a largura do texto usando o tamanho da fonte que você definiu
const textWidth = doc.widthOfString("Hora prevista de fim de filme: " + endTime);

// Calcule a posição x para centralizar o texto
const pageWidth3 = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const xPosition3 = (pageWidth3 / 2) - (textWidth / 2) + 10;

doc.text("Hora prevista de fim de filme: " + endTime, xPosition3, doc.y);

doc.moveDown(2);
const message = "Conserve este bilhete durante toda a sessão";

// Define o tamanho da fonte
doc.fontSize(2);  // Ajuste o tamanho da fonte conforme necessário

// Obtém a largura do texto
const textWidth4 = doc.widthOfString(message);

// Calcule a coordenada x para o texto de forma a centralizá-lo na largura da página
const pageWidth4 = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const xPosition4 = (pageWidth4 / 2) - (textWidth4 / 2) + 10;

function drawBoldText(doc, text, x, y) {
  for(let i = 0; i < 3; i++) {
      for(let j = 0; j < 3; j++) {
          doc.text(text, x + i - 1, y + j - 1);
      }
  }
}



// Adicione o texto centralizado horizontalmente na posição y desejada
doc.font('Helvetica-Bold')
   .fillColor('black')
   .text(message, xPosition4, doc.y);



              // Criar um buffer contendo o PDF
              const pdfBuffer = await new Promise((resolve, reject) => {
                const buffers = [];
                doc.on('data', buffer => buffers.push(buffer));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.end();
              });
              
              attachments.push({
                filename: `Bilhete_${bilheteIndex + 1}.pdf`,
                content: pdfBuffer
              });
            }
            
            // Encontrar o usuário que fez a compra
            const user = await User.findById(newCompras[0].user);
        if(!user.isFunc && !user.isAdmin)
        {
  // Configurar opções de e-mail
            const mailOptions = {
              from: `"Cinema Mirandela" <seuemail@example.com>`,
              to: user.email,
              subject: `'Confirmação de Compra - Bilhete para Filme!  ${sessao.filme.titulo}}'`,
              text: 'Veja os detalhes dos bilhetes anexados em PDF.',
              attachments: attachments
            };
            
            // Enviar o e-mail com os detalhes dos bilhetes em anexo
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log('Erro ao enviar e-mail dos bilhetes:', error);
              } else {
                console.log('E-mail dos bilhetes enviado com sucesso:', info.response);
              }
            });
        }
          
            
            res.send({
              success: true,
              message: "Sessao comprada com sucesso",
              data: newCompras
            })  } ;
          } catch (error) {
            res.send({
              success: false,
              message: error.message
            });
          }
     
        })




        
router.post("/comprar-sessao-2", authMiddleware, async (req, res) => {
            try {
                console.log("2")
                const lugares = req.body.lugares;
                console.log("Lugares -> " + lugares)
                const pathToImage = path.join(__dirname, 'imagens', 'Mirandela-logo-tr.png');
                // Criar um bilhete para cada lugar no array de lugares
                const newCompras = await Promise.all(lugares.map(async (lugar) => {
                    // Buscar o bilhete correspondente
                    const bilhete = await Bilhete.findOne({ lugares: lugar });
                    console.log(bilhete)
                    if (!bilhete) {
                        console.error(`Nenhum bilhete encontrado para o lugar id ${lugar}`);
                        return null;
                    }
                    console.log("BilheteId -> ", bilhete._id)
                    // Atualizar o bilhete
                    const newCompra = await Bilhete.findByIdAndUpdate(bilhete._id, {
                        ...req.body,
                        estado:"Comprado",
                        lugares: [lugar],  // ou apenas lugar dependendo da estrutura desejada
                    }, { new: true });  // Retorna o documento atualizado
                    console.log("Bilhete New Compra  -> " + newCompra)
                    return newCompra;
                }));
                const sessaoId = req.body.sessao;
                const sessao = await Sessao.findById(sessaoId).populate("filme").populate("cinema");
                if (sessao.estado == "A decorrer") {
                    res.send({
                        success:false,
                        message: "Sessão já não está a vender bilhetes!"
                    })
               
                }
                else{
    
               
    
    
              
                   await Sessao.findByIdAndUpdate(sessaoId, {
                $push: { bilhetes: { $each: newCompras } }
            });
                console.log("aqui")
                const bilhetes = newCompras; // Bilhetes do req.body
                console.log("aqui")
                const pdfKit = require('pdfkit');
                const doc = new pdfKit();
                console.log("aqui")
                const attachments = []; // Array para armazenar os anexos PDF
                const lineHeight = 10;
                const marginLeft = 10;
                let marginTop = 10;
                const valorEmEuros = sessao.precobilhete 
          
          
                const valorFormatado = valorEmEuros.toLocaleString('pt-PT', {
                style: 'currency',
                currency: 'EUR',
              });
                // Criar um PDF separado para cada bilhete
                for (let bilheteIndex = 0; bilheteIndex < newCompras.length; bilheteIndex++) {
                  const newCompra = newCompras[bilheteIndex];
                  // Criar um novo objeto doc para cada bilhete
                  const doc = new pdfKit({
                    size: [80, 95], // Tamanho do PDF (largura x altura)
                    margin: 10, // Margem em todos os lados
                  });
                  const imgWidth = 20; // A largura desejada da imagem
    const imgHeight = 20; // A altura desejada da imagem
    const pageWidth2 = doc.page.width; // Largura da página do PDF
    const xPosition2 = pageWidth2 - imgWidth - 5; // Calcula a posição x para alinhar a imagem ao canto superior direito com uma pequena margem de 10
    
    doc.image(pathToImage, xPosition2, 2, { width: imgWidth });
                  doc.fontSize(3);
                  doc.text(`Detalhes do Bilhete ${bilheteIndex + 1}:`);
                  doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
                  doc.text(`  - Cinema: ${sessao.cinema.nome}`);
                  doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
                  doc.text('  - Sessão: ' + sessao.nome);
                  doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
                  doc.text('  - Filme: ' + sessao.filme.titulo);
                  doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
                  const formatDate = (dateObj) => {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');  // Os meses variam de 0 (janeiro) a 11 (dezembro), então adicionamos 1
                    const year = dateObj.getFullYear();
                  
                    return `${day}-${month}-${year}`;
                  };
                  
                  doc.text("  - " + formatDate(sessao.data) + " / " + sessao.hora);
                  doc.text(''); // Adicionar uma linha vazia para separar os bilhetes
                  doc.text('  - Total: ' + valorFormatado); // Adicionar uma linha vazia para separar os bilhetes
                  doc.moveDown(2);
                  console.log("Lugares -> 2222")
                  const selectedPlaces = newCompra.lugares;
    
    if (selectedPlaces) {
        let lugarText = ''; // Vamos armazenar o texto do lugar aqui
    
        const formatLugar = (place) => {
            let numero = place; // Pega todos os caracteres após o primeiro
            return `Lugar: ${numero}`;
        }
    
        if (typeof selectedPlaces === 'object') {
            // Se for um objeto, trate-o como um objeto
            if (selectedPlaces[0].id) {
                console.log(selectedPlaces[0].id);
                let places = selectedPlaces[0].id.split(',').map(place => place.trim()); // Divida o string por ',' e remova espaços em branco
                lugarText = places.map(formatLugar).join(' e '); // Formata e junta com 'e'
            } else {
                lugarText = formatLugar(selectedPlaces[0]);
            }
        } else {
            // Se não for um objeto, trate-o como um array
            if (selectedPlaces.length > 0) {
                console.log(selectedPlaces[0].id);
                let places = selectedPlaces[0].id.split(',').map(place => place.trim());
                lugarText = places.map(formatLugar).join(' e ');
            } else {
                console.log('O array de lugares está vazio.');
            }
        }
                
                    if (lugarText) { // Se tivermos um texto válido para o lugar
                        const textWidth = doc.widthOfString(lugarText);
                        const textHeight = doc.currentLineHeight();
                        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
                        const xPosition = (pageWidth / 2) - (textWidth / 2) + 10;
                        const yPosition = doc.y;
                
                        // Desenha o retângulo preto
                        doc.rect(xPosition - 2, yPosition - 2, textWidth + 4, textHeight + 4).fill('black');
                
                        // Adiciona o texto do lugar em branco centralizado sobre o retângulo
                        doc.fillColor('white').text(lugarText, xPosition, yPosition);
                    }
                } else {
                    console.log('Nenhum lugar selecionado.');
                }
    
    
                doc.moveDown(2);
                // Gere o código de barras usando jsbarcode
                const canvas = createCanvas();
    JsBarcode(canvas, newCompra._id.toString(), {
        format: 'CODE128',
        width: 4,
        height: 100,
    });
    
    // Converta o código de barras renderizado em um buffer
    const barcodeBuffer = canvas.toBuffer('image/png');
    
    // Calcule a posição x para alinhar a imagem ao centro
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const imageWidth = 70;  // largura da imagem
    const xPosition = (pageWidth / 2) - (imageWidth / 2) + 10;
    
    // Adicione a imagem do código de barras ao PDF
    doc.image(barcodeBuffer, xPosition, doc.y, {
        fit: [70, 50],
    });
    doc.moveDown(1,5);
    
    
    // Suponha que esta seja a hora de início e a duração em minutos
    let startTime = sessao.hora;
    let durationMinutes = sessao.filme.duracao;
    console.log(startTime)
    console.log(durationMinutes)
    
    // Converta a hora de início em um objeto Date
    let startTimeParts = startTime.split(":");
    let startDate = new Date();
    startDate.setHours(parseInt(startTimeParts[0]));
    startDate.setMinutes(parseInt(startTimeParts[1]));
    
    // Adicione a duração
    let endDate = new Date(startDate.getTime() + durationMinutes * 60000); 
    // Formate a hora de término
    let endTime = endDate.getHours().toString().padStart(2, '0') + ':' + endDate.getMinutes().toString().padStart(2, '0');
    console.log("Acaba às " + endTime);  // Isso mostrará "16:30" se a hora de início for "14:30" e a duração for 120 minutos
    // Primeiro, defina o tamanho da fonte e a cor do texto
    doc.fontSize(2).fillColor('black');
    
    // Calcule a largura do texto usando o tamanho da fonte que você definiu
    const textWidth = doc.widthOfString("Hora prevista de fim de filme: " + endTime);
    
    // Calcule a posição x para centralizar o texto
    const pageWidth3 = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const xPosition3 = (pageWidth3 / 2) - (textWidth / 2) + 10;
    
    doc.text("Hora prevista de fim de filme: " + endTime, xPosition3, doc.y);
    
    doc.moveDown(2);
    const message = "Conserve este bilhete durante toda a sessão";
    
    // Define o tamanho da fonte
    doc.fontSize(2);  // Ajuste o tamanho da fonte conforme necessário
    
    // Obtém a largura do texto
    const textWidth4 = doc.widthOfString(message);
    
    // Calcule a coordenada x para o texto de forma a centralizá-lo na largura da página
    const pageWidth4 = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const xPosition4 = (pageWidth4 / 2) - (textWidth4 / 2) + 10;
    
    function drawBoldText(doc, text, x, y) {
      for(let i = 0; i < 3; i++) {
          for(let j = 0; j < 3; j++) {
              doc.text(text, x + i - 1, y + j - 1);
          }
      }
    }
    
    
    
    // Adicione o texto centralizado horizontalmente na posição y desejada
    doc.font('Helvetica-Bold')
       .fillColor('black')
       .text(message, xPosition4, doc.y);
    
    
    
                  // Criar um buffer contendo o PDF
                  const pdfBuffer = await new Promise((resolve, reject) => {
                    const buffers = [];
                    doc.on('data', buffer => buffers.push(buffer));
                    doc.on('end', () => resolve(Buffer.concat(buffers)));
                    doc.end();
                  });
                  
                  attachments.push({
                    filename: `Bilhete_${bilheteIndex + 1}.pdf`,
                    content: pdfBuffer
                  });
                }
                
                // Encontrar o usuário que fez a compra
                const user = await User.findById(newCompras[0].user);
            if(!user.isFunc && !user.isAdmin)
            {
      // Configurar opções de e-mail
                const mailOptions = {
                  from: `"Cinema Mirandela" <seuemail@example.com>`,
                  to: user.email,
                  subject: `'Confirmação de Compra - Bilhete para Filme! ${sessao.filme.titulo}'`,
                  text: 'Veja os detalhes dos bilhetes anexados em PDF.',
                  attachments: attachments
                };
                
                // Enviar o e-mail com os detalhes dos bilhetes em anexo
                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log('Erro ao enviar e-mail dos bilhetes:', error);
                  } else {
                    console.log('E-mail dos bilhetes enviado com sucesso:', info.response);
                  }
                });
            }
              console.log("Bilhetes -> " + newCompras)
                
                res.send({
                  success: true,
                  message: "Sessao comprada com sucesso",
                  data: newCompras
                })  } ;
              } catch (error) {
                res.send({
                  success: false,
                  message: error.message
                });
              }
         
            })

//todas compras por id de usuario
router.get("/get-bilhetes", authMiddleware, async (req, res) => {
    try {
       
        const bilhetes = await Bilhete.find({
            user: req.body.userId,
        }).populate("sessao").populate({
            path: "sessao",
            populate: {
                path: "filme",
                model: "movies"

            },

        }).populate("user").populate({
            path: "sessao",
            populate: {
                path: "cinema",
                model: "cinemas"
            }
        })


        res.send({
            success: true,
            message: "Bilhetes fetched com sucesso",
            data: bilhetes,
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

router.post("/get-id-bilhetes", authMiddleware, async (req, res) => {
    try {


        const bilhetes = req.body; // Array de bilhetes

        const bilhetesEncontrados = new Set();
   
        for (const bilheteData of bilhetes) {
            try {
                const bilhete = await Bilhete.findById(bilheteData._id);
                if (bilhete) {
                    bilhetesEncontrados.add(bilhete);
                }
            } catch (error) {
                console.error("Erro ao buscar bilhete:", error.message);
            }
        }
        
        // Convertendo o conjunto de bilhetes de volta para um array
        const bilhetesUnicos = Array.from(bilhetesEncontrados);

        console.log("Aqui 2 -> " + bilhetesUnicos)

       res.send({
            success: true,
            data: bilhetesUnicos,
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})



//Todas as sessões de um cinema 
router.post("/get-all-compradores", authMiddleware, async (req, res) => {
    try {
        const compradores = await Bilhete.find({ sessao: req.body.sessaoId }).populate('user').sort({ createdAt: -1 })

        res.send({
            success: true,
            message: "Compradores carregados com sucesso!",
            data: compradores,
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message

        })
    }
})

router.post("/delete-bilhete", authMiddleware, async (req, res) => {
    try {
        const sessao = await Sessao.findById(req.body.bilhete.sessao).populate("filme").populate("cinema")


        const bilhete = await Bilhete.findById(req.body.bilhete)



        const user = await User.findById(req.body.bilhete.user)


        const date = new Date(sessao.data)



        const dataFormat = Intl.DateTimeFormat('pt-br', {
            dateStyle: 'long'
        })

  
        
        bilhete.estado = "Cancelado"

        await Bilhete.findByIdAndUpdate(bilhete._id,bilhete)

        
        


      if(!user.isFunc && !user.isAdmin)
      {
        var mailOptions = {
            from: ` "Cancelamento do bilhete ${bilhete._id} de cinema - ${sessao.filme.titulo}" <${process.env.USER}>`,
            to: user.email,
            subject: 'Cancelamento do bilhete de cinema!',
            html: `<h2>Cancelamento do bilhete de cinema - ${sessao.filme.titulo}</h2>
                  <h4>Caro(a) ${user.nome},

                  Espero que esta mensagem o(a) encontre bem. Estou a contactar-lhe relativamente ao bilhete que adquiriu para o filme ${sessao.filme.titulo}, agendado para ser exibido em ${dataFormat.format(date)} às ${sessao.hora}.
                  
                  Gostaríamos de informar que o seu bilhete foi cancelado. Por favor contacte o nosso suporte para esclarecer qualquer assunto. O valor do bilhete vai ser reembolsado.
                  
                  

Atenciosamente,Cinema Mirandela </h4>


            `
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)
            } else {
                console.log("Verification email was send")
            }
        })

      }

     
   

       res.send({
            success: true,
            message: "Bilhete eliminado com sucesso"

        })



    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }



})


router.post("/delete-all-bilhetes-by-sessao", authMiddleware, async (req, res) => {
    try {



        const sessao = await Sessao.findById(req.body.sessaoId).populate("filme").populate("cinema")





        const bilhete = await Bilhete.find({ sessao }).populate("user").populate("sessao")


        const date = new Date(sessao.data)

       

        const dataFormat = Intl.DateTimeFormat('pt-br', {
            dateStyle: 'long'
        })

        console.log("Lenght =>  " + bilhete.length)
        const num = bilhete.length
        const usuariosBilhetes = {};

        for (let i = 0; i < num; i++) {
            // Atualiza o estado do bilhete para "Cancelado" para todos os bilhetes da sessão
            if (bilhete[i].sessao.estado) {
                bilhete[i].estado = "Cancelado";
                await Bilhete.findByIdAndUpdate(bilhete[i]._id, bilhete[i]);
        
                // Se o bilhete ainda não foi cancelado anteriormente e o usuário não é "func" nem "admin", adicione ao mapa de usuários e bilhetes
                if (bilhete[i].estado !== "Cancelado" && !bilhete[i].user.isFunc && !bilhete[i].user.isAdmin) {
                    if (!usuariosBilhetes[bilhete[i].user._id]) {
                        usuariosBilhetes[bilhete[i].user._id] = {
                            nome: bilhete[i].user.nome,
                            email: bilhete[i].user.email,
                            bilhetes: []
                        };
                    }
                    usuariosBilhetes[bilhete[i].user._id].bilhetes.push(bilhete[i]._id);
                }
            }
        }
        
        for (const userId in usuariosBilhetes) {
            const { nome, email, bilhetes } = usuariosBilhetes[userId];
        
            var mailOptions = {
                from: ` "Cancelamento de bilhetes de cinema - ${sessao.filme.titulo}" <${process.env.USER}>`,
                to: email,
                subject: 'Cancelamento do bilhete de cinema!',
                html: `<h2>Cancelamento de bilhetes de cinema - ${sessao.filme.titulo}</h2>
                      <h4>Caro(a) ${nome},
                      Espero que esta mensagem o(a) encontre bem. Estamos a contactar-lhe relativamente aos bilhetes que adquiriu para o filme ${sessao.filme.titulo}. Os seguintes bilhetes foram cancelados: ${bilhetes.join(', ')}.
                      // Restante do conteúdo do e-mail...`
            };
        
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("E-mail de cancelamento enviado.");
                }
            });
        
        }

          sessao.estado = "Cancelada"
          
       
              await Sessao.findByIdAndUpdate(sessao._id , sessao)
              console.log('Historico salvo com sucesso');
      

    
        // await Sessao.findByIdAndDelete(sessao.id)
        res.send({
            success: true,
            message: "Sessão eliminada com sucesso"
        })





    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }




})


router.get("/get-all-bilhetes", authMiddleware, async (req, res) => {
    try {
        const bilhetes = await Bilhete.find({ estado: { $in: ["Expirado", "Terminado", "Cancelado"] } })
  .populate("user")
  .populate({
    path: 'sessao',
    populate: { path: 'filme' }
  });
        res.send({
          success: true,
          message: "Bilhetes fetched com sucesso",
          data: bilhetes,
        });
      } catch (error) {
        res.send({
          success: false,
          message: error.message
        });
      }
})

router.get("/get-all-bilhetes2", authMiddleware, async (req, res) => {
    try {
        const bilhetes = await Bilhete.find().populate("user").populate("sessao");
        res.send({
          success: true,
          message: "Bilhetes fetched com sucesso",
          data: bilhetes,
        });
      } catch (error) {
        res.send({
          success: false,
          message: error.message
        });
      }
})

router.post("/reservar-lugar", authMiddleware, async (req, res) => {
    try {

     const lugarReservado = Bilhete({lugares : req.body.id , user: req.body.userid, sessao :req.body.sessaoId , estado:"Reservado" })
     lugarReservado.save()
     io.emit('lugar-reservado', { lugarId: req.body.id, sessaoId: req.body.sessaoId, userId: req.body.userid });
       res.send({
            success: true,
            message: "Bilhete Reservado com sucesso"

        })



    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }



})

router.post("/reservar-lugar-2", authMiddleware, async (req, res) => { //para os cinemas criados a parte....
    try {
     console.log(req.body)
     const lugarReservado = Bilhete({lugares : req.body.id , user: req.body.userid, sessao :req.body.sessaoId , estado:"Reservado" })
     io.emit('lugar-reservado', { lugarId: req.body.id, sessaoId: req.body.sessaoId, userId: req.body.userid });
     lugarReservado.save()

       res.send({
            success: true,
            message: "Bilhete Reservado com sucesso"

        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }

})

router.post("/eliminar-lugar-reserva", authMiddleware, async (req, res) => {
    try {
        const lugar = req.body.lugar;
        const sessaoId = req.body.sessao.sessao._id;

        const bilhete = await Bilhete.findOne({ lugares: lugar, sessao: sessaoId });
        
        if (!bilhete) {
            console.log("Bilhete não encontrado");
            return res.send({
                success: false,
                message: "Bilhete não encontrado"
            });
        }

        if (bilhete.estado !== "Reservado") {
            console.log("Bilhete já foi comprado ou está em outro estado");
            return res.send({
                success: false,
                message: "Bilhete já foi comprado ou está em outro estado"
            });
        }

        await Bilhete.deleteOne({ _id: bilhete._id });
        io.emit('lugar-liberado', { lugarId: lugar });
        res.send({
            success: true,
            message: "Bilhete Removido com sucesso"
        });

    } catch (error) {
        console.error("Erro ao eliminar lugar reserva:", error);
        res.send({
            success: false,
            message: error.message
        });
    }
});

router.post("/eliminar-lugar-reserva-2", authMiddleware, async (req, res) => {//para os cinemas criados a parte....
    try {
     
        const lugar = req.body.lugar;
        console.log(lugar)


       const bilhete = await Bilhete.findOne({ lugares: lugar });


       console.log( "Bilhete ->" + bilhete)
       if(bilhete && bilhete.estado === "Reservado") {
        await Bilhete.deleteOne({ lugares: lugar });
        io.emit('lugar-liberado', { lugarId: lugar });
        res.send({
            success: true,
            message: "Bilhete Removido com sucesso"
        });
    } else if (bilhete && bilhete.estado !== "Reservado") {
        console.log("já foi comprado")
        res.send({
            success: false,
            
        });
    } else if(!bilhete) {
        console.log("já foi eliminado")
        res.send({
            success: false,
            
            
        });
    }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }



})

router.post("/eliminar-todas-reserva", authMiddleware, async (req, res) => {
    try {
        console.log(req.body._id);
        
        // Buscar os bilhetes reservados para um usuário específico
        const bilhetes = await Bilhete.find({ 
            user: req.body._id,
            estado: 'Reservado'
        });

        // Obter os lugares de cada bilhete
        const lugares = bilhetes.flatMap(bilhete => bilhete.lugares);
        console.log("Lugares " + lugares)

        // Deletar os bilhetes
        const result = await Bilhete.deleteMany({ 
            user: req.body._id,
            estado: 'Reservado'
        });

        // Emitir um evento para cada lugar que foi deletado
        lugares.forEach(lugar => {
            io.emit('lugar-liberado', { lugarId: lugar });
        });

        res.send({
            success: true
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});

router.post("/get-reservas", authMiddleware, async (req, res) => {
    try {
        const reservas = await Bilhete.find({ sessao: req.body._id, estado: 'Reservado' });
        const now = new Date();
        const reservasToRemove = [];
        
        for (const reserva of reservas) {
            const createdAtDate = new Date(reserva.createdAt);  // <-- Alteração aqui
            const difference = now - createdAtDate;
            if (difference > 300000) {  
                reservasToRemove.push(reserva._id);
            }
        }
        
        // Se houver reservas para remover, você pode então removê-las da sua base de dados
        if (reservasToRemove.length > 0) {
            await LugarReservado.deleteMany({ _id: { $in: reservasToRemove } });
        }
        res.send({
            success: true,
            message: "Bilhetes fetched com sucesso",
            data: reservas,
        });
        

        
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
})

router.post("/get-all-bilhetes-now", authMiddleware, async (req, res) => {
    try {

        console.log("#")
        const bilhetes = await Bilhete.find({
            sessao: req.body._id,
            estado: { $in: ["Comprado", "Validado","Reservado"] }
        }).populate("user");
       
        res.send({
            success: true,
            data: bilhetes,
          });

      } catch (error) {
        res.send({
          success: false,
          message: error.message,
          data : bilhetes,
        });
      }
})

router.post('/update-bilhete', async (req, res) => {
    try {
        const formatHour = (date) => {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          };
        console.log("Aqui")
      const bilhete = await Bilhete.findById(req.body.id).populate("sessao");
  
      if (!bilhete) {
        return res.send({
          message: "Bilhete não encontrado"
        });
      }
     console.log(bilhete)
      if (bilhete.estado === "Comprado") {
        // Verifique se a sessão é para o mesmo dia
        const dataAtual = new Date().toLocaleDateString();
        const dataSessao = new Date(bilhete.sessao.data).toLocaleDateString();
  
        if (dataAtual !== dataSessao) {
          return res.send({
            message: "Este bilhete não é válido para hoje"      
          });
        }
  
        bilhete.estado = "Validado";
        bilhete.dataHoraValidacao = new Date(); // Data e hora atual
      
        await Bilhete.findByIdAndUpdate(bilhete._id, bilhete);
      
        const dataHoraValidacao = formatHour(bilhete.dataHoraValidacao); 
      
        return res.send({
            message: `Bilhete Validado às ${dataHoraValidacao}`, // Mensagem informando a validação e a data, hora e minutos da validação
        });
      } else if (bilhete.estado === "Expirado") {
        return res.send({
          message: "Este bilhete já expirou"
        });
    } else if (bilhete.estado === "Validado") {
        const dataHoraValidacao = formatHour(bilhete.dataHoraValidacao); 
      
        return res.send({
            message: `Este bilhete já foi validado às ${dataHoraValidacao}`, // Mensagem informando que o bilhete já foi validado e a data, hora e minutos da validação
        });
      } else {
        return res.send({
          message: "Ação não permitida para este bilhete"
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: "Ocorreu um erro interno no servidor"
      });
    }
  });


  router.post("/enviar-email", upload.single('image'), async (req, res) => {
    try {
        console.log(req.body);
        if (req.file) {
            console.log("Nome do arquivo no servidor: " + req.file.filename);
            console.log("Nome original do arquivo: " + req.file.originalname);
        }

        let emailText = `
Nome: ${req.body.nome}
Email: ${req.body.email}
Assunto: ${req.body.assunto}
ID do Utilizador: ${req.body.userId}
Mensagem: ${req.body.mensagem}
`;

        // Se o assunto é "Reembolso" e se existem IDs de bilhetes, adicione-os ao texto
        if (req.body.assunto === "Reembolso" && req.body.bilheteIDs) {
            emailText += `ID(s) do(s) Bilhetes(s): ${req.body.bilheteIDs}\n`;
        }

        const mailOptions = {
            from: `Pedido de Apoio`,
            to: "mirandelacinema@gmail.com",
            subject: `Pedido de Apoio! Utilizador - ${req.body.nome}`,
            text: emailText
        };

        // Se um arquivo foi enviado, anexe-o ao e-mail
        if (req.file) {
            mailOptions.attachments = [{
                filename: req.file.originalname,
                content: req.file.buffer
            }];
        }

        // Enviar o e-mail
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Erro ao enviar e-mail de apoio:', error);
            } else {
                console.log('E-mail de Apoio enviado com sucesso:', info.response);
            }
        });

        res.send({
            success: true,
            message: "Mensagem enviada com sucesso!"
        });

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});


router.post("/get-all-bilhetes-func", authMiddleware, async (req, res) => {
    try {
        console.log("poalapodwqkdqpwjdqd")
        const compradores = await Bilhete.find({ 
          sessao: req.body.sessaoId,
          user: req.body.userId  // Considerando user._id na consulta
        }).populate('user').sort({ createdAt: -1 })
         console.log(compradores)
        res.send({
            success: true,
            message: "Compradores carregados com sucesso!",
            data: compradores,
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
  })
module.exports = router