const express = require('express');
const router = express.Router();
const Foto = require('../models/Foto');
const multer = require('multer');
const jwt = require('jsonwebtoken');


// Configuração do Multer para armazenar arquivos de imagem
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Rota para buscar fotos do usuário logado
router.get('/minhas-fotos', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Buscar fotos onde o idUtilizador corresponde ao userId decodificado do token
    const fotos = await Foto.find({ idUtilizador: userId });
    res.json(fotos);
  } catch (err) {
    res.status(400).json({ message: 'Token inválido ou problema ao buscar fotos.' });
  }
});

// Rota para ir buscar uma foto
router.get('/fotos/:id', async (req, res) => {
  try {
    const fotos = await Foto.find({ idUtilizador: req.params.id });
    if (!fotos) {
      return res.status(404).json({ message: 'Fotos não encontradas' });
    }
    res.json(fotos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para buscar todas as fotos, excluindo as do usuário logado
router.get('/fotos', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = req.headers.authorization.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    // Recupera as tags da query string, se houver
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const localizacao = req.query.localizacao ? req.query.localizacao.trim() : '';

    // Cria um objeto de filtro baseado nas tags, se houver
    let filtro = { idUtilizador: { $ne: userId } };

    if (tags.length > 0) {
      filtro.tags = { $all: tags };
    }

    // Adiciona filtro de localização, se houver
    if (localizacao) {
      filtro.localizacao = localizacao;
    }
    const fotos = await Foto.find(filtro)
                            .sort({ createdAt: -1 })
                            .populate('idUtilizador', 'nome fotoPerfil');

    const fotosComUsuario = fotos.map(foto => ({
        ...foto._doc,
        userName: foto.idUtilizador.nome,
        userPhoto: foto.idUtilizador.fotoPerfil
    }));

    res.json(fotosComUsuario);
  } catch (err) {
    res.status(400).json({ message: 'Token inválido ou problema ao buscar fotos.' });
  }
});


// Rota para criar uma nova foto
router.post('/foto', upload.single('image'), async (req, res) => {
  // Verifique se o token está presente
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = req.headers.authorization.split(' ')[1]; // Extrair o token do cabeçalho

  try {
    // Verifique o token e obtenha o userId
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const { descricao, tags, privacidade, localizacao } = req.body;
    const foto = new Foto({
      descricao,
      tags: tags.split(','), // Transforma a string de tags em um array
      privacidade,
      localizacao,
      idUtilizador: userId, // Use o userId do token
      imagePath: req.file.path // Salvando o caminho do arquivo da imagem
    });
    const novaFoto = await foto.save();
    res.status(201).json(novaFoto);
  } catch (err) {

    res.status(400).json({ message: err.message });
  }
});

// Rota para atualizar uma foto
router.put('/foto/:id', async (req, res) => {
  try {
    const foto = await Foto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!foto) {
      return res.status(404).json({ message: 'Foto não encontrada' });
    }
    res.json(foto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Rota para apagar uma foto
router.delete('/foto/:id', async (req, res) => {
  try {
    const foto = await Foto.findByIdAndDelete(req.params.id);
    if (!foto) {
      return res.status(404).json({ message: 'Foto não encontrada' });
    }
    res.json({ message: 'Foto apagada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
