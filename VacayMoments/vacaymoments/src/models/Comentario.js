const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  descricao: String,
  dataCriacao: Date,
  fotoID: { type: mongoose.Schema.Types.ObjectId, ref: 'Foto' },
  idUtilizador: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador' }
});

const Comentario = mongoose.model('Comentario', comentarioSchema);
module.exports = Comentario;