import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardSlider } from "@/components/DashboardSlider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/client/profile")({
  component: ClientProfilePage,
});

function ClientProfilePage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  useEffect(() => {
    if (!session) return;
    void loadProfile();
  }, [session]);

  async function loadProfile() {
    if (!session) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, age, gender, weight_kg, height_cm")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setFullName(data?.full_name ?? "");
    setAge(data?.age?.toString() ?? "");
    setGender(data?.gender ?? "");
    setWeightKg(data?.weight_kg?.toString() ?? "");
    setHeightCm(data?.height_cm?.toString() ?? "");
    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;

    if (!fullName.trim()) {
      toast.error("Name is required.");
      return;
    }

    const parsedAge = Number(age);
    if (!age || Number.isNaN(parsedAge) || parsedAge <= 0) {
      toast.error("Please enter a valid age.");
      return;
    }

    const parsedWeight = Number(weightKg);
    if (!weightKg || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      toast.error("Weight (kg) is required and must be greater than 0.");
      return;
    }

    const parsedHeight = heightCm ? Number(heightCm) : null;
    if (heightCm && (Number.isNaN(parsedHeight) || (parsedHeight ?? 0) <= 0)) {
      toast.error("Height (cm) must be greater than 0.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        age: parsedAge,
        gender: gender.trim() || null,
        weight_kg: parsedWeight,
        height_cm: parsedHeight,
      })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated.");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSlider role="client" title="Client Dashboard" />
      <div className="md:pl-72">
        <div className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            Client / Profile
          </div>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Your profile.
          </h1>

          {loading ? (
            <Card className="mt-8 border-2 border-foreground/10 p-8">
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </Card>
          ) : (
            <Card className="mt-8 border-2 border-foreground/10 p-6">
              <form className="space-y-6" onSubmit={saveProfile}>
                <div className="space-y-4">
                  <h2 className="font-display text-xl font-bold tracking-tight">Basic Profile</h2>
                  <div className="space-y-1.5">
                    <Label htmlFor="client-name">Name</Label>
                    <Input
                      id="client-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="client-age">Age</Label>
                      <Input
                        id="client-age"
                        type="number"
                        min={1}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="e.g. 28"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="client-gender">Gender (optional)</Label>
                      <Input
                        id="client-gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        placeholder="e.g. Female, Male, Non-binary"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-foreground/10 pt-6">
                  <h2 className="font-display text-xl font-bold tracking-tight">Body Data</h2>
                  <div className="space-y-1.5">
                    <Label htmlFor="client-weight">Weight (kg)</Label>
                    <Input
                      id="client-weight"
                      type="number"
                      min={1}
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="Required"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This is very important for training accuracy.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="client-height">Height (cm) (optional)</Label>
                    <Input
                      id="client-height"
                      type="number"
                      min={1}
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-foreground text-accent hover:bg-foreground/90"
                >
                  {saving ? "Saving..." : "Save profile"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
