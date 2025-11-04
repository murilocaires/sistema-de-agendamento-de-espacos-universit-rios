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
  FileText,
  CalendarPlus,
  CheckSquare,
  FolderOpen,
  Bell,
} from "lucide-react";

// Menu do Administrador
export const adminMenu = [
  {
    id: "home",
    label: "Home",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "aprovar-contas",
    label: "Aprovar Contas",
    icon: Users,
    path: "/admin/aprovar-contas",
  },
  {
    id: "projetos",
    label: "Meus Projetos",
    icon: FolderOpen,
    path: "/admin/projetos",
  },
  {
    id: "cadastrar-alunos",
    label: "Cadastrar Alunos",
    icon: Users,
    path: "/admin/cadastrar-alunos",
  },
  {
    id: "calendario-geral",
    label: "Calendário Geral",
    icon: Calendar,
    path: "/admin/calendario-geral",
  },
  {
    id: "nova-reserva",
    label: "Nova Reserva",
    icon: CalendarPlus,
    path: "/admin/nova-reserva",
  },
  {
    id: "aprovar-reservas",
    label: "Aprovar Reservas",
    icon: CheckSquare,
    path: "/admin/aprovar-reservas",
  },
  { id: "usuarios", label: "Usuários", icon: Users, path: "/admin/usuarios" },
  { id: "salas", label: "Salas", icon: DoorClosed, path: "/admin/salas" },
  { id: "logs", label: "Logs", icon: FileText, path: "/admin/logs" },
  { id: "historico", label: "Histórico", icon: Clock, path: "/admin/historico" },
];

// Menu do Docente
export const docenteMenu = [
  {
    id: "minhas-reservas",
    label: "Minhas Reservas",
    icon: Calendar,
    path: "/servidor/minhas-reservas",
  },
  {
    id: "nova-reserva",
    label: "Nova Reserva",
    icon: CalendarPlus,
    path: "/servidor/nova-reserva",
  },
  {
    id: "projetos",
    label: "Meus Projetos",
    icon: FolderOpen,
    path: "/servidor/projetos",
  },
  {
    id: "historico",
    label: "Histórico",
    icon: Clock,
    path: "/servidor/historico",
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: Settings,
    path: "/servidor/configuracoes",
  },
];

// Menu do Servidor
export const servidorMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  {
    id: "minhas-reservas",
    label: "Minhas Reservas",
    icon: ClipboardList,
    path: "/servidor/reservas",
  },
  {
    id: "nova-reserva",
    label: "Nova Reserva",
    icon: Calendar,
    path: "/servidor/nova-reserva",
  },
  {
    id: "historico",
    label: "Histórico",
    icon: Clock,
    path: "/servidor/historico",
  },
  { id: "perfil", label: "Meu Perfil", icon: Users, path: "/servidor/perfil" },
];

// Menu do Coordenador
export const coordenadorMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  {
    id: "calendario-geral",
    label: "Calendário Geral",
    icon: Calendar,
    path: "/coordenador/calendario-geral",
  },
  {
    id: "nova-reserva",
    label: "Nova Reserva",
    icon: CalendarPlus,
    path: "/coordenador/nova-reserva",
  },
  {
    id: "reservas",
    label: "Reservas",
    icon: ClipboardList,
    path: "/coordenador/reservas",
  },
  {
    id: "professores",
    label: "Professores",
    icon: Users,
    path: "/coordenador/professores",
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: BarChart3,
    path: "/coordenador/relatorios",
  },
];

// Menu do Aluno
export const alunoMenu = [
  {
    id: "reservas",
    label: "Minhas Reservas",
    icon: ClipboardList,
    path: "/aluno/reservas",
  },
  {
    id: "nova-reserva",
    label: "Nova Reserva",
    icon: Calendar,
    path: "/aluno/nova-reserva",
  },
  {
    id: "projetos",
    label: "Projetos",
    icon: FolderOpen,
    path: "/aluno/projetos",
  },
  {
    id: "historico",
    label: "Histórico",
    icon: Clock,
    path: "/aluno/historico",
  },
  { id: "perfil", label: "Meu Perfil", icon: Users, path: "/aluno/perfil" },
];

// Menu da Portaria
export const portariaMenu = [
  {
    id: "reservas",
    label: "Reservas",
    icon: ClipboardList,
    path: "/portaria/reservas",
  },
];

// Cache para menus para evitar recriações
const menuCache = new Map();

// Função para obter o menu baseado no tipo de usuário
export const getUserMenu = (userType) => {
  const key = userType.toLowerCase();

  if (menuCache.has(key)) {
    return menuCache.get(key);
  }

  let menu;
  switch (key) {
    case "admin":
      menu = adminMenu;
      break;
    case "docente":
    case "professor":
    case "servidor":
      menu = docenteMenu;
      break;
    case "coordenador":
      menu = coordenadorMenu;
      break;
    case "aluno":
      menu = alunoMenu;
      break;
    case "portaria":
      menu = portariaMenu;
      break;
    default:
      menu = adminMenu;
  }

  // Cache o menu para evitar recriações
  menuCache.set(key, menu);
  return menu;
};

// Função para obter o tipo de usuário formatado
export const getUserTypeDisplay = (userType) => {
  switch (userType.toLowerCase()) {
    case "admin":
      return "ADMIN";
    case "docente":
    case "professor":
    case "servidor":
      return "SERVIDOR";
    case "coordenador":
      return "COORDENADOR";
    case "aluno":
      return "ALUNO";
    case "portaria":
      return "PORTARIA";
    default:
      return "ADMIN";
  }
};
