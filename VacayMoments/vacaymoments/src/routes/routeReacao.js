const express = require('express');
const router = express.Router();
const Reacao = require('../models/Reacao');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Rota para buscar todas as reações
router.get('/reacao', async (req, res) => {
  try {
    const reacoes = await Reacao.find();
    res.json(reacoes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//buscar as reaçoes dos utilizador logado
router.get('/reacoes/:fotoId', async (req, res) => {
  const { fotoId } = req.params;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const UtilizadorID = decodedToken.userId;

    const reacao = await Reacao.findOne({
      UtilizadorID,
      FotoID: fotoId
    });

    if (reacao) {
      res.json({ reacao: reacao.TipoEmoji });
    } else {
      res.json({ reacao: null });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar reação do usuário.', error });
  }
});
// Rota para criar uma nova reação
router.post('/reacoes', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }
  
  const token = req.headers.authorization.split(' ')[1];
  const { tipoEmoji, fotoID } = req.body;
  
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const UtilizadorID = decodedToken.userId; // Garanta que este é o campo correto para o ID do usuário
    
    // Verificar se já existe uma reação do usuário para a foto
    const reacaoExistente = await Reacao.findOne({
      UtilizadorID, // Corrigido para usar o nome do campo conforme definido no esquema
      FotoID: fotoID // Certifique-se de que este campo corresponde ao nome do campo no esquema
    });
    if (reacaoExistente) {
      // Atualizar a reação existente
      reacaoExistente.TipoEmoji = tipoEmoji; // Use a capitalização correta conforme definido no esquema
      await reacaoExistente.save();
    } else {
      const novaReacao = new Reacao({
        TipoEmoji: tipoEmoji, // Use a capitalização correta conforme definido no esquema
        UtilizadorID: UtilizadorID, // Corrigido para usar o nome do campo conforme definido no esquema
        FotoID: fotoID // Certifique-se de que este campo corresponde ao nome do campo no esquema
      });
      await novaReacao.save();
    }
    res.status(201).json({ message: 'Reação atualizada com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar reação.', error });
  }
});
// Rota para atualizar uma reação
router.put('/reacao/:id', async (req, res) => {
  try {
    const reacao = await Reacao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reacao) {
      return res.status(404).json({ message: 'Reação não encontrada' });
    }
    res.json(reacao);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para eliminar uma reação
router.delete('/reacao', async (req, res) => {
  const { fotoid, utilizadorid } = req.query; // Tudo em minúsculas

  try {
    const reacao = await Reacao.findOneAndDelete({ FotoID: fotoid, UtilizadorID: utilizadorid });
    if (!reacao) {
      return res.status(404).json({ message: 'Reação não encontrada' });
    }
    res.json({ message: 'Reação apagada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/reacoes/contagem/:fotoId', async (req, res) => {
  try {
    // Converte a string do fotoId em um ObjectId
    const fotoId = new mongoose.Types.ObjectId(req.params.fotoId);
    const contagens = await Reacao.aggregate([
      // Usa o ObjectId na consulta de agregação
      { $match: { FotoID: fotoId } },
      { $group: { _id: '$TipoEmoji', count: { $sum: 1 } } }
    ]);
    res.json(contagens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
