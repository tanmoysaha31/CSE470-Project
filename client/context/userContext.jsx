import axios from "axios";
import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
        const checkAuth = async () => {
            try {
                const {data} = await axios.get('/profile');
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuth();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Or your loading component
    }

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
}