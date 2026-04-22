import { useState, type ComponentType } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, UserRound, Users, Dumbbell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type DashboardSliderRole = "client" | "trainer";

type DashboardSliderProps = {
  role: DashboardSliderRole;
  title: string;
  showDesktop?: boolean;
  triggerClassName?: string;
};

type MenuItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function getActiveItemTo(items: MenuItem[], currentPath: string): string | null {
  const normalizedCurrent = normalizePath(currentPath);
  const matches = items.filter((item) => {
    const normalizedItem = normalizePath(item.to);
    return (
      normalizedCurrent === normalizedItem || normalizedCurrent.startsWith(`${normalizedItem}/`)
    );
  });

  if (matches.length === 0) return null;
  return matches.sort((a, b) => normalizePath(b.to).length - normalizePath(a.to).length)[0].to;
}

const MENU_ITEMS: Record<DashboardSliderRole, MenuItem[]> = {
  client: [
    { to: "/client", label: "Dashboard", icon: LayoutDashboard },
    { to: "/client/profile", label: "Profile", icon: UserRound },
    { to: "/client/workouts", label: "Workouts", icon: Dumbbell },
    { to: "/trainers", label: "Find Trainers", icon: Users },
  ],
  trainer: [
    { to: "/trainer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/trainer/profile", label: "Profile", icon: UserRound },
    { to: "/trainer/clients", label: "Clients", icon: Users },
  ],
};

export function DashboardSlider({
  role,
  title,
  showDesktop = true,
  triggerClassName,
}: DashboardSliderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const items = MENU_ITEMS[role];
  const currentPath = location.pathname;
  const activeItemTo = getActiveItemTo(items, currentPath);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "fixed left-4 top-4 z-50 border-2 border-foreground/20 md:hidden",
              triggerClassName,
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open dashboard menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="border-r-2 border-foreground/15 sm:max-w-md md:hidden">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl font-extrabold tracking-tight">
              {title}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-8 space-y-2">
            {items.map((item) => {
              const isActive = activeItemTo === item.to;
              const Icon = item.icon;

              return (
                <SheetClose key={item.to} asChild>
                  <Link
                    to={item.to as any}
                    className={`flex items-center gap-3 rounded-md border-2 px-4 py-3 font-medium transition-colors ${
                      isActive
                        ? "border-foreground bg-foreground text-accent"
                        : "border-foreground/15 hover:border-foreground/30 hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </SheetClose>
              );
            })}
          </div>

          <div className="mt-8 border-t border-foreground/10 pt-6">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={async () => {
                setOpen(false);
                await signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {showDesktop && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r-2 border-foreground/10 bg-background md:flex md:flex-col">
          <div className="border-b border-foreground/10 px-5 py-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60">
              Dashboard
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{title}</h2>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {items.map((item) => {
              const isActive = activeItemTo === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to as any}
                  className={`flex items-center gap-3 rounded-md border-2 px-4 py-3 font-medium transition-colors ${
                    isActive
                      ? "border-foreground bg-foreground text-accent"
                      : "border-foreground/15 hover:border-foreground/30 hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-foreground/10 p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={async () => {
                await signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>
      )}
    </>
  );
}
