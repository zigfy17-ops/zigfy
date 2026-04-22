import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/NotificationBell";
import { User } from "lucide-react";

export function AppHeader() {
  const { session, role, signOut } = useAuth();
  const navigate = useNavigate();

  const dashHref = role === "admin" ? "/admin" : role === "trainer" ? "/trainer" : "/client";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-foreground/10 bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5 font-display">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-[color:var(--accent)] font-black text-sm">
            Z
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            zigfy<span className="text-[color:var(--accent)]">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1.5">
          <Link
            to="/trainers"
            className="hidden sm:inline-block px-3 py-1.5 text-sm font-medium hover:text-foreground/70 transition-colors"
          >
            Trainers
          </Link>
          {session ? (
            <>
              <NotificationBell />
              {role === "trainer" && (
                <Button variant="ghost" size="icon" asChild>
                  <a href="/trainer/profile" aria-label="Profile" title="Profile">
                    <User className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to={dashHref as any}>Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-foreground text-[color:var(--accent)] hover:bg-foreground/90"
              >
                <Link to="/auth">Get started →</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
