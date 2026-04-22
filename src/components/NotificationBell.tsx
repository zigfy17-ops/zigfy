import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Notif = { id: string; title: string; message: string | null; read: boolean; created_at: string };

export function NotificationBell() {
  const { session } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const unread = items.filter((i) => !i.read).length;

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, read, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setItems(data ?? []);
    })();

    const channel = supabase
      .channel("notifications-" + session.user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          const n = payload.new as Notif;
          setItems((prev) => [n, ...prev]);
          toast.info(n.title, { description: n.message ?? undefined });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session]);

  async function markAllRead() {
    if (!session) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id).eq("read", false);
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  if (!session) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className={`px-4 py-3 border-b border-border/50 ${!n.read ? "bg-accent/30" : ""}`}>
                <div className="text-sm font-medium">{n.title}</div>
                {n.message && <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>}
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}