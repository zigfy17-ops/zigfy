import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

/**
 * Lets a client toggle which trainer(s) can view their workouts & metrics.
 * Auto-includes any trainer with whom the client has a booking.
 */
export function SharingPanel() {
  const { session } = useAuth();
  const [trainers, setTrainers] = useState<any[]>([]);

  async function load() {
    if (!session) return;
    // Find trainers via existing bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("trainer_id")
      .eq("client_id", session.user.id);
    const ids = Array.from(new Set((bookings ?? []).map((b) => b.trainer_id)));
    if (ids.length === 0) return setTrainers([]);
    const [{ data: profs }, { data: grants }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email").in("id", ids),
      supabase.from("trainer_data_access").select("*").eq("client_id", session.user.id),
    ]);
    const grantMap = new Map((grants ?? []).map((g: any) => [g.trainer_id, g.granted]));
    setTrainers(
      (profs ?? []).map((p: any) => ({ ...p, granted: grantMap.get(p.id) ?? false })),
    );
  }
  useEffect(() => { load(); }, [session]);

  async function toggle(trainerId: string, granted: boolean) {
    if (!session) return;
    const { error } = await supabase
      .from("trainer_data_access")
      .upsert(
        { client_id: session.user.id, trainer_id: trainerId, granted },
        { onConflict: "client_id,trainer_id" },
      );
    if (error) return toast.error(error.message);
    toast.success(granted ? "Trainer can now view your data" : "Access revoked");
    setTrainers((arr) => arr.map((t) => (t.id === trainerId ? { ...t, granted } : t)));
  }

  return (
    <Card className="p-6 border-2 border-foreground/10">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-[color:var(--accent)] text-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">Data sharing</h3>
          <p className="text-sm text-muted-foreground">Choose which trainers can see your workouts and metrics.</p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {trainers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Book a trainer first — then you can share progress with them.</p>
        ) : trainers.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-md border-2 border-foreground/10 p-4">
            <div>
              <div className="font-semibold">{t.full_name ?? "Trainer"}</div>
              <div className="font-mono text-xs text-muted-foreground">{t.email}</div>
            </div>
            <Switch checked={t.granted} onCheckedChange={(v) => toggle(t.id, v)} />
          </div>
        ))}
      </div>
    </Card>
  );
}