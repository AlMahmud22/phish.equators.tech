import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import type { UserRole } from "@/types";

export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions);
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}

export function isTester(session: Session | null): boolean {
  const role = session?.user?.role;
  return role === "tester" || role === "admin";
}

export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user;
}

export function hasRole(session: Session | null, role: UserRole): boolean {
  return session?.user?.role === role;
}

export function hasAnyRole(
  session: Session | null,
  roles: UserRole[]
): boolean {
  return roles.includes(session?.user?.role as UserRole);
}

export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();

  if (session.user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }

  return session;
}

export async function requireAnyRole(roles: UserRole[]) {
  const session = await requireAuth();

  if (!roles.includes(session.user.role)) {
    throw new Error(`Forbidden: One of [${roles.join(", ")}] roles required`);
  }

  return session;
}
