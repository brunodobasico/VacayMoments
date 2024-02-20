const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(401).json({ message: 'Acesso negado' });

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Token inválido' });
  }
}

module.exports = verificarToken;
