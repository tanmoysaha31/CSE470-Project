import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../assets/styles/calendar.css';
import ModalPortal from './ModalPortal';

// Configure axios for debugging
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

/* Modal styles - More aggressive styling to ensure visibility */
const modalStyles = {
  overlay: {
    position: 'fixed !important',
    top: '0 !important',
    left: '0 !important',
    right: '0 !important',
    bottom: '0 !important',
    backgroundColor: 'rgba(0, 0, 0, 0.7) !important',
    display: 'flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
    zIndex: '99999 !important', // Extremely high z-index
    pointerEvents: 'auto !important',
    visibility: 'visible !important',
    opacity: '1 !important',
  },
  content: {
    position: 'relative !important',
    backgroundColor: '#fff !important',
    borderRadius: '8px !important',
    width: '500px !important',
    maxWidth: '90% !important',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5) !important',
    margin: 'auto !important',
    padding: '0 !important',
    zIndex: '100000 !important', // Even higher z-index
    pointerEvents: 'auto !important',
    visibility: 'visible !important',
    opacity: '1 !important',
  }
};

const EventModal = ({ modalData, onClose, onEventAdded, onEventUpdated }) => {
    console.log("EventModal opened with data:", modalData);
    
    const [formData, setFormData] = useState({
        title: '',
        type: 'task',
        description: '',
        hasTime: false,
        startTime: '09:00',
        endTime: '10:00',
        completed: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        console.log("EventModal effect running with modalData:", modalData);
        // Force body overflow to be hidden when modal is open
        document.body.style.overflow = 'hidden';
        
        if (modalData.type === 'edit' && modalData.event) {
            const event = modalData.event;
            const startDate = new Date(modalData.start);
            const endDate = new Date(modalData.end);
            
            const hasTime = !event.allDay && event.type === 'event';
            
            setFormData({
                title: event.title,
                type: event.type || 'task',
                description: event.description || '',
                hasTime: hasTime,
                startTime: hasTime ? startDate.toTimeString().slice(0, 5) : '09:00',
                endTime: hasTime ? endDate.toTimeString().slice(0, 5) : '10:00',
                completed: event.completed || false
            });
        }
        
        // Alert to confirm modal is opening
        toast.success('Modal opened!');
        
        return () => {
            // Reset body overflow when modal is closed
            document.body.style.overflow = '';
        };
    }, [modalData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isSubmitting) {
            console.log("Already submitting, preventing double submission");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const startDate = new Date(modalData.start);
            const endDate = new Date(modalData.start); // Use same date for start and end

            if (formData.type === 'event' && formData.hasTime) {
                // For events with specific time
                const [startHours, startMinutes] = formData.startTime.split(':');
                const [endHours, endMinutes] = formData.endTime.split(':');
                
                // Create new Date objects to avoid modifying the original dates
                const eventStartDate = new Date(startDate);
                const eventEndDate = new Date(startDate);
                
                eventStartDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                eventEndDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

                if (eventEndDate <= eventStartDate) {
                    toast.error('End time must be after start time');
                    setIsSubmitting(false);
                    return;
                }

                // Use the time-specific dates
                startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
            } else {
                // For tasks or all-day events
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            }

            const payload = {
                title: formData.title,
                type: formData.type,
                description: formData.description,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                allDay: !formData.hasTime || formData.type === 'task',
                completed: formData.completed || false
            };

            console.log("Submitting payload:", payload);

            if (modalData.type === 'edit') {
                console.log(`Updating task with ID: ${modalData.id}`);
                const { data } = await axios.put(`/tasks/${modalData.id}`, payload, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Task updated successfully:", data);
                onEventUpdated(data);
                toast.success(`${formData.type} updated successfully`);
            } else {
                console.log("Creating new task/event with payload:", payload);
                const { data } = await axios.post('/tasks', payload, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Task created successfully:", data);
                onEventAdded(data);
                toast.success(`${formData.type} created successfully`);
            }
            onClose();
        } catch (error) {
            console.error('Operation failed:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Status code:', error.response.status);
                toast.error(`Failed: ${error.response.data.error || 'Server error'}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                toast.error('Server did not respond. Check your connection.');
            } else {
                console.error('Error setting up request:', error.message);
                toast.error(`Error: ${error.message}`);
            }
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/tasks/${modalData.id}`, {
                withCredentials: true
            });
            onEventUpdated(null, modalData.id); // Pass null for updated event and the ID for deletion
            onClose();
            toast.success('Deleted successfully');
        } catch (error) {
            console.error('Delete failed:', error);
            if (error.response) {
                toast.error(`Failed to delete: ${error.response.data.error || 'Server error'}`);
            } else {
                toast.error('Failed to delete. Check your connection.');
            }
        }
    };

    const toggleTaskCompletion = () => {
        if (formData.type === 'task') {
            setFormData({
                ...formData,
                completed: !formData.completed
            });
        }
    };

    // Render using the Portal component
    return (
        <ModalPortal isOpen={true} onClose={onClose}>
            <div className="modal-content">
                <div className="modal-header">
                    <h5>{modalData.type === 'edit' ? 'Edit' : 'Add New'} {formData.type === 'event' ? 'Event' : 'Task'}</h5>
                    <button 
                        type="button" 
                        className="close-btn"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                
                {/* Debug info */}
                <div className="p-2 bg-light border-bottom">
                    <small>Modal open with type: {modalData.type}</small>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group p-3">
                        <label>Type</label>
                        <select 
                            className="form-control"
                            value={formData.type}
                            onChange={(e) => {
                                setFormData({
                                    ...formData, 
                                    type: e.target.value,
                                    hasTime: e.target.value === 'event' ? formData.hasTime : false,
                                    completed: e.target.value === 'task' ? formData.completed : false
                                });
                            }}
                        >
                            <option value="task">Task</option>
                            <option value="event">Event</option>
                        </select>
                    </div>
                    <div className="form-group px-3">
                        <label>Title</label>
                        <input 
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            placeholder="Enter title"
                        />
                    </div>
                    <div className="form-group px-3">
                        <label>Description</label>
                        <textarea 
                            className="form-control"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Add description (optional)"
                            rows="3"
                        />
                    </div>
                    
                    {formData.type === 'task' && (
                        <div className="form-group px-3">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="taskCompleted"
                                    checked={formData.completed}
                                    onChange={toggleTaskCompletion}
                                />
                                <label className="form-check-label" htmlFor="taskCompleted">
                                    Mark as completed
                                </label>
                            </div>
                        </div>
                    )}
                    
                    {formData.type === 'event' && (
                        <div className="form-group px-3">
                            {!formData.hasTime ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => setFormData({...formData, hasTime: true})}
                                >
                                    <i className="fas fa-clock me-1"></i> Add Time
                                </button>
                            ) : (
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="mb-0">Event Time</label>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => setFormData({...formData, hasTime: false})}
                                        >
                                            Remove Time
                                        </button>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <label>Start Time</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                value={formData.startTime}
                                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                            />
                                        </div>
                                        <div className="col">
                                            <label>End Time</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                value={formData.endTime}
                                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-footer">
                        {modalData.type === 'edit' && (
                            <button 
                                type="button" 
                                className="btn btn-danger me-auto"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        )}
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (modalData.type === 'edit' ? 'Update' : 'Save')}
                        </button>
                    </div>
                </form>
            </div>
        </ModalPortal>
    );
};

export default EventModal;
