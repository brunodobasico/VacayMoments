const express = require('express');
const router = express.Router();
const Comentario = require('../models/Comentario');
const jwt = require('jsonwebtoken');

// Rota para buscar todos os comentários
router.get('/comentario', async (req, res) => {
  try {
    const comentarios = await Comentario.find();
    res.json(comentarios);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Endpoint para postar um comentário
router.post('/comentarios', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }
  
  const token = req.headers.authorization.split(' ')[1];
  const { descricao, fotoID, dataCriacao} = req.body;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const UtilizadorID = decodedToken.userId; // Garanta que este é o campo correto para o ID do usuário

    let comentario = new Comentario({ descricao, fotoID, idUtilizador:UtilizadorID, dataCriacao});
    await comentario.save();
    res.status(201).json(comentario);
  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar o comentário" });
  }
});

router.get('/comentarios/:fotoId', async (req, res) => {
  const { fotoId } = req.params;
  try {
    const comentarios = await Comentario.find({fotoID: fotoId})
                                        .populate('idUtilizador', 'nome fotoPerfil _id');
    
    const comentariosComNome = comentarios.map(comentario => {
      return {
        ...comentario._doc,
        userName: comentario.idUtilizador.nome, // Adicionando o nome do usuário ao objeto de comentário.
        userPhoto: comentario.idUtilizador.fotoPerfil,
        userId: comentario.idUtilizador._id // Inclua esta linha
      };
    });
    res.json(comentariosComNome);
  } catch (error) {
    console.error('Erro ao buscar comentários', error);
    res.status(500).json({ message: "Erro ao buscar comentários" });
  }
});

// Rota para atualizar um comentário
router.put('/Comentario/:id', async (req, res) => {
  try {
    const comentario = await Comentario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comentario) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }
    res.json(comentario);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//eliminar comentario
router.delete('/comentario/:id', async (req, res) => {
  
  try {
    const comentario = await Comentario.findById(req.params.id);

    if (!comentario) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }
    await Comentario.deleteOne({ _id: req.params.id });


    res.json({ message: 'Comentário apagado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
