/**
 * Protected Route Component
 * Wraps routes that require authentication and optionally specific permissions
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  redirectTo = '/staff/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground mt-4 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check for required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-destructive text-4xl font-bold">403</h1>
          <p className="mt-2 text-lg font-semibold">Access Denied</p>
          <p className="text-muted-foreground mt-1 text-sm">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check for required role
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-destructive text-4xl font-bold">403</h1>
          <p className="mt-2 text-lg font-semibold">Access Denied</p>
          <p className="text-muted-foreground mt-1 text-sm">
            This page is only accessible to {requiredRole} role.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
