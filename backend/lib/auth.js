import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Hash da senha
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verificar senha
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Gerar JWT token
export const generateToken = (userId, email, role) => {
  const payload = {
    userId,
    email,
    role,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Verificar JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Middleware de autenticação para APIs
export const authMiddleware = (handler) => {
  return async (req, res) => {
    // Configurar CORS sempre
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Responder a preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token de acesso necessário' });
      }

      const decoded = verifyToken(token);
      req.user = decoded;
      
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  };
};

// Middleware para verificar roles específicas
export const requireRole = (allowedRoles) => {
  return (handler) => {
    return authMiddleware(async (req, res) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Permissão insuficiente' });
      }
      return handler(req, res);
    });
  };
};
