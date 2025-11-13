import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../types/authservice';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    // Redirect to login page if not authenticated
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
