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
import Lifesyncai from './pages/Lifesyncai';
import Dashboard from "./pages/Dashboard";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { UserContextProvider } from '../context/userContext';
import ProtectedRoute from './components/ProtectedRoute';

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

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
          <Route path="Finance" element={<Finance />} />
          <Route path="Lifesyncai" element={<Lifesyncai />} />          
        </Route>
        <Route path="/Navbar" element={<Navbar />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;
