import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '/context/userContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../assets/styles/calendar.css';
import EventModal from '../components/EventModal';

export default function Calendar() {
    const { user } = useContext(UserContext);
    const [events, setEvents] = useState([]);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await axios.get('/tasks');
            setEvents(data.map(task => ({
                id: task._id,
                title: task.title,
                start: task.start,
                end: task.end,
                color: task.type === 'event' ? '#4169e1' : '#ff69b4',
                allDay: task.allDay,
                display: 'block',
                extendedProps: {
                    type: task.type,
                    description: task.description
                },
                displayEventTime: false,
                className: task.type === 'task' ? 'task-event' : 'normal-event'
            })));
        } catch (error) {
            toast.error('Failed to fetch events');
        }
    };

    const handleDateSelect = (selectInfo) => {
        setModalData({
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: selectInfo.allDay,
            type: 'new'
        });
    };

    const handleEventClick = (clickInfo) => {
        setModalData({
            type: 'edit',
            id: clickInfo.event.id,
            event: {
                title: clickInfo.event.title,
                type: clickInfo.event.extendedProps.type || 'event',
                description: clickInfo.event.extendedProps.description || '',
                allDay: clickInfo.event.allDay
            },
            start: clickInfo.event.startStr,
            end: clickInfo.event.endStr
        });
    };

    const handleEventAdded = (event) => {
        setEvents([...events, {
            id: event._id,
            title: event.title,
            start: event.start,
            end: event.end,
            color: event.type === 'event' ? '#4169e1' : '#ff69b4',
            allDay: event.allDay
        }]);
    };

    const handleEventUpdated = (updatedEvent, deletedId) => {
        if (deletedId) {
            // Handle deletion
            setEvents(events.filter(event => event.id !== deletedId));
        } else {
            // Handle update
            setEvents(events.map(event => 
                event.id === updatedEvent._id 
                    ? {
                        id: updatedEvent._id,
                        title: updatedEvent.title,
                        start: updatedEvent.start,
                        end: updatedEvent.end,
                        color: updatedEvent.type === 'event' ? '#4169e1' : '#ff69b4',
                        allDay: updatedEvent.allDay,
                        extendedProps: {
                            type: updatedEvent.type,
                            description: updatedEvent.description
                        }
                    }
                    : event
            ));
        }
    };

    return (
        <div className="calendar-container">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView="dayGridMonth"
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="85vh"
            />
            {modalData && (
                <EventModal 
                    modalData={modalData}
                    onClose={() => setModalData(null)}
                    onEventAdded={handleEventAdded}
                    onEventUpdated={handleEventUpdated}
                />
            )}
        </div>
    );
}
