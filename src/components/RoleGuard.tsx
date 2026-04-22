import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/lib/auth-context";

export function RoleGuard({ allow, children }: { allow: AppRole[]; children: ReactNode }) {
  const { loading, session, role } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" />;
  if (role && !allow.includes(role)) return <Navigate to="/" />;
  return <>{children}</>;
}