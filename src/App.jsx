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
import NewReservation from "./pages/admin/NewReservation";
import NovaReservaAdmin from "./pages/admin/NovaReservaAdmin";
import NewReservationCoordenador from "./pages/coordenador/NewReservation";
import ApproveReservations from "./pages/admin/ApproveReservations";
import AprovarContas from "./pages/admin/AprovarContas";
import Logs from "./pages/admin/Logs";
import ProjetosAdmin from "./pages/admin/Projetos";
import CadastrarAlunosAdmin from "./pages/admin/CadastrarAlunos";
import HistoricoAdmin from "./pages/admin/HistoricoAdmin";
import ReservasPortaria from "./pages/portaria/ReservasPortaria";
import MinhasReservasServidor from "./pages/servidor/MinhasReservas";
import NovaReservaServidor from "./pages/servidor/NovaReserva";
import ProjetosServidor from "./pages/servidor/Projetos";
import ConfiguracoesServidor from "./pages/servidor/Configuracoes";
import HistoricoServidor from "./pages/servidor/HistoricoServidor";
import DetalhesReservaServidor from "./pages/servidor/DetalhesReserva";
import DetalhesHistoricoServidor from "./pages/servidor/DetalhesHistorico";
import ProjetosAluno from "./pages/aluno/ProjetosAluno";
import ReservasAluno from "./pages/aluno/ReservasAluno";
import NovaReservaAluno from "./pages/aluno/NovaReservaAluno";
import PerfilAluno from "./pages/aluno/PerfilAluno";
import DetalhesReservaAluno from "./pages/aluno/DetalhesReserva";
import HistoricoAluno from "./pages/aluno/HistoricoAluno";
import DetalhesHistorico from "./pages/aluno/DetalhesHistorico";
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

          {/* Rota protegida para nova reserva moderna (admin) */}
          <Route
            path="/admin/nova-reserva-v2"
            element={
              <ProtectedRoute>
                <NovaReservaAdmin />
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

          {/* Rota protegida para histórico (admin) */}
          <Route
            path="/admin/historico"
            element={
              <ProtectedRoute>
                <HistoricoAdmin />
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

          {/* Rotas protegidas para servidor */}

          <Route
            path="/servidor/minhas-reservas"
            element={
              <ProtectedRoute>
                <MinhasReservasServidor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/servidor/nova-reserva"
            element={
              <ProtectedRoute>
                <NovaReservaServidor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/servidor/projetos"
            element={
              <ProtectedRoute>
                <ProjetosServidor />
              </ProtectedRoute>
            }
          />


          <Route
            path="/servidor/configuracoes"
            element={
              <ProtectedRoute>
                <ConfiguracoesServidor />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para histórico (servidor) */}
          <Route
            path="/servidor/historico"
            element={
              <ProtectedRoute>
                <HistoricoServidor />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para detalhes da reserva (servidor) */}
          <Route
            path="/servidor/reservas/:id"
            element={
              <ProtectedRoute>
                <DetalhesReservaServidor />
              </ProtectedRoute>
            }
          />

          {/* Rota protegida para detalhes do histórico (servidor) */}
          <Route
            path="/servidor/historico/:id"
            element={
              <ProtectedRoute>
                <DetalhesHistoricoServidor />
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
            path="/aluno/nova-reserva"
            element={
              <ProtectedRoute>
                <NovaReservaAluno />
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
                <DetalhesHistorico />
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
