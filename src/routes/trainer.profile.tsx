import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardSlider } from "@/components/DashboardSlider";
import { RoleGuard } from "@/components/RoleGuard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/trainer/profile")({
  component: () => (
    <RoleGuard allow={["trainer"]}>
      <TrainerProfilePage />
    </RoleGuard>
  ),
});

function TrainerProfilePage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [years, setYears] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    if (!session) return;
    void loadProfile();
  }, [session]);

  async function loadProfile() {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setProfile(data);
    setBio(data?.bio ?? "");
    setExpertise((data?.expertise ?? []).join(", "));
    setYears(data?.years_experience?.toString() ?? "");
    setAvailability(data?.availability ?? "");
    setIsEditing(!data);
    setLoading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    const payload = {
      bio: bio || null,
      expertise: expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      years_experience: years ? Number(years) : null,
      availability: availability || null,
    };

    setSaving(true);
    if (profile) {
      const { error } = await supabase
        .from("trainers")
        .update(payload)
        .eq("user_id", session.user.id);
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
    } else {
      const { error } = await supabase
        .from("trainers")
        .insert({ user_id: session.user.id, ...payload });
      if (error) {
        setSaving(false);
        return toast.error(error.message);
      }
    }

    toast.success("Profile saved");
    setSaving(false);
    await loadProfile();
    setIsEditing(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSlider role="trainer" title="Trainer Dashboard" />
      <div className="md:pl-72">
        <div className="container mx-auto px-4 py-10 md:py-14 max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            Trainer / Profile
          </div>
          <div className="mt-2 flex items-end justify-between gap-3 flex-wrap">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Your profile.
            </h1>
            {profile && !isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit profile
              </Button>
            )}
          </div>

          {loading ? (
            <Card className="mt-8 p-8 border-2 border-foreground/10">
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </Card>
          ) : isEditing ? (
            <Card className="mt-8 p-6 border-2 border-foreground/10">
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Bio</Label>
                  <Textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about your approach..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Expertise (comma-separated)</Label>
                  <Input
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="Strength, HIIT, Yoga"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Years experience</Label>
                    <Input type="number" value={years} onChange={(e) => setYears(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Availability</Label>
                  <Input
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="Mon-Fri 6am-9pm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-foreground text-accent hover:bg-foreground/90"
                  >
                    {saving ? "Saving..." : "Save profile"}
                  </Button>
                  {profile && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          ) : (
            <Card className="mt-8 p-6 border-2 border-foreground/10">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold tracking-tight">Current details</h2>
                {profile?.is_approved ? (
                  <Badge variant="outline" className="bg-accent border-foreground">
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="outline">Pending approval</Badge>
                )}
              </div>
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Bio
                  </p>
                  <p className="mt-1">{profile?.bio || "No bio added yet."}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Expertise
                  </p>
                  <p className="mt-1">
                    {(profile?.expertise ?? []).length > 0
                      ? profile.expertise.join(", ")
                      : "No expertise added yet."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Years experience
                    </p>
                    <p className="mt-1">{profile?.years_experience ?? "Not set"}</p>
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Availability
                  </p>
                  <p className="mt-1">{profile?.availability || "Not set"}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
