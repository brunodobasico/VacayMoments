const mongoose = require('mongoose');

const reacaoSchema = new mongoose.Schema({
  TipoEmoji: {
    type: String,
    enum: ['like', 'heart', 'laugh', 'happy'], // Adicione mais opções conforme necessário
  },
  UtilizadorID: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador' },
  FotoID: { type: mongoose.Schema.Types.ObjectId, ref: 'Foto' }
});

const Reacao = mongoose.model('Reacao', reacaoSchema);
module.exports = Reacao;