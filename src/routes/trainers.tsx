import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { DashboardSlider } from "@/components/DashboardSlider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/trainers")({
  component: TrainersPage,
});

type TrainerRow = {
  id: string;
  user_id: string;
  bio: string | null;
  expertise: string[] | null;
  years_experience: number | null;
  profile: { full_name: string | null; avatar_url: string | null } | null;
};

function TrainersPage() {
  const location = useLocation();
  const [trainers, setTrainers] = useState<TrainerRow[]>([]);
  const [bookedTrainerIds, setBookedTrainerIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { role, session } = useAuth();
  const showSlider = role === "client" || role === "trainer";

  // This route is a parent of /trainers/$trainerId. Render child routes when not on the list path.
  if (location.pathname !== "/trainers") {
    return <Outlet />;
  }

  useEffect(() => {
    (async () => {
      const { data: ts } = await supabase
        .from("trainers")
        .select("id, user_id, bio, expertise, years_experience");
      const ids = (ts ?? []).map((t) => t.user_id);
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids)
        : { data: [] as any };
      const profMap = new Map<string, { full_name: string | null; avatar_url: string | null }>(
        (profs ?? []).map((p: any) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]),
      );
      setTrainers((ts ?? []).map((t) => ({ ...t, profile: profMap.get(t.user_id) ?? null })));

      if (role === "client" && session?.user?.id && (ts ?? []).length > 0) {
        const trainerUserIds = (ts ?? []).map((t) => t.user_id);
        const { data: bookings } = await supabase
          .from("bookings")
          .select("trainer_id")
          .eq("client_id", session.user.id)
          .in("trainer_id", trainerUserIds)
          .in("status", ["pending", "accepted"]);

        setBookedTrainerIds(new Set((bookings ?? []).map((b) => b.trainer_id)));
      } else {
        setBookedTrainerIds(new Set());
      }

      setLoading(false);
    })();
  }, [role, session]);

  return (
    <div className="min-h-screen bg-background">
      {showSlider && (
        <DashboardSlider
          role={role === "trainer" ? "trainer" : "client"}
          title={role === "trainer" ? "Trainer Dashboard" : "Client Dashboard"}
          showDesktop
          triggerClassName="top-20"
        />
      )}
      <AppHeader />
      <div className={showSlider ? "md:pl-72" : undefined}>
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            Browse / Trainers
          </div>
          <h1 className="mt-2 font-display text-5xl md:text-6xl font-extrabold tracking-tight">
            Coaches who get it.
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Vetted personal trainers. Book in minutes.
          </p>

          {loading ? (
            <p className="mt-12 font-mono text-sm text-muted-foreground">Loading…</p>
          ) : trainers.length === 0 ? (
            <Card className="mt-12 p-12 border-2 border-dashed border-foreground/15 text-center">
              <p className="text-muted-foreground">No trainers yet. Check back soon!</p>
            </Card>
          ) : (
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trainers.map((t) => (
                <Card
                  key={t.id}
                  className="p-6 border-2 border-foreground/10 hover:border-foreground transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-foreground">
                      <AvatarFallback className="bg-accent text-foreground font-extrabold">
                        {(t.profile?.full_name ?? "T").slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-display font-bold tracking-tight">
                        {t.profile?.full_name ?? "Trainer"}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t.years_experience ?? 0} yrs · expert
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-foreground/70 line-clamp-3 min-h-15">
                    {t.bio ?? "Certified personal trainer ready to help you reach your goals."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(t.expertise ?? []).slice(0, 3).map((e) => (
                      <Badge
                        key={e}
                        variant="outline"
                        className="font-mono text-[10px] uppercase tracking-wider border-foreground/20"
                      >
                        {e}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-center border-t-2 border-foreground/10 pt-4">
                    {bookedTrainerIds.has(t.user_id) ? (
                      <Button size="sm" disabled className="bg-foreground/70 text-accent">
                        Current trainer
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        className="bg-foreground text-accent hover:bg-foreground/90"
                      >
                        <Link to="/trainers/$trainerId" params={{ trainerId: t.user_id }}>
                          Book an appointment
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
