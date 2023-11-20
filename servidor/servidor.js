const express = require('express');
const { default: mongoose } = require('mongoose');
mongoose.set('strictQuery', true)
const app = express();
require('dotenv').config();
const dbconfig = require("./config/dbconfig")
const WebSocket = require('ws');
const crypto = require('crypto');
const cors = require('cors');

const CryptoJS = require('crypto-js');
const http = require('http').createServer(app);
const io = require('./socket');

io.attach(http);

app.use(cors());
app.use(express.json());

const usersRoute = require('./routes/usersRoute')
const distribuidoraRoute = require('./routes/distribuidoraRoute')
const idiomaRoute = require('./routes/idiomaRoute')
const moviesRoute = require('./routes/moviesRoute')
const cinemasRoute = require('./routes/cinemasRoute')
const bilhetesRoute = require('./routes/bilhetesRoute')

app.use("/api/users", usersRoute);
app.use("/api/movies",moviesRoute);
app.use("/api/cinemas",cinemasRoute);
app.use("/api/bilhetes",bilhetesRoute);
app.use("/api/distribuidora",distribuidoraRoute);
app.use("/api/idioma",idiomaRoute);

// Configuração do socket.io
io.on('connection', (socket) => {
    console.log('Um cliente conectou-se com o ID:', socket.id);

    // Quando o cliente se desconecta
    socket.on('disconnect', () => {
        console.log('O cliente com o ID', socket.id, 'se desconectou');
    });
});


const port = process.env.PORT || 5000;


const path = require("path");
__dirname = path.resolve();


// render deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/cliente/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "cliente", "build", "index.html"));
  });
}



http.listen(port, () => console.log('Listening on port ' + port));