import './App.css'
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/homeNavbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Finance from './pages/Finance';
import Notes from './pages/Notes';
import Lifesyncai from './pages/Lifesyncai';
import Dashboard from "./pages/Dashboard";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from '../context/userContext';
import ProtectedRoute from './components/ProtectedRoute';

// Configure axios with defaults for API calls
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.timeout = 10000; // 10 seconds timeout

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log(`[API Response] Status: ${response.status} from ${response.config.url}`);
    return response;
  },
  error => {
    if (error.response) {
      // Server responded with error status
      console.error(`[API Error] Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Error] No response received', error.request);
    } else {
      // Error in setting up request
      console.error('[API Error] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <UserContextProvider>
      <Toaster position='bottom-right' toastOptions={2000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route path="Overview" element={<Overview />} />
          <Route path="Profile" element={<Profile />} />
          <Route path="Tasks" element={<Tasks />} />
          <Route path="Calendar" element={<Calendar />} />
          <Route path="Notes" element={<Notes />} />
          <Route path="Finance" element={<Finance />} />
          <Route path="Lifesyncai" element={<Lifesyncai />} />          
        </Route>
        <Route path="/Navbar" element={<Navbar />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;
