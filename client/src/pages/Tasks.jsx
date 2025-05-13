import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '/context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendar, faListCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { format } from 'date-fns';
import '../assets/styles/tasks.css';

export default function Tasks() {
  const { user } = useContext(UserContext);
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/tasks', {
        withCredentials: true
      });
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setLoading(false);
    }
  };

  const filterItems = (items, type, timeframe) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return items
      .filter(item => item.type === type)
      .filter(item => {
        const itemDate = new Date(item.start);
        const normalizedItemDate = new Date(
          itemDate.getFullYear(),
          itemDate.getMonth(),
          itemDate.getDate()
        );

        switch (timeframe) {
          case 'past':
            return normalizedItemDate < today;
          case 'today':
            return normalizedItemDate.getTime() === today.getTime();
          case 'upcoming':
            return normalizedItemDate >= tomorrow; // Changed this line to use tomorrow
          default:
            return true;
        }
      })
      .filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <span key={index} className="highlight-text">{part}</span> : part
    );
  };

  const renderItems = (items) => {
    if (items.length === 0) {
        return <div className="empty-state">No items to display</div>;
    }

    return items.map(item => {
        const hasMatch = searchTerm && (
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        return (
            <div key={item._id} className={`item-card ${hasMatch ? 'highlight-card' : ''}`}>
                <div className="item-title">
                    {highlightText(item.title, searchTerm)}
                </div>
                {item.description && (
                    <div className="item-description">
                        {highlightText(item.description, searchTerm)}
                    </div>
                )}
                <div className="item-date">
                    {format(new Date(item.start), 'MMM dd, yyyy')}
                </div>
            </div>
        );
    });
};

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="tasks-container">
      <div className="search-container mb-4">
        <div className="search-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search tasks and events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="tasks-grid">
        <div className="tasks-column">
          <div className="section-header">
            <FontAwesomeIcon icon={faListCheck} />
            <h2>Tasks</h2>
          </div>

          <div className="timeline-section">
            <h3>Due Tasks</h3>
            {renderItems(filterItems(tasks, 'task', 'past'))}
          </div>

          <div className="timeline-section">
            <h3>Today's Tasks</h3>
            {renderItems(filterItems(tasks, 'task', 'today'))}
          </div>

          <div className="timeline-section">
            <h3>Upcoming Tasks</h3>
            {renderItems(filterItems(tasks, 'task', 'upcoming'))}
          </div>
        </div>

        <div className="events-column">
          <div className="section-header">
            <FontAwesomeIcon icon={faCalendar} />
            <h2>Events</h2>
          </div>

          <div className="timeline-section">
            <h3>Past Events</h3>
            {renderItems(filterItems(tasks, 'event', 'past'))}
          </div>

          <div className="timeline-section">
            <h3>Today's Events</h3>
            {renderItems(filterItems(tasks, 'event', 'today'))}
          </div>

          <div className="timeline-section">
            <h3>Upcoming Events</h3>
            {renderItems(filterItems(tasks, 'event', 'upcoming'))}
          </div>
        </div>
      </div>
    </div>
  );
}
