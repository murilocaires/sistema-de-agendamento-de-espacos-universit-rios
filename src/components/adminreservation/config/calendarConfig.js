import moment from 'moment';
import { momentLocalizer } from 'react-big-calendar';

// Configurar localização para português
moment.locale('pt-br', {
  weekdays: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  weekdaysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
});

export const localizer = momentLocalizer(moment);

export const calendarMessages = {
    next: "Próxima",
    previous: "Anterior",
    today: "Hoje",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    agenda: "Agenda",
    date: "Data",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Não há reservas neste período",
    showMore: (total) => `+${total} mais`
};

export const calendarFormats = {
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
        localizer.format(start, 'HH:mm', culture) + ' - ' + 
        localizer.format(end, 'HH:mm', culture),
    dayFormat: 'ddd DD/MM',
    dayHeaderFormat: 'ddd DD/MM',
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
        localizer.format(start, 'DD/MM', culture) + ' - ' + 
        localizer.format(end, 'DD/MM', culture),
    weekdayFormat: 'ddd'
};

