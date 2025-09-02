import {
  LayoutDashboard,
  ClipboardList,
  Users,
  DoorClosed,
  Calendar,
  Settings,
  BarChart3,
  BookOpen,
  Clock,
  CheckCircle,
} from "lucide-react";

// Menu do Administrador
export const adminMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "reservas", label: "Reservas", icon: ClipboardList },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "salas", label: "Salas", icon: DoorClosed },
];

// Menu do Docente
export const docenteMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "minhas-reservas", label: "Minhas Reservas", icon: ClipboardList },
  { id: "nova-reserva", label: "Nova Reserva", icon: Calendar },
  { id: "historico", label: "Histórico", icon: Clock },
  { id: "perfil", label: "Meu Perfil", icon: Users },
];

// Menu do Servidor
export const servidorMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "minhas-reservas", label: "Minhas Reservas", icon: ClipboardList },
  { id: "nova-reserva", label: "Nova Reserva", icon: Calendar },
  { id: "historico", label: "Histórico", icon: Clock },
  { id: "perfil", label: "Meu Perfil", icon: Users },
];

// Menu do Coordenador
export const coordenadorMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "reservas", label: "Reservas", icon: ClipboardList },
  { id: "professores", label: "Professores", icon: Users },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
];

// Menu do Aluno
export const alunoMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "reservas", label: "Minhas Reservas", icon: ClipboardList },
  { id: "nova-reserva", label: "Nova Reserva", icon: Calendar },
  { id: "historico", label: "Histórico", icon: Clock },
  { id: "perfil", label: "Meu Perfil", icon: Users },
];

// Menu da Portaria
export const portariaMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "reservas", label: "Reservas", icon: ClipboardList },
  { id: "confirmacoes", label: "Confirmações", icon: CheckCircle },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
];

// Menu da Direção
export const direcaoMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "reservas", label: "Reservas", icon: ClipboardList },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

// Função para obter o menu baseado no tipo de usuário
export const getUserMenu = (userType) => {
  switch (userType.toLowerCase()) {
    case "admin":
      return adminMenu;
    case "docente":
      return docenteMenu;
    case "servidor":
      return servidorMenu;
    case "coordenador":
      return coordenadorMenu;
    case "aluno":
      return alunoMenu;
    case "portaria":
      return portariaMenu;
    case "direcao":
      return direcaoMenu;
    default:
      return adminMenu;
  }
};

// Função para obter o tipo de usuário formatado
export const getUserTypeDisplay = (userType) => {
  switch (userType.toLowerCase()) {
    case "admin":
      return "ADMIN";
    case "docente":
      return "DOCENTE";
    case "servidor":
      return "SERVIDOR";
    case "coordenador":
      return "COORDENADOR";
    case "aluno":
      return "ALUNO";
    case "portaria":
      return "PORTARIA";
    case "direcao":
      return "DIREÇÃO";
    default:
      return "ADMIN";
  }
};
