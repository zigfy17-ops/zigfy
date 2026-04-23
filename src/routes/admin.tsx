import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RoleGuard allow={["admin"]}>
      <AdminDash />
    </RoleGuard>
  ),
});

function AdminDash() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [stats, setStats] = useState({ trainers: 0, clients: 0, bookings: 0, pending: 0 });

  const load = async () => {
    const { data: ts } = await supabase
      .from("trainers")
      .select("*")
      .order("created_at", { ascending: false });
    const ids = (ts ?? []).map((t) => t.user_id);
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as any };
    const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
    setTrainers((ts ?? []).map((t) => ({ ...t, profile: map.get(t.user_id) })));

    const [{ count: tc }, { count: cc }, { count: bc }, { count: pc }] = await Promise.all([
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "trainer"),
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "client"),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    setStats({ trainers: tc ?? 0, clients: cc ?? 0, bookings: bc ?? 0, pending: pc ?? 0 });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
          Admin / Overview
        </div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight">
          Platform pulse.
        </h1>

        <div className="mt-8 grid gap-px md:grid-cols-4 bg-foreground/15 border-2 border-foreground rounded-md overflow-hidden">
          {[
            { label: "Trainers", value: stats.trainers },
            { label: "Clients", value: stats.clients },
            { label: "Bookings", value: stats.bookings },
            { label: "Pending", value: stats.pending },
          ].map((s) => (
            <div key={s.label} className="bg-background p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-2 font-display text-4xl font-extrabold tabular tracking-tight">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl font-bold tracking-tight">Trainers</h2>
        <div className="mt-4 space-y-3">
          {trainers.length === 0 ? (
            <Card className="p-10 border-2 border-dashed border-foreground/15 text-center text-muted-foreground">
              No trainers yet.
            </Card>
          ) : (
            trainers.map((t) => (
              <Card
                key={t.id}
                className="p-5 border-2 border-foreground/10 flex items-center justify-between flex-wrap gap-4 hover:border-foreground/30 transition-colors"
              >
                <div>
                  <div className="font-display font-bold">{t.profile?.full_name ?? "Trainer"}</div>
                  <div className="font-mono text-xs text-muted-foreground">{t.profile?.email}</div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">{t.bio ?? "No bio"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-widest bg-accent border-foreground"
                  >
                    Active
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
