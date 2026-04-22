import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* HERO — asymmetric, oversized typography, lime accent bar */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background/50">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 pt-12 pb-16 md:pt-16 md:pb-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-start min-h-[600px]">
          <div className="flex flex-col justify-start motion-enter">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/60">
              <span className="h-2 w-2 rounded-full bg-[color:var(--accent)] animate-pulse" />
              Live · Now matching trainers
            </div>
            <h1 className="mt-4 text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em]">
              Train like
              <br />
              you mean
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">it.</span>
                <span
                  className="absolute inset-x-0 bottom-1 h-4 bg-[color:var(--accent)] z-0"
                  aria-hidden
                />
              </span>
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Personalized workout plans", "Verified coaches", "Progress shared live"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-foreground/20 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-foreground/70"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
            <p className="mt-6 max-w-xl text-sm md:text-base text-foreground/70 leading-relaxed">
              Zigfy is the new home for personal coaching. Book real trainers, run live workouts
              with a built-in timer, and share every rep with the coach in your corner.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="group interactive-lift inline-flex items-center gap-2 rounded-md bg-foreground text-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold tracking-wide shadow-[var(--shadow-brutal)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_var(--foreground)] transition-all"
              >
                Start training
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/trainers"
                className="interactive-lift inline-flex items-center gap-2 rounded-md border-2 border-foreground px-5 py-2.5 text-sm font-semibold tracking-wide hover:bg-foreground hover:text-background transition-colors"
              >
                Browse trainers
              </Link>
            </div>
          </div>

          {/* Stat panel */}
          <div className="flex h-full flex-col gap-3 motion-enter motion-delay-1">
            <div className="relative rounded-md border-2 border-foreground overflow-hidden min-h-[300px] interactive-lift">
              <img
                src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80"
                alt="Personal training session with coach guidance"
                className="hero-image-motion h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/80">
                  Live coaching environment
                </div>
                <div className="mt-1 text-xl font-bold text-background leading-tight max-w-md">
                  Real trainers. Real sessions. Built for measurable progress.
                </div>
              </div>
            </div>

            <div className="rounded-md border-2 border-foreground bg-background overflow-hidden interactive-lift">
              <div className="flex border-b-2 border-foreground">
                <div className="flex-1 bg-foreground text-background font-mono text-[11px] uppercase tracking-wider font-bold px-4 py-2.5 flex items-center justify-center">
                  Today
                </div>
                <div className="flex-1 bg-background text-foreground/60 font-mono text-[11px] uppercase tracking-wider px-4 py-2.5 flex items-center justify-center border-l-2 border-foreground">
                  Sessions
                </div>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { time: "09:00", name: "Jane Doe", type: "Weightlifting" },
                  { time: "10:30", name: "John Smith", type: "Yoga (Available)" },
                  { time: "13:00", name: "Sarah Lee", type: "HIIT (Available)" },
                ].map((session) => (
                  <div
                    key={session.time}
                    className="flex items-start gap-2 pb-2 border-b border-foreground/10 last:border-0 last:pb-0"
                  >
                    <span className="font-mono text-[10px] text-foreground/50 pt-0.5 w-12">
                      {session.time}
                    </span>
                    <div className="flex-1 text-sm text-foreground/80">
                      <div className="font-medium">{session.name}</div>
                      <div className="text-xs text-foreground/60">{session.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="border-y-2 border-foreground bg-foreground text-background py-4 overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap font-mono text-sm uppercase tracking-[0.25em] animate-[marquee_30s_linear_infinite]">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-12">
                Strength <span className="text-[color:var(--accent)]">●</span>
                HIIT <span className="text-[color:var(--accent)]">●</span>
                Mobility <span className="text-[color:var(--accent)]">●</span>
                Endurance <span className="text-[color:var(--accent)]">●</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 py-24 motion-enter motion-delay-1">
        <div className="mb-8 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            How it works
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Start training in three simple steps
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-foreground/15 border-2 border-foreground rounded-md overflow-hidden stagger-children">
          {[
            {
              n: "01",
              t: "Find your trainer",
              b: "Vetted coaches, transparent rates, real reviews. Filter by what matters.",
            },
            {
              n: "02",
              t: "Book in real time",
              b: "Request a slot, get accepted, get reminders. No back-and-forth.",
            },
            {
              n: "03",
              t: "Train + track",
              b: "Live workout timer, sets and reps, calories, heart rate. All in your feed.",
            },
          ].map((f) => (
            <div
              key={f.n}
              className="bg-background p-8 hover:bg-[color:var(--accent)] transition-colors group interactive-lift"
            >
              <div className="font-mono text-xs tracking-widest text-foreground/60 group-hover:text-foreground/80">
                {f.n} / 03
              </div>
              <h3 className="mt-6 text-2xl font-bold tracking-tight">{f.t}</h3>
              <p className="mt-3 text-sm text-foreground/70 group-hover:text-foreground/80 leading-relaxed">
                {f.b}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="container mx-auto px-4 pb-24 motion-enter motion-delay-2">
        <div className="mb-8 max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
            Pricing
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Flexible plans for members and coaches
          </h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-3 stagger-children">
          {[
            {
              name: "Starter",
              price: "$0",
              cycle: "/mo",
              blurb: "Explore trainers and track basic progress.",
              points: ["Browse trainer profiles", "1 active training plan", "Basic workout logs"],
            },
            {
              name: "Pro",
              price: "$19",
              cycle: "/mo",
              blurb: "For committed members who train weekly.",
              points: [
                "Unlimited plans",
                "Live workout timer + insights",
                "Priority coach feedback",
              ],
              featured: true,
            },
            {
              name: "Coach",
              price: "$49",
              cycle: "/mo",
              blurb: "Everything a coach needs to scale clients.",
              points: [
                "Client booking management",
                "Progress dashboards",
                "Secure in-app messaging",
              ],
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`interactive-lift rounded-md border-2 p-6 ${plan.featured ? "border-foreground bg-foreground text-background" : "border-foreground/25 bg-background"}`}
            >
              <div
                className={`font-mono text-[11px] uppercase tracking-[0.16em] ${plan.featured ? "text-[color:var(--accent)]" : "text-foreground/55"}`}
              >
                {plan.name}
              </div>
              <div className="mt-3 flex items-end gap-1">
                <div className="text-4xl font-extrabold leading-none">{plan.price}</div>
                <div
                  className={`text-sm ${plan.featured ? "text-background/75" : "text-foreground/60"}`}
                >
                  {plan.cycle}
                </div>
              </div>
              <p
                className={`mt-3 text-sm ${plan.featured ? "text-background/85" : "text-foreground/70"}`}
              >
                {plan.blurb}
              </p>
              <ul className="mt-5 space-y-2">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <span
                      className={`${plan.featured ? "text-[color:var(--accent)]" : "text-foreground/60"}`}
                    >
                      •
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={`mt-6 inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition-opacity ${plan.featured ? "bg-[color:var(--accent)] text-foreground hover:opacity-90" : "bg-foreground text-background hover:opacity-90"}`}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* TRAINER CTA — split panel */}
      <section className="container mx-auto px-4 pb-24 motion-enter motion-delay-3">
        <div className="grid md:grid-cols-2 border-2 border-foreground rounded-md overflow-hidden interactive-lift">
          <div className="bg-foreground text-background p-10 md:p-14">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
              For coaches
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold leading-[0.95] tracking-tight">
              Your gym.
              <br />
              Now without
              <br />
              walls.
            </h2>
            <Link
              to="/auth"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-[color:var(--accent)] text-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Apply as trainer →
            </Link>
          </div>
          <div className="p-10 md:p-14 bg-background">
            <ul className="space-y-5 stagger-children">
              {[
                "Reach motivated clients in your area",
                "Manage bookings in real time",
                "Build and assign workouts",
                "See client progress with their permission",
              ].map((b, i) => (
                <li
                  key={b}
                  className="flex items-start gap-4 border-b border-foreground/10 pb-5 last:border-0"
                >
                  <span className="font-mono text-xs text-foreground/50 pt-1">0{i + 1}</span>
                  <span className="text-base font-medium">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-foreground py-12 motion-enter motion-delay-3">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-black tracking-tight">
              zigfy<span className="text-[color:var(--accent)]">.</span>
            </div>
            <p className="mt-3 text-sm text-foreground/65 max-w-xs">
              Personal coaching platform for smarter training, better recovery, and measurable
              progress.
            </p>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/55">
              Platform
            </div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/75">
              <li>
                <Link to="/trainers" className="hover:underline">
                  Find trainers
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:underline">
                  Get started
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:underline">
                  Member dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/55">
              Company
            </div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/75">
              <li>
                <Link to="/about" className="hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:underline">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/55">
              Support
            </div>
            <ul className="mt-3 space-y-2 text-sm text-foreground/75">
              <li>
                <Link to="/help-center" className="hover:underline">
                  Help center
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:underline">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:underline">
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-10 pt-6 border-t border-foreground/10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest text-foreground/55">
          <span>© {new Date().getFullYear()} Zigfy</span>
          <span>Move better. Live louder.</span>
        </div>
      </footer>

      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
