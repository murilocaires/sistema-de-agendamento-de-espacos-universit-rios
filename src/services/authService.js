// Simulação de um banco de dados local usando localStorage
// Em produção, isso seria substituído por chamadas para uma API real

const DB_KEY = "users_db";

// Inicializar banco de dados se não existir
const initializeDB = () => {
  if (!localStorage.getItem(DB_KEY)) {
    // Criar usuários padrão para diferentes tipos
    const defaultUsers = [
      {
        id: "admin-001",
        name: "Administrador",
        email: "admin@siru.com",
        siape: "000000",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "professor-001",
        name: "João Silva",
        email: "joao.silva@universidade.edu",
        siape: "123456",
        password: "professor123",
        role: "professor",
        createdAt: new Date().toISOString(),
      },
      {
        id: "coordenador-001",
        name: "Maria Santos",
        email: "maria.santos@universidade.edu",
        siape: "654321",
        password: "coordenador123",
        role: "coordenador",
        createdAt: new Date().toISOString(),
      },
      {
        id: "aluno-001",
        name: "Pedro Costa",
        email: "pedro.costa@aluno.universidade.edu",
        siape: "111111",
        password: "aluno123",
        role: "aluno",
        createdAt: new Date().toISOString(),
      },
      {
        id: "portaria-001",
        name: "Ana Oliveira",
        email: "ana.oliveira@universidade.edu",
        siape: "222222",
        password: "portaria123",
        role: "portaria",
        createdAt: new Date().toISOString(),
      },
      {
        id: "direcao-001",
        name: "Carlos Ferreira",
        email: "carlos.ferreira@universidade.edu",
        siape: "333333",
        password: "direcao123",
        role: "direcao",
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(DB_KEY, JSON.stringify(defaultUsers));
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
      role: userData.role || "docente", // Usar o role fornecido ou padrão
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

// Resetar banco de dados (para desenvolvimento)
export const resetDatabase = () => {
  localStorage.removeItem(DB_KEY);
  initializeDB();
  console.log("Banco de dados resetado com sucesso!");
  return getUsers();
};

// Verificar se os usuários existem
export const checkUsers = () => {
  const users = getUsers();
  console.log("Usuários no banco:", users);
  return users;
};
