import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const styles = {
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: '1rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
  select: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: '1rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
  textarea: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: '1rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
  },
  checkbox: {
    marginRight: '8px',
  },
  row: {
    display: 'flex',
    marginLeft: '-8px',
    marginRight: '-8px',
  },
  col: {
    flex: '1 0 0%',
    padding: '0 8px',
  },
  button: {
    display: 'inline-block',
    padding: '6px 12px',
    marginBottom: '0',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.42857143',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    touchAction: 'manipulation',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundImage: 'none',
    border: '1px solid transparent',
    borderRadius: '4px',
    margin: '0 4px',
  },
  primaryButton: {
    color: '#fff',
    backgroundColor: '#0275d8',
    borderColor: '#0275d8',
  },
  secondaryButton: {
    color: '#fff',
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
  },
  dangerButton: {
    color: '#fff',
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
};

const SimpleEventForm = ({ modalData, onClose, onEventAdded, onEventUpdated }) => {
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
    console.log("Form initialized with modalData:", modalData);
    
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

  // Render just the form fields
  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Type</label>
        <select 
          style={styles.select}
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

      <div style={styles.formGroup}>
        <label style={styles.label}>Title</label>
        <input 
          type="text"
          style={styles.input}
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
          placeholder="Enter title"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea 
          style={styles.textarea}
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Add description (optional)"
          rows="3"
        />
      </div>
      
      {formData.type === 'task' && (
        <div style={styles.formGroup}>
          <div>
            <input
              type="checkbox"
              style={styles.checkbox}
              id="taskCompleted"
              checked={formData.completed}
              onChange={toggleTaskCompletion}
            />
            <label htmlFor="taskCompleted">
              Mark as completed
            </label>
          </div>
        </div>
      )}
      
      {formData.type === 'event' && (
        <div style={styles.formGroup}>
          {!formData.hasTime ? (
            <button
              type="button"
              style={{...styles.button, backgroundColor: '#0275d8', color: 'white'}}
              onClick={() => setFormData({...formData, hasTime: true})}
            >
              Add Time
            </button>
          ) : (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <label style={{margin: 0}}>Event Time</label>
                <button
                  type="button"
                  style={{...styles.button, backgroundColor: '#6c757d', color: 'white'}}
                  onClick={() => setFormData({...formData, hasTime: false})}
                >
                  Remove Time
                </button>
              </div>
              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Start Time</label>
                  <input
                    type="time"
                    style={styles.input}
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>End Time</label>
                  <input
                    type="time"
                    style={styles.input}
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px'}}>
        {modalData.type === 'edit' && (
          <button 
            type="button" 
            style={{...styles.button, ...styles.dangerButton, marginRight: 'auto'}}
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
        <button 
          type="button" 
          style={{...styles.button, ...styles.secondaryButton}}
          onClick={onClose}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          style={{...styles.button, ...styles.primaryButton}}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (modalData.type === 'edit' ? 'Update' : 'Save')}
        </button>
      </div>
    </form>
  );
};

export default SimpleEventForm; 