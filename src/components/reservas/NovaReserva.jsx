import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getRooms,
  createReservation,
  getReservations,
  getMyProjects,
  getProfessorProjects
} from "../../services/authService";
import { RefreshCw, Monitor, Wifi, AirVent } from "lucide-react";
import {
  isSameDate,
  isDateInPast,
  getBrazilNow,
  createBrazilDateTimeISO
} from "../../utils/dateUtils";
import ProjectSelector from "./ProjectSelector";
import FormFields from "./FormFields";
import RecurrenceFields from "./RecurrenceFields";
import MiniCalendar from "./MiniCalendar";
import AvailableRoomsGrid from "./AvailableRoomsGrid";
import SuccessModal from "./SuccessModal";
import ErrorMessage from "./ErrorMessage";
import SuccessToast from "./SuccessToast";

const NovaReserva = ({
  title = "Nova Reserva",
  userType = "student",
  showProjectSelection = true,
  onReservationCreated = null
}) => {
  const { user } = useAuth();

  // Estados
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isSearchingRooms, setIsSearchingRooms] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    project_id: "",
    project_text: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    people_count: "",
    is_recurring: false,
    recurrence_frequency: "daily",
    recurrence_end_date: "",
    room_resources: {
      projector: false,
      internet: false,
      air_conditioning: false
    }
  });

  // Estados para o dropdown de projetos
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchProjectText, setSearchProjectText] = useState("");

  const [errors, setErrors] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Estados do calendário
  const [currentDate, setCurrentDate] = useState(new Date());

  // Recursos da sala
  const roomResources = [
    { key: 'projector', label: 'Projetor', icon: Monitor },
    { key: 'internet', label: 'Internet', icon: Wifi },
    { key: 'air_conditioning', label: 'Ar Condicionado', icon: AirVent }
  ];

  // -------------------------------------------------------------
  // USEMEMOS CORRIGIDOS (Mapeamento de disponibilidade e salas)
  // -------------------------------------------------------------
  const reservationsByRoom = useMemo(() => {
    const map = {};
    reservations.forEach(res => {
      if (res.status !== "approved") return;
      if (!map[res.room_id]) map[res.room_id] = [];
      map[res.room_id].push(res);
    });
    return map;
  }, [reservations]);

  const handleSearchRooms = () => {
    if (!formData.date || !formData.start_time || !formData.end_time || !formData.people_count) {
      setError("Preencha data, horários e quantidade de participantes para buscar salas.");
      return;
    }

    setError("");
    setIsSearchingRooms(true);

    // Pequeno delay para dar o feedback visual de "buscando"
    setTimeout(() => {
      setSearchCriteria({
        date: formData.date,
        start: formData.start_time,
        end: formData.end_time,
        people: formData.people_count,
        recurring: formData.is_recurring,
        recurrenceEnd: formData.recurrence_end_date,
        recurrenceFreq: formData.recurrence_frequency,
        resources: formData.room_resources
      });
      setIsSearchingRooms(false);
    }, 600);
  };

  const availableRooms = useMemo(() => {
    if (!searchCriteria) return [];

    const {
      date,
      start,
      end,
      people,
      recurring,
      recurrenceEnd,
      resources
    } = searchCriteria;

    if (!date || !start || !end || !people || people <= 0) {
      return [];
    }

    if (recurring && !recurrenceEnd) {
      return [];
    }

    const requiredResources = Object.entries(resources)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    return rooms
      .filter(room => room.is_active)
      .filter(room => {
        if (recurring) {
          const isFixed = room.is_fixed_reservation === true || room.is_fixed_reservation === 1;
          if (isFixed) return false;
        }
        return true;
      })
      .filter(room => {
        if (requiredResources.length === 0) return true;

        const dbMap = {
          projector: "has_projector",
          internet: "has_internet",
          air_conditioning: "has_air_conditioning"
        };

        return requiredResources.every(resource => {
          const dbField = dbMap[resource];
          return (
            (room.resources && room.resources[resource] === true) ||
            room[dbField] === true ||
            room[dbField] === 1
          );
        });
      })
      .filter(room => {
        const roomReservations = reservationsByRoom[room.id] || [];

        return !roomReservations.some(res => {
          if (!isSameDate(date, res.date)) return false;
          return start < res.end_time && end > res.start_time;
        });
      });
  }, [rooms, reservationsByRoom, searchCriteria]);
  // -------------------------------------------------------------


  // Função para gerar dias recorrentes baseados no dia da semana
  const getRecurringDays = () => {
    if (!formData.is_recurring || !formData.date || !formData.recurrence_end_date) {
      return [];
    }

    const startDate = new Date(formData.date);
    const endDate = new Date(formData.recurrence_end_date);

    // Trava de segurança 1: não tentar calcular se a data final for menor
    if (endDate < startDate) {
      return [];
    }

    const startDayOfWeek = startDate.getDay();
    const recurringDays = [];

    let currentDate = new Date(startDate);
    let occurrencesCount = 0;
    const MAX_OCCURRENCES = 365; // Trava de segurança 2: máximo 1 ano de ocorrências diárias na UI

    while (currentDate <= endDate && occurrencesCount < MAX_OCCURRENCES) {
      if (formData.recurrence_frequency === 'daily') {
        recurringDays.push(currentDate.toISOString().split('T')[0]);
        occurrencesCount++;
      } else {
        if (currentDate.getDay() === startDayOfWeek) {
          recurringDays.push(currentDate.toISOString().split('T')[0]);
          occurrencesCount++;
        }
      }

      if (formData.recurrence_frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (formData.recurrence_frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (formData.recurrence_frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      }
    }

    return recurringDays;
  };

  // Função para expandir reservas recorrentes
  const expandRecurringReservations = (reservation) => {
    if (!reservation.is_recurring || !reservation.recurrence_end_date) {
      return [reservation];
    }

    const occurrences = [];
    const startDate = new Date(reservation.start_time);
    const endDate = new Date(reservation.recurrence_end_date);

    endDate.setHours(23, 59, 59, 999);

    const startHour = new Date(reservation.start_time).getHours();
    const startMinute = new Date(reservation.start_time).getMinutes();
    const endHour = new Date(reservation.end_time).getHours();
    const endMinute = new Date(reservation.end_time).getMinutes();

    let currentDate = new Date(startDate);
    let weekCount = 0;
    const maxWeeks = 52;

    while (currentDate <= endDate && weekCount < maxWeeks) {
      const occurrenceStart = new Date(currentDate);
      occurrenceStart.setHours(startHour, startMinute, 0, 0);

      const occurrenceEnd = new Date(currentDate);
      occurrenceEnd.setHours(endHour, endMinute, 0, 0);

      occurrences.push({
        ...reservation,
        id: `${reservation.id}_${currentDate.toISOString().split('T')[0]}`,
        date: currentDate.toISOString().split('T')[0],
        start_time: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
        end_time: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
        is_recurrence_instance: true,
        original_reservation_id: reservation.id
      });

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 7);
      weekCount++;
    }

    return occurrences.length > 0 ? occurrences : [reservation];
  };

  // Carregar dados iniciais
  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const getProjectsFunction = userType === 'professor' ? getProfessorProjects : getMyProjects;

      const [roomsData, reservationsData, projectsData] = await Promise.all([
        getRooms(),
        getReservations(),
        showProjectSelection ? getProjectsFunction() : Promise.resolve([])
      ]);

      let expandedReservations = [];
      (reservationsData || []).forEach(reservation => {
        const occurrences = expandRecurringReservations(reservation);
        expandedReservations.push(...occurrences);
      });

      const activeRooms = roomsData.filter(room => room.is_active);
      setRooms(activeRooms);
      setReservations(expandedReservations);
      setMyProjects(projectsData);
      setError("");
    } catch (err) {
      setError("Erro ao carregar dados: " + err.message);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadData(true);
    setSuccessMessage("Dados atualizados com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!searchProjectText.trim()) {
      setFilteredProjects(myProjects);
    } else {
      const filtered = myProjects.filter(project =>
        project.name.toLowerCase().includes(searchProjectText.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchProjectText, myProjects]);


  // Função para verificar se uma sala está disponível no horário selecionado (CORRIGIDA)
  const isRoomAvailable = (room) => {
    if (!formData.date || !formData.start_time || !formData.end_time) return false;

    if (formData.is_recurring && formData.recurrence_end_date) {
      const recurringDays = getRecurringDays();

      const allDaysAvailable = recurringDays.every(dateString => {
        const hasConflict = reservations.some(reservation => {
          if (reservation.status !== 'approved') return false;
          if (reservation.room_id !== room.id) return false;
          if (!isSameDate(dateString, reservation.date)) return false;

          const reservationStart = reservation.start_time;
          const reservationEnd = reservation.end_time;

          return (formData.start_time < reservationEnd && formData.end_time > reservationStart);
        });
        return !hasConflict;
      });
      return allDaysAvailable;
    }

    const hasConflict = reservations.some(reservation => {
      if (reservation.status !== 'approved') return false;
      if (reservation.room_id !== room.id) return false;
      if (!isSameDate(formData.date, reservation.date)) return false;

      const reservationStart = reservation.start_time;
      const reservationEnd = reservation.end_time;

      return (formData.start_time < reservationEnd && formData.end_time > reservationStart);
    });

    return !hasConflict;
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
  };

  const navigateCalendar = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateSelect = (dayString) => {
    setFormData(prev => ({ ...prev, date: dayString }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (value === '') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return;
    }

    const year = value.split('-')[0];
    const yearNum = parseInt(year);
    if (year.length !== 4 || isNaN(yearNum)) {
      setErrors(prev => ({
        ...prev,
        [name]: "Ano deve ter 4 dígitos"
      }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      let hasError = false;

      if (name === 'date') {
        if (isDateInPast(value)) {
          newErrors.date = "A data não pode ser anterior a hoje";
          hasError = true;
        } else {
          delete newErrors.date;
        }
      }

      if (name === 'recurrence_end_date' || (name === 'date' && formData.recurrence_end_date)) {
        const dateToCheck = name === 'recurrence_end_date' ? value : formData.recurrence_end_date;
        const startDateString = name === 'date' ? value : formData.date;

        if (dateToCheck && startDateString) {
          const selectedDate = new Date(dateToCheck);
          const startDate = new Date(startDateString);

          if (selectedDate < startDate) {
            newErrors.recurrence_end_date = "A data final deve ser posterior à data inicial";
            hasError = true;
          } else {
            delete newErrors.recurrence_end_date;
          }
        }
      }

      return newErrors;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'date' || name === 'recurrence_end_date') {
      handleDateChange(e);
      return;
    }

    if (type === 'checkbox') {
      if (name === 'is_recurring') {
        setFormData(prev => ({
          ...prev,
          [name]: checked,
          recurrence_end_date: checked ? prev.recurrence_end_date : ""
        }));
      } else if (Object.keys(formData.room_resources).includes(name)) {
        setFormData(prev => ({
          ...prev,
          room_resources: {
            ...prev.room_resources,
            [name]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      if (name === 'start_time') {
        const selectedDate = formData.date ? new Date(formData.date + 'T00:00:00') : null;
        const now = getBrazilNow();
        const isToday = selectedDate ? isSameDate(selectedDate, now) : false;

        setErrors(prev => {
          const newErrors = { ...prev };
          let hasStartError = false;

          if (isToday) {
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            if (value <= currentTime) {
              newErrors.start_time = "O horário deve ser posterior ao horário atual";
              hasStartError = true;
            } else {
              delete newErrors.start_time;
            }
          } else {
            delete newErrors.start_time;
          }

          if (formData.end_time) {
            if (value >= formData.end_time) {
              newErrors.end_time = "O horário de fim deve ser posterior ao horário de início";
            } else {
              delete newErrors.end_time;
            }
          }
          return newErrors;
        });
      }

      if (name === 'end_time') {
        setErrors(prev => {
          const newErrors = { ...prev };
          if (formData.start_time && value <= formData.start_time) {
            newErrors.end_time = "O horário de fim deve ser posterior ao horário de início";
          } else {
            delete newErrors.end_time;
          }
          return newErrors;
        });
      }
    }

    // Limpar erros de campos de texto ou numéricos ao digitar
    if (type !== 'date' && type !== 'time') {
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (selectedRoom && !isRoomAvailable(selectedRoom)) {
      setError("Esta sala não está mais disponível no horário selecionado. Por favor, escolha outra sala.");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      const selectedProject = myProjects.find(p => p.id === formData.project_id);
      const startTimeISO = createBrazilDateTimeISO(formData.date, formData.start_time);
      const endTimeISO = createBrazilDateTimeISO(formData.date, formData.end_time);
      const recurrenceEndDateISO = formData.is_recurring && formData.recurrence_end_date
        ? createBrazilDateTimeISO(formData.recurrence_end_date, "23:59")
        : null;

      const reservationData = {
        title: showProjectSelection && selectedProject ? selectedProject.name : "Reserva",
        description: formData.description,
        project_id: showProjectSelection && formData.project_id ? parseInt(formData.project_id) : null,
        room_id: selectedRoom.id,
        start_time: startTimeISO,
        end_time: endTimeISO,
        people_count: formData.people_count,
        recurrence_type: formData.is_recurring ? formData.recurrence_frequency : "none",
        recurrence_end_date: recurrenceEndDateISO,
        recurrence_interval: 1,
        room_resources: formData.room_resources
      };

      const result = await createReservation(reservationData);

      setCreatedReservation(result);
      setShowModal(true);

      await loadData();
      resetForm();

      if (onReservationCreated) {
        onReservationCreated(result);
      }

    } catch (err) {
      setError("Erro ao criar reserva: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: "",
      project_text: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      people_count: "",
      is_recurring: false,
      recurrence_frequency: "daily",
      recurrence_end_date: "",
      room_resources: {
        projector: false,
        internet: false,
        air_conditioning: false
      }
    });
    setSearchProjectText("");
    setSelectedRoom(null);
    setSearchCriteria(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (showProjectSelection && (!formData.project_id || !formData.project_text.trim())) {
      newErrors.project_text = "Selecione um projeto da lista";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.date) {
      newErrors.date = "Data é obrigatória";
    } else {
      if (isDateInPast(formData.date)) {
        newErrors.date = "A data não pode ser anterior a hoje";
      }
      const year = formData.date.split('-')[0];
      if (year && (year.length !== 4 || isNaN(parseInt(year)))) {
        newErrors.date = "Ano deve ter 4 dígitos";
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = "Horário de início é obrigatório";
    } else if (formData.date) {
      const selectedDate = new Date(formData.date + 'T00:00:00');
      const now = getBrazilNow();
      const isToday = isSameDate(selectedDate, now);

      if (isToday) {
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (formData.start_time <= currentTime) {
          newErrors.start_time = "O horário deve ser posterior ao horário atual";
        }
      }
    }

    if (!formData.end_time) {
      newErrors.end_time = "Horário de fim é obrigatório";
    } else if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = "O horário de fim deve ser posterior ao horário de início";
    }

    if (!formData.people_count || formData.people_count === "" || formData.people_count <= 0) {
      newErrors.people_count = "Quantidade de participantes deve ser maior que 0";
    }

    if (!selectedRoom) {
      newErrors.room = "Selecione uma sala";
    }

    if (formData.is_recurring && !formData.recurrence_end_date) {
      newErrors.recurrence_end_date = "Data de fim da recorrência é obrigatória";
    }

    if (formData.is_recurring && !formData.recurrence_frequency) {
      newErrors.recurrence_frequency = "Frequência é obrigatória para reservas recorrentes";
    }

    if (formData.is_recurring && formData.recurrence_end_date && formData.recurrence_end_date <= formData.date) {
      newErrors.recurrence_end_date = "Data de fim deve ser posterior à data inicial";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProjectSearchChange = (e) => {
    const value = e.target.value;
    setSearchProjectText(value);
    setShowProjectDropdown(true);
  };

  const selectProject = (project) => {
    setFormData(prev => ({
      ...prev,
      project_text: project.name,
      project_id: project.id
    }));
    setSearchProjectText("");
    setShowProjectDropdown(false);
  };

  const handleProjectFieldFocus = () => {
    if (!formData.project_id) {
      setSearchProjectText("");
      setFilteredProjects(myProjects);
    }
    setShowProjectDropdown(true);
  };

  const handleClearProject = (e) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      project_text: "",
      project_id: ""
    }));
    setSearchProjectText("");
    setShowProjectDropdown(true);
  };

  const isSearchReady =
    formData.date &&
    formData.start_time &&
    formData.end_time &&
    formData.people_count &&
    (!formData.is_recurring || (formData.recurrence_end_date && formData.recurrence_frequency)) &&
    Object.values(errors).every(errorValue => !errorValue);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-[152px]">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1
            className="font-bold text-lg md:text-2xl"
            style={{
              fontFamily: "Lato, sans-serif",
              lineHeight: "140%",
              letterSpacing: "0%",
              color: "#2E3DA3",
            }}
          >
            {title}
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Atualizar disponibilidade de salas"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        <SuccessToast message={successMessage} onClose={() => setSuccessMessage("")} />
        <ErrorMessage error={error} />

        {/* Layout Principal - Formulário e Calendário */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Formulário de Criação */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border p-4 md:p-6">
            <form id="reservation-form" onSubmit={handleSubmit} className="space-y-4">
              <ProjectSelector
                showProjectSelection={showProjectSelection}
                formData={formData}
                errors={errors}
                searchProjectText={searchProjectText}
                showProjectDropdown={showProjectDropdown}
                filteredProjects={filteredProjects}
                onProjectSearchChange={handleProjectSearchChange}
                onProjectFieldFocus={handleProjectFieldFocus}
                onSelectProject={selectProject}
                onClearProject={handleClearProject}
                onToggleDropdown={setShowProjectDropdown}
              />

              <FormFields
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                roomResources={roomResources}
              />

              <RecurrenceFields
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
              />
            </form>
          </div>

          {/* Coluna Direita - Calendário e Salas */}
          <div className="w-full md:w-80 space-y-4">
            <MiniCalendar
              currentDate={currentDate}
              formData={formData}
              onNavigateCalendar={navigateCalendar}
              onDateSelect={handleDateSelect}
              getRecurringDays={getRecurringDays}
            />

            <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
              <button
                type="button"
                onClick={handleSearchRooms}
                disabled={!isSearchReady || isSearchingRooms}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none flex justify-center items-center gap-2 ${isSearchReady && !isSearchingRooms
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                  : 'bg-blue-50 text-blue-300 cursor-not-allowed'
                  }`}
              >
                {isSearchingRooms ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Buscar por salas"
                )}
              </button>
            </div>

            <AvailableRoomsGrid
              availableRooms={availableRooms}
              selectedRoom={selectedRoom}
              onSelectRoom={selectRoom}
              formData={formData}
              showProjectSelection={showProjectSelection}
            />

            {/* Botões */}
            <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
              <button
                type="submit"
                form="reservation-form"
                disabled={formLoading || !selectedRoom}
                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none"
              >
                {formLoading ? "Solicitando..." : "Solicitar"}
              </button>
            </div>
          </div>
        </div>

        <SuccessModal show={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
};

export default NovaReserva;