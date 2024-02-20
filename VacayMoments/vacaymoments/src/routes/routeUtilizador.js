  const express = require('express');
  const router = express.Router();
  const Utilizador = require('../models/Utilizador'); // Ajuste o caminho conforme necessário
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const jwt = require('jsonwebtoken');
  const multer = require('multer');

  const verificarToken = require('../../middleware.js');
// Configuração do Multer para armazenar arquivos de imagem
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'fotosutilizadores/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });


  router.get('/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obter o token do cabeçalho Authorization
    if (!token) {
      return res.status(401).send('Acesso negado. Nenhum token fornecido.');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar e decodificar o token
      Utilizador.findById(decoded.userId) // Usar o ID do usuário decodificado do token
        .then(user => {
          res.json(user); // Enviar os dados do usuário como resposta
        })
        .catch(err => {
          res.status(400).send('Usuário não encontrado.');
        });
    } catch (ex) {
      res.status(400).send('Token inválido.');
    }
  });


  router.post('/login', async (req, res) => {
    try {
      const { emailOrUsername, password } = req.body;

      const utilizador = await Utilizador.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
      });


      if (!utilizador) {
        return res.status(400).json({ message: 'Username ou email estão incorretos.' });
      }

      if (bcrypt.compareSync(password, utilizador.password)) {

        const token = jwt.sign({ userId: utilizador._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login bem sucedido!', token: token });
      } else {

        res.status(400).json({ message: 'Senha incorreta.' });
      }
    } catch (err) {

      res.status(500).json({ message: err.message });
    }
  });

  // Rota para buscar todos os utilizadores
  router.get('/utilizador', async (req, res) => {
    try {
      const utilizadores = await Utilizador.find();
      res.json(utilizadores);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  // Rota para criar um novo utilizador
  router.post('/utilizador', async (req, res) => {
    const utilizador = new Utilizador({
      nome: req.body.nome,
      email: req.body.email,
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, saltRounds),
      fotoperfil: req.body.fotoPerfil
      });

  // Verifique se o email ou username já existe
  const userExists = await Utilizador.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }]
  });

  if (userExists) {
    return res.status(400).json({ message: 'Email ou nome de utilizador já registado.' });
  }
      try {
        const novoUtilizador = await utilizador.save();
        res.status(201).json(novoUtilizador);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
  });

    // Rota para atualizar um utilizador
    router.put('/utilizador/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const { nome } = req.body; // Extrai o novo nome do corpo da requisição
    
        const updatedUser = await Utilizador.findByIdAndUpdate(id, { nome }, { new: true });
        if (!updatedUser) {
          return res.status(404).json({ message: 'Utilizador não encontrado' });
        }
        res.json(updatedUser);
      } catch (err) {
        res.status(400).json({ message: 'Erro ao atualizar o utilizador', error: err });
      }
    });

    router.put('/alterar-foto', upload.single('image'), async (req, res)=>{
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Token não fornecido.' });
      }

      const token = req.headers.authorization.split(' ')[1];

      try{
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const UtilizadorID = decodedToken.userId; // Garanta que este é o campo correto para o ID do usuário
        const imagePath = req.file.path; // O caminho para a imagem salva

        // Atualiza o documento do usuário com o novo caminho da imagem
        await Utilizador.findByIdAndUpdate(UtilizadorID, { fotoPerfil: imagePath });
    
        res.status(200).json({ message: 'Foto de perfil atualizada com sucesso.' });
      }catch (error) {
        res.status(500).json({ message: 'Erro ao alterar foto.', error });
      }
    });

    router.put('/alterar-password', async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const userId = req.usuario._id; // Supondo que você tenha middleware que decodifica o token e insere o usuário no req
    
      try {
        const user = await Utilizador.findById(userId);
        if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(403).json({ message: 'Senha atual incorreta.' });
        }
    
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;
        await user.save();
    
        res.json({ message: 'Senha atualizada com sucesso!' });
      } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
      }
    });

    // No seu arquivo de rotas do Express
  router.get('/search-users', async (req, res) => {
    try {
      const query = req.query.query;
      const users = await Utilizador.find({ nome: new RegExp(query, 'i') });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
    }
  });

  // Rota para buscar um utilizador específico
  router.get('/utilizador/:id', async (req, res) => {
    try {
      const utilizador = await Utilizador.findById(req.params.id);
      if (!utilizador) {
        return res.status(404).json({ message: 'Utilizador não encontrado' });
      }
      res.json(utilizador);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.delete('/utilizador/:id', async (req, res) => {
    try {
      const utilizador = await Utilizador.findByIdAndDelete(req.params.id);
      if (!utilizador) {
        return res.status(404).json({ message: 'Utilizador não encontrada' });
      }
      res.json({ message: 'Utilizador apagado com sucesso' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });




  module.exports = router;
