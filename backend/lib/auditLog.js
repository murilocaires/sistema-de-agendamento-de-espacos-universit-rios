import { query } from './database.js';

// Função para registrar log de auditoria
export const createAuditLog = async ({
  tableName,
  recordId,
  action,
  oldValues = null,
  newValues = null,
  userId = null,
  userEmail = null,
  userName = null,
  userRole = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    await query(`
      INSERT INTO audit_logs (
        table_name, record_id, action, old_values, new_values,
        user_id, user_email, user_name, user_role, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      tableName,
      recordId,
      action,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      userId,
      userEmail,
      userName,
      userRole,
      ipAddress,
      userAgent
    ]);
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
    // Não propagar o erro para não quebrar a operação principal
  }
};

// Middleware para capturar informações da requisição
export const withAuditLog = (tableName) => {
  return (handler) => {
    return async (req, res) => {
      // Capturar informações da requisição
      const auditInfo = {
        userId: req.user?.userId || null,
        userEmail: req.user?.email || null,
        userName: req.user?.name || null,
        userRole: req.user?.role || null,
        ipAddress: req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null),
        userAgent: req.headers['user-agent'] || null
      };

      // Adicionar informações de auditoria à requisição
      req.auditInfo = auditInfo;
      req.auditTable = tableName;

      return handler(req, res);
    };
  };
};

// Função para registrar log de criação
export const logCreate = async (req, tableName, recordId, newValues) => {
  await createAuditLog({
    tableName,
    recordId,
    action: 'CREATE',
    newValues,
    ...req.auditInfo
  });
};

// Função para registrar log de atualização
export const logUpdate = async (req, tableName, recordId, oldValues, newValues) => {
  await createAuditLog({
    tableName,
    recordId,
    action: 'UPDATE',
    oldValues,
    newValues,
    ...req.auditInfo
  });
};

// Função para registrar log de exclusão
export const logDelete = async (req, tableName, recordId, oldValues) => {
  await createAuditLog({
    tableName,
    recordId,
    action: 'DELETE',
    oldValues,
    ...req.auditInfo
  });
};

// Função para registrar login
export const logLogin = async (userInfo, ipAddress, userAgent, success = true) => {
  await createAuditLog({
    tableName: 'auth',
    recordId: userInfo.id || 0,
    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    newValues: {
      email: userInfo.email,
      name: userInfo.name,
      role: userInfo.role,
      timestamp: new Date().toISOString()
    },
    userId: success ? userInfo.id : null,
    userEmail: userInfo.email,
    userName: userInfo.name,
    userRole: userInfo.role,
    ipAddress,
    userAgent
  });
};

// Função para registrar logout
export const logLogout = async (userInfo, ipAddress, userAgent) => {
  await createAuditLog({
    tableName: 'auth',
    recordId: userInfo.id,
    action: 'LOGOUT',
    oldValues: {
      email: userInfo.email,
      name: userInfo.name,
      role: userInfo.role,
      timestamp: new Date().toISOString()
    },
    userId: userInfo.id,
    userEmail: userInfo.email,
    userName: userInfo.name,
    userRole: userInfo.role,
    ipAddress,
    userAgent
  });
};
