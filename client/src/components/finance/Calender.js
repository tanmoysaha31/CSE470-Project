// src/components/finance/Calendar.js
import React, { useState } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  IconButton, 
  Box
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon 
} from '@mui/icons-material';

const Calendar = ({ currentDate, onMonthChange, onDateSelect, expenses }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    onDateSelect(newDate);
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const daysArray = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<Grid item xs={1.7} key={`empty-${i}`} />);
    }
    
    // Create a map of days with expenses for quick lookup
    const expensesByDay = {};
    expenses.forEach(expense => {
      const day = new Date(expense.date).getDate();
      if (expensesByDay[day]) {
        expensesByDay[day] += expense.amount;
      } else {
        expensesByDay[day] = expense.amount;
      }
    });
    
    // Add cells for each day of the month
    for (let day = 1; day <= days; day++) {
      const isSelected = 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year;
      
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === month && 
        new Date().getFullYear() === year;
      
      const hasExpense = expensesByDay[day] !== undefined;
      
      daysArray.push(
        <Grid item xs={1.7} key={day}>
          <Paper
            elevation={isSelected ? 6 : 1}
            onClick={() => handleDateClick(day)}
            sx={{
              height: 80,
              display: 'flex',
              flexDirection: 'column',
              p: 1,
              cursor: 'pointer',
              bgcolor: isToday ? 'primary.light' : isSelected ? 'primary.main' : 'background.paper',
              color: isSelected || isToday ? 'white' : 'inherit',
              '&:hover': {
                bgcolor: isSelected ? 'primary.dark' : 'action.hover',
              }
            }}
          >
            <Typography variant="body2">{day}</Typography>
            {hasExpense && (
              <Box mt="auto">
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  ${expensesByDay[day].toFixed(2)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      );
    }
    
    return daysArray;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeftIcon />
        </IconButton>
        
        <Typography variant="h6">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Typography>
        
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      
      <Grid container spacing={1}>
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Grid item xs={1.7} key={day}>
            <Typography variant="subtitle2" align="center">{day}</Typography>
          </Grid>
        ))}
        
        {/* Calendar days */}
        {renderCalendarDays()}
      </Grid>
    </Box>
  );
};

export default Calendar;
