import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { MoodFace } from "./mood-face";
import { MOODS, moodOf, timeAgo, type FamilyView, type MoodId } from "../../lib/umeet-shared";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-mist">
      <header className="mx-auto flex h-16 max-w-md items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2" aria-label="Umeet home">
          <img src="/assets/logo.svg" alt="" className="h-9 w-9 rounded-xl" />
          <span className="font-display text-xl font-semibold">Umeet</span>
        </Link>
        <Link to="/app" className="text-sm font-bold text-moss hover:text-forest">
          My families
        </Link>
      </header>
      <main className="mx-auto max-w-md px-4 pb-24">{children}</main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[24px] bg-white/80 p-5 ring-1 ring-forest/5 ${className}`}>{children}</section>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-xl font-semibold leading-tight">{children}</h2>;
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3800);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <div className="max-w-sm rounded-2xl bg-forest px-5 py-3 text-center text-[15px] font-semibold text-mist shadow-xl">
        {message}
      </div>
    </div>
  );
}

/** Web stand-in for the phone home-screen widget. */
export function WidgetPreview({ view }: { view: FamilyView }) {
  const last = view.notes[0];
  const sides = [
    { name: view.childName, mood: view.childMood, at: view.childMoodAt },
    { name: view.parentName, mood: view.parentMood, at: view.parentMoodAt },
  ];
  return (
    <section className="rounded-[28px] bg-mint p-5" aria-label="Widget preview">
      <div className="flex items-center gap-2">
        <img src="/assets/logo.svg" alt="" className="h-7 w-7 rounded-lg" />
        <span className="font-display text-lg font-semibold">Umeet</span>
        <span className="ml-auto text-xs font-bold text-forest/60">Home-screen widget</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {sides.map((s) => (
          <div key={s.name} className="flex flex-col items-center rounded-[20px] bg-mist px-3 py-4 text-center">
            <span className="font-display text-lg font-semibold">{s.name}</span>
            <div className="my-2">
              <MoodFace mood={s.mood} size={60} />
            </div>
            <span className="text-[15px] font-bold">{moodOf(s.mood)?.label ?? "No mood yet"}</span>
            <span className="text-xs text-moss">{timeAgo(s.at)}</span>
          </div>
        ))}
      </div>
      {last ? (
        <p className="mt-3 rounded-2xl bg-mist/70 px-4 py-2.5 text-[15px] font-semibold">
          {last.sender === "parent" ? view.parentName : view.childName}: {last.text}
        </p>
      ) : null}
    </section>
  );
}

export function MoodPicker({
  value,
  onPick,
  disabled,
}: {
  value: MoodId | null;
  onPick: (m: MoodId) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Pick a mood">
      {MOODS.map((m) => (
        <button
          key={m.id}
          role="radio"
          aria-checked={value === m.id}
          disabled={disabled}
          onClick={() => onPick(m.id)}
          className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-60 ${
            value === m.id ? "bg-mint ring-2 ring-forest" : "bg-leaf/60 hover:bg-mint"
          }`}
        >
          <MoodFace mood={m.id} size={40} />
          {m.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-leaf/70 px-3 py-2">
      <img src={icon} alt="" className="h-7 w-7" />
      <div className="leading-tight">
        <div className="text-xs font-bold text-moss">{label}</div>
        <div className="font-display text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}

export function CompanionCard({
  view,
  onCare,
  busy,
}: {
  view: FamilyView;
  onCare: (action: "feed" | "play") => void;
  busy: boolean;
}) {
  const c = view.companion;
  const unwell = c.sick || c.health < 30;
  const img =
    c.kind === "plant"
      ? unwell
        ? "/assets/plant-sick.png"
        : "/assets/plant-happy.png"
      : unwell
        ? "/assets/pet-sick.png"
        : "/assets/pet-happy.png";
  const barColor = c.health > 60 ? "bg-sprout" : c.health > 30 ? "bg-sun" : "bg-peach";
  return (
    <Card className={unwell ? "bg-peach/30" : ""}>
      <div className="flex items-center gap-4">
        <img src={img} alt={`${c.name} ${unwell ? "feeling unwell" : "feeling good"}`} className="h-28 w-28 object-contain" />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-moss">Your {c.kind}</p>
          <h2 className="font-display text-3xl font-semibold leading-none">{c.name}</h2>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-moss">
            <span>Health</span>
            <span>{c.health}%</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-leaf">
            <div className={`h-full rounded-full ${barColor} transition-[width] duration-500`} style={{ width: `${c.health}%` }} />
          </div>
        </div>
      </div>
      {c.sick ? (
        <p className="mt-4 rounded-2xl bg-peach/60 px-4 py-2.5 text-[15px] font-semibold">
          {c.name} feels unwell and needs a visit to the doctor.
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat icon="/assets/icons/energy.png" label="Energy" value={c.energy} />
        <Stat icon="/assets/icons/coin.png" label="Coins" value={c.coins} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={busy}
          onClick={() => onCare("feed")}
          className="rounded-2xl bg-sprout py-3.5 font-display text-lg font-semibold text-forest shadow-[0_5px_0_-1px_#3a9a5d] transition active:translate-y-[2px] active:shadow-none disabled:opacity-60"
        >
          {c.kind === "plant" ? "Water" : "Feed"} · 10 coins
        </button>
        <button
          disabled={busy}
          onClick={() => onCare("play")}
          className="rounded-2xl bg-sun py-3.5 font-display text-lg font-semibold text-forest shadow-[0_5px_0_-1px_#e0b93f] transition active:translate-y-[2px] active:shadow-none disabled:opacity-60"
        >
          {c.kind === "plant" ? "Sing" : "Play"} · 10 energy
        </button>
      </div>
    </Card>
  );
}

export function NotesList({ view }: { view: FamilyView }) {
  if (!view.notes.length) {
    return <p className="text-[15px] text-moss">No notes yet. Send the first one.</p>;
  }
  return (
    <ul className="grid gap-2">
      {view.notes.map((n) => {
        const mine = n.sender === view.role;
        return (
          <li key={n.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? "bg-mint" : "bg-leaf"}`}>
              <p className="text-[15px] font-semibold">{n.text}</p>
              <p className="mt-0.5 text-xs text-moss">
                {n.sender === "parent" ? view.parentName : view.childName} · {timeAgo(n.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ChipRow({
  items,
  onPick,
  active,
  disabled,
}: {
  items: readonly string[];
  onPick: (v: string) => void;
  active?: string | null;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <button
          key={t}
          disabled={disabled}
          onClick={() => onPick(t)}
          className={`rounded-full px-4 py-2 text-[15px] font-bold transition active:scale-95 disabled:opacity-60 ${
            active === t ? "bg-forest text-mist" : "bg-leaf hover:bg-mint"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
