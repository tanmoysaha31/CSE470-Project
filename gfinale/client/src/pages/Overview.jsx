import React, { useContext, useState, useEffect, useCallback } from 'react';
import { UserContext } from '/context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faListCheck, faCalendarCheck, faArrowTrendUp, faStickyNote, 
  faBrain, faCheckCircle, faChartLine, faExclamationTriangle,
  faUtensils, faShoppingBag, faHome, faCar, faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import { format, isToday, parseISO, differenceInDays } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/overview.css';

export default function Overview() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [finance, setFinance] = useState({ income: 0, expenses: [] });
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedTasks: 0,
    dueTasks: 0,
    dailyCompletion: 0,
    weeklyCompletion: 0,
    monthlyCompletion: 0
  });

  // AI suggestions state
  const [suggestions, setSuggestions] = useState([]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchTasks(),
          fetchFinance(),
          fetchNotes()
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats and generate suggestions after data is loaded
  useEffect(() => {
    if (!loading) {
      calculateStats();
    }
  }, [tasks, loading]);

  // Generate AI suggestions when data changes
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      generateAISuggestions();
    }
  }, [tasks, finance, notes, loading, stats.weeklyCompletion]);

  // Function to fetch tasks
  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/tasks', {
        withCredentials: true
      });
      setTasks(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  };

  // Function to fetch finance data
  const fetchFinance = async () => {
    try {
      const { data } = await axios.get('/finance', {
        withCredentials: true
      });
      setFinance(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
      return { income: 0, expenses: [] };
    }
  };

  // Function to fetch notes
  const fetchNotes = async () => {
    try {
      const { data } = await axios.get('/notes', {
        withCredentials: true
      });
      setNotes(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      return [];
    }
  };

  // Calculate statistics based on tasks
  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Filter for only tasks (not events)
    const allTasks = tasks.filter(task => task.type === 'task');
    
    // Count completed tasks
    const completedTasks = allTasks.filter(task => task.completed).length;
    
    // Count due/overdue tasks (end date before now and not completed)
    const dueTasks = allTasks.filter(task => 
      !task.completed && new Date(task.end) < now
    ).length;
    
    // Daily tasks (today only)
    const dailyTasks = allTasks.filter(task => {
      const taskDate = new Date(task.start);
      return taskDate >= today && taskDate < tomorrow;
    });
    
    // Calculate daily completion percentage
    const dailyCompletion = dailyTasks.length > 0 
      ? Math.floor((dailyTasks.filter(t => t.completed).length / dailyTasks.length) * 100) 
      : 0;
    
    // Weekly tasks
    const weeklyTasks = allTasks.filter(task => 
      new Date(task.start) >= oneWeekAgo &&
      new Date(task.start) <= now
    );
    
    // Calculate weekly completion percentage
    const weeklyCompletion = weeklyTasks.length > 0 
      ? Math.floor((weeklyTasks.filter(t => t.completed).length / weeklyTasks.length) * 100) 
      : 0;
    
    // Monthly tasks
    const monthlyTasks = allTasks.filter(task => 
      new Date(task.start) >= oneMonthAgo &&
      new Date(task.start) <= now
    );
    
    // Calculate monthly completion percentage
    const monthlyCompletion = monthlyTasks.length > 0 
      ? Math.floor((monthlyTasks.filter(t => t.completed).length / monthlyTasks.length) * 100) 
      : 0;
    
    setStats({
      completedTasks,
      dueTasks,
      dailyCompletion,
      weeklyCompletion,
      monthlyCompletion,
    });
  };

  // Function to generate AI suggestions based on user data
  const generateAISuggestions = () => {
    const newSuggestions = [];
    const now = new Date();
    
    // Get tasks due soon (within the next 3 days)
    const soon = new Date(now);
    soon.setDate(soon.getDate() + 3);
    
    // Task-based suggestions
    const upcomingTasks = tasks.filter(task => 
      task.type === 'task' && 
      !task.completed && 
      new Date(task.end) >= now && 
      new Date(task.end) <= soon
    );
    
    if (upcomingTasks.length > 0) {
      // Prioritize most urgent task
      const urgentTask = upcomingTasks.sort((a, b) => new Date(a.end) - new Date(b.end))[0];
      newSuggestions.push({
        text: `Prioritize '${urgentTask.title}' due ${format(new Date(urgentTask.end), 'EEE, MMM d')}`,
        source: "Based on upcoming deadlines",
        icon: faListCheck
      });
    }
    
    // Overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.type === 'task' && 
      !task.completed && 
      new Date(task.end) < now
    );
    
    if (overdueTasks.length > 0) {
      newSuggestions.push({
        text: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
        source: "Based on overdue tasks",
        icon: faExclamationTriangle
      });
    }
    
    // Check task completion rate
    if (stats.weeklyCompletion < 50 && tasks.filter(t => t.type === 'task').length > 0) {
      newSuggestions.push({
        text: "Your task completion rate is below 50% this week",
        source: "Based on productivity analysis",
        icon: faChartLine
      });
    }
    
    // Finance suggestions
    if (finance.income > 0) {
      const totalExpense = calculateTotal();
      const expensePercentage = (totalExpense / finance.income) * 100;
      
      // High spending alert
      if (expensePercentage > 70) {
        newSuggestions.push({
          text: `Your expenses (${Math.round(expensePercentage)}%) are approaching your income limit`,
          source: "Based on financial analysis",
          icon: faArrowTrendUp
        });
      }
      
      // Category-specific spending alerts
      const categories = {};
      finance.expenses.forEach(expense => {
        const category = expense.category || 'Other';
        categories[category] = (categories[category] || 0) + expense.amount;
      });
      
      const topCategory = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topCategory && topCategory[1] > 0) {
        const categoryPercentage = (topCategory[1] / finance.income) * 100;
        if (categoryPercentage > 30) {
          newSuggestions.push({
            text: `Your ${topCategory[0]} expenses are ${Math.round(categoryPercentage)}% of your income`,
            source: "Based on spending patterns",
            icon: getCategoryIcon(topCategory[0])
          });
        }
      }
    }
    
    // Note-based suggestions
    if (notes.length > 0) {
      // Get the most recent note
      const recentNote = notes.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      )[0];
      
      // Look for action items in notes (text containing "TODO", "REMINDER", etc.)
      if (recentNote.content.includes("TODO") || 
          recentNote.content.includes("REMINDER") || 
          recentNote.content.includes("DON'T FORGET")) {
        newSuggestions.push({
          text: `Review action items in your note '${recentNote.title}'`,
          source: "Based on recent notes",
          icon: faStickyNote
        });
      } else {
        newSuggestions.push({
          text: `You updated '${recentNote.title}' recently`,
          source: "Based on note activity",
          icon: faStickyNote
        });
      }
    }
    
    // Add general suggestion if we have fewer than 4
    if (newSuggestions.length < 4) {
      newSuggestions.push({
        text: "Set clear priorities for your tasks to improve productivity",
        source: "Based on productivity best practices",
        icon: faBrain
      });
    }
    
    // Limit to 4 suggestions
    setSuggestions(newSuggestions.slice(0, 4));
  };

  // Filter tasks for today
  const getTodayTasks = useCallback(() => {
    const today = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.start);
      return task.type === 'task' && 
             taskDate.getDate() === today.getDate() &&
             taskDate.getMonth() === today.getMonth() &&
             taskDate.getFullYear() === today.getFullYear();
    });
  }, [tasks]);

  // Filter events for today
  const getTodayEvents = useCallback(() => {
    const today = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.start);
      return task.type === 'event' && 
             taskDate.getDate() === today.getDate() &&
             taskDate.getMonth() === today.getMonth() &&
             taskDate.getFullYear() === today.getFullYear();
    });
  }, [tasks]);

  // Calculate total expenses
  const calculateTotal = useCallback(() => {
    return finance.expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [finance.expenses]);

  // Determine budget status
  const calculateStatus = useCallback(() => {
    if (!finance.income) return { status: 'Neutral', color: 'var(--text-primary)', class: '' };
    
    const expensePercentage = (calculateTotal() / finance.income) * 100;
    
    if (expensePercentage <= 50) {
      return { status: 'Good', color: '#4CAF50', class: 'status-good' };
    } else if (expensePercentage <= 70) {
      return { status: 'Warning', color: '#FFA500', class: 'status-warning' };
    } else if (expensePercentage <= 90) {
      return { status: 'Critical', color: '#FF4444', class: 'status-critical' };
    } else {
      return { status: 'Exceeded', color: '#831010', class: 'status-exceeded' };
    }
  }, [finance.income, calculateTotal]);

  // Get top expense categories
  const getTopCategories = useCallback(() => {
    const categories = {};
    
    finance.expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categories[category] = (categories[category] || 0) + expense.amount;
    });
    
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => ({
        name: category,
        amount,
        percentage: finance.income > 0 ? (amount / finance.income) * 100 : 0
      }));
  }, [finance.expenses, finance.income]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Navigate to other pages when clicking on widget headers
  const navigateTo = (path) => {
    navigate(`/Dashboard/${path}`);
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Food': return faUtensils;
      case 'Shopping': return faShoppingBag;
      case 'Housing': return faHome;
      case 'Transportation': return faCar;
      default: return faEllipsisH;
    }
  };

  // Format dates appropriately
  const formatDate = (dateString, includeTime = false) => {
    const date = parseISO(dateString);
    if (includeTime) {
      return format(date, 'MMM d, h:mm a');
    }
    return format(date, 'MMM d, yyyy');
  };

  // Truncate text
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Add this function to handle task completion toggle
  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      // Find the current task from our task list
      const currentTask = tasks.find(task => task._id === taskId);
      
      if (!currentTask) {
        toast.error('Task not found');
        return;
      }
      
      // Create updated task object with all required fields
      const updatedTask = {
        title: currentTask.title,
        type: currentTask.type,
        start: currentTask.start,
        end: currentTask.end,
        description: currentTask.description || '',
        allDay: currentTask.allDay || false,
        completed: !currentStatus
      };
      
      // Send update request with all fields
      const { data } = await axios.put(`/tasks/${taskId}`, updatedTask, {
        withCredentials: true
      });
      
      // Update local task list with the updated task
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, completed: data.completed } : task
        )
      );
      
      toast.success(`Task marked as ${data.completed ? 'completed' : 'incomplete'}`);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task status');
    }
  };

  return (
    <div className="overview-container" id="overview-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="welcome-message">
          {user ? `Hello, ${user.name}!` : 'Welcome to your dashboard'}
        </div>
        <div className="date-display">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Daily/Weekly Snapshot */}
        <div className="dashboard-card daily-snapshot">
          <div className="card-header">
            <div className="card-title">
              <FontAwesomeIcon icon={faCalendarCheck} className="card-icon" />
              Daily Snapshot
            </div>
            <span className="card-action" onClick={() => navigateTo('Calendar')}>View Calendar</span>
          </div>
          <div className="card-content">
            <div className="today-tasks">
              <div className="section-title">Today's Tasks</div>
              {getTodayTasks().length === 0 ? (
                <div className="empty-message">No tasks scheduled for today</div>
              ) : (
                <ul className="task-list">
                  {getTodayTasks().map(task => (
                    <li 
                      key={task._id} 
                      className="task-item"
                      onClick={() => task.type === 'task' && toggleTaskCompletion(task._id, task.completed)}
                      style={{ cursor: task.type === 'task' ? 'pointer' : 'default' }}
                    >
                      <div className={`task-checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed && (
                          <FontAwesomeIcon icon={faCheckCircle} size="xs" color="white" />
                        )}
                      </div>
                      <div className={`task-title ${task.completed ? 'completed-task-text' : ''}`}>
                        {task.title}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="today-events">
              <div className="section-title">Today's Events</div>
              {getTodayEvents().length === 0 ? (
                <div className="empty-message">No events scheduled for today</div>
              ) : (
                <ul className="event-list">
                  {getTodayEvents().map(event => (
                    <li key={event._id} className="event-item">
                      <FontAwesomeIcon icon={faCalendarCheck} className="card-icon" />
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">{format(new Date(event.start), 'h:mm a')}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Finance Summary */}
        <div className="dashboard-card finance-summary">
          <div className="card-header">
            <div className="card-title">
              <FontAwesomeIcon icon={faArrowTrendUp} className="card-icon" />
              Finance Summary
            </div>
            <span className="card-action" onClick={() => navigateTo('Finance')}>Manage</span>
          </div>
          <div className="card-content">
            <div className="finance-data">
              <div className="finance-metric">
                <div className="metric-label">Current Balance</div>
                <div className="metric-value">
                  {formatCurrency(finance.income - calculateTotal())}
                </div>
              </div>
              <div className="finance-metric">
                <div className="metric-label">Monthly Income</div>
                <div className="metric-value">{formatCurrency(finance.income)}</div>
              </div>
              <div className="finance-metric">
                <div className="metric-label">Total Expenses</div>
                <div className="metric-value">{formatCurrency(calculateTotal())}</div>
              </div>
              <div className="finance-metric">
                <div className="metric-label">Status</div>
                <div className={`status-value ${calculateStatus().class}`}>
                  {calculateStatus().status}
                </div>
              </div>
            </div>

            <div className="top-categories">
              <h4 className="section-title mt-3">Top Expenses</h4>
              {getTopCategories().map((cat, index) => (
                <div key={index} className="expense-category">
                  <div>
                    <FontAwesomeIcon icon={getCategoryIcon(cat.name)} className="me-2" />
                    {cat.name}
                  </div>
                  <div>{formatCurrency(cat.amount)}</div>
                  <div className="category-bar">
                    <div 
                      className="category-progress" 
                      style={{
                        width: `${Math.min(cat.percentage, 100)}%`,
                        backgroundColor: cat.percentage > 70 ? '#FF4444' : 
                                        cat.percentage > 50 ? '#FFA500' : 
                                        '#4CAF50'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="dashboard-card recent-notes">
          <div className="card-header">
            <div className="card-title">
              <FontAwesomeIcon icon={faStickyNote} className="card-icon" />
              Recent Notes
            </div>
            <span className="card-action" onClick={() => navigateTo('Notes')}>View All</span>
          </div>
          <div className="card-content">
            {notes.length === 0 ? (
              <div className="empty-message">No notes available</div>
            ) : (
              notes.slice(0, 4).map(note => (
                <div 
                  key={note._id} 
                  className="note-card" 
                  onClick={() => navigateTo('Notes')}
                >
                  <div className="note-title">{note.title}</div>
                  <div className="note-preview">{truncateText(note.content, 80)}</div>
                  <div className="note-date">{formatDate(note.updatedAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="dashboard-card ai-suggestions">
          <div className="card-header">
            <div className="card-title">
              <FontAwesomeIcon icon={faBrain} className="card-icon" />
              Suggestions
            </div>
            <span className="card-action" onClick={() => navigateTo('Lifesyncai')}>Ask AI</span>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="empty-message">Loading suggestions...</div>
            ) : suggestions.length === 0 ? (
              <div className="empty-message">No suggestions available yet</div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div key={index} className="suggestion-item">
                  <div className="suggestion-icon">
                    <FontAwesomeIcon icon={suggestion.icon} />
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-text">{suggestion.text}</div>
                    <div className="suggestion-source">{suggestion.source}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="dashboard-card activity-summary">
          <div className="card-header">
            <div className="card-title">
              <FontAwesomeIcon icon={faChartLine} className="card-icon" />
              Activity Summary
            </div>
            <span className="card-action" onClick={() => navigateTo('Tasks')}>View Tasks</span>
          </div>
          <div className="card-content">
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value">{stats.completedTasks}</div>
                <div className="stat-label">Tasks Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.dueTasks}</div>
                <div className="stat-label">Due Tasks</div>
              </div>
            </div>

            <h4 className="section-title mt-3">Task Completion</h4>
            <div className="progress-container">
              <div className="progress-title">
                <div className="progress-label">Daily Completion</div>
                <div className="progress-value">{stats.dailyCompletion}%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.dailyCompletion}%` }}></div>
              </div>
              
              <div className="progress-title">
                <div className="progress-label">Weekly Completion</div>
                <div className="progress-value">{stats.weeklyCompletion}%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.weeklyCompletion}%` }}></div>
              </div>
              
              <div className="progress-title">
                <div className="progress-label">Monthly Completion</div>
                <div className="progress-value">{stats.monthlyCompletion}%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${stats.monthlyCompletion}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add a spacer at the bottom to ensure scrollability */}
      <div style={{ height: '40px', width: '100%' }}></div>
    </div>
  );
}
