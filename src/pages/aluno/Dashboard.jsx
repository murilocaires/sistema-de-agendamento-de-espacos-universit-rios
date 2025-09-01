import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

/**
 * Dashboard do Aluno
 * Página principal para estudantes do sistema
 */
const DashboardAluno = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard do Aluno
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, {user?.nome}</span>
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="w-auto px-4 py-2"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Área do Estudante
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card de Estatísticas */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Minhas Reservas
                </h3>
                <p className="text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-green-700">Reservas ativas</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Salas Disponíveis
                </h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-blue-700">Para reserva</p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Próxima Reserva
                </h3>
                <p className="text-3xl font-bold text-yellow-600">-</p>
                <p className="text-sm text-yellow-700">Nenhuma agendada</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Funcionalidades Disponíveis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Nova Reserva
                  </h4>
                  <p className="text-sm text-gray-600">
                    Reservar salas para estudos ou atividades acadêmicas
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Minhas Reservas
                  </h4>
                  <p className="text-sm text-gray-600">
                    Visualizar e gerenciar suas reservas ativas
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Histórico</h4>
                  <p className="text-sm text-gray-600">
                    Ver histórico de reservas anteriores
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Perfil</h4>
                  <p className="text-sm text-gray-600">
                    Atualizar informações pessoais
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Informações Importantes
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • As reservas podem ser feitas com até 7 dias de antecedência
                </li>
                <li>• Máximo de 4 horas por reserva</li>
                <li>
                  • Cancelamentos devem ser feitos com 24h de antecedência
                </li>
                <li>
                  • Em caso de dúvidas, entre em contato com a coordenação
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAluno;
