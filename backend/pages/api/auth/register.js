import { query } from '../../../lib/database.js';
import { hashPassword, generateToken } from '../../../lib/auth.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { name, email, siape, password, role } = req.body;

    // Validar dados de entrada
    if (!name || !email || !siape || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar se email já existe
    const emailExists = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (emailExists.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Verificar se SIAPE já existe
    const siapeExists = await query(
      'SELECT id FROM users WHERE siape = $1',
      [siape]
    );

    if (siapeExists.rows.length > 0) {
      return res.status(409).json({ error: 'SIAPE já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Inserir novo usuário
    const result = await query(
      `INSERT INTO users (name, email, siape, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, siape, role`,
      [name, email.toLowerCase(), siape, hashedPassword, role || 'professor']
    );

    const newUser = result.rows[0];

    // Gerar token JWT
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    return res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
