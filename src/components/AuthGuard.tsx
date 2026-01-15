import React from 'react';
import { useStore } from '../store/useStore';
import { Login } from './Login';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return <Login />;
  }

  return <>{children}</>;
};
