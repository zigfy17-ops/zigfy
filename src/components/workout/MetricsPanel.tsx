import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const METRICS = [
  { value: "weight_kg", label: "Weight (kg)" },
  { value: "body_fat_pct", label: "Body Fat (%)" },
  { value: "resting_hr", label: "Resting HR (bpm)" },
  { value: "sleep_hours", label: "Sleep (hours)" },
  { value: "steps", label: "Steps" },
];

export function MetricsPanel({ clientId }: { clientId?: string }) {
  const { session } = useAuth();
  const userId = clientId ?? session?.user.id;
  const readOnly = Boolean(clientId);
  const [metric, setMetric] = useState("weight_kg");
  const [value, setValue] = useState("");
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    if (!userId) return;
    const { data } = await supabase
      .from("fitness_metrics")
      .select("*")
      .eq("client_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(50);
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, [userId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    const { error } = await supabase.from("fitness_metrics").insert({
      client_id: session.user.id,
      metric,
      value: Number(value),
    });
    if (error) return toast.error(error.message);
    setValue("");
    toast.success("Recorded");
    load();
  }

  return (
    <Card className="p-6 border-2 border-foreground/10">
      <h3 className="font-display text-xl font-bold tracking-tight">Fitness metrics</h3>
      {!readOnly && (
        <form onSubmit={add} className="mt-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <Label>Metric</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {METRICS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Value</Label>
            <Input type="number" step="any" required value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <Button type="submit" className="bg-foreground text-[color:var(--accent)] hover:bg-foreground/90">Add</Button>
        </form>
      )}
      <div className="mt-6">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data recorded yet.</p>
        ) : (
          <div className="divide-y divide-foreground/10">
            {items.map((i) => {
              const lbl = METRICS.find((m) => m.value === i.metric)?.label ?? i.metric;
              return (
                <div key={i.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{lbl}</span>
                  <span className="font-display font-bold tabular">{i.value}</span>
                  <span className="font-mono text-xs text-muted-foreground">{new Date(i.recorded_at).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}