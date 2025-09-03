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
import NewReservation from "./pages/admin/NewReservation";
import ApproveReservations from "./pages/admin/ApproveReservations";
import Logs from "./pages/admin/Logs";

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

          {/* Rota protegida para logs de auditoria (apenas admin) */}
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <Logs />
              </ProtectedRoute>
            }
          />

          {/* Redirecionar rota raiz para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Redirecionar rotas não encontradas para dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
