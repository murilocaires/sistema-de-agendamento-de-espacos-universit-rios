import { authMiddleware, requireRole } from '../../../../lib/auth.js';
import { query } from '../../../../lib/database.js';
import { withAuditLog, logCreate, logDelete } from '../../../../lib/auditLog.js';

async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const projectId = req.query.id;

  if (req.method === 'GET') {
    try {
      // Buscar alunos do projeto
      const result = await query(`
        SELECT 
          ps.*,
          u.name as student_name,
          u.email as student_email,
          u.siape as student_siape,
          u.matricula_sigaa,
          u.created_by,
          u.created_at,
          u.first_login,
          creator.name as created_by_name
        FROM project_students ps
        LEFT JOIN users u ON ps.student_id = u.id
        LEFT JOIN users creator ON u.created_by = creator.id
        WHERE ps.project_id = $1
        ORDER BY u.name
      `, [projectId]);

      return res.status(200).json({
        success: true,
        students: result.rows
      });

    } catch (error) {
      console.error('Erro ao buscar alunos do projeto:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else if (req.method === 'POST') {
    // Professores e admins podem adicionar alunos
    if (!['professor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Apenas professores e administradores podem adicionar alunos' });
    }

    try {
      const { student_id } = req.body;

      if (!student_id) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório' });
      }

      // Verificar se o projeto pertence ao professor (somente quando o usuário é professor)
      if (req.user.role === 'professor') {
        const projectCheck = await query(
          'SELECT id FROM projects WHERE id = $1 AND professor_id = $2',
          [projectId, req.user.id]
        );

        if (projectCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Você não tem permissão para modificar este projeto' });
        }
      }

      // Verificar se o aluno existe e é realmente um aluno
      const studentCheck = await query(
        'SELECT id, name, role FROM users WHERE id = $1 AND role = $2',
        [student_id, 'aluno']
      );

      if (studentCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Aluno não encontrado' });
      }

      // Verificar se o aluno já está no projeto
      const existingCheck = await query(
        'SELECT id FROM project_students WHERE project_id = $1 AND student_id = $2',
        [projectId, student_id]
      );

      if (existingCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Aluno já está neste projeto' });
      }

      // Adicionar aluno ao projeto
      const result = await query(`
        INSERT INTO project_students (project_id, student_id) 
        VALUES ($1, $2) 
        RETURNING *
      `, [projectId, student_id]);

      const newProjectStudent = result.rows[0];

      // Registrar log de auditoria
      await logCreate(req, 'project_students', newProjectStudent.id, {
        project_id: projectId,
        student_id: student_id,
        student_name: studentCheck.rows[0].name,
        created_at: newProjectStudent.created_at
      });

      return res.status(201).json({
        success: true,
        message: 'Aluno adicionado ao projeto com sucesso',
        project_student: newProjectStudent
      });

    } catch (error) {
      console.error('Erro ao adicionar aluno ao projeto:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else if (req.method === 'DELETE') {
    // Professores e admins podem remover alunos
    if (!['professor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Apenas professores e administradores podem remover alunos' });
    }

    try {
      const { student_id } = req.body;

      if (!student_id) {
        return res.status(400).json({ error: 'ID do aluno é obrigatório' });
      }

      // Verificar se o projeto pertence ao professor (somente quando o usuário é professor)
      if (req.user.role === 'professor') {
        const projectCheck = await query(
          'SELECT id FROM projects WHERE id = $1 AND professor_id = $2',
          [projectId, req.user.id]
        );

        if (projectCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Você não tem permissão para modificar este projeto' });
        }
      }

      // Buscar dados do aluno antes de remover
      const studentCheck = await query(`
        SELECT ps.*, u.name as student_name
        FROM project_students ps
        LEFT JOIN users u ON ps.student_id = u.id
        WHERE ps.project_id = $1 AND ps.student_id = $2
      `, [projectId, student_id]);

      if (studentCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Aluno não encontrado neste projeto' });
      }

      // Remover aluno do projeto
      await query(
        'DELETE FROM project_students WHERE project_id = $1 AND student_id = $2',
        [projectId, student_id]
      );

      // Registrar log de auditoria
      await logDelete(req, 'project_students', studentCheck.rows[0].id, {
        project_id: projectId,
        student_id: student_id,
        student_name: studentCheck.rows[0].student_name
      });

      return res.status(200).json({
        success: true,
        message: 'Aluno removido do projeto com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover aluno do projeto:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}

// Professores, admins e alunos podem acessar alunos dos projetos (alunos só podem ver)
export default requireRole(['professor', 'admin', 'aluno'])(withAuditLog('project_students')(handler));
