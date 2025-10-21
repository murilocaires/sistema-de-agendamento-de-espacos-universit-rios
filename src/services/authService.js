// Configuração da API Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Função para fazer requisições HTTP
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
};

// Função para fazer requisições HTTP sem autenticação
const apiRequestNoAuth = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
};

// Buscar todos os usuários
export const getUsers = async () => {
  try {
    const response = await apiRequest('/users');
    return response.users;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

// Inicializar banco de dados
export const initializeDatabase = async () => {
  try {
    const response = await apiRequest('/init', {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    throw error;
  }
};

// Cadastrar novo usuário
export const registerUser = async (userData) => {
  try {
    const response = await apiRequestNoAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Salvar token e dados do usuário no localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response.user;
  } catch (error) {
    console.error('Erro no cadastro:', error);
    throw error;
  }
};

// Autenticar usuário
export const authenticateUser = async (email, password) => {
  try {
    const response = await apiRequestNoAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Salvar token e dados do usuário no localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response.user;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    throw error;
  }
};

// Fluxo: Esqueci a senha - enviar código
export const sendForgotPasswordCode = async (email) => {
  try {
    const response = await apiRequestNoAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao enviar código de recuperação:', error);
    throw error;
  }
};

// Fluxo: Verificar código
export const verifyResetCode = async (email, code) => {
  try {
    const response = await apiRequestNoAuth('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    throw error;
  }
};

// Fluxo: Confirmar redefinição (altera senha e já loga)
export const confirmResetPassword = async (email, code, newPassword) => {
  try {
    const response = await apiRequestNoAuth('/auth/confirm-reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });

    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
    }

    return response.user;
  } catch (error) {
    console.error('Erro ao confirmar redefinição de senha:', error);
    throw error;
  }
};

// Verificar token de autenticação
export const verifyToken = async () => {
  try {
    const response = await apiRequest('/auth/verify');
    return response.user;
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    // Limpar dados locais se o token for inválido
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    throw error;
  }
};

// Resetar banco de dados (para desenvolvimento)
export const resetDatabase = async () => {
  try {
    const response = await initializeDatabase();
    console.log("Banco de dados resetado com sucesso!");
    return response;
  } catch (error) {
    console.error('Erro ao resetar banco:', error);
    throw error;
  }
};

// Verificar se os usuários existem
export const checkUsers = async () => {
  try {
    const users = await getUsers();
    console.log("Usuários no banco:", users);
    return users;
  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
    throw error;
  }
};

// Criar novo usuário (apenas admin)
export const createUser = async (userData) => {
  try {
    const response = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.user;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

// Atualizar usuário (apenas admin)
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response.user;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

// Deletar usuário (apenas admin)
export const deleteUser = async (userId) => {
  try {
    const response = await apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
};

// Buscar usuário por ID
export const getUserById = async (userId) => {
  try {
    const response = await apiRequest(`/users/${userId}`);
    return response.user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

// === FUNÇÕES DE SALAS ===

// Buscar todas as salas
export const getRooms = async () => {
  try {
    const response = await apiRequest('/rooms');
    return response.rooms;
  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    throw error;
  }
};

// Criar nova sala
export const createRoom = async (roomData) => {
  try {
    const response = await apiRequest('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
    return response.room;
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    throw error;
  }
};

// Atualizar sala
export const updateRoom = async (roomId, roomData) => {
  try {
    const response = await apiRequest(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
    return response.room;
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    throw error;
  }
};

// Deletar sala (soft delete)
export const deleteRoom = async (roomId) => {
  try {
    const response = await apiRequest(`/rooms/${roomId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Erro ao deletar sala:', error);
    throw error;
  }
};

// Buscar sala por ID
export const getRoomById = async (roomId) => {
  try {
    const response = await apiRequest(`/rooms/${roomId}`);
    return response.room;
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    throw error;
  }
};

// === FUNÇÕES DE RESERVAS ===

// Buscar todas as reservas
export const getReservations = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await apiRequest(`/reservations?${params}`);
    return response.reservations;
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    throw error;
  }
};

// Criar nova reserva
export const createReservation = async (reservationData) => {
  try {
    const response = await apiRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
    return response.reservation;
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    throw error;
  }
};

// Atualizar reserva
export const updateReservation = async (reservationId, reservationData) => {
  try {
    const response = await apiRequest(`/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify(reservationData),
    });
    return response.reservation;
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    throw error;
  }
};

// Deletar reserva
export const deleteReservation = async (reservationId) => {
  try {
    const response = await apiRequest(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Erro ao deletar reserva:', error);
    throw error;
  }
};

// Buscar reserva por ID
export const getReservationById = async (reservationId) => {
  try {
    const response = await apiRequest(`/reservations/${reservationId}`);
    return response.reservation;
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    throw error;
  }
};

// Buscar reservas pendentes para aprovação
export const getPendingReservations = async () => {
  try {
    const response = await apiRequest('/reservations/pending');
    return response.pending_reservations;
  } catch (error) {
    console.error('Erro ao buscar reservas pendentes:', error);
    throw error;
  }
};

// Aprovar ou rejeitar reserva
export const approveReservation = async (reservationId, action, rejectionReason = null) => {
  try {
    const response = await apiRequest('/reservations/approve', {
      method: 'POST',
      body: JSON.stringify({
        reservation_id: reservationId,
        action,
        rejection_reason: rejectionReason
      }),
    });
    return response; // Retornar resposta completa com message e reservation
  } catch (error) {
    console.error('Erro ao aprovar/rejeitar reserva:', error);
    throw error;
  }
};

// ===== FUNÇÕES DE PROJETOS =====

// Buscar projetos
export const getProjects = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.professor_id) queryParams.append('professor_id', filters.professor_id);

    const queryString = queryParams.toString();
    const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(endpoint);
    return response.projects;
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
};

// Criar projeto
export const createProject = async (projectData) => {
  try {
    const response = await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response.project;
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    throw error;
  }
};

// Excluir projeto
export const deleteProject = async (projectId) => {
  try {
    const response = await apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    throw error;
  }
};

// Buscar alunos disponíveis
export const getAvailableStudents = async (projectId, search = '') => {
  try {
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.append('project_id', projectId);
    if (search) queryParams.append('search', search);

    const queryString = queryParams.toString();
    const endpoint = `/students/available${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(endpoint);
    return response.students;
  } catch (error) {
    console.error('Erro ao buscar alunos disponíveis:', error);
    throw error;
  }
};

// Buscar alunos cadastrados pelo professor
export const getMyStudents = async (search = '', unassignedOnly = false) => {
  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (unassignedOnly) queryParams.append('unassigned_only', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/students/my-students${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(endpoint);
    return response.students;
  } catch (error) {
    console.error('Erro ao buscar meus alunos:', error);
    throw error;
  }
};

// Buscar alunos de um projeto
export const getProjectStudents = async (projectId) => {
  try {
    const response = await apiRequest(`/projects/${projectId}/students`);
    return response.students;
  } catch (error) {
    console.error('Erro ao buscar alunos do projeto:', error);
    throw error;
  }
};

// Adicionar aluno ao projeto
export const addStudentToProject = async (projectId, studentId) => {
  try {
    const response = await apiRequest(`/projects/${projectId}/students`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    });
    return response.project_student;
  } catch (error) {
    console.error('Erro ao adicionar aluno ao projeto:', error);
    throw error;
  }
};

// Remover aluno do projeto
export const removeStudentFromProject = async (projectId, studentId) => {
  try {
    const response = await apiRequest(`/projects/${projectId}/students`, {
      method: 'DELETE',
      body: JSON.stringify({ student_id: studentId }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao remover aluno do projeto:', error);
    throw error;
  }
};

// ===== FUNÇÕES DE ALUNOS =====

// Cadastrar aluno
export const createStudent = async (studentData) => {
  try {
    const response = await apiRequest('/students/create', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    return response;
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    throw error;
  }
};

// Redefinir senha (primeiro acesso)
export const resetPassword = async (passwordData) => {
  try {
    const response = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
    return response;
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    throw error;
  }
};

// ===== FUNÇÕES DE APROVAÇÃO DE CONTAS =====

// Buscar usuários pendentes de aprovação
export const getPendingUsers = async () => {
  try {
    const response = await apiRequest('/users/pending');
    return response.users;
  } catch (error) {
    console.error('Erro ao buscar usuários pendentes:', error);
    throw error;
  }
};

// Aprovar ou rejeitar usuário
export const approveUser = async (userId, action) => {
  try {
    const response = await apiRequest('/users/approve', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, action }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao processar aprovação:', error);
    throw error;
  }
};

// ===== FUNÇÕES DE PROJETOS PARA ALUNOS =====

// Buscar projetos disponíveis para alunos
export const getAvailableProjects = async () => {
  try {
    const response = await apiRequest('/projects/available');
    return response.projects;
  } catch (error) {
    console.error('Erro ao buscar projetos disponíveis:', error);
    throw error;
  }
};

// Buscar projetos que o aluno está participando
export const getMyProjects = async () => {
  try {
    const response = await apiRequest('/projects/my-projects');
    return response.projects || [];
  } catch (error) {
    console.error('Erro ao buscar meus projetos:', error);
    throw error;
  }
};

// Solicitar entrada em projeto
export const requestProjectAccess = async (projectData) => {
  try {
    const response = await apiRequest('/projects/requests', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    return response;
  } catch (error) {
    console.error('Erro ao solicitar acesso ao projeto:', error);
    throw error;
  }
};

// Buscar solicitações de projeto do aluno
export const getMyProjectRequests = async () => {
  try {
    const response = await apiRequest('/projects/requests?student_id=me');
    return response.requests;
  } catch (error) {
    console.error('Erro ao buscar minhas solicitações:', error);
    throw error;
  }
};

// ===== FUNÇÕES DE NOTIFICAÇÕES PARA PROFESSORES =====

// Buscar notificações de solicitações de projeto
export const getProjectRequestNotifications = async (status = 'pending') => {
  try {
    const response = await apiRequest(`/notifications/project-requests?status=${status}`);
    return response.requests;
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
};

// Buscar notificações de reservas pendentes para professores
export const getReservationNotifications = async () => {
  try {
    const response = await apiRequest('/notifications/reservations');
    return response.reservations || [];
  } catch (error) {
    console.error('Erro ao buscar notificações de reservas:', error);
    throw error;
  }
};

// Aprovar ou rejeitar reserva
export const processReservation = async (reservationId, action, rejectionReason = null) => {
  try {
    const response = await apiRequest('/reservations/approve', {
      method: 'POST',
      body: JSON.stringify({ 
        reservation_id: reservationId, 
        action: action,
        rejection_reason: rejectionReason
      }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao processar reserva:', error);
    throw error;
  }
};

// Buscar notificações de reservas para admin (aprovadas pelo professor)
export const getAdminReservationNotifications = async () => {
  try {
    const response = await apiRequest('/notifications/admin-reservations');
    return response.reservations || [];
  } catch (error) {
    console.error('Erro ao buscar notificações de reservas para admin:', error);
    throw error;
  }
};

// Processar solicitação de projeto (aprovar/rejeitar)
export const processProjectRequest = async (requestId, action) => {
  try {
    // Converter action para o formato esperado pelo backend
    const backendAction = action === 'approve' ? 'approved' : 'rejected';
    
    const response = await apiRequest('/projects/requests', {
      method: 'PUT',
      body: JSON.stringify({ request_id: requestId, action: backendAction }),
    });
    return response;
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    throw error;
  }
};
