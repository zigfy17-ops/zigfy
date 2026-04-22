import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { DashboardSlider } from "@/components/DashboardSlider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, CalendarPlus, Dumbbell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/client/")({
  component: ClientDash,
});

function ClientDash() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!session) return;

    if (sessionStorage.getItem("booking_request_sent") === "1") {
      sessionStorage.removeItem("booking_request_sent");
      toast.success("Appointment request sent to the trainer.");
    }

    const load = async () => {
      const { data: bs } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", session.user.id)
        .order("requested_date", { ascending: false });
      const ids = Array.from(new Set((bs ?? []).map((b) => b.trainer_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, full_name").in("id", ids)
        : { data: [] as any };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));
      setBookings(
        (bs ?? []).map((b) => ({ ...b, trainer_name: map.get(b.trainer_id) ?? "Trainer" })),
      );
    };
    load();
    const channel = supabase
      .channel("client-bookings-" + session.user.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `client_id=eq.${session.user.id}`,
        },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSlider role="client" title="Client Dashboard" />
      <div className="md:pl-72">
        <div className="container mx-auto px-4 py-16 md:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            Client / Dashboard
          </div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Your training, your way.
          </h1>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Link
              to="/client/workouts"
              className="group block p-6 rounded-md border-2 border-foreground bg-foreground text-background hover:bg-accent hover:text-foreground transition-colors"
            >
              <div className="flex items-center justify-between">
                <Dumbbell className="h-6 w-6 text-accent group-hover:text-foreground" />
                <span className="font-mono text-xs uppercase tracking-widest opacity-60">→</span>
              </div>
              <div className="mt-6 font-display text-2xl font-extrabold tracking-tight">
                Workouts
              </div>
              <div className="mt-1 text-sm opacity-80">Live timer, manual logs, metrics.</div>
            </Link>
            <Link
              to="/trainers"
              className="group block p-6 rounded-md border-2 border-foreground bg-background hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <CalendarPlus className="h-6 w-6" />
                <span className="font-mono text-xs uppercase tracking-widest text-foreground/60">
                  →
                </span>
              </div>
              <div className="mt-6 font-display text-2xl font-extrabold tracking-tight">
                Find a trainer
              </div>
              <div className="mt-1 text-sm text-foreground/70">Book your next session.</div>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-tight">Bookings</h2>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {bookings.length} total
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {bookings.length === 0 ? (
              <Card className="p-10 border-2 border-dashed border-foreground/15 text-center">
                <Activity className="mx-auto h-8 w-8 text-foreground/30" />
                <p className="mt-3 text-muted-foreground">No bookings yet.</p>
                <Button asChild className="mt-4 bg-foreground text-accent hover:bg-foreground/90">
                  <Link to="/trainers">Browse trainers</Link>
                </Button>
              </Card>
            ) : (
              bookings.map((b) => (
                <Card
                  key={b.id}
                  className="p-5 border-2 border-foreground/10 flex items-center justify-between flex-wrap gap-4 hover:border-foreground/30 transition-colors"
                >
                  <div>
                    <div className="font-display font-bold">{b.trainer_name}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {new Date(b.requested_date).toLocaleString()}
                    </div>
                    {b.message && (
                      <div className="text-xs text-muted-foreground mt-1 italic">"{b.message}"</div>
                    )}
                  </div>
                  <StatusBadge status={b.status} />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "border-foreground/30 bg-warning/15 text-foreground",
    accepted: "border-foreground bg-[color:var(--accent)] text-foreground",
    rejected: "border-destructive/30 bg-destructive/10 text-destructive",
    cancelled: "border-foreground/15 bg-muted text-muted-foreground",
    completed: "border-foreground bg-foreground text-[color:var(--accent)]",
  };
  return (
    <Badge
      variant="outline"
      className={`font-mono text-[10px] uppercase tracking-widest ${map[status] ?? ""}`}
    >
      {status}
    </Badge>
  );
}
