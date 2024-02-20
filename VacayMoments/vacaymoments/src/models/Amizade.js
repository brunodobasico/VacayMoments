const mongoose = require('mongoose');

const amizadeSchema = new mongoose.Schema({
  dataAmizade: Date,
  estado: String,
  idUtilizador1: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador' },
  idUtilizador2: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador' }
});

const Amizade = mongoose.model('Amizade', amizadeSchema);
module.exports = Amizade;