import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardSlider } from "@/components/DashboardSlider";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth-context";
import { SessionsList } from "@/components/workout/SessionsList";
import { WORKOUT_TYPE_LABEL, WORKOUT_TYPE_OPTIONS, type WorkoutType } from "@/lib/workout-metrics";
import { Eye, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type ClientProfile = Tables<"profiles">;
type WorkoutPlanExercise = Tables<"workout_plan_exercises">;

type DayDraft = {
  dayIndex: number;
  title: string;
  workoutType: WorkoutType;
  notes: string;
  videoUrl: string;
  exercisesText: string;
};

type WeeklyPlanDraft = {
  planTitle: string;
  startDate: string;
  days: DayDraft[];
};

function buildDefaultDays(): DayDraft[] {
  return Array.from({ length: 7 }, (_, idx) => ({
    dayIndex: idx + 1,
    title: `Day ${idx + 1}`,
    workoutType: "strength",
    notes: "",
    videoUrl: "",
    exercisesText: "",
  }));
}

function getDraftKey(trainerId: string, clientId: string) {
  return `weekly-plan-draft:${trainerId}:${clientId}`;
}

function loadDraft(trainerId: string, clientId: string): WeeklyPlanDraft | null {
  try {
    const raw = sessionStorage.getItem(getDraftKey(trainerId, clientId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeeklyPlanDraft;
    if (!parsed || !Array.isArray(parsed.days) || parsed.days.length !== 7) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(trainerId: string, clientId: string, draft: WeeklyPlanDraft) {
  sessionStorage.setItem(getDraftKey(trainerId, clientId), JSON.stringify(draft));
}

function clearDraft(trainerId: string, clientId: string) {
  sessionStorage.removeItem(getDraftKey(trainerId, clientId));
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export const Route = createFileRoute("/trainer/clients")({
  component: () => (
    <RoleGuard allow={["trainer"]}>
      <ClientsPage />
    </RoleGuard>
  ),
});

function ClientsPage() {
  const { session } = useAuth();
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [active, setActive] = useState<ClientProfile | null>(null);
  const [planTitle, setPlanTitle] = useState("Weekly Plan");
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState<DayDraft[]>(buildDefaultDays());
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: acceptedBookings } = await supabase
        .from("bookings")
        .select("client_id")
        .eq("trainer_id", session.user.id)
        .eq("status", "accepted");

      const ids = Array.from(new Set((acceptedBookings ?? []).map((b) => b.client_id)));
      if (ids.length === 0) return setClients([]);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      setClients((profs ?? []) as ClientProfile[]);
    })();
  }, [session]);

  useEffect(() => {
    if (!session || !active) return;

    const existingDraft = loadDraft(session.user.id, active.id);

    setLoadingPlan(true);
    (async () => {
      const { data: plan, error: planError } = await supabase
        .from("workout_plans")
        .select("id, title, start_date")
        .eq("trainer_id", session.user.id)
        .eq("client_id", active.id)
        .maybeSingle();

      if (planError) {
        toast.error(planError.message);
        setPlanTitle("Weekly Plan");
        setStartDate("");
        setDays(buildDefaultDays());
        setLoadingPlan(false);
        return;
      }

      if (!plan) {
        if (existingDraft) {
          setPlanTitle(existingDraft.planTitle || "Weekly Plan");
          setStartDate(existingDraft.startDate || "");
          setDays(existingDraft.days);
        } else {
          setPlanTitle("Weekly Plan");
          setStartDate("");
          setDays(buildDefaultDays());
        }
        setLoadingPlan(false);
        return;
      }

      const { data: planDays, error: daysError } = await supabase
        .from("workout_plan_days")
        .select("id, day_index, title, workout_type, notes, video_url")
        .eq("plan_id", plan.id)
        .order("day_index", { ascending: true });

      if (daysError) {
        toast.error(daysError.message);
        setPlanTitle(plan.title);
        setStartDate(plan.start_date ?? "");
        setDays(buildDefaultDays());
        setLoadingPlan(false);
        return;
      }

      const dayIds = (planDays ?? []).map((d) => d.id);
      const { data: exercises, error: exerciseError } = dayIds.length
        ? await supabase
            .from("workout_plan_exercises")
            .select("day_id, name, position")
            .in("day_id", dayIds)
            .order("position", { ascending: true })
        : { data: [] as Pick<WorkoutPlanExercise, "day_id" | "name" | "position">[], error: null };

      if (exerciseError) {
        toast.error(exerciseError.message);
      }

      const byDay = new Map<string, string[]>();
      for (const ex of exercises ?? []) {
        const existing = byDay.get(ex.day_id) ?? [];
        existing.push(ex.name);
        byDay.set(ex.day_id, existing);
      }

      const loadedDays = buildDefaultDays();
      for (const d of planDays ?? []) {
        const i = d.day_index - 1;
        if (i < 0 || i > 6) continue;
        loadedDays[i] = {
          dayIndex: d.day_index,
          title: d.title,
          workoutType: (d.workout_type as WorkoutType | null) ?? "strength",
          notes: d.notes ?? "",
          videoUrl: d.video_url ?? "",
          exercisesText: (byDay.get(d.id) ?? []).join("\n"),
        };
      }

      setPlanTitle(existingDraft?.planTitle || plan.title);
      setStartDate(existingDraft?.startDate || toDateInputValue(plan.start_date));
      setDays(existingDraft?.days || loadedDays);
      setLoadingPlan(false);
    })();
  }, [active, session]);

  useEffect(() => {
    if (!session || !active || loadingPlan) return;
    saveDraft(session.user.id, active.id, {
      planTitle,
      startDate,
      days,
    });
  }, [session, active, planTitle, startDate, days, loadingPlan]);

  async function saveWeeklyPlan() {
    if (!session || !active) return;
    setSavingPlan(true);

    const normalizedStartDate = startDate ? toDateInputValue(startDate) : null;

    const { data: plan, error: planError } = await supabase
      .from("workout_plans")
      .upsert(
        {
          trainer_id: session.user.id,
          client_id: active.id,
          title: planTitle || "Weekly Plan",
          start_date: normalizedStartDate,
        },
        { onConflict: "trainer_id,client_id" },
      )
      .select("id")
      .single();

    if (planError) {
      setSavingPlan(false);
      toast.error(planError.message);
      return;
    }

    const planId = plan.id;
    const { error: deleteError } = await supabase
      .from("workout_plan_days")
      .delete()
      .eq("plan_id", planId);

    if (deleteError) {
      setSavingPlan(false);
      toast.error(deleteError.message);
      return;
    }

    const dayPayload = days.map((d) => ({
      plan_id: planId,
      day_index: d.dayIndex,
      title: d.title || `Day ${d.dayIndex}`,
      workout_type: d.workoutType,
      notes: d.notes || null,
      video_url: d.videoUrl || null,
    }));

    const { data: insertedDays, error: insertDaysError } = await supabase
      .from("workout_plan_days")
      .insert(dayPayload)
      .select("id, day_index");

    if (insertDaysError) {
      setSavingPlan(false);
      toast.error(insertDaysError.message);
      return;
    }

    const exercisesPayload: {
      day_id: string;
      name: string;
      position: number;
    }[] = [];

    for (const inserted of insertedDays ?? []) {
      const draft = days.find((d) => d.dayIndex === inserted.day_index);
      if (!draft) continue;
      const names = draft.exercisesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      names.forEach((name, idx) => {
        exercisesPayload.push({
          day_id: inserted.id,
          name,
          position: idx,
        });
      });
    }

    if (exercisesPayload.length > 0) {
      const { error: exError } = await supabase
        .from("workout_plan_exercises")
        .insert(exercisesPayload);
      if (exError) {
        setSavingPlan(false);
        toast.error(exError.message);
        return;
      }
    }

    setSavingPlan(false);
    clearDraft(session.user.id, active.id);
    setStartDate(normalizedStartDate ?? "");
    toast.success("Weekly plan saved for client");
  }

  function updateDay(index: number, next: Partial<DayDraft>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...next } : d)));
  }

  if (active) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSlider role="trainer" title="Trainer Dashboard" />
        <div className="md:pl-72">
          <div className="container mx-auto px-4 py-10">
            <Button variant="ghost" size="sm" onClick={() => setActive(null)} className="mb-4">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              {active.full_name}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">{active.email}</p>
            <div className="mt-8 grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <Card className="p-6 border-2 border-foreground/10 mt-6">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-bold tracking-tight">
                        Weekly workout plan (Day 1 to Day 7)
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create each day plan and add a video URL for the client to watch inside the
                        app.
                      </p>
                    </div>
                    <Button
                      onClick={saveWeeklyPlan}
                      disabled={loadingPlan || savingPlan}
                      className="bg-foreground text-accent hover:bg-foreground/90"
                    >
                      {savingPlan ? "Saving..." : "Save weekly plan"}
                    </Button>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Plan title</Label>
                      <Input
                        value={planTitle}
                        onChange={(e) => setPlanTitle(e.target.value)}
                        placeholder="Weekly Plan"
                        disabled={loadingPlan}
                      />
                    </div>
                    <div>
                      <Label>Start date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={loadingPlan}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {days.map((day, idx) => (
                      <Card key={day.dayIndex} className="p-4 border border-foreground/10">
                        <div className="font-display text-lg font-bold">Day {day.dayIndex}</div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Label>Workout title</Label>
                            <Input
                              value={day.title}
                              onChange={(e) => updateDay(idx, { title: e.target.value })}
                              placeholder={`Day ${day.dayIndex} workout`}
                              disabled={loadingPlan}
                            />
                          </div>
                          <div>
                            <Label>Workout type</Label>
                            <select
                              value={day.workoutType}
                              onChange={(e) =>
                                updateDay(idx, { workoutType: e.target.value as WorkoutType })
                              }
                              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                              disabled={loadingPlan}
                            >
                              {WORKOUT_TYPE_OPTIONS.map((type) => (
                                <option key={type} value={type}>
                                  {WORKOUT_TYPE_LABEL[type]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Video URL</Label>
                            <Input
                              value={day.videoUrl}
                              onChange={(e) => updateDay(idx, { videoUrl: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=..."
                              disabled={loadingPlan}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Exercises (one per line)</Label>
                            <Textarea
                              rows={3}
                              value={day.exercisesText}
                              onChange={(e) => updateDay(idx, { exercisesText: e.target.value })}
                              placeholder={"Push-ups\nSquats\nPlank"}
                              disabled={loadingPlan}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label>Notes</Label>
                            <Textarea
                              rows={2}
                              value={day.notes}
                              onChange={(e) => updateDay(idx, { notes: e.target.value })}
                              placeholder="Any guidance for this day"
                              disabled={loadingPlan}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-6 border-2 border-foreground/10 h-fit">
                <h2 className="font-display text-xl font-bold tracking-tight">Recent sessions</h2>
                <div className="mt-4">
                  <SessionsList clientId={active.id} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSlider role="trainer" title="Trainer Dashboard" />
      <div className="md:pl-72">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            Trainer / My clients
          </div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight">
            Accepted clients
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Clients with accepted appointments. Click a client to create and manage their weekly
            workout plan.
          </p>

          <div className="mt-8 grid gap-3">
            {clients.length === 0 ? (
              <Card className="p-10 border-2 border-dashed border-foreground/15 text-center text-muted-foreground">
                No accepted client appointments yet.
              </Card>
            ) : (
              clients.map((c) => (
                <Card
                  key={c.id}
                  className="p-5 border-2 border-foreground/10 flex items-center justify-between hover:border-foreground/30 transition-colors"
                >
                  <div>
                    <div className="font-display font-bold">{c.full_name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{c.email}</div>
                  </div>
                  <Button onClick={() => setActive(c)} variant="outline" size="sm">
                    <Eye className="h-4 w-4" /> View progress
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
