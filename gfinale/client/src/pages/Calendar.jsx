import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '/context/userContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import BasicModal from '../components/BasicModal';
import SimpleEventForm from '../components/SimpleEventForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/calendar.css';

export default function Calendar() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [modalData, setModalData] = useState({
    isOpen: false,
    type: 'add', // add or edit
    start: new Date(), 
    end: new Date(),
    id: null,
    event: null
  });
  const [loading, setLoading] = useState(true);
  const calendarRef = React.useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/tasks', {
        withCredentials: true
      });
      
      // Transform the data for FullCalendar
      const formattedEvents = data.map(event => ({
        id: event._id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        classNames: [
          event.type,
          event.completed ? 'completed' : '',
        ],
        backgroundColor: event.completed ? '#70757a' : (event.type === 'event' ? '#4285f4' : '#0f9d58'),
        borderColor: event.completed ? '#70757a' : (event.type === 'event' ? '#4285f4' : '#0f9d58'),
        textColor: '#ffffff',
        extendedProps: {
          description: event.description,
          type: event.type,
          completed: event.completed
        }
      }));
      
      setEvents(formattedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
      setLoading(false);
    }
  };

  const handleDateClick = (arg) => {
    setModalData({
      isOpen: true,
      type: 'add',
      start: arg.date,
      end: arg.date,
      id: null,
      event: null
    });
  };

  const handleEventClick = (info) => {
    const event = info.event;
    setModalData({
      isOpen: true,
      type: 'edit',
      start: event.start,
      end: event.end || event.start,
      id: event.id,
      event: {
        title: event.title,
        start: event.start,
        end: event.end || event.start,
        allDay: event.allDay,
        description: event.extendedProps.description,
        type: event.extendedProps.type,
        completed: event.extendedProps.completed
      }
    });
  };

  const handleDateSelect = (selectInfo) => {
    setModalData({
      isOpen: true,
      type: 'add',
      start: selectInfo.start,
      end: selectInfo.end,
      id: null,
      event: null
    });
  };

  // Handle event drag and drop
  const handleEventDrop = async (info) => {
    const { event } = info;
    
    try {
      // Create the updated event payload
      const payload = {
        title: event.title,
        type: event.extendedProps.type,
        description: event.extendedProps.description,
        start: event.start.toISOString(),
        end: event.end ? event.end.toISOString() : event.start.toISOString(),
        allDay: event.allDay,
        completed: event.extendedProps.completed
      };
      
      // Show visual feedback
      toast.promise(
        axios.put(`/tasks/${event.id}`, payload, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        {
          loading: 'Updating event...',
          success: 'Event moved successfully',
          error: 'Failed to update event'
        }
      );
      
      // Update event in the calendar
      const updatedEvent = {
        _id: event.id,
        ...payload
      };
      
      onEventUpdated(updatedEvent);
    } catch (error) {
      // Revert the event if update fails
      info.revert();
      toast.error('Failed to update event: ' + (error.response?.data?.error || error.message));
    }
  };

  // Handle event resize
  const handleEventResize = async (info) => {
    const { event } = info;
    
    try {
      // Create the updated event payload
      const payload = {
        title: event.title,
        type: event.extendedProps.type,
        description: event.extendedProps.description,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        allDay: event.allDay,
        completed: event.extendedProps.completed
      };
      
      // Show visual feedback
      toast.promise(
        axios.put(`/tasks/${event.id}`, payload, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }),
        {
          loading: 'Updating event...',
          success: 'Event resized successfully',
          error: 'Failed to update event'
        }
      );
      
      // Update event in the calendar
      const updatedEvent = {
        _id: event.id,
        ...payload
      };
      
      onEventUpdated(updatedEvent);
    } catch (error) {
      // Revert the event if update fails
      info.revert();
      toast.error('Failed to update event: ' + (error.response?.data?.error || error.message));
    }
  };

  const onEventAdded = (newEvent) => {
    const formattedEvent = {
      id: newEvent._id,
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      allDay: newEvent.allDay,
      classNames: [
        newEvent.type, 
        newEvent.completed ? 'completed' : '',
      ],
      backgroundColor: newEvent.completed ? '#70757a' : (newEvent.type === 'event' ? '#4285f4' : '#0f9d58'),
      borderColor: newEvent.completed ? '#70757a' : (newEvent.type === 'event' ? '#4285f4' : '#0f9d58'),
      textColor: '#ffffff',
      extendedProps: {
        description: newEvent.description,
        type: newEvent.type,
        completed: newEvent.completed
      }
    };
    
    setEvents([...events, formattedEvent]);
  };

  const onEventUpdated = (updatedEvent, deletedId = null) => {
    if (deletedId) {
      // Handle deletion
      setEvents(events.filter(event => event.id !== deletedId));
      return;
    }
    
    if (!updatedEvent) return;
    
    // Handle update
    const formattedEvent = {
      id: updatedEvent._id,
      title: updatedEvent.title,
      start: updatedEvent.start,
      end: updatedEvent.end,
      allDay: updatedEvent.allDay,
      classNames: [
        updatedEvent.type,
        updatedEvent.completed ? 'completed' : '',
      ],
      backgroundColor: updatedEvent.completed ? '#70757a' : (updatedEvent.type === 'event' ? '#4285f4' : '#0f9d58'),
      borderColor: updatedEvent.completed ? '#70757a' : (updatedEvent.type === 'event' ? '#4285f4' : '#0f9d58'),
      textColor: '#ffffff',
      extendedProps: {
        description: updatedEvent.description,
        type: updatedEvent.type,
        completed: updatedEvent.completed
      }
    };
    
    setEvents(
      events.map(event => 
        event.id === formattedEvent.id ? formattedEvent : event
      )
    );
  };

  const handleAddManually = () => {
    setModalData({
      isOpen: true,
      type: 'add',
      start: new Date(),
      end: new Date(),
      id: null,
      event: null
    });
  };

  const closeModal = () => {
    setModalData({ ...modalData, isOpen: false });
  };

  const changeView = (viewName) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(viewName);
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
    }
  };

  const getCalendarTitle = () => {
    if (calendarRef.current) {
      return calendarRef.current.getApi().view.title;
    }
    return '';
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header mb-3">
        <div className="title-section">
          <h3>{calendarRef.current ? getCalendarTitle() : 'Calendar'}</h3>
        </div>
        <div className="controls-section">
          <div className="btn-group me-2">
            <button className="btn" onClick={handleToday}>Today</button>
            <button className="btn" onClick={handlePrev}>&lt;</button>
            <button className="btn" onClick={handleNext}>&gt;</button>
          </div>
          <div className="btn-group">
            <button className="btn" onClick={() => changeView('dayGridMonth')}>Month</button>
            <button className="btn" onClick={() => changeView('timeGridWeek')}>Week</button>
            <button className="btn" onClick={() => changeView('timeGridDay')}>Day</button>
          </div>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading calendar...</p>
          </div>
        ) : (
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false} // We'll create our own header
            events={events}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            select={handleDateSelect}
            fixedWeekCount={true}
            aspectRatio={1.8}
            height="auto"
            expandRows={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short'
            }}
            eventContent={(eventInfo) => (
              <div className="fc-event-content">
                <div className="fc-event-title">{eventInfo.event.title}</div>
              </div>
            )}
            dayCellDidMount={(info) => {
              // Ensure all day cells have the same height
              info.el.style.height = '100%';
            }}
            eventDrop={handleEventDrop}      // Handle drag and drop between dates
            eventResize={handleEventResize}   // Handle event resizing
            droppable={true}                  // Allow external drag and drop
            longPressDelay={200}              // Reduce long press time for touch devices
            eventDurationEditable={true}      // Allow changing event duration by resizing
          />
        )}
      </div>
      
      {/* Use our BasicModal with SimpleEventForm */}
      <BasicModal 
        isOpen={modalData.isOpen} 
        onClose={closeModal}
        title={modalData.type === 'edit' ? 'Edit Task/Event' : 'Add New Task/Event'}
      >
        <SimpleEventForm
          modalData={modalData}
          onClose={closeModal}
          onEventAdded={onEventAdded}
          onEventUpdated={onEventUpdated}
        />
      </BasicModal>
    </div>
  );
}
