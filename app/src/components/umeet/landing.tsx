import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { MoodFace } from "./mood-face";
import { MOODS, PARENT_NOTES, type MoodId } from "../../lib/umeet-shared";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------------------------------- Nav ---------------------------------- */

export function SiteNav() {
  return (
    <header className="relative z-20 mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
      <Link to="/" className="flex items-center gap-2.5" aria-label="Umeet home">
        <img src="/assets/logo.svg" alt="" className="h-11 w-11 rounded-2xl" />
        <span className="font-display text-2xl font-semibold tracking-tight">Umeet</span>
      </Link>
      <nav className="flex items-center gap-5 md:gap-8">
        <a href="#garden" className="hidden text-[15px] font-semibold text-moss hover:text-forest md:inline">
          How it works
        </a>
        <a href="#parents" className="hidden text-[15px] font-semibold text-moss hover:text-forest md:inline">
          For parents
        </a>
        <Link to="/app" className="wave-link relative pb-2 font-display text-[17px] font-semibold">
          Open the demo
          <svg
            className="absolute -bottom-0.5 left-0 w-full"
            height="8"
            viewBox="0 0 120 8"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M1 4 Q 10 0, 20 4 T 40 4 T 60 4 T 80 4 T 100 4 T 119 4" fill="none" stroke="#4FB874" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}

/* --------------------------------- Hero ---------------------------------- */

function PetTagCta() {
  return (
    <Link
      to="/app"
      className="group relative inline-flex items-center gap-3 rounded-[20px] bg-sprout py-4 pl-7 pr-20 font-display text-xl font-semibold text-forest shadow-[0_10px_0_-2px_#3a9a5d] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-[3px] active:shadow-[0_5px_0_-2px_#3a9a5d]"
    >
      Open the demo
      <img
        src="/assets/pet-happy.png"
        alt=""
        className="absolute -top-5 right-3 w-14 transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)] group-hover:-translate-y-3 group-hover:rotate-6"
      />
    </Link>
  );
}

export function Hero() {
  const img = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (img.current) img.current.style.transform = `translateY(${Math.min(window.scrollY, 900) * -0.06}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-8 md:pt-12">
      <img src="/assets/icons/heart.png" alt="" className="absolute left-[8%] top-40 hidden w-10 -rotate-12 md:block" />
      <img src="/assets/icons/sun.png" alt="" className="absolute right-[9%] top-24 hidden w-16 md:block" />
      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
        <h1 className="umeet-rise font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
          Close, even
          <br />
          when far.
        </h1>
        <p className="umeet-rise-2 mx-auto mt-6 max-w-[38ch] text-lg leading-relaxed text-moss md:text-xl">
          Shared moods, a pet you raise together, and little notes of love for kids and parents who live apart.
        </p>
        <div className="umeet-rise-2 mt-10">
          <PetTagCta />
        </div>
      </div>
      <div className="relative mx-auto mt-8 max-w-6xl px-3 md:mt-4">
        <img
          ref={img}
          src="/assets/showcase.webp"
          alt="Four Umeet screens: the home-screen mood widget, the shared pet Sprout, a gentle check-in question, and the parent dashboard"
          width={1920}
          height={1086}
          className="w-full will-change-transform"
          fetchPriority="high"
        />
      </div>
    </section>
  );
}

/* -------------------------------- Widget --------------------------------- */

function PathArrowLink() {
  return (
    <Link to="/app" className="path-link group inline-flex flex-col gap-1 font-display text-lg font-semibold text-forest">
      <span className="underline decoration-sprout decoration-2 underline-offset-4">Open the demo</span>
      <span className="relative block h-7 w-36" aria-hidden="true">
        <svg viewBox="0 0 140 28" className="absolute inset-0 h-full w-full">
          <path d="M2 14 C 30 2, 50 26, 78 12 S 120 4, 138 14" fill="none" stroke="#4FB874" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" />
        </svg>
        <span className="path-dot absolute left-0 top-0 block text-xl leading-none text-sprout">➜</span>
      </span>
    </Link>
  );
}

export function WidgetSection() {
  const [mood, setMood] = useState<MoodId>("happy");
  const picked = MOODS.find((m) => m.id === mood);
  return (
    <section id="widget" className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <div className="relative grid overflow-hidden rounded-[40px] bg-mint md:grid-cols-[1fr_1fr]">
        <div className="relative z-10 p-8 md:p-14">
          <h2 className="font-display text-4xl font-semibold leading-none tracking-tight md:text-6xl">
            Two moods,
            <br />
            one home screen.
          </h2>
          <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-forest/80 md:text-lg">
            A small widget on both phones shows how your child feels and how you feel, plus the last little note.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" role="radiogroup" aria-label="Try a mood">
            {MOODS.slice(0, 5).map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={mood === m.id}
                onClick={() => setMood(m.id)}
                className={`flex flex-col items-center gap-1 rounded-full p-1 transition-transform active:scale-95 ${
                  mood === m.id ? "ring-[3px] ring-forest" : "ring-0"
                }`}
              >
                <MoodFace mood={m.id} size={52} />
                <span className="sr-only">{m.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-[15px] font-semibold text-forest" aria-live="polite">
            Mia's widget now shows: {picked?.label}
          </p>
          <div className="mt-10">
            <PathArrowLink />
          </div>
        </div>
        <div className="relative min-h-[380px] md:min-h-0">
          <img
            src="/assets/widget.webp"
            alt="Umeet home-screen widget showing Mia is happy and Mom is missing you"
            loading="lazy"
            className="absolute -bottom-10 right-[-12%] w-[105%] max-w-none rotate-[-4deg] drop-shadow-[0_30px_40px_rgba(31,58,52,0.25)] md:-bottom-24 md:right-[-10%] md:w-[95%]"
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Garden (B2 grade-shift) ---------------------- */

function HealingGarden() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el || prefersReducedMotion()) return;
    let tx = 70, ty = 50, tr = 30;
    let x = tx, y = ty, r = tr;
    let raf = 0;
    const set = () => {
      const b = el.getBoundingClientRect();
      const ratio = b.width / Math.max(1, b.height);
      el.style.setProperty("--gx", `${x}%`);
      el.style.setProperty("--gy", `${y}%`);
      el.style.setProperty("--grx", `${r}%`);
      el.style.setProperty("--gry", `${r * ratio}%`);
    };
    const tick = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      r += (tr - r) * 0.08;
      set();
      raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(tr - r) > 0.05 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width) * 100;
      ty = ((e.clientY - b.top) / b.height) * 100;
      tr = 26;
      kick();
    };
    const onLeave = () => {
      tx = 70;
      ty = 50;
      tr = 30;
      kick();
    };
    const onScroll = () => {
      const b = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - b.top) / (vh + b.height)));
      tx = 50;
      ty = 45;
      tr = 12 + p * 95;
      kick();
    };
    if (fine) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    set();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[40px] md:aspect-[16/9]"
      style={{ "--gx": "70%", "--gy": "50%", "--grx": "30%", "--gry": "53%" } as CSSProperties}
    >
      <img
        src="/assets/garden-wilted.webp"
        alt="Sprout's garden, grey and wilted"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[50%_50%]"
      />
      <img
        src="/assets/garden-thriving.webp"
        alt="The same garden, bright and blooming"
        loading="lazy"
        className="garden-lit absolute inset-0 h-full w-full object-cover object-[50%_50%]"
      />
    </div>
  );
}

export function GardenSection() {
  const [kind, setKind] = useState<"pet" | "plant">("pet");
  return (
    <section id="garden" className="mx-auto max-w-6xl px-4 md:px-8">
      <div className="relative">
        <HealingGarden />
        <div className="relative z-10 -mt-24 mx-3 rounded-[28px] bg-mist p-7 shadow-[0_20px_50px_-20px_rgba(31,58,52,0.35)] md:absolute md:bottom-8 md:left-8 md:mx-0 md:mt-0 md:w-[440px] md:p-9">
          <h2 className="font-display text-4xl font-semibold leading-none tracking-tight md:text-5xl">
            Raise Sprout together.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-moss">
            Pick a pet or a plant. Feed it, play with it, watch it grow. Care brings the garden back to life.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div role="radiogroup" aria-label="Companion type" className="inline-flex rounded-full bg-leaf p-1">
              {(["pet", "plant"] as const).map((k) => (
                <button
                  key={k}
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  className={`rounded-full px-5 py-2 font-display text-base font-semibold capitalize transition-colors ${
                    kind === k ? "bg-sprout text-forest" : "text-moss"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <img
              key={kind}
              src={kind === "pet" ? "/assets/pet-happy.png" : "/assets/plant-happy.png"}
              alt={kind === "pet" ? "Sprout the pet" : "Sprout the plant"}
              className="umeet-rise h-16 w-16 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Care ---------------------------------- */

function MiniQuestion() {
  const [picked, setPicked] = useState<number | null>(null);
  const options = ["Great", "Good", "Okay", "Not great"];
  return (
    <div className="mt-8 rotate-[-2deg] rounded-3xl bg-mist p-5 text-forest shadow-[0_18px_30px_-18px_rgba(31,58,52,0.6)]">
      <p className="font-display text-lg font-semibold leading-tight">How did you feel at school today?</p>
      <div className="mt-4 grid gap-2">
        {options.map((o, i) => (
          <button
            key={o}
            onClick={() => setPicked(i)}
            className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-left text-[15px] font-semibold transition ${
              picked === i ? "bg-sprout" : "bg-leaf hover:bg-mint"
            }`}
          >
            {o}
            <span className={`h-4 w-4 rounded-full border-2 border-forest ${picked === i ? "bg-forest" : ""}`} />
          </button>
        ))}
      </div>
      <p className="mt-3 h-5 text-sm font-bold text-forest" aria-live="polite">
        {picked !== null ? "+15 energy for Sprout" : ""}
      </p>
    </div>
  );
}

export function CareSection() {
  return (
    <section id="care" className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <h2 className="max-w-xl font-display text-4xl font-semibold leading-none tracking-tight md:text-6xl">
        Small questions, real care.
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-12 md:grid-rows-[auto_auto]">
        <div className="rounded-[28px] bg-sprout p-8 md:col-span-4 md:row-span-2">
          <img src="/assets/icons/energy.png" alt="" className="w-12" />
          <h3 className="mt-4 font-display text-3xl font-semibold leading-tight text-forest">
            Answer a few questions, earn energy for your pet.
          </h3>
          <MiniQuestion />
        </div>
        <div className="flex flex-col justify-between gap-6 rounded-[28px] bg-mint p-8 md:col-span-8 md:flex-row md:items-center">
          <h3 className="max-w-[14ch] font-display text-3xl font-semibold leading-tight">Discover your strong sides</h3>
          <ul className="flex flex-wrap gap-3">
            {["Kind", "Creative", "Brave"].map((s, i) => (
              <li
                key={s}
                className="flex items-center gap-2 rounded-full bg-mist py-2 pl-2 pr-5 font-display text-lg font-semibold"
                style={{ transform: `rotate(${(i - 1) * 3}deg)` }}
              >
                <img src="/assets/icons/star.png" alt="" className="h-9 w-9" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-6 rounded-[28px] bg-peach p-8 md:col-span-5">
          <img src="/assets/pet-sick.png" alt="Sprout feeling unwell with a bandage" loading="lazy" className="w-28 shrink-0 md:w-36" />
          <p className="text-lg font-semibold leading-snug text-forest">
            When Sprout feels unwell, a caring specialist can help, only with a parent's OK.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-sun p-8 md:col-span-3">
          <img src="/assets/icons/shield.png" alt="" className="w-14" />
          <p className="font-display text-2xl font-semibold leading-tight">Results go to the parent first.</p>
        </div>
      </div>
      <p className="mt-5 text-sm text-moss">
        Check-ins are gentle prompts for families, not a medical test or diagnosis.
      </p>
    </section>
  );
}

/* -------------------------------- Parents -------------------------------- */

function FlipChip({ text, bg, icon, indent }: { text: string; bg: string; icon: string; indent: string }) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 2200);
    return () => clearTimeout(t);
  }, [sent]);
  return (
    <button onClick={() => setSent(true)} data-sent={sent} className={`flip block w-fit ${indent}`} aria-label={`Send "${text}"`}>
      <span className="flip-inner grid">
        <span
          className={`flip-face col-start-1 row-start-1 flex items-center gap-3 rounded-full px-6 py-3.5 font-display text-xl font-semibold text-forest md:text-2xl ${bg}`}
        >
          <img src={icon} alt="" className="h-8 w-8" />
          {text}
        </span>
        <span className="flip-face flip-back col-start-1 row-start-1 flex items-center justify-center gap-2 rounded-full bg-mist px-6 py-3.5 font-display text-xl font-semibold text-forest md:text-2xl">
          Sent to Mia
        </span>
      </span>
    </button>
  );
}

export function ParentsSection() {
  return (
    <section id="parents" className="mx-auto max-w-6xl px-4 md:px-8">
      <div className="grid overflow-hidden rounded-[40px] md:grid-cols-2">
        <div className="bg-forest p-8 text-mist md:p-14">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-mint">For parents</p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight md:mt-24 md:text-6xl">
            Always a tap away.
          </h2>
          <p className="mt-5 max-w-[36ch] text-lg leading-relaxed text-mist/85">
            See where your child is and how they feel, then send a little love.
          </p>
          <div className="mt-9 flex flex-col gap-3">
            <FlipChip text={PARENT_NOTES[0]} bg="bg-sprout" icon="/assets/icons/pin.png" indent="ml-0" />
            <FlipChip text={PARENT_NOTES[1]} bg="bg-peach" icon="/assets/icons/heart.png" indent="ml-6 md:ml-12" />
            <FlipChip text={PARENT_NOTES[2]} bg="bg-sun" icon="/assets/icons/sun.png" indent="ml-12 md:ml-24" />
          </div>
        </div>
        <div className="relative flex min-h-[460px] items-center justify-center bg-mint p-8">
          <img
            src="/assets/parent-dashboard.webp"
            alt="Umeet parent dashboard showing Mia at school, feeling calm, with a wellbeing chart"
            loading="lazy"
            className="w-[62%] max-w-[340px] rotate-[4deg] drop-shadow-[0_30px_40px_rgba(31,58,52,0.3)]"
          />
          <img src="/assets/icons/note.png" alt="" className="absolute right-[10%] top-[12%] w-12 rotate-12" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Final CTA -------------------------------- */

function TicketCta() {
  return (
    <Link to="/app" className="group relative mt-9 inline-flex items-stretch font-display text-xl font-semibold text-forest">
      <span className="ticket flex items-center rounded-l-xl bg-sun py-4 pl-8 pr-6">Create a family</span>
      <span
        aria-hidden="true"
        className="ticket flex items-center rounded-r-xl border-l-2 border-dashed border-forest/40 bg-sun px-5 transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.5,1)] group-hover:translate-x-2 group-hover:rotate-[8deg] group-active:translate-x-3"
      >
        ♥
      </span>
    </Link>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-36 md:px-8 md:pt-44">
      <div className="relative rounded-[40px] bg-sprout px-6 pb-14 pt-20 text-center md:px-12">
        <img src="/assets/pet-happy.png" alt="" className="absolute -top-24 left-1/2 w-36 -translate-x-1/2 md:w-44" />
        <h2 className="font-display text-4xl font-semibold leading-none tracking-tight text-forest md:text-6xl">
          Start your family space.
        </h2>
        <p className="mx-auto mt-4 max-w-[40ch] text-lg text-forest/85">
          Create a family code, invite your child, and say hello.
        </p>
        <TicketCta />
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-forest text-mist">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-12 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2.5">
          <img src="/assets/logo.svg" alt="" className="h-9 w-9 rounded-xl" />
          <span className="font-display text-xl font-semibold">Umeet</span>
        </div>
        <nav className="flex gap-6 text-[15px] font-semibold text-mist/80">
          <a href="#garden" className="hover:text-mist">How it works</a>
          <a href="#parents" className="hover:text-mist">For parents</a>
          <Link to="/app" className="hover:text-mist">Open the demo</Link>
        </nav>
        <p className="text-sm text-mist/60">Made for families who live apart.</p>
      </div>
    </footer>
  );
}
