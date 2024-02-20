const mongoose = require('mongoose');

const fotoSchema = new mongoose.Schema({
  descricao: String,
  tags: [String], // Isso permite armazenar várias tags em um array
  privacidade: String,
  dataCriacao: { type: Date, default: Date.now }, // Isso define um valor padrão para a data de criação
  localizacao: String,
  idUtilizador: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilizador' },
  imagePath: String // Este campo armazenará o caminho do arquivo da imagem
});

const Foto = mongoose.model('Foto', fotoSchema);
module.exports = Foto;