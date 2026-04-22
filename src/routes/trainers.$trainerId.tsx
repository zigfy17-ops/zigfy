import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/trainers/$trainerId")({
  component: TrainerDetail,
});

function TrainerDetail() {
  const { trainerId } = Route.useParams();
  const { session, role } = useAuth();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase
        .from("trainers")
        .select("*")
        .eq("user_id", trainerId)
        .maybeSingle();
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", trainerId)
        .maybeSingle();
      setTrainer(t);
      setProfile(p);
      setLoading(false);
    })();
  }, [trainerId]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return navigate({ to: "/auth" });
    if (role !== "client") return toast.error("Only client accounts can book trainers.");
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      client_id: session.user.id,
      trainer_id: trainerId,
      requested_date: new Date(date).toISOString(),
      message: message || null,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    sessionStorage.setItem("booking_request_sent", "1");
    toast.success("Appointment request sent to the trainer.");
    navigate({ to: "/client" });
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
        {loading ? (
          <p className="font-mono text-sm text-muted-foreground">Loading…</p>
        ) : !trainer ? (
          <p>Trainer not found.</p>
        ) : (
          <>
            <Card className="p-8 border-2 border-foreground">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-foreground">
                  <AvatarFallback className="text-lg bg-accent text-foreground font-extrabold">
                    {(profile?.full_name ?? "T").slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-display text-3xl font-extrabold tracking-tight">
                    {profile?.full_name ?? "Trainer"}
                  </h1>
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {trainer.years_experience ?? 0} years experience
                  </p>
                </div>
              </div>
              <p className="mt-6 leading-relaxed">{trainer.bio ?? "No bio yet."}</p>
              <div className="mt-4 flex flex-wrap gap-1">
                {(trainer.expertise ?? []).map((e: string) => (
                  <Badge
                    key={e}
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-wider border-foreground/20"
                  >
                    {e}
                  </Badge>
                ))}
              </div>
              {trainer.availability && (
                <p className="mt-4 text-sm">
                  <span className="font-mono uppercase tracking-widest text-xs text-muted-foreground">
                    Availability ·{" "}
                  </span>
                  {trainer.availability}
                </p>
              )}
            </Card>

            <Card className="mt-6 p-8 border-2 border-foreground/10">
              <h2 className="font-display text-2xl font-bold tracking-tight">Book a session</h2>
              <form onSubmit={handleBook} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred date & time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="msg">Message (optional)</Label>
                  <Textarea
                    id="msg"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the trainer about your goals…"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-foreground text-accent hover:bg-foreground/90"
                >
                  {submitting ? "Sending…" : "Send request →"}
                </Button>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
