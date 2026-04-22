import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardSlider } from "@/components/DashboardSlider";
import { RoleGuard } from "@/components/RoleGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutTimer } from "@/components/workout/WorkoutTimer";
import { SharingPanel } from "@/components/workout/SharingPanel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type WorkoutPlan = Tables<"workout_plans">;
type WorkoutPlanDay = Tables<"workout_plan_days">;
type WorkoutPlanExercise = Tables<"workout_plan_exercises">;

type DayWithExercises = WorkoutPlanDay & {
  exercises: WorkoutPlanExercise[];
};

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/client/workouts")({
  component: () => (
    <RoleGuard allow={["client"]}>
      <WorkoutsPage />
    </RoleGuard>
  ),
});

function WorkoutsPage() {
  const { session } = useAuth();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [planDays, setPlanDays] = useState<DayWithExercises[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState("weekly-plan");
  const [completedDayIndexes, setCompletedDayIndexes] = useState<number[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  async function loadPlan() {
    if (!session) return;
    setLoadingPlan(true);

    const { data: currentPlan, error: planError } = await supabase
      .from("workout_plans")
      .select("id, trainer_id, client_id, title, start_date, created_at, updated_at")
      .eq("client_id", session.user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError) {
      toast.error(planError.message);
      setLoadingPlan(false);
      return;
    }

    setPlan(currentPlan);
    if (!currentPlan) {
      setPlanDays([]);
      setCompletedDayIndexes([]);
      setLoadingPlan(false);
      return;
    }

    const { data: days, error: daysError } = await supabase
      .from("workout_plan_days")
      .select("id, plan_id, day_index, title, workout_type, notes, video_url, created_at")
      .eq("plan_id", currentPlan.id)
      .order("day_index", { ascending: true });

    if (daysError) {
      toast.error(daysError.message);
      setLoadingPlan(false);
      return;
    }

    const dayIds = (days ?? []).map((d) => d.id);
    const { data: exercises, error: exercisesError } = dayIds.length
      ? await supabase
          .from("workout_plan_exercises")
          .select("id, day_id, position, name, sets, reps, rest_seconds, notes, created_at")
          .in("day_id", dayIds)
          .order("position", { ascending: true })
      : { data: [] as WorkoutPlanExercise[], error: null };

    if (exercisesError) {
      toast.error(exercisesError.message);
      setLoadingPlan(false);
      return;
    }

    const mapped = (days ?? []).map((d) => ({
      ...d,
      exercises: (exercises ?? []).filter((e) => e.day_id === d.id),
    }));

    const { data: sessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select("plan_day_index")
      .eq("client_id", session.user.id)
      .eq("plan_id", currentPlan.id)
      .not("plan_day_index", "is", null);

    if (sessionsError) {
      toast.error(sessionsError.message);
      setLoadingPlan(false);
      return;
    }

    const completed = Array.from(
      new Set((sessions ?? []).map((s) => s.plan_day_index).filter((n): n is number => !!n)),
    ).sort((a, b) => a - b);

    setPlanDays(mapped);
    setCompletedDayIndexes(completed);
    setLoadingPlan(false);
  }

  useEffect(() => {
    loadPlan();
  }, [session]);

  const nextPendingDay = planDays.find((d) => !completedDayIndexes.includes(d.day_index)) ?? null;
  const selectedDay = planDays.find((d) => d.id === selectedDayId) ?? null;
  const activeDayForTimer = selectedDay ?? nextPendingDay;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSlider role="client" title="Client Dashboard" />
      <div className="md:pl-72">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
                <Link to="/client" className="hover:text-foreground">
                  Dashboard
                </Link>{" "}
                / Workouts
              </div>
              <h1 className="mt-2 font-display text-4xl md:text-5xl font-extrabold tracking-tight">
                Train. Log. Repeat.
              </h1>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid grid-cols-3 h-auto bg-foreground/5 p-1">
              <TabsTrigger value="timer">Live Timer</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
              <TabsTrigger value="weekly-plan">Weekly Plan</TabsTrigger>
            </TabsList>
            <TabsContent value="timer" className="mt-6">
              <WorkoutTimer
                plannedDay={
                  activeDayForTimer
                    ? {
                        planId: activeDayForTimer.plan_id,
                        dayId: activeDayForTimer.id,
                        dayIndex: activeDayForTimer.day_index,
                        title: activeDayForTimer.title,
                        workoutType: activeDayForTimer.workout_type,
                        exercises: activeDayForTimer.exercises.map((e) => ({
                          name: e.name,
                          sets: e.sets ?? 3,
                          reps: e.reps ?? 10,
                          rest: e.rest_seconds ?? 60,
                        })),
                      }
                    : undefined
                }
                onSaved={() => {
                  setSelectedDayId(null);
                  setActiveTab("weekly-plan");
                  void loadPlan();
                }}
              />
            </TabsContent>
            <TabsContent value="sharing" className="mt-6">
              <SharingPanel />
            </TabsContent>
            <TabsContent value="weekly-plan" className="mt-6">
              <Card className="p-6 border-2 border-foreground/10">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight">
                      Your weekly trainer plan
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Day 1 to Day 7 workouts created by your trainer.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadPlan} disabled={loadingPlan}>
                    {loadingPlan ? "Refreshing..." : "Refresh plan"}
                  </Button>
                </div>

                {!plan && !loadingPlan && (
                  <p className="text-sm text-muted-foreground mt-6">
                    No weekly plan assigned yet. Ask your trainer to create one.
                  </p>
                )}

                {plan && (
                  <>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{plan.title}</Badge>
                      <Badge variant="secondary">
                        Completed: {completedDayIndexes.length}/{planDays.length || 7}
                      </Badge>
                      {plan.start_date && (
                        <Badge variant="secondary">
                          Starts: {new Date(plan.start_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-6">
                      {nextPendingDay ? (
                        <Card className="border border-foreground/10 p-5">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
                                Next workout
                              </p>
                              <h4 className="font-display text-2xl font-bold tracking-tight">
                                Day {nextPendingDay.day_index} - {nextPendingDay.title}
                              </h4>
                            </div>
                            <Button
                              className="bg-foreground text-accent hover:bg-foreground/90"
                              onClick={() => {
                                setSelectedDayId(nextPendingDay.id);
                                setActiveTab("timer");
                              }}
                            >
                              Start Day {nextPendingDay.day_index} Workout
                            </Button>
                          </div>

                          {nextPendingDay.notes && (
                            <p className="mt-3 text-sm text-muted-foreground">
                              {nextPendingDay.notes}
                            </p>
                          )}

                          {nextPendingDay.exercises.length > 0 && (
                            <div className="mt-4">
                              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
                                Exercises
                              </div>
                              <ul className="mt-2 space-y-1 text-sm">
                                {nextPendingDay.exercises.map((ex) => (
                                  <li key={ex.id}>• {ex.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {nextPendingDay.video_url && <DayVideo day={nextPendingDay} />}
                        </Card>
                      ) : (
                        <Card className="border border-foreground/10 p-5">
                          <h4 className="font-display text-2xl font-bold tracking-tight">
                            Weekly plan completed
                          </h4>
                          <p className="mt-2 text-sm text-muted-foreground">
                            You completed all assigned days. Ask your trainer for the next plan.
                          </p>
                        </Card>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function DayVideo({ day }: { day: DayWithExercises }) {
  const embedUrl = day.video_url ? toEmbedUrl(day.video_url) : null;
  const isMp4 = !!day.video_url && day.video_url.toLowerCase().endsWith(".mp4");

  return (
    <div className="mt-4 space-y-3">
      <a
        href={day.video_url ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline underline-offset-4"
      >
        Open workout video in new tab
      </a>
      {embedUrl ? (
        <div
          className="relative w-full overflow-hidden rounded-md border border-foreground/10"
          style={{ paddingTop: "56.25%" }}
        >
          <iframe
            title={`Day ${day.day_index} workout video`}
            src={embedUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : isMp4 ? (
        <video controls className="w-full rounded-md border border-foreground/10">
          <source src={day.video_url ?? ""} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : null}
    </div>
  );
}
