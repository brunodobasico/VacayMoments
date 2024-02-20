const mongoose = require('mongoose');

const utilizadorSchema = new mongoose.Schema({
  nome: String,
  username: String,
  email: String,
  password: String,
  fotoPerfil: String,
});

const Utilizador = mongoose.model('Utilizador', utilizadorSchema);
module.exports = Utilizador;