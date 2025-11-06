import React from 'react';
import { Calendar } from 'react-big-calendar';
import { localizer, calendarMessages, calendarFormats } from '../config/calendarConfig';

export const MainCalendar = ({
    events,
    selectedDate,
    onNavigate,
    onSelectEvent
}) => {
    return (
        <div className="bg-white rounded-lg shadow border p-4">
            <div className="calendar-container" style={{ height: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="week"
                    views={['week']}
                    date={selectedDate}
                    onNavigate={onNavigate}
                    step={30}
                    timeslots={2}
                    min={new Date(0, 0, 0, 7, 0, 0)} // 7:00 AM
                    max={new Date(0, 0, 0, 22, 0, 0)} // 10:00 PM
                    messages={calendarMessages}
                    formats={calendarFormats}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: '#3b82f6',
                            borderColor: '#1d4ed8',
                            color: 'white',
                            fontSize: '12px',
                            borderRadius: '4px'
                        }
                    })}
                    components={{
                        event: ({ event }) => (
                            <div className="text-xs">
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="opacity-90 truncate">{event.resource?.room}</div>
                                <div className="opacity-80 truncate">{event.resource?.user}</div>
                            </div>
                        )
                    }}
                    onSelectEvent={onSelectEvent}
                />
            </div>
        </div>
    );
};

