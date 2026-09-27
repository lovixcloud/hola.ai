import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  isPlatformAdmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  myRole?: string;
}

interface AppContextType {
  token: string | null;
  user: User | null;
  organizations: Organization[];
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  fetchOrganizations: () => Promise<void>;
  apiCall: (path: string, options?: RequestInit) => Promise<any>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('hola_auth_token'));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('hola_user') ? JSON.parse(localStorage.getItem('hola_user')!) : null
  );
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrgState] = useState<Organization | null>(null);

  const apiCall = async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
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

  const login = async (email: string, pass: string) => {
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
    } catch (err) {
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
    if (!token) return;
    try {
      const data = await apiCall('/api/v1/organizations');
      setOrganizations(data.organizations || []);
      if (data.organizations?.length > 0 && !activeOrg) {
        setActiveOrgState(data.organizations[0]);
      }
    } catch (err) {
      console.error('Fetch Orgs Error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrganizations();
    }
  }, [token]);

  const setActiveOrg = (org: Organization) => {
    setActiveOrgState(org);
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        organizations,
        activeOrg,
        setActiveOrg,
        login,
        logout,
        fetchOrganizations,
        apiCall,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
