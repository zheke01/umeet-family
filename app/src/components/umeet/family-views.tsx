import { useState, type FormEvent } from "react";

import { Card, CardTitle, ChipRow, CompanionCard, MoodPicker, NotesList, WidgetPreview } from "./app-ui";
import { MoodFace } from "./mood-face";
import {
  ANSWERS,
  CHILD_NOTES,
  LOCATIONS,
  PARENT_NOTES,
  QUESTIONS,
  moodOf,
  timeAgo,
  type FamilyView,
  type MoodId,
} from "../../lib/umeet-shared";

export type Actions = {
  busy: boolean;
  setMood: (m: MoodId) => void;
  sendNote: (t: string) => void;
  care: (a: "feed" | "play") => void;
  setLocation: (l: (typeof LOCATIONS)[number]) => void;
  submitCheckin: (answers: number[]) => Promise<boolean>;
  decide: (allow: boolean) => void;
  requestSession: () => void;
};

const ANSWER_FACES: MoodId[] = ["calm", "okay", "sad", "excited"];

function CheckinCard({ view, actions }: { view: FamilyView; actions: Actions }) {
  const [step, setStep] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  if (step === null) {
    return (
      <Card className="bg-sprout/90">
        <div className="flex items-start gap-3">
          <img src="/assets/icons/energy.png" alt="" className="h-10 w-10" />
          <div>
            <CardTitle>Answer today's questions</CardTitle>
            <p className="mt-1 text-[15px] font-semibold text-forest/80">7 quick questions. +15 energy and +10 coins.</p>
            {view.lastCheckinAt ? (
              <p className="mt-1 text-xs font-bold text-forest/70">Last time: {timeAgo(view.lastCheckinAt)}</p>
            ) : null}
          </div>
        </div>
        <button
          onClick={() => {
            setAnswers([]);
            setStep(0);
          }}
          className="mt-4 w-full rounded-2xl bg-mist py-3.5 font-display text-lg font-semibold text-forest active:scale-[0.98]"
        >
          Start
        </button>
      </Card>
    );
  }

  const q = QUESTIONS[step];
  const pick = async (value: number) => {
    const next = [...answers.slice(0, step), value];
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const ok = await actions.submitCheckin(next);
      if (ok) setStep(null);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between text-sm font-bold text-moss">
        <span>
          Question {step + 1} of {QUESTIONS.length}
        </span>
        <button onClick={() => setStep(null)} className="underline">
          Later
        </button>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-leaf">
        <div className="h-full rounded-full bg-sprout transition-[width]" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="mt-5 font-display text-2xl font-semibold leading-tight">{q.text}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {ANSWERS.map((a, i) => (
          <button
            key={a}
            disabled={actions.busy}
            onClick={() => pick(i)}
            className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-[15px] font-bold transition active:scale-95 disabled:opacity-60 ${
              answers[step] === i ? "bg-mint ring-2 ring-forest" : "bg-leaf hover:bg-mint"
            }`}
          >
            <MoodFace mood={ANSWER_FACES[i]} size={30} />
            {a}
          </button>
        ))}
      </div>
      {step > 0 ? (
        <button onClick={() => setStep(step - 1)} className="mt-3 text-sm font-bold text-moss underline">
          Back
        </button>
      ) : null}
    </Card>
  );
}

function DoctorCard({ view, actions }: { view: FamilyView; actions: Actions }) {
  const name = view.companion.name;
  if (view.companion.sick && view.therapy === "approved") {
    return (
      <Card className="bg-peach/40">
        <CardTitle>Visit the pet doctor</CardTitle>
        <p className="mt-1 text-[15px] text-forest/80">
          {view.parentName} said yes. A kind specialist can talk with you online, and {name} will feel better too.
        </p>
        <button
          disabled={actions.busy}
          onClick={actions.requestSession}
          className="mt-4 w-full rounded-2xl bg-forest py-3.5 font-display text-lg font-semibold text-mist active:scale-[0.98] disabled:opacity-60"
        >
          Ask for a session
        </button>
      </Card>
    );
  }
  if (view.companion.sick) {
    return (
      <Card className="bg-peach/30">
        <CardTitle>{name} needs a little help</CardTitle>
        <p className="mt-1 text-[15px] text-forest/80">
          {view.parentName} will look at how to help {name}. You can keep caring for {name} in the meantime.
        </p>
      </Card>
    );
  }
  if (view.therapy === "requested") {
    return (
      <Card>
        <CardTitle>Session requested</CardTitle>
        <p className="mt-1 text-[15px] text-forest/80">A specialist will contact {view.parentName} to find a good time.</p>
      </Card>
    );
  }
  return null;
}

export function ChildView({ view, actions }: { view: FamilyView; actions: Actions }) {
  return (
    <div className="grid gap-4">
      <h1 className="mt-2 font-display text-4xl font-semibold leading-none">Hi, {view.childName}!</h1>
      <WidgetPreview view={view} />
      <Card>
        <CardTitle>How do you feel right now?</CardTitle>
        <div className="mt-4">
          <MoodPicker value={view.childMood} onPick={actions.setMood} disabled={actions.busy} />
        </div>
      </Card>
      <CompanionCard view={view} onCare={actions.care} busy={actions.busy} />
      <DoctorCard view={view} actions={actions} />
      <CheckinCard view={view} actions={actions} />
      <Card>
        <div className="flex items-center gap-2">
          <img src="/assets/icons/pin.png" alt="" className="h-8 w-8" />
          <CardTitle>Where are you?</CardTitle>
        </div>
        <p className="mt-1 text-[15px] text-moss">{view.parentName} will see it on the dashboard.</p>
        <div className="mt-3">
          <ChipRow items={LOCATIONS} active={view.location} disabled={actions.busy} onPick={(l) => actions.setLocation(l as (typeof LOCATIONS)[number])} />
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-2">
          <img src="/assets/icons/note.png" alt="" className="h-8 w-8" />
          <CardTitle>Little notes</CardTitle>
        </div>
        <div className="mt-3">
          <ChipRow items={CHILD_NOTES} disabled={actions.busy} onPick={actions.sendNote} />
        </div>
        <div className="mt-4">
          <NotesList view={view} />
        </div>
      </Card>
    </div>
  );
}

function InviteCard({ view }: { view: FamilyView }) {
  const [copied, setCopied] = useState(false);
  if (!view.childKey) return null;
  const copy = () => {
    const link = `${window.location.origin}/family/${view.childKey}`;
    void navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <Card className="bg-sun/70">
      <CardTitle>Invite {view.childName}</CardTitle>
      <p className="mt-1 text-[15px] text-forest/80">
        Open this code on {view.childName}'s phone at <span className="font-bold">/app</span>, or send the link.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="rounded-2xl bg-mist px-4 py-2 font-display text-2xl font-semibold tracking-[0.15em]">{view.childKey}</span>
        <button onClick={copy} className="rounded-2xl bg-forest px-4 py-2.5 text-sm font-bold text-mist active:scale-95">
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <p className="mt-3 text-xs font-bold text-forest/70">Keep this page's own link private. It opens the parent view.</p>
    </Card>
  );
}

function WellbeingCard({ view, actions }: { view: FamilyView; actions: Actions }) {
  const c = view.checkin;
  return (
    <Card>
      <div className="flex items-center gap-2">
        <img src="/assets/icons/shield.png" alt="" className="h-8 w-8" />
        <CardTitle>Wellbeing check-ins</CardTitle>
      </div>
      {!c ? (
        <p className="mt-2 text-[15px] text-moss">
          No check-ins yet. When {view.childName} answers, the results come to you first.
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-moss">{timeAgo(c.createdAt)}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${c.flagged ? "bg-peach" : "bg-mint"}`}>
              {c.flagged ? "Needs attention" : "All good"}
            </span>
          </div>
          <ul className="mt-4 grid gap-2.5">
            {c.areas.map((a) => (
              <li key={a.area}>
                <div className="flex justify-between text-sm font-bold">
                  <span>{a.area}</span>
                  <span className="text-moss">{["Fine", "A little", "Some worry", "Worrying"][a.level]}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-leaf">
                  <div
                    className={`h-full rounded-full ${a.level >= 2 ? "bg-peach" : "bg-sprout"}`}
                    style={{ width: `${Math.max(8, (a.level / 3) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          {c.strengths.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-moss">Strong sides:</span>
              {c.strengths.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-full bg-sun px-3 py-1 text-sm font-bold">
                  <img src="/assets/icons/star.png" alt="" className="h-4 w-4" />
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}
      {view.companion.sick && (view.therapy === "waiting_parent" || view.therapy === "declined") ? (
        <div className="mt-5 rounded-2xl bg-peach/40 p-4">
          <p className="font-display text-lg font-semibold leading-tight">Allow an online session with a specialist?</p>
          <p className="mt-1 text-sm text-forest/80">
            {view.childName}'s {view.companion.kind} {view.companion.name} is unwell. If you agree, {view.childName} can ask for a session.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              disabled={actions.busy}
              onClick={() => actions.decide(true)}
              className="rounded-2xl bg-forest py-3 font-bold text-mist active:scale-95 disabled:opacity-60"
            >
              Allow
            </button>
            <button
              disabled={actions.busy}
              onClick={() => actions.decide(false)}
              className="rounded-2xl bg-mist py-3 font-bold text-forest ring-1 ring-forest/20 active:scale-95 disabled:opacity-60"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}
      {view.companion.sick && view.therapy === "approved" ? (
        <p className="mt-4 text-sm font-bold text-moss">You said yes. Waiting for {view.childName} to ask for a session.</p>
      ) : null}
      {view.therapy === "requested" ? (
        <p className="mt-4 text-sm font-bold text-moss">
          {view.childName} asked for a session. A specialist would contact you to find a time. In this demo nobody is contacted.
        </p>
      ) : null}
    </Card>
  );
}

function LoveCard({ view, actions }: { view: FamilyView; actions: Actions }) {
  const [text, setText] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    actions.sendNote(t);
    setText("");
  };
  return (
    <Card>
      <div className="flex items-center gap-2">
        <img src="/assets/icons/heart.png" alt="" className="h-8 w-8" />
        <CardTitle>Send a little love</CardTitle>
      </div>
      <div className="mt-3">
        <ChipRow items={PARENT_NOTES} disabled={actions.busy} onPick={actions.sendNote} />
      </div>
      <form onSubmit={submit} className="mt-4">
        <label htmlFor="note" className="text-sm font-bold">
          Or write your own
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="note"
            value={text}
            maxLength={80}
            onChange={(e) => setText(e.target.value)}
            className="min-w-0 flex-1 rounded-2xl bg-leaf/70 px-4 py-3 text-[15px] outline-none ring-forest/30 placeholder:text-moss focus:ring-2"
            placeholder="Have a great day at school"
          />
          <button disabled={actions.busy || !text.trim()} className="rounded-2xl bg-sprout px-5 font-bold text-forest active:scale-95 disabled:opacity-50">
            Send
          </button>
        </div>
      </form>
      <div className="mt-5">
        <NotesList view={view} />
      </div>
    </Card>
  );
}

export function ParentView({ view, actions }: { view: FamilyView; actions: Actions }) {
  const mood = moodOf(view.childMood);
  return (
    <div className="grid gap-4">
      <h1 className="mt-2 font-display text-4xl font-semibold leading-none">Hi, {view.parentName}</h1>
      <InviteCard view={view} />
      <WidgetPreview view={view} />
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <img src="/assets/icons/pin.png" alt="" className="h-8 w-8" />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-moss">Location</p>
          <p className="font-display text-xl font-semibold leading-tight">{view.location ?? "Not shared yet"}</p>
          <p className="text-xs text-moss">{timeAgo(view.locationAt)}</p>
        </Card>
        <Card>
          <MoodFace mood={view.childMood} size={36} />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-moss">Mood</p>
          <p className="font-display text-xl font-semibold leading-tight">{mood?.label ?? "Not shared yet"}</p>
          <p className="text-xs text-moss">{timeAgo(view.childMoodAt)}</p>
        </Card>
      </div>
      <WellbeingCard view={view} actions={actions} />
      <LoveCard view={view} actions={actions} />
      <Card>
        <CardTitle>Your mood</CardTitle>
        <p className="mt-1 text-[15px] text-moss">{view.childName} sees it on the widget.</p>
        <div className="mt-4">
          <MoodPicker value={view.parentMood} onPick={actions.setMood} disabled={actions.busy} />
        </div>
      </Card>
      <CompanionCard view={view} onCare={actions.care} busy={actions.busy} />
    </div>
  );
}
