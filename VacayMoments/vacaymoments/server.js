// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/fotosutilizadores', express.static(path.join(__dirname, 'fotosutilizadores')));




app.use(cors());
app.use(express.json());

const routeAmizade = require('./src/routes/routeAmizade');
const routeComentario = require('./src/routes/routeComentario');
const routeFoto = require('./src/routes/routeFoto');
const routeNotificacao = require('./src/routes/routeNotificacao');
const routeReacao = require('./src/routes/routeReacao');
const routeUtilizador = require('./src/routes/routeUtilizador');


mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado com sucesso ao MongoDB');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB', err);
});

app.use('/api', routeAmizade);
app.use('/api', routeComentario);
app.use('/api', routeFoto);
app.use('/api', routeNotificacao);
app.use('/api', routeReacao);
app.use('/api', routeUtilizador);


// Rota de teste
app.get('/', (req, res) => {
  res.send('API do PersonalFitness está operacional.');
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});