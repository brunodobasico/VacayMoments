const express = require('express');
const router = express.Router();
const Amizade = require('../models/Amizade');
const jwt = require('jsonwebtoken');
const verificarToken = require('../../middleware.js');

// Rota para buscar todas as categorias
router.get('/amizades', async (req, res) => {
  try {
    const amizades = await Amizade.find();
    res.json(amizades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para criar uma nova amizade
router.post('/amizades', async (req, res) => {
  const { idutilizador1, idutilizador2, dataAmizade, estado } = req.body;
  const amizade = new Amizade({
    idUtilizador1: idutilizador1,
    idUtilizador2: idutilizador2,
    dataAmizade: dataAmizade,
    estado: estado
  });
  try {
    const novaAmizade = await amizade.save();
    res.status(201).json(novaAmizade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para atualizar uma categoria
router.put('/amizades/:id', async (req, res) => {
  try {
    const amizade = await Amizade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!amizade) {
      return res.status(404).json({ message: 'Amizade não encontrada' });
    }
    res.json(amizade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para deletar uma categoria
router.delete('/amizades/:id', async (req, res) => {
  try {
    const amizade = await Amizade.findByIdAndDelete(req.params.id);
    if (!amizade) {
      return res.status(404).json({ message: 'Amizade não encontrada' });
    }
    res.json({ message: 'Amizade apagada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/amizades/verificar/:id1/:id2', async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    let amizade = await Amizade.findOne({
      idUtilizador1: { $in: [id1, id2] },
      idUtilizador2: { $in: [id1, id2] }
    });
    
    if (!amizade) {
      return res.json({ estado: 'nenhum' });
    }
    res.json({ estado: amizade.estado , amizadeId: amizade._id});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para buscar pedidos de amizade pendentes para o usuário especificado
router.get('/amizades/pendentes/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const pendentes = await Amizade.find({
      idUtilizador2: userId,
      estado: 'pendente'
    }).populate('idUtilizador1', 'nome fotoPerfil'); // Adapte os campos conforme necessário

    res.json(pendentes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para aceitar um pedido de amizade
router.put('/amizades/aceitar/:amizadeId', async (req, res) => {
  try {
    const amizadeId = req.params.amizadeId;
    const amizade = await Amizade.findById(amizadeId);

    if (!amizade) {
      return res.status(404).json({ message: 'Pedido de amizade não encontrado.' });
    }

    if (amizade.estado !== 'pendente') {
      return res.status(400).json({ message: 'Pedido de amizade não está pendente.' });
    }

    amizade.estado = 'amigos';
    await amizade.save();
    
    res.json({ message: 'Pedido de amizade aceito.', amizade });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para rejeitar um pedido de amizade e removê-lo da base de dados
router.delete('/amizades/rejeitar/:amizadeId', async (req, res) => {

  
  try {
    const amizadeId = req.params.amizadeId;
    const amizade = await Amizade.findById(amizadeId);
    if (!amizade) {
      return res.status(404).json({ message: 'Pedido de amizade não encontrado.' });
    }

    if (amizade.estado !== 'pendente') {
      return res.status(400).json({ message: 'Pedido de amizade não está pendente.' });
    }

    await Amizade.findByIdAndDelete(amizadeId);
    
    res.json({ message: 'Pedido de amizade rejeitado e removido.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

  router.get('/amizades/amigos/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
      // Encontrar todas as amizades onde userId é idUtilizador1 ou idUtilizador2 e o estado é 'amigos'
      const amizades = await Amizade.find({
        $or: [{ idUtilizador1: userId }, { idUtilizador2: userId }],
        estado: 'amigos'
      }).populate('idUtilizador1 idUtilizador2', 'nome fotoPerfil'); // Ajuste conforme necessário

      // Filtrar e mapear as amizades para obter detalhes dos amigos
      const amigos = amizades.map(amizade => {
        return amizade.idUtilizador1._id.toString() === userId ? amizade.idUtilizador2 : amizade.idUtilizador1;
      });
      res.json(amigos);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/amizades/meusamigos', async (req, res) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Token não fornecido.' });
    }
    
    const token = req.headers.authorization.split(' ')[1]; // Extrair o token do cabeçalho
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
      const amizades = await Amizade.find({
        $or: [{ idUtilizador1: userId }, { idUtilizador2: userId }],
        estado: 'amigos'
      }).populate('idUtilizador1 idUtilizador2', 'nome fotoPerfil'); // Ajuste conforme necessário

      // Filtrar e mapear as amizades para obter detalhes dos amigos
      const amigos = amizades.map(amizade => {
        return amizade.idUtilizador1._id.toString() === userId ? amizade.idUtilizador2 : amizade.idUtilizador1;
      });
      
      res.json(amigos);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


module.exports = router;