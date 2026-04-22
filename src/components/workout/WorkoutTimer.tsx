import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Plus, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  estimateCaloriesFromMet,
  inferWorkoutTypeFromText,
  INTENSITY_BY_TYPE,
  MET_BY_TYPE,
  WORKOUT_TYPE_LABEL,
  WORKOUT_TYPE_OPTIONS,
  type WorkoutType,
} from "@/lib/workout-metrics";
import { toast } from "sonner";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  doneSets: number;
};

type PlannedDay = {
  planId: string;
  dayId: string;
  dayIndex: number;
  title: string;
  workoutType?: string | null;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    rest: number;
  }>;
};

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

function toWorkoutType(value: string | null | undefined): WorkoutType | null {
  if (!value) return null;
  return WORKOUT_TYPE_OPTIONS.includes(value as WorkoutType) ? (value as WorkoutType) : null;
}

export function WorkoutTimer({
  onSaved,
  plannedDay,
}: {
  onSaved?: () => void;
  plannedDay?: PlannedDay;
}) {
  const { session } = useAuth();
  const [name, setName] = useState("Workout");
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [restLeft, setRestLeft] = useState(0);
  const [calories, setCalories] = useState("");
  const [avgHr, setAvgHr] = useState("");
  const [maxHr, setMaxHr] = useState("");
  const [effort, setEffort] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("strength");
  const startedRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!plannedDay) return;
    if (seconds > 0 || running) return;

    setName(plannedDay.title);
    setWorkoutType(
      toWorkoutType(plannedDay.workoutType) ?? inferWorkoutTypeFromText(plannedDay.title),
    );
    setExercises(
      plannedDay.exercises.map((ex) => ({
        id: crypto.randomUUID(),
        name: ex.name,
        sets: Math.max(1, ex.sets || 1),
        reps: Math.max(1, ex.reps || 1),
        rest: Math.max(0, ex.rest || 0),
        doneSets: 0,
      })),
    );
  }, [plannedDay, seconds, running]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => s + 1);
      setRestLeft((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  function start() {
    if (!startedRef.current) startedRef.current = new Date();
    setRunning(true);
  }

  function addExercise() {
    setExercises((e) => [
      ...e,
      { id: crypto.randomUUID(), name: "Exercise", sets: 3, reps: 10, rest: 60, doneSets: 0 },
    ]);
  }

  function completeSet(id: string) {
    setExercises((e) =>
      e.map((x) => (x.id === id ? { ...x, doneSets: Math.min(x.sets, x.doneSets + 1) } : x)),
    );
    const ex = exercises.find((x) => x.id === id);
    if (ex) setRestLeft(ex.rest);
  }

  async function finish() {
    if (!session) return;
    if (seconds === 0) return;

    setRunning(false);
    const started_at = startedRef.current?.toISOString() ?? new Date().toISOString();
    const ended_at = new Date().toISOString();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("age, weight_kg")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profileError) {
      return toast.error(profileError.message);
    }

    const age = profile?.age ?? null;
    const weightKg = profile?.weight_kg ?? null;
    const met = MET_BY_TYPE[workoutType];
    const intensity = INTENSITY_BY_TYPE[workoutType];
    const estimatedCalories = estimateCaloriesFromMet(workoutType, weightKg, seconds);
    const estimatedMaxHr = age != null ? Math.max(0, 220 - age) : null;
    const estimatedAvgHr =
      estimatedMaxHr != null ? Math.max(0, Math.round(estimatedMaxHr * intensity)) : null;

    const finalCalories = calories ? Number(calories) : estimatedCalories;
    const finalMaxHr = maxHr ? Number(maxHr) : estimatedMaxHr;
    const finalAvgHr = avgHr ? Number(avgHr) : estimatedAvgHr;
    const computedEffort =
      finalAvgHr && finalMaxHr && finalMaxHr > 0
        ? Number(Math.min(10, Math.max(1, (finalAvgHr / finalMaxHr) * 10)).toFixed(1))
        : null;
    const finalEffort = effort ? Number(effort) : computedEffort;

    const totalPlannedSets = exercises.reduce((sum, ex) => sum + Math.max(ex.sets, 0), 0);
    const totalDoneSets = exercises.reduce((sum, ex) => sum + Math.max(ex.doneSets, 0), 0);
    const completionRatio =
      totalPlannedSets > 0 ? Number((totalDoneSets / totalPlannedSets).toFixed(2)) : null;

    const durationScore = Math.min(1, seconds / 1800);
    const intensityScore = finalAvgHr && finalMaxHr ? Math.min(1, finalAvgHr / finalMaxHr) : 0;
    const completionScore = completionRatio ?? (seconds > 0 ? 1 : 0);
    const workoutEfficiency = Number(
      Math.min(
        100,
        Math.max(0, (completionScore * 0.5 + intensityScore * 0.3 + durationScore * 0.2) * 100),
      ).toFixed(1),
    );

    const reportJson = {
      workout_type: workoutType,
      met,
      intensity_factor: intensity,
      age,
      weight_kg: weightKg,
      duration_seconds: seconds,
      estimated_calories: estimatedCalories,
      estimated_avg_heart_rate: estimatedAvgHr,
      estimated_max_heart_rate: estimatedMaxHr,
      completion_ratio: completionRatio,
      workout_efficiency: workoutEfficiency,
    };

    const { error } = await supabase.from("workout_sessions").insert({
      client_id: session.user.id,
      workout_name: plannedDay?.title || name,
      source: "timer",
      started_at,
      ended_at,
      duration_seconds: seconds,
      calories: finalCalories,
      avg_heart_rate: finalAvgHr,
      max_heart_rate: finalMaxHr,
      perceived_effort: finalEffort,
      workout_type: workoutType,
      plan_id: plannedDay?.planId ?? null,
      plan_day_id: plannedDay?.dayId ?? null,
      plan_day_index: plannedDay?.dayIndex ?? null,
      completion_ratio: completionRatio,
      workout_efficiency: workoutEfficiency,
      report_json: reportJson,
      notes: exercises.length
        ? exercises.map((e) => `${e.name}: ${e.doneSets}/${e.sets}×${e.reps}`).join(" · ")
        : null,
    });
    if (error) return toast.error(error.message);
    toast.success(
      plannedDay
        ? `Day ${plannedDay.dayIndex} saved. Efficiency ${workoutEfficiency}/100`
        : "Workout saved 💪",
    );
    setSeconds(0);
    setExercises([]);
    setCalories("");
    setAvgHr("");
    setMaxHr("");
    setEffort("");
    setRestLeft(0);
    startedRef.current = null;
    onSaved?.();
  }

  const isPlanMode = !!plannedDay;

  return (
    <Card className="p-0 overflow-hidden border-2 border-foreground">
      {/* Big timer panel */}
      <div className="bg-foreground text-background p-8">
        <div className="flex flex-wrap items-end gap-3 border-b-2 border-background/20 pb-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPlanMode}
            className="h-auto flex-1 bg-transparent border-0 rounded-none px-0 text-background text-lg font-semibold focus-visible:ring-0 focus-visible:border-accent"
            placeholder="Workout name"
          />
          <div className="min-w-40 sm:min-w-44">
            <Label className="text-[10px] uppercase tracking-widest text-background/70">
              Workout type
            </Label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value as WorkoutType)}
              disabled={isPlanMode}
              className="mt-1 h-10 w-full rounded-md border border-background/30 bg-transparent px-3 text-sm text-background"
            >
              {WORKOUT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type} className="text-foreground">
                  {WORKOUT_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 font-mono tabular text-[clamp(3.5rem,12vw,6rem)] font-extrabold leading-none text-accent">
          {fmt(seconds)}
        </div>
        {restLeft > 0 && (
          <div className="mt-3 font-mono text-sm uppercase tracking-widest text-background/70">
            Rest · <span className="text-accent">{restLeft}s</span>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (running) {
                setRunning(false);
                return;
              }
              start();
            }}
            className="bg-accent text-foreground hover:bg-accent/90"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : seconds > 0 ? "Resume" : "Start"}
          </Button>
          <Button
            onClick={finish}
            disabled={seconds === 0}
            className="bg-accent text-foreground hover:bg-accent/90 disabled:opacity-100 disabled:bg-accent/50 disabled:text-foreground/80"
          >
            <Square className="h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      {/* Exercises */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold tracking-tight">
            {plannedDay ? `Day ${plannedDay.dayIndex} Exercises` : "Exercises"}
          </h3>
          {!isPlanMode && (
            <Button variant="outline" size="sm" onClick={addExercise}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          )}
        </div>
        {exercises.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add exercises to track sets · reps · rest.
          </p>
        )}
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="border-2 border-foreground/10 rounded-md p-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end"
          >
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Name
              </Label>
              <Input
                value={ex.name}
                disabled={isPlanMode}
                onChange={(e) =>
                  setExercises((arr) =>
                    arr.map((x) => (x.id === ex.id ? { ...x, name: e.target.value } : x)),
                  )
                }
              />
            </div>
            {(
              [
                ["Sets", "sets"],
                ["Reps", "reps"],
                ["Rest s", "rest"],
              ] as const
            ).map(([label, key]) => (
              <div key={key} className="w-20">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </Label>
                <Input
                  type="number"
                  value={ex[key]}
                  disabled={isPlanMode}
                  onChange={(e) =>
                    setExercises((arr) =>
                      arr.map((x) =>
                        x.id === ex.id ? { ...x, [key]: Number(e.target.value) } : x,
                      ),
                    )
                  }
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="font-mono text-sm tabular text-muted-foreground">
                {ex.doneSets}/{ex.sets}
              </div>
              <Button
                size="sm"
                onClick={() => completeSet(ex.id)}
                disabled={ex.doneSets >= ex.sets}
              >
                <Check className="h-4 w-4" />
              </Button>
              {!isPlanMode && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setExercises((arr) => arr.filter((x) => x.id !== ex.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            ["Calories", calories, setCalories, "kcal"],
            ["Avg HR", avgHr, setAvgHr, "bpm"],
            ["Max HR", maxHr, setMaxHr, "bpm"],
            ["Effort", effort, setEffort, "1-10"],
          ].map(([label, val, setter, ph]) => (
            <div key={label as string}>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {label as string}
              </Label>
              <Input
                type="number"
                placeholder={ph as string}
                value={val as string}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
