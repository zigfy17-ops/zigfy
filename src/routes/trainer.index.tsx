import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { DashboardSlider } from "@/components/DashboardSlider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/trainer/")({
  component: TrainerDash,
});

function TrainerDash() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!session) return;
    const load = async () => {
      const { data: bs } = await supabase
        .from("bookings")
        .select("*")
        .eq("trainer_id", session.user.id)
        .order("requested_date", { ascending: false });
      const ids = Array.from(new Set((bs ?? []).map((b) => b.client_id)));
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, full_name").in("id", ids)
        : { data: [] as any };
      const map = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));
      setBookings((bs ?? []).map((b) => ({ ...b, client_name: map.get(b.client_id) ?? "Client" })));
    };
    load();
    const channel = supabase
      .channel("trainer-bookings-" + session.user.id)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `trainer_id=eq.${session.user.id}`,
        },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  async function respond(id: string, status: "accepted" | "rejected") {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);

    toast.success(`Booking ${status}`);
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const others = bookings.filter((b) => b.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <DashboardSlider role="trainer" title="Trainer Dashboard" />
      <div className="md:pl-72">
        <div className="container mx-auto px-4 py-16 md:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            Trainer / Dashboard
          </div>
          <div className="mt-2 flex items-end justify-between flex-wrap gap-4">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Your studio.
            </h1>
            <Button asChild variant="outline" className="border-2 border-foreground">
              <Link to="/trainer/clients">View client progress -&gt;</Link>
            </Button>
          </div>

          <div className="mt-8">
            <Card className="p-6 border-2 border-foreground/10 max-w-3xl">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Pending requests{" "}
                <span className="font-mono text-xs text-muted-foreground font-normal">
                  ({pending.length})
                </span>
              </h2>
              <div className="mt-4 space-y-3">
                {pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending requests.</p>
                ) : (
                  pending.map((b) => (
                    <div key={b.id} className="rounded-md border-2 border-foreground/10 p-3">
                      <div className="font-display font-bold">{b.client_name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {new Date(b.requested_date).toLocaleString()}
                      </div>
                      {b.message && (
                        <p className="text-xs italic text-muted-foreground mt-1">"{b.message}"</p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respond(b.id, "accepted")}
                          className="bg-foreground text-accent hover:bg-foreground/90"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => respond(b.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {others.length > 0 && (
                <>
                  <h3 className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    History
                  </h3>
                  <div className="mt-2 space-y-2">
                    {others.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between text-sm py-1.5 border-b border-foreground/5 last:border-0"
                      >
                        <span className="font-medium">
                          {b.client_name} ·{" "}
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(b.requested_date).toLocaleDateString()}
                          </span>
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] uppercase tracking-wider"
                        >
                          {b.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
