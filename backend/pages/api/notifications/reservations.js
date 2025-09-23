import { authMiddleware, requireRole } from '../../../lib/auth.js';
import { query } from '../../../lib/database.js';

async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const professor_id = req.user.id;
      const { status = 'pending' } = req.query;

      // Buscar reservas pendentes de alunos dos projetos do professor
      const result = await query(`
        SELECT 
          r.id,
          r.title,
          r.description,
          r.start_time,
          r.end_time,
          r.status,
          r.created_at,
          r.room_id,
          r.project_id,
          r.professor_approved_by,
          r.professor_approved_at,
          u.name as student_name,
          u.email as student_email,
          u.matricula_sigaa as student_matricula,
          rm.name as room_name,
          rm.location as room_location,
          p.name as project_name,
          p.type as project_type,
          prof.name as professor_name
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN rooms rm ON r.room_id = rm.id
        LEFT JOIN projects p ON r.project_id = p.id
        LEFT JOIN users prof ON r.professor_approved_by = prof.id
        WHERE r.status = $1 
        AND r.project_id IN (
          SELECT id FROM projects WHERE professor_id = $2
        )
        ORDER BY r.created_at DESC
      `, [status, professor_id]);

      return res.status(200).json({
        success: true,
        reservations: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Erro ao buscar notificações de reservas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}

// Apenas professores podem acessar
export default requireRole(['professor'])(authMiddleware(handler));
