import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { session, role: authRole, loading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupRole, setSignupRole] = useState<"client" | "trainer">("client");
  const [busy, setBusy] = useState(false);

  // Redirect once role is known so users land on their dashboard, not the landing page
  if (!loading && session && !roleLoading) {
    const dest = authRole === "admin" ? "/admin" : authRole === "trainer" ? "/trainer" : "/client";
    return <Navigate to={dest} />;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    // The redirect above will handle routing once role loads.
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, role: signupRole },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you're signed in.");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 py-12 md:py-20 items-center min-h-[calc(100vh-80px)]">
        {/* Left side — bold marketing column */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-foreground/60">
            Account · Get started
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-[0.95] tracking-tight">
            Show up.
            <br />
            Sweat.
            <br />
            <span className="bg-[color:var(--accent)] px-2 -ml-1">Repeat.</span>
          </h1>
          <p className="mt-6 text-base text-foreground/70 max-w-md leading-relaxed">
            Build your training routine with a real coach. Live timer, session history, and progress
            shared on your terms.
          </p>
        </div>
        <Card className="w-full max-w-md p-7 border-2 border-foreground mx-auto lg:mx-0 shadow-[var(--shadow-brutal)]">
          <h2 className="text-xl font-extrabold tracking-tight">Welcome to Zigfy</h2>
          <p className="mt-1 text-xs text-foreground/60">Sign in or create your account.</p>

          <Tabs defaultValue="signin" className="mt-5">
            <TabsList className="grid w-full grid-cols-2 bg-background">
              <TabsTrigger value="signin" className="text-sm">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs font-medium">
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm py-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signin-password" className="text-xs font-medium">
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm py-2"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-foreground text-[color:var(--accent)] hover:bg-foreground/90 text-sm py-2 mt-2"
                >
                  {busy ? "Signing in…" : "Sign in →"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-xs font-medium">
                    Full name
                  </Label>
                  <Input
                    id="signup-name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-sm py-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-medium">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm py-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-medium">
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm py-2"
                  />
                </div>
                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-medium">I am a…</Label>
                  <RadioGroup
                    value={signupRole}
                    onValueChange={(v) => setSignupRole(v as "client" | "trainer")}
                    className="grid grid-cols-2 gap-1.5"
                  >
                    <label className="flex items-center gap-2 rounded-lg border border-foreground/20 p-2.5 cursor-pointer hover:border-foreground/40 text-sm [&:has([data-state=checked])]:border-foreground [&:has([data-state=checked])]:bg-background">
                      <RadioGroupItem value="client" />{" "}
                      <span className="font-medium text-xs">Client</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-foreground/20 p-2.5 cursor-pointer hover:border-foreground/40 text-sm [&:has([data-state=checked])]:border-foreground [&:has([data-state=checked])]:bg-background">
                      <RadioGroupItem value="trainer" />{" "}
                      <span className="font-medium text-xs">Trainer</span>
                    </label>
                  </RadioGroup>
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-foreground text-[color:var(--accent)] hover:bg-foreground/90 text-sm py-2 mt-2"
                >
                  {busy ? "Creating account…" : "Create account →"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
