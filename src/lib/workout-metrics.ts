export type WorkoutType = "light" | "strength" | "hiit" | "cardio";

export const WORKOUT_TYPE_LABEL: Record<WorkoutType, string> = {
  light: "Light",
  strength: "Strength",
  hiit: "HIIT",
  cardio: "Cardio",
};

export const MET_BY_TYPE: Record<WorkoutType, number> = {
  light: 3,
  strength: 5,
  hiit: 9,
  cardio: 10,
};

export const INTENSITY_BY_TYPE: Record<WorkoutType, number> = {
  light: 0.6,
  strength: 0.7,
  hiit: 0.85,
  cardio: 0.8,
};

export const WORKOUT_TYPE_OPTIONS: WorkoutType[] = ["light", "strength", "hiit", "cardio"];

export function inferWorkoutTypeFromText(text: string | null | undefined): WorkoutType {
  const value = (text ?? "").toLowerCase();
  if (value.includes("hiit") || value.includes("hit")) return "hiit";
  if (value.includes("cardio") || value.includes("run") || value.includes("cycling")) {
    return "cardio";
  }
  if (value.includes("light") || value.includes("mobility") || value.includes("recovery")) {
    return "light";
  }
  return "strength";
}

export function estimateCaloriesFromMet(
  workoutType: WorkoutType,
  weightKg: number | null,
  durationSeconds: number,
): number | null {
  if (weightKg == null || durationSeconds <= 0) return null;
  const met = MET_BY_TYPE[workoutType];
  const timeHours = durationSeconds / 3600;
  return Math.max(1, Math.round(met * Number(weightKg) * timeHours));
}