import { useSupabaseAuth } from '@hooks/useSupabaseAuth';
import React, { createContext, useContext } from 'react';


interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Call your hook once
  console.log('AuthProvider rendering and calling useSupabaseAuth');
  const auth = useSupabaseAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to consume context in child components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};