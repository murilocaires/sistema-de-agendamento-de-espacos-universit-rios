import { query } from './database.js';
import { hashPassword } from './auth.js';

// Dados dos usuários padrão
const defaultUsers = [
  {
    name: 'Administrador',
    email: 'admin@siru.com',
    siape: '000000',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'João Silva',
    email: 'joao.silva@universidade.edu',
    siape: '123456',
    password: 'professor123',
    role: 'professor'
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@universidade.edu',
    siape: '654321',
    password: 'coordenador123',
    role: 'coordenador'
  },
  {
    name: 'Pedro Costa',
    email: 'pedro.costa@aluno.universidade.edu',
    siape: '111111',
    password: 'aluno123',
    role: 'aluno'
  },
  {
    name: 'Ana Oliveira',
    email: 'ana.oliveira@universidade.edu',
    siape: '222222',
    password: 'portaria123',
    role: 'portaria'
  },
  {
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@universidade.edu',
    siape: '333333',
    password: 'direcao123',
    role: 'direcao'
  },
  {
    name: 'Lucia Mendes',
    email: 'lucia.mendes@universidade.edu',
    siape: '444444',
    password: 'servidor123',
    role: 'servidor'
  }
];

// Dados das salas padrão
const defaultRooms = [
  {
    name: 'Auditório Principal',
    capacity: 200,
    equipment: ['projetor', 'som', 'microfone', 'ar-condicionado'],
    location: 'Bloco A - Térreo'
  },
  {
    name: 'Sala de Aula 101',
    capacity: 40,
    equipment: ['projetor', 'quadro-branco'],
    location: 'Bloco A - 1º Andar'
  },
  {
    name: 'Laboratório de Informática 1',
    capacity: 30,
    equipment: ['computadores', 'projetor', 'ar-condicionado'],
    location: 'Bloco B - 2º Andar'
  },
  {
    name: 'Sala de Reuniões',
    capacity: 12,
    equipment: ['tv', 'mesa-de-reunião', 'ar-condicionado'],
    location: 'Bloco A - 3º Andar'
  },
  {
    name: 'Sala de Videoconferência',
    capacity: 20,
    equipment: ['câmera', 'microfone', 'tv', 'sistema-videoconferência'],
    location: 'Bloco C - 1º Andar'
  }
];

// Função para popular o banco com dados iniciais
export const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Verificar se já existem usuários
    const existingUsers = await query('SELECT COUNT(*) FROM users');
    if (existingUsers.rows[0].count > 0) {
      console.log('✅ Usuários já existem no banco. Seed não necessário.');
      return;
    }

    // Inserir usuários padrão
    console.log('👥 Criando usuários padrão...');
    for (const user of defaultUsers) {
      const hashedPassword = await hashPassword(user.password);
      await query(
        `INSERT INTO users (name, email, siape, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        [user.name, user.email, user.siape, hashedPassword, user.role]
      );
      console.log(`   ✓ Usuário criado: ${user.name} (${user.role})`);
    }

    // Inserir salas padrão
    console.log('🏢 Criando salas padrão...');
    for (const room of defaultRooms) {
      await query(
        `INSERT INTO rooms (name, capacity, equipment, location) 
         VALUES ($1, $2, $3, $4)`,
        [room.name, room.capacity, room.equipment, room.location]
      );
      console.log(`   ✓ Sala criada: ${room.name}`);
    }

    console.log('🎉 Seed do banco de dados concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o seed do banco:', error);
    throw error;
  }
};
