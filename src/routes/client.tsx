import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";

export const Route = createFileRoute("/client")({
  component: () => (
    <RoleGuard allow={["client"]}>
      <Outlet />
    </RoleGuard>
  ),
});
