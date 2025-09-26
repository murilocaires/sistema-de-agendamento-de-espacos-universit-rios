import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getReservations } from "../services/authService";
import {
  Calendar,
  Clock,
  MapPin,
  Users as UsersIcon,
  DoorClosed,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  ArrowLeft,
} from "lucide-react";

const DetalhesReserva = ({
  title = "Detalhes da Reserva",
  backPath = "/aluno/reservas",
  backLabel = "Voltar",
  Layout = null,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReservation();
  }, [id]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const data = await getReservations();
      const foundReservation = data.find((r) => r.id === parseInt(id));

      if (foundReservation) {
        setReservation(foundReservation);
      } else {
        setError("Reserva não encontrada");
      }
    } catch (error) {
      console.error("Erro ao carregar reserva:", error);
      setError("Erro ao carregar detalhes da reserva");
    } finally {
      setLoading(false);
    }
  };

  // Obter cor do status
  const getStatusBackground = (status) => {
    const backgrounds = {
      pending: "#6BB6FF",
      approved: "#D1FAE5",
      rejected: "#FFE4E1",
      changed: "#FFB366",
    };
    return backgrounds[status] || "#F3F4F6";
  };

  const getStatusTextColor = (status) => {
    const textColors = {
      pending: "#355EC5",
      approved: "#059669",
      rejected: "#D03E3E",
      changed: "#FF8C00",
    };
    return textColors[status] || "#6B7280";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pendente",
      approved: "Reservado",
      rejected: "Recusado",
      changed: "Alterado",
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} style={{ color: "#059669" }} />;
      case "pending":
        return <Clock size={16} style={{ color: "#355EC5" }} />;
      case "rejected":
        return <X size={16} style={{ color: "#D03E3E" }} />;
      case "changed":
        return <Edit size={16} style={{ color: "#FF8C00" }} />;
      default:
        return <Clock size={16} style={{ color: "#6B7280" }} />;
    }
  };

  // Verificar se reservation existe antes de renderizar o conteúdo
  if (!reservation) {
    return Layout ? (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const content = (
    <div
      className="px-6 md:px-16 mt-12 pb-6"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center mb-4"
          style={{
            color: "#535964",
            fontWeight: "bold",
          }}
        >
          <ArrowLeft size={20} className="mr-2" />
          {backLabel}
        </button>
        <h1
          className="font-bold"
          style={{
            fontFamily: "Lato, sans-serif",
            fontSize: "24px",
            lineHeight: "140%",
            letterSpacing: "0%",
            color: "#2E3DA3",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card - Reservation Details */}
        <div
          className="bg-white p-6 rounded-lg shadow-sm"
          style={{
            border: "1px solid #E3E5E8",
            borderRadius: "10px",
          }}
        >
          {/* Título e Status na mesma linha */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900">
                {reservation.title || "Sem título"}
              </p>
            </div>
            <div className="ml-4">
              <div
                className="inline-flex items-center px-3 py-1 rounded-full"
                style={{
                  backgroundColor: getStatusBackground(reservation.status),
                }}
              >
                {getStatusIcon(reservation.status)}
                <span
                  className="ml-2 text-sm font-semibold"
                  style={{ color: getStatusTextColor(reservation.status) }}
                >
                  {getStatusText(reservation.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-4">
            <span className="text-sm font-bold text-gray-500">Descrição</span>
            <p className="text-gray-900 mt-1">
              {reservation.description || "Nenhuma descrição fornecida."}
            </p>
          </div>

          {/* Local */}
          <div className="mb-4">
            <span className="text-sm font-bold text-gray-500">Local</span>
            <div className="mt-1 space-y-1">
              <div className="flex items-center">
                <DoorClosed size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {reservation.room_name || "Sala não informada"}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {reservation.room_location || "Local não informado"}
                </span>
              </div>
            </div>
          </div>

          {/* Horário */}
          <div className="mb-4">
            <span className="text-sm font-bold text-gray-500">Horário</span>
            <div className="mt-1 space-y-1">
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {reservation.date
                    ? new Date(reservation.date).toLocaleDateString("pt-BR")
                    : "Data não informada"}
                </span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {reservation.start_time && reservation.end_time
                    ? `${reservation.start_time} - ${reservation.end_time}`
                    : "Horário não informado"}
                </span>
              </div>
            </div>
          </div>

          {/* Tipo */}
          <div className="mb-4">
            <span className="text-sm font-bold text-gray-500">Tipo</span>
            <p className="text-gray-900 mt-1">
              {reservation.is_recurring ? "Recorrente" : "Não Recorrente"}
            </p>
          </div>

          {/* ID e Criado em */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-gray-500">
                ID da Reserva
              </span>
              <p className="text-lg font-semibold text-gray-900">
                #{reservation.id?.toString().padStart(4, "0") || "0000"}
              </p>
            </div>
            <div>
              <span className="text-sm font-bold text-gray-500">Criado em</span>
              <p className="text-gray-900 mt-1">
                {reservation.created_at
                  ? new Date(reservation.created_at).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "Data não disponível"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Card - People Details */}
        <div
          className="bg-white p-6 rounded-lg shadow-sm self-start"
          style={{
            border: "1px solid #E3E5E8",
            borderRadius: "10px",
          }}
        >
          <div className="mb-6">
            <span className="text-sm font-bold text-gray-500">Responsável</span>
            <div className="flex items-center mt-2">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {reservation.professor_name?.charAt(0)?.toUpperCase() ||
                      "P"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {reservation.professor_name || "Professor"}
                </p>
                <p className="text-sm text-gray-500">
                  {reservation.professor_email || "professor@universidade.edu"}
                </p>
              </div>
            </div>
          </div>

          {/* Solicitante */}
          <div className="mb-6">
            <span className="text-sm font-bold text-gray-500">Solicitante</span>
            <div className="flex items-center mt-2">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {reservation.user_name?.charAt(0)?.toUpperCase() ||
                      reservation.user_email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {reservation.user_name || "Usuário"}
                </p>
                <p className="text-sm text-gray-500">
                  {reservation.user_email || "Email não disponível"}
                </p>
              </div>
            </div>
          </div>

          {reservation.rejection_reason && (
            <div className="mb-4">
              <span className="text-sm font-bold text-gray-500">
                Motivo da Rejeição
              </span>
              <p className="text-red-600 mt-1">
                {reservation.rejection_reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return Layout ? (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !reservation) {
    return Layout ? (
      <Layout>
        <div
          className="px-16 mt-12 pb-6"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {error || "Reserva não encontrada"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              A reserva solicitada não foi encontrada ou não existe.
            </p>
            <button
              onClick={() => navigate(backPath)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar para {backLabel}
            </button>
          </div>
        </div>
      </Layout>
    ) : (
      <div className="px-16 mt-12 pb-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            {error || "Reserva não encontrada"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            A reserva solicitada não foi encontrada ou não existe.
          </p>
          <button
            onClick={() => navigate(backPath)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar para {backLabel}
          </button>
        </div>
      </div>
    );
  }

  return Layout ? <Layout>{content}</Layout> : content;
};

export default DetalhesReserva;
