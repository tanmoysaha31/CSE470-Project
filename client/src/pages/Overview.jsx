import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '/context/userContext';
import { FondAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalender, faListCheck } from '@fortawesome/free-solid-svg-icons';
import axio from 'axios';
import { format } from 'date-fns';
import '../assets/styles/tasks.css';

<<<<<<< HEAD:client/src/pages/Tasks.jsx
export default function Tasks() {
  const{ user } = useContext(UserContext);
  const[tasks, setTasks] = useState([]);
  const[searchTerm, setSearchTerm] = useState('');
  const[loading,setLoading] = useState(true);

  useEffect(() => {
    fetchTasks () ;
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/tasks', {withCredentials: true
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
          case'past':
            return normalizedItemDate < today;
          case 'today':  
            return normalizedItemDate.getTime() === today.getTime();
          case 'upcoming':
            return normalizedItemDate >= tomorrow; //changed line to use tomorrow
          default:
            return true;
        }
      })
      .filter(item => item.title.toLoe=werCase().includes(searchTeam.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  };

  const highlight = (text, searchTerm) => {
    if (!searchTerm) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part,index) =>
      part.toLowerCase() === searchTerm.toLoweCase() ? <span key={index} className="highlight-text">{part}</span> : part
    );
  };

  const renderItems = (items) => {
    if (items.length === 0) {
      return <div className="empty-state">No items to display</div>;
    }

    return items.map(item => {
      const hasMatch = searchTerm && ( item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))

      );

      return(
        <div key={item._id} className={`item-card ${hasMatch ? 'highlight-card' : ''}`}>
          </div>

      )
    })
  }



}
=======
export default function Overview() {
  const { user } = useContext(UserContext)
  
  return (
    <div>
      <h1>Overview</h1>
      <h2>This is Overview page</h2>
    </div>
  )
}
>>>>>>> 5283b8982de163eeae2aa0d93c472b70bfeb8741:client/src/pages/Overview.jsx
