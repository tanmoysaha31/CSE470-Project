import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';

export default function ProtectedRoute({ children }) {
    const { user } = useContext(UserContext);
    
    if (!user) {
        // Redirect to login if no user is authenticated
        return <Navigate to="/login" replace />;
    }
    
    return children;
}