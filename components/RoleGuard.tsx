"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import type { UserRole } from "@/types";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
  showError?: boolean;
}

/// RoleGuard component - restricts access to UI sections based on user role
/// Wraps content that should only be visible to specific roles
/// @param allowedRoles - Array of roles that can access the content
/// @param fallback - Optional JSX to show when user doesn't have permission
/// @param redirectTo - Optional path to redirect unauthorized users
/// @param showError - Whether to show error message for unauthorized access
export default function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  redirectTo,
  showError = true,
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    /// redirect if specified and user is unauthorized
    if (
      status === "authenticated" &&
      session?.user?.role &&
      !allowedRoles.includes(session.user.role) &&
      redirectTo
    ) {
      router.push(redirectTo);
    }
  }, [status, session, allowedRoles, redirectTo, router]);

  /// show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  /// show error if not authenticated
  if (status === "unauthenticated") {
    if (showError) {
      return (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Authentication Required
              </h3>
              <p className="mt-1 text-sm text-red-700">
                You must be logged in to access this content.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return fallback;
  }

  /// check if user has required role
  const userRole = session?.user?.role;
  const hasAccess = userRole && allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (showError) {
      return (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Access Restricted
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                You don't have permission to access this content. Required
                role: {allowedRoles.join(" or ")}.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return fallback;
  }

  /// user has access, render children
  return <>{children}</>;
}

/// Hook to check if current user has specific role
export function useHasRole(role: UserRole): boolean {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user?.role) {
    return false;
  }

  return session.user.role === role;
}

/// Hook to check if current user has any of the specified roles
export function useHasAnyRole(roles: UserRole[]): boolean {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user?.role) {
    return false;
  }

  return roles.includes(session.user.role);
}

/// Hook to get current user's role
export function useUserRole(): UserRole | null {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user?.role) {
    return null;
  }

  return session.user.role;
}
