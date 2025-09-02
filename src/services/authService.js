// Configuração da API Backend
const API_BASE_URL = 'http://localhost:3001/api';

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
    const response = await apiRequest('/auth/register', {
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
    const response = await apiRequest('/auth/login', {
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
