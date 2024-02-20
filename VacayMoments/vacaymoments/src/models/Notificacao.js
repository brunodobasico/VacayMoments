const mongoose = require('mongoose');

const notificaoSchema = new mongoose.Schema({
  tipo: String,
  conteudo: String,
  data: Date,
  lida: String,
  idUtilizador: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador' },
});

const Notificacao = mongoose.model('Notificacao', notificaoSchema);
module.exports = Notificacao;
