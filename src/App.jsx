import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Rooms from "./pages/admin/Rooms";
import CalendarioGeral from "./pages/admin/CalendarioGeral";
import CalendarioGeralCoordenador from "./pages/coordenador/CalendarioGeral";
import DashboardCoordenador from "./pages/coordenador/DashboardCoordenador";
import NewReservation from "./pages/admin/NewReservation";
import NewReservationCoordenador from "./pages/coordenador/NewReservation";
import ApproveReservations from "./pages/admin/ApproveReservations";
import AprovarContas from "./pages/admin/AprovarContas";
import Logs from "./pages/admin/Logs";
import ProjetosAdmin from "./pages/admin/Projetos";
import CadastrarAlunosAdmin from "./pages/admin/CadastrarAlunos";
import ReservasPortaria from "./pages/portaria/ReservasPortaria";
import MinhasReservas from "./pages/professor/MinhasReservas";
import NovaReserva from "./pages/professor/NovaReserva";
import Projetos from "./pages/professor/Projetos";
import AprovarReservas from "./pages/professor/AprovarReservas";
import HistoricoProfessor from "./pages/professor/HistoricoProfessor";
import DetalhesHistoricoProfessor from "./pages/professor/DetalhesHistorico";
import PerfilProfessor from "./pages/professor/PerfilProfessor";
import ProjetosAluno from "./pages/aluno/ProjetosAluno";
import ReservasAluno from "./pages/aluno/ReservasAluno";
import NovaReservaAluno from "./pages/aluno/NovaReservaAluno";
import HistoricoAluno from "./pages/aluno/HistoricoAluno";
import PerfilAluno from "./pages/aluno/PerfilAluno";
import DetalhesReservaAluno from "./pages/aluno/DetalhesReserva";
import DetalhesHistoricoAluno from "./pages/aluno/DetalhesHistorico";
import SmartRedirect from "./components/SmartRedirect";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota pública para autenticação */}
          <Route path="/login" element={<AuthPage />} />

          {/* Rota protegida para dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para dashboard do admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para gerenciar usuários (apenas admin) */}
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para gerenciar salas (apenas admin) */}
          <Route
            path="/admin/salas"
            element={
              <ProtectedRoute>
                <Rooms />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para calendário geral (admin) */}
          <Route
            path="/admin/calendario-geral"
            element={
              <ProtectedRoute>
                <CalendarioGeral />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para nova reserva (admin) */}
          <Route
            path="/admin/nova-reserva"
            element={
              <ProtectedRoute>
                <NewReservation />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para aprovar reservas (admin) */}
          <Route
            path="/admin/aprovar-reservas"
            element={
              <ProtectedRoute>
                <ApproveReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/aprovar-contas"
            element={
              <ProtectedRoute>
                <AprovarContas />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para logs de auditoria (apenas admin) */}
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para projetos do admin */}
          <Route
            path="/admin/projetos"
            element={
              <ProtectedRoute>
                <ProjetosAdmin />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para cadastrar alunos (admin) */}
          <Route
            path="/admin/cadastrar-alunos"
            element={
              <ProtectedRoute>
                <CadastrarAlunosAdmin />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para dashboard do coordenador */}
          <Route
            path="/coordenador/dashboard"
            element={
              <ProtectedRoute>
                <DashboardCoordenador />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para calendário geral (coordenador) */}
          <Route
            path="/coordenador/calendario-geral"
            element={
              <ProtectedRoute>
                <CalendarioGeralCoordenador />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para nova reserva (coordenador) */}
          <Route
            path="/coordenador/nova-reserva"
            element={
              <ProtectedRoute>
                <NewReservationCoordenador />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para visualizar reservas (portaria) */}
          <Route
            path="/portaria/reservas"
            element={
              <ProtectedRoute>
                <ReservasPortaria />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas para professor */}

          <Route
            path="/professor/minhas-reservas"
            element={
              <ProtectedRoute>
                <MinhasReservas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professor/nova-reserva"
            element={
              <ProtectedRoute>
                <NovaReserva />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professor/projetos"
            element={
              <ProtectedRoute>
                <Projetos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professor/aprovar-reservas"
            element={
              <ProtectedRoute>
                <AprovarReservas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professor/historico"
            element={
              <ProtectedRoute>
                <HistoricoProfessor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professor/historico/:id"
            element={
              <ProtectedRoute>
                <DetalhesHistoricoProfessor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/professor/perfil"
            element={
              <ProtectedRoute>
                <PerfilProfessor />
              </ProtectedRoute>
            }
          />


          {/* Rotas do Aluno */}
          <Route
            path="/aluno/projetos"
            element={
              <ProtectedRoute>
                <ProjetosAluno />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aluno/reservas"
            element={
              <ProtectedRoute>
                <ReservasAluno />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aluno/reservas/:id"
            element={
              <ProtectedRoute>
                <DetalhesReservaAluno />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aluno/nova-reserva"
            element={
              <ProtectedRoute>
                <NovaReservaAluno />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aluno/historico"
            element={
              <ProtectedRoute>
                <HistoricoAluno />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aluno/historico/:id"
            element={
              <ProtectedRoute>
                <DetalhesHistoricoAluno />
              </ProtectedRoute>
            }
          />

          <Route
            path="/aluno/perfil"
            element={
              <ProtectedRoute>
                <PerfilAluno />
              </ProtectedRoute>
            }
          />

          {/* Redirecionar rota raiz para dashboard correto */}
          <Route path="/" element={<SmartRedirect />} />

          {/* Redirecionar rotas não encontradas para dashboard correto */}
          <Route path="*" element={<SmartRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
