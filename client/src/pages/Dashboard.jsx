import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faCalendarCheck, faBrain, faListCheck, faRightFromBracket, faShield, faUser, faTableColumns } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/dashboard.css';

export default function Dashboard() {
    const { user } = useContext(UserContext);
    const location = useLocation();
    const showGreeting = location.pathname === "/Dashboard";
    
    const [isExpanded, setIsExpanded] = useState(() => {
        const savedState = localStorage.getItem('sidebarExpanded');
        return savedState ? JSON.parse(savedState) : true; // default expanded
    });
    
    useEffect(() => {
        localStorage.setItem('sidebarExpanded', JSON.stringify(isExpanded));
    }, [isExpanded]);
    
    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };
    
    return (
        <div className="wrapper">
            <aside id="sidebar" className={isExpanded ? "expand" : ""}>
                <div className="d-flex">
                    <button className="toggle-btn" type="button" onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={faTableColumns} />
                    </button> 
                    <div className="sidebar-logo">
                        <NavLink to="/Dashboard">
                            <img src="/vite.svg" className="logo" />
                            <span className="logo-text">LifeSync</span>
                        </NavLink>
                    </div>
                </div>
                <ul className="sidebar-nav">
                    <li className="sidebar-item mb-3">                                
                        <NavLink to="Profile" className="sidebar-link">
                            <FontAwesomeIcon icon={faUser} />
                            <span>Profile</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item mb-3">                                
                        <NavLink to="Tasks" className="sidebar-link">
                            <FontAwesomeIcon icon={faListCheck} />
                            <span>Tasks</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item mb-3">                                
                        <NavLink to="Calendar" className="sidebar-link">
                            <FontAwesomeIcon icon={faCalendarCheck} />
                            <span>Calendar</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item mb-3">                                
                        <NavLink to="Finance" className="sidebar-link">
                            <FontAwesomeIcon icon={faArrowTrendUp} />
                            <span>Finance</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item mb-3">                                
                        <NavLink to="Lifesyncai" className="sidebar-link">
                            <FontAwesomeIcon icon={faBrain} />
                            <span>LifeSync AI (experimental)</span>
                        </NavLink>
                    </li>
                    <li className="sidebar-item mb-3">
                        <a href="#" className="sidebar-link has-dropdown collapsed" data-bs-toggle="collapse" data-bs-target="#auth" aria-expanded="false" aria-controls="auth">
                            <FontAwesomeIcon icon={faShield} />
                            <span>Auth</span>
                        </a>
                        <ul id="auth" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                            <li className="sidebar-item">
                                <a href="/Login" className="sidebar-link">Login</a>
                            </li>
                            <li className="sidebar-item">
                                <a href="/Register" className="sidebar-link">Register</a>
                            </li>
                        </ul>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <a href="#" className="sidebar-link">
                        <FontAwesomeIcon icon={faRightFromBracket} />
                        <span>Logout</span>
                    </a>
                </div>
            </aside>
            <div className="main p-3">
                <div className="text-center">
                    {showGreeting && (user ? (<h2>Hi, {user.name}</h2>) : (<h2>No user data available</h2>))}
                    <Outlet />
                </div>
            </div>
        </div>
    );
}