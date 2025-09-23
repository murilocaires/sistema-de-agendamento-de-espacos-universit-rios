import { authMiddleware, requireRole } from '../../../lib/auth.js';
import { query } from '../../../lib/database.js';
import { hashPassword } from '../../../lib/auth.js';
import { withAuditLog, logUpdate } from '../../../lib/auditLog.js';

async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { current_password, new_password, confirm_password } = req.body;

      // Validar dados obrigatórios
      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({ 
          error: 'Todos os campos são obrigatórios' 
        });
      }

      // Verificar se as senhas coincidem
      if (new_password !== confirm_password) {
        return res.status(400).json({ 
          error: 'A nova senha e confirmação não coincidem' 
        });
      }

      // Validar tamanho da senha
      if (new_password.length < 6) {
        return res.status(400).json({ 
          error: 'A nova senha deve ter pelo menos 6 caracteres' 
        });
      }

      // Buscar dados do usuário
      const userResult = await query(
        'SELECT id, name, email, password_hash, first_login FROM users WHERE id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = userResult.rows[0];

      // Verificar se é o primeiro login
      if (!user.first_login) {
        return res.status(400).json({ 
          error: 'Você já redefiniu sua senha anteriormente' 
        });
      }

      // Verificar senha atual
      const bcrypt = await import('bcryptjs');
      const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({ 
          error: 'Senha atual incorreta' 
        });
      }

      // Hash da nova senha
      const hashedNewPassword = await hashPassword(new_password);

      // Atualizar senha e marcar como não primeiro login
      await query(
        'UPDATE users SET password_hash = $1, first_login = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedNewPassword, req.user.id]
      );

      // Registrar log de auditoria
      await logUpdate(req, 'users', req.user.id, {
        first_login: false,
        password_updated: true,
        updated_at: new Date().toISOString()
      }, {
        first_login: true,
        password_updated: false
      });

      return res.status(200).json({
        success: true,
        message: 'Senha redefinida com sucesso! Agora você pode usar sua nova senha para fazer login.'
      });

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}

// Qualquer usuário autenticado pode redefinir sua própria senha
export default authMiddleware(handler);
