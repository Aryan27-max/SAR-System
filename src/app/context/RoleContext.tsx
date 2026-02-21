import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../lib/api';

export type UserRole = 'Analyst' | 'Supervisor' | 'Auditor';

interface User {
  employeeId: string;
  name: string;
  role: UserRole;
}

interface RoleContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  login: (employeeId: string, password: string) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const logout = () => {
    setUser(null);
  };

  const login = async (employeeId: string, password: string) => {
    const data = await api.login(employeeId, password);
    setUser({
      employeeId: data.employeeId,
      name: data.name,
      role: data.role,
    });
  };

  return (
    <RoleContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        logout,
        login,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};
