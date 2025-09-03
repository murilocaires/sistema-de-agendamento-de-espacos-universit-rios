import { authMiddleware, requireRole } from '../../../lib/auth.js';
import { query } from '../../../lib/database.js';
import { withAuditLog, logCreate } from '../../../lib/auditLog.js';

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
      const { status, user_id, room_id, start_date, end_date } = req.query;
      
      let whereConditions = [];
      let queryParams = [];
      let paramCount = 0;

      // Construir filtros dinamicamente
      if (status) {
        paramCount++;
        whereConditions.push(`r.status = $${paramCount}`);
        queryParams.push(status);
      }

      if (user_id) {
        paramCount++;
        whereConditions.push(`r.user_id = $${paramCount}`);
        queryParams.push(user_id);
      }

      if (room_id) {
        paramCount++;
        whereConditions.push(`r.room_id = $${paramCount}`);
        queryParams.push(room_id);
      }

      if (start_date) {
        paramCount++;
        whereConditions.push(`r.start_time >= $${paramCount}`);
        queryParams.push(start_date);
      }

      if (end_date) {
        paramCount++;
        whereConditions.push(`r.end_time <= $${paramCount}`);
        queryParams.push(end_date);
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // Buscar reservas com informações de usuário, sala e aprovador
      const result = await query(`
        SELECT 
          r.*,
          u.name as user_name,
          u.email as user_email,
          u.role as user_role,
          rm.name as room_name,
          rm.location as room_location,
          rm.capacity as room_capacity,
          approver.name as approved_by_name
        FROM reservations r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN rooms rm ON r.room_id = rm.id
        LEFT JOIN users approver ON r.approved_by = approver.id
        ${whereClause}
        ORDER BY r.start_time DESC
      `, queryParams);

      return res.status(200).json({
        success: true,
        reservations: result.rows
      });

    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else if (req.method === 'POST') {
    // Criar nova reserva
    try {
      const { 
        user_id: requested_user_id,
        room_id,
        title,
        description = '',
        start_time,
        end_time,
        is_recurring = false,
        recurrence_type = null,
        recurrence_end_date = null,
        priority = 1
      } = req.body;

      // Usar o user_id fornecido no corpo da requisição, ou o ID do usuário autenticado como fallback
      const user_id = requested_user_id || req.user.id;
      const user_role = req.user.role;

      // Validar dados obrigatórios
      if (!user_id || !room_id || !title || !start_time || !end_time) {
        return res.status(400).json({ 
          error: 'Usuário, sala, título, data/hora de início e fim são obrigatórios' 
        });
      }

      // Se um user_id específico foi fornecido, verificar se o usuário existe
      if (requested_user_id) {
        const userCheck = await query(
          'SELECT id, name FROM users WHERE id = $1',
          [requested_user_id]
        );

        if (userCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
      }

      // Validar se a data de fim é posterior à data de início
      if (new Date(end_time) <= new Date(start_time)) {
        return res.status(400).json({ 
          error: 'Data/hora de fim deve ser posterior à data/hora de início' 
        });
      }

      // Verificar se a sala existe e está ativa
      const roomCheck = await query(
        'SELECT id, name, is_active FROM rooms WHERE id = $1',
        [room_id]
      );

      if (roomCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Sala não encontrada' });
      }

      if (!roomCheck.rows[0].is_active) {
        return res.status(400).json({ error: 'Sala não está ativa' });
      }

      // Verificar conflitos de horário
      const conflictCheck = await query(`
        SELECT id, title, start_time, end_time 
        FROM reservations 
        WHERE room_id = $1 
        AND status IN ('approved', 'pending')
        AND (
          (start_time <= $2 AND end_time > $2) OR
          (start_time < $3 AND end_time >= $3) OR
          (start_time >= $2 AND end_time <= $3)
        )
      `, [room_id, start_time, end_time]);

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: 'Já existe uma reserva para este horário',
          conflict: conflictCheck.rows[0]
        });
      }

      // Determinar status inicial baseado no papel do usuário
      let initialStatus = 'pending';
      let approved_by = null;
      let approved_at = null;

      // Administradores e coordenadores podem aprovar automaticamente
      if (user_role === 'admin') {
        initialStatus = 'approved';
        approved_by = user_id;
        approved_at = new Date().toISOString();
      } else if (user_role === 'coordenador') {
        // Coordenadores podem aprovar automaticamente (lógica especial)
        initialStatus = 'approved';
        approved_by = user_id;
        approved_at = new Date().toISOString();
      }

      // Inserir nova reserva
      const result = await query(`
        INSERT INTO reservations (
          user_id, room_id, title, description, start_time, end_time,
          status, is_recurring, recurrence_type, recurrence_end_date,
          approved_by, approved_at, priority
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        user_id, room_id, title, description, start_time, end_time,
        initialStatus, is_recurring, recurrence_type, recurrence_end_date,
        approved_by, approved_at, priority
      ]);

      const newReservation = result.rows[0];

      // Registrar log de auditoria
      await logCreate(req, 'reservations', newReservation.id, {
        user_id: newReservation.user_id,
        room_id: newReservation.room_id,
        title: newReservation.title,
        start_time: newReservation.start_time,
        end_time: newReservation.end_time,
        status: newReservation.status,
        is_recurring: newReservation.is_recurring,
        created_at: newReservation.created_at
      });

      // Buscar dados completos da reserva criada
      const fullReservation = await query(`
        SELECT 
          r.*,
          u.name as user_name,
          u.email as user_email,
          rm.name as room_name,
          rm.location as room_location
        FROM reservations r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN rooms rm ON r.room_id = rm.id
        WHERE r.id = $1
      `, [newReservation.id]);

      return res.status(201).json({
        success: true,
        message: initialStatus === 'approved' 
          ? 'Reserva criada e aprovada automaticamente'
          : 'Reserva criada e enviada para aprovação',
        reservation: fullReservation.rows[0]
      });

    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}

// Usuários autenticados podem ver e criar reservas
export default authMiddleware(withAuditLog('reservations')(handler));
