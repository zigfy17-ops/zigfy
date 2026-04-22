import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Activity, Flame, Heart, Timer } from "lucide-react";

function fmtDur(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

function fmtKcal(calories: number | null, durationSeconds: number | null) {
  if (calories == null) return "—";
  if (calories === 0 && (durationSeconds ?? 0) > 0) return "<1";
  return calories;
}

export function SessionsList({ clientId, refreshKey }: { clientId?: string; refreshKey?: number }) {
  const { session } = useAuth();
  const userId = clientId ?? session?.user.id;
  const [items, setItems] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("client_id", userId)
        .order("started_at", { ascending: false })
        .limit(30);
      setItems(data ?? []);
    })();
  }, [userId, refreshKey]);

  const reportItems = items.filter(
    (s) => s.plan_day_index != null || s.report_json != null || s.workout_efficiency != null,
  );

  if (reportItems.length === 0) {
    return (
      <Card className="p-10 border-2 border-dashed border-foreground/15 text-center">
        <Activity className="mx-auto h-8 w-8 text-foreground/30" />
        <p className="mt-3 text-sm text-muted-foreground">No day reports yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reportItems.map((s) => (
        <Card
          key={s.id}
          className="p-5 border-2 border-foreground/10 hover:border-foreground/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display text-lg font-bold tracking-tight">
                  {s.plan_day_index ? `Day ${s.plan_day_index} report` : s.workout_name}
                </h4>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                  {s.source}
                </Badge>
              </div>
              <div className="font-mono text-xs text-muted-foreground mt-0.5">
                {new Date(s.started_at).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-wrap gap-5 text-sm">
              <Stat icon={Timer} label="Duration" value={fmtDur(s.duration_seconds)} tone="time" />
              {s.calories != null && (
                <Stat
                  icon={Flame}
                  label="kcal"
                  value={fmtKcal(s.calories, s.duration_seconds)}
                  tone="kcal"
                />
              )}
              {s.avg_heart_rate != null && (
                <Stat icon={Heart} label="avg bpm" value={s.avg_heart_rate} tone="heart" />
              )}
              {s.perceived_effort != null && (
                <Stat
                  icon={Activity}
                  label="effort"
                  value={`${s.perceived_effort}/10`}
                  tone="effort"
                />
              )}
            </div>
          </div>
          {(s.plan_day_index || s.report_json || s.workout_efficiency != null) && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpandedId((prev) => (prev === s.id ? null : s.id))}
              >
                {expandedId === s.id ? "Hide report details" : "View report details"}
              </Button>
            </div>
          )}
          {expandedId === s.id && (
            <div className="mt-3 rounded-md border border-foreground/10 p-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Workout type
                  </span>
                  <p className="font-display font-bold">{s.workout_type ?? "Not set"}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Efficiency
                  </span>
                  <p className="font-display font-bold">
                    {s.workout_efficiency != null ? `${s.workout_efficiency}/100` : "Not set"}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Completion
                  </span>
                  <p className="font-display font-bold">
                    {s.completion_ratio != null
                      ? `${Math.round(Number(s.completion_ratio) * 100)}%`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Max HR
                  </span>
                  <p className="font-display font-bold">{s.max_heart_rate ?? "Not set"}</p>
                </div>
              </div>
            </div>
          )}
          {s.notes && <p className="mt-3 text-xs text-muted-foreground">{s.notes}</p>}
        </Card>
      ))}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: any;
  tone?: "time" | "kcal" | "heart" | "effort";
}) {
  const iconTone =
    tone === "time"
      ? "text-sky-600"
      : tone === "kcal"
        ? "text-orange-500"
        : tone === "heart"
          ? "text-rose-500"
          : tone === "effort"
            ? "text-violet-600"
            : "text-foreground/60";

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${iconTone}`} />
      <div className="font-display font-bold tabular">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
