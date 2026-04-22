import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleGuard } from "@/components/RoleGuard";

export const Route = createFileRoute("/trainer")({
  component: () => (
    <RoleGuard allow={["trainer"]}>
      <Outlet />
    </RoleGuard>
  ),
});
