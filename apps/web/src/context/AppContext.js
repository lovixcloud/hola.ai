import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AppContext = createContext(null);
export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('hola_auth_token'));
    const [user, setUser] = useState(localStorage.getItem('hola_user') ? JSON.parse(localStorage.getItem('hola_user')) : null);
    const [organizations, setOrganizations] = useState([]);
    const [activeOrg, setActiveOrgState] = useState(null);
    const apiCall = async (path, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (activeOrg) {
            headers['X-Organization-ID'] = activeOrg.id;
        }
        const res = await fetch(path, { ...options, headers });
        if (res.status === 401) {
            logout();
            throw new Error('Unauthorized');
        }
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'API Request Failed');
        }
        return data;
    };
    const login = async (email, pass) => {
        try {
            const data = await apiCall('/api/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password: pass }),
            });
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('hola_auth_token', data.token);
            localStorage.setItem('hola_user', JSON.stringify(data.user));
            return true;
        }
        catch (err) {
            console.error('Login Error:', err);
            return false;
        }
    };
    const logout = () => {
        setToken(null);
        setUser(null);
        setOrganizations([]);
        setActiveOrgState(null);
        localStorage.removeItem('hola_auth_token');
        localStorage.removeItem('hola_user');
    };
    const fetchOrganizations = async () => {
        if (!token)
            return;
        try {
            const data = await apiCall('/api/v1/organizations');
            setOrganizations(data.organizations || []);
            if (data.organizations?.length > 0 && !activeOrg) {
                setActiveOrgState(data.organizations[0]);
            }
        }
        catch (err) {
            console.error('Fetch Orgs Error:', err);
        }
    };
    useEffect(() => {
        if (token) {
            fetchOrganizations();
        }
    }, [token]);
    const setActiveOrg = (org) => {
        setActiveOrgState(org);
    };
    return (_jsx(AppContext.Provider, { value: {
            token,
            user,
            organizations,
            activeOrg,
            setActiveOrg,
            login,
            logout,
            fetchOrganizations,
            apiCall,
        }, children: children }));
};
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context)
        throw new Error('useApp must be used within AppProvider');
    return context;
};
