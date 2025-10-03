import { authMiddleware, requireRole } from '../../../lib/auth.js';
import { query } from '../../../lib/database.js';

async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const professor_id = req.user.id;
      const { status = 'pending' } = req.query;

      // Buscar solicitações pendentes para o professor
      const result = await query(`
        SELECT 
          pr.id,
          pr.project_id,
          pr.student_id,
          pr.status,
          pr.message,
          pr.created_at,
          p.name as project_name,
          p.type as project_type,
          s.name as student_name,
          s.email as student_email,
          s.matricula_sigaa as student_matricula
        FROM project_requests pr
        JOIN projects p ON pr.project_id = p.id
        JOIN users s ON pr.student_id = s.id
        WHERE pr.professor_id = $1 AND pr.status = $2
        ORDER BY pr.created_at DESC
      `, [professor_id, status]);

      return res.status(200).json({
        success: true,
        requests: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Erro ao buscar notificações de projeto:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}

// Professores e admins podem acessar
export default requireRole(['professor', 'servidor', 'admin'])(authMiddleware(handler));
