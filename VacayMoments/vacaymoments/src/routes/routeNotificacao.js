const express = require('express');
const router = express.Router();
const Notificacao = require('../models/Notificacao'); // Certifique-se de ter um modelo para notificações

// Rota para buscar todas as notificações
router.get('/notificacao', async (req, res) => {
  try {
    const notificacoes = await Notificacao.find();
    res.json(notificacoes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para criar uma nova notificação
router.post('/notificacao', async (req, res) => {
  const { tipo, conteudo, data, lida, idUtilizador } = req.body;
  const notificacao = new Notificacao({
    tipo: tipo,
    conteudo: conteudo,
    data: data,
    lida: lida,
    idUtilizador: idUtilizador
  });

  try {
    const novaNotificacao = await notificacao.save();
    res.status(201).json(novaNotificacao);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para atualizar uma notificação
router.put('/notificacao/:id', async (req, res) => {
  try {
    const notificacao = await Notificacao.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notificacao) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    res.json(notificacao);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar uma notificação
router.delete('/notificacao/:id', async (req, res) => {
  try {
    const notificacao = await Notificacao.findByIdAndDelete(req.params.id);
    if (!notificacao) {
      return res.status(404).json({ message: 'Notificação não encontrada' });
    }
    res.json({ message: 'Notificação apagada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
