import moment from 'moment';
import 'moment/locale/pt-br';
import { momentLocalizer } from 'react-big-calendar';

// Configurar moment para português usando updateLocale (locale já existe)
moment.updateLocale('pt-br', {
    months: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthsShort: [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ],
    weekdays: [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'
    ],
    weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    weekdaysMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
});

// Definir como locale padrão
moment.locale('pt-br');

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

