
import React, { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function requireAuth<P extends object>(
  Component: ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lingua-primary"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/auth" />;
    }

    return <Component {...props} />;
  };
}
