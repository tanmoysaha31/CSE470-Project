import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EventModal = ({ modalData, onClose, onEventAdded, onEventUpdated }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'task',
        description: '',
        hasTime: false,
        startTime: '09:00',  // Add default time
        endTime: '10:00'     // Add default time
    });

    useEffect(() => {
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
                endTime: hasTime ? endDate.toTimeString().slice(0, 5) : '10:00'
            });
        }
    }, [modalData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                ...formData,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                allDay: !formData.hasTime || formData.type === 'task'
            };

            if (modalData.type === 'edit') {
                const { data } = await axios.put(`/tasks/${modalData.id}`, payload, {
                    withCredentials: true
                });
                onEventUpdated(data);
                toast.success(`${formData.type} updated successfully`);
            } else {
                const { data } = await axios.post('/tasks', payload, {
                    withCredentials: true
                });
                onEventAdded(data);
                toast.success(`${formData.type} created successfully`);
            }
            onClose();
        } catch (error) {
            console.error('Operation failed:', error);
            console.error('Payload:', {
                ...formData,
                start: startDate,
                end: endDate
            });
            toast.error(`Failed to ${modalData.type === 'edit' ? 'update' : 'create'}`);
        }
    };

    // Add handleDelete function
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
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h5>{modalData.type === 'edit' ? 'Edit' : 'Add New'} {formData.type === 'event' ? 'Event' : 'Task'}</h5>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label>Type</label>
                        <select 
                            className="form-control"
                            value={formData.type}
                            onChange={(e) => {
                                setFormData({
                                    ...formData, 
                                    type: e.target.value,
                                    hasTime: false // Reset hasTime when type changes
                                });
                            }}
                        >
                            <option value="task">Task</option>
                            <option value="event">Event</option>
                        </select>
                    </div>
                    <div className="form-group mb-3">
                        <label>Title</label>
                        <input 
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Description</label>
                        <textarea 
                            className="form-control"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    
                    {formData.type === 'event' && (
                        <div className="form-group mb-3">
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
                                                value={formData.startTime || '09:00'}
                                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                            />
                                        </div>
                                        <div className="col">
                                            <label>End Time</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                value={formData.endTime || '10:00'}
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
                        <button type="submit" className="btn btn-primary">
                            {modalData.type === 'edit' ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;