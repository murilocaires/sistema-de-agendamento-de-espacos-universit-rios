// Simulação de um banco de dados local usando localStorage
// Em produção, isso seria substituído por chamadas para uma API real

const DB_KEY = "users_db";

// Inicializar banco de dados se não existir
const initializeDB = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify([]));
  }
};

// Buscar todos os usuários
export const getUsers = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem(DB_KEY) || "[]");
};

// Buscar usuário por email
export const getUserByEmail = (email) => {
  const users = getUsers();
  return users.find((user) => user.email === email);
};

// Buscar usuário por SIAPE
export const getUserBySiape = (siape) => {
  const users = getUsers();
  return users.find((user) => user.siape === siape);
};

// Cadastrar novo usuário
export const registerUser = async (userData) => {
  try {
    // Validar se o email já existe
    const existingUser = getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email já cadastrado");
    }

    // Validar se o SIAPE já existe
    const existingSiape = getUserBySiape(userData.siape);
    if (existingSiape) {
      throw new Error("SIAPE já cadastrado");
    }

    // Validar senha
    if (userData.password.length < 6) {
      throw new Error("Senha deve ter no mínimo 6 caracteres");
    }

    // Criar novo usuário
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      siape: userData.siape,
      password: userData.password, // Em produção, isso seria criptografado
      role: "professor", // Todos os usuários são professores/coordenadores
      createdAt: new Date().toISOString(),
    };

    // Salvar no banco de dados
    const users = getUsers();
    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));

    // Retornar dados do usuário (sem senha)
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// Autenticar usuário
export const authenticateUser = async (email, password) => {
  try {
    const user = getUserByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    if (user.password !== password) {
      throw new Error("Senha incorreta");
    }

    // Retornar dados do usuário (sem senha)
    const { password: userPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// Buscar usuário por ID
export const getUserById = (id) => {
  const users = getUsers();
  const user = users.find((user) => user.id === id);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};
