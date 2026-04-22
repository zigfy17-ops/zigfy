import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  estimateCaloriesFromMet,
  WORKOUT_TYPE_LABEL,
  WORKOUT_TYPE_OPTIONS,
  type WorkoutType,
} from "@/lib/workout-metrics";
import { toast } from "sonner";

export function ManualLogForm({ onSaved }: { onSaved?: () => void }) {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [duration, setDuration] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("strength");
  const [calories, setCalories] = useState("");
  const [avgHr, setAvgHr] = useState("");
  const [maxHr, setMaxHr] = useState("");
  const [effort, setEffort] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    const dur = duration ? Number(duration) * 60 : null;
    const started = new Date(date);
    const ended = dur ? new Date(started.getTime() + dur * 1000) : null;

    let est: number | null = null;
    if (!calories && dur) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("weight_kg")
        .eq("id", session.user.id)
        .maybeSingle();
      est = estimateCaloriesFromMet(workoutType, profile?.weight_kg ?? null, dur);
    }

    const { error } = await supabase.from("workout_sessions").insert({
      client_id: session.user.id,
      workout_name: name || "Workout",
      source: "manual",
      started_at: started.toISOString(),
      ended_at: ended?.toISOString() ?? null,
      duration_seconds: dur,
      calories: calories ? Number(calories) : est,
      workout_type: workoutType,
      avg_heart_rate: avgHr ? Number(avgHr) : null,
      max_heart_rate: maxHr ? Number(maxHr) : null,
      perceived_effort: effort ? Number(effort) : null,
      notes: notes || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Logged ✓");
    setName("");
    setDuration("");
    setWorkoutType("strength");
    setCalories("");
    setAvgHr("");
    setMaxHr("");
    setEffort("");
    setNotes("");
    onSaved?.();
  }

  return (
    <Card className="p-6 border-2 border-foreground/10">
      <h3 className="font-display text-xl font-bold tracking-tight">Log a past workout</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Don't see your calories? We'll estimate them from duration and workout type MET.
      </p>
      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Workout name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning Run"
            required
          />
        </div>
        <div>
          <Label>When</Label>
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Duration (min)</Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Workout type</Label>
          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {WORKOUT_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {WORKOUT_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Calories (kcal)</Label>
          <Input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="auto-estimate"
          />
        </div>
        <div>
          <Label>Effort 1–10</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={effort}
            onChange={(e) => setEffort(e.target.value)}
          />
        </div>
        <div>
          <Label>Avg HR (bpm)</Label>
          <Input type="number" value={avgHr} onChange={(e) => setAvgHr(e.target.value)} />
        </div>
        <div>
          <Label>Max HR (bpm)</Label>
          <Input type="number" value={maxHr} onChange={(e) => setMaxHr(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label>Notes</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="sm:col-span-2 bg-foreground text-accent hover:bg-foreground/90"
        >
          {busy ? "Saving…" : "Log workout"}
        </Button>
      </form>
    </Card>
  );
}
