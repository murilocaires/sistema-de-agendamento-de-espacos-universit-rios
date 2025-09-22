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
} from "lucide-react";

// Menu do Administrador
export const adminMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard, path: "/admin/dashboard" },
  { id: "calendario-geral", label: "Calendário Geral", icon: Calendar, path: "/admin/calendario-geral" },
  { id: "nova-reserva", label: "Nova Reserva", icon: CalendarPlus, path: "/admin/nova-reserva" },
  { id: "aprovar-reservas", label: "Aprovar Reservas", icon: CheckSquare, path: "/admin/aprovar-reservas" },
  { id: "usuarios", label: "Usuários", icon: Users, path: "/admin/usuarios" },
  { id: "salas", label: "Salas", icon: DoorClosed, path: "/admin/salas" },
  { id: "logs", label: "Logs", icon: FileText, path: "/admin/logs" },
];

// Menu do Docente
export const docenteMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "minhas-reservas", label: "Minhas Reservas", icon: ClipboardList, path: "/professor/reservas" },
  { id: "nova-reserva", label: "Nova Reserva", icon: Calendar, path: "/professor/nova-reserva" },
  { id: "historico", label: "Histórico", icon: Clock, path: "/professor/historico" },
  { id: "perfil", label: "Meu Perfil", icon: Users, path: "/professor/perfil" },
];

// Menu do Servidor
export const servidorMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "minhas-reservas", label: "Minhas Reservas", icon: ClipboardList, path: "/servidor/reservas" },
  { id: "nova-reserva", label: "Nova Reserva", icon: Calendar, path: "/servidor/nova-reserva" },
  { id: "historico", label: "Histórico", icon: Clock, path: "/servidor/historico" },
  { id: "perfil", label: "Meu Perfil", icon: Users, path: "/servidor/perfil" },
];

// Menu do Coordenador
export const coordenadorMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { id: "calendario-geral", label: "Calendário Geral", icon: Calendar, path: "/coordenador/calendario-geral" },
  { id: "nova-reserva", label: "Nova Reserva", icon: CalendarPlus, path: "/coordenador/nova-reserva" },
  { id: "reservas", label: "Reservas", icon: ClipboardList, path: "/coordenador/reservas" },
  { id: "professores", label: "Professores", icon: Users, path: "/coordenador/professores" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, path: "/coordenador/relatorios" },
];

// Menu do Aluno
export const alunoMenu = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "reservas", label: "Minhas Reservas", icon: ClipboardList, path: "/aluno/reservas" },
  { id: "nova-reserva", label: "Nova Reserva", icon: Calendar, path: "/aluno/nova-reserva" },
  { id: "historico", label: "Histórico", icon: Clock, path: "/aluno/historico" },
  { id: "perfil", label: "Meu Perfil", icon: Users, path: "/aluno/perfil" },
];

// Menu da Portaria
export const portariaMenu = [
  { id: "home", label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { id: "reservas", label: "Reservas", icon: ClipboardList, path: "/portaria/reservas" },
  { id: "relatorios", label: "Relatórios", icon: BarChart3, path: "/portaria/relatorios" },
];


// Função para obter o menu baseado no tipo de usuário
export const getUserMenu = (userType) => {
  switch (userType.toLowerCase()) {
    case "admin":
      return adminMenu;
    case "docente":
    case "professor":
      return docenteMenu;
    case "servidor":
      return servidorMenu;
    case "coordenador":
      return coordenadorMenu;
    case "aluno":
      return alunoMenu;
    case "portaria":
      return portariaMenu;
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
    case "professor":
      return "PROFESSOR";
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
