import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { AppShell, Card, CardTitle } from "../components/umeet/app-ui";
import { createFamily } from "../lib/api/umeet.functions";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Umeet: start your family space" }] }),
  component: StartPage,
});

type Saved = { key: string; label: string };

function StartPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Saved[]>([]);
  const [parentName, setParentName] = useState("Mom");
  const [childName, setChildName] = useState("");
  const [kind, setKind] = useState<"pet" | "plant">("pet");
  const [companionName, setCompanionName] = useState("Sprout");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem("umeet-families") ?? "[]") as Saved[]);
    } catch {
      setSaved([]);
    }
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!childName.trim()) {
      setError("Please add your child's name.");
      return;
    }
    setBusy(true);
    try {
      const r = await createFamily({
        data: { parentName: parentName.trim() || "Mom", childName: childName.trim(), companionKind: kind, companionName: companionName.trim() || "Sprout" },
      });
      await navigate({ to: "/family/$key", params: { key: r.parentKey } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the family. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const join = (e: FormEvent) => {
    e.preventDefault();
    const c = code.trim().toLowerCase().replace(/^.*\/family\//, "");
    if (c.length < 6) return;
    void navigate({ to: "/family/$key", params: { key: c } });
  };

  const input =
    "mt-1 w-full rounded-2xl bg-leaf/70 px-4 py-3 text-[16px] outline-none ring-forest/30 placeholder:text-moss focus:ring-2";

  return (
    <AppShell>
      <div className="grid gap-4">
        <div className="mt-2 flex items-end gap-3">
          <h1 className="font-display text-4xl font-semibold leading-none">Start your family space.</h1>
          <img src="/assets/pet-happy.png" alt="" className="umeet-rise w-20 shrink-0" />
        </div>

        {saved.length ? (
          <Card>
            <CardTitle>Open again</CardTitle>
            <ul className="mt-3 grid gap-2">
              {saved.map((s) => (
                <li key={s.key}>
                  <Link
                    to="/family/$key"
                    params={{ key: s.key }}
                    className="flex items-center justify-between rounded-2xl bg-leaf/70 px-4 py-3 font-bold hover:bg-mint"
                  >
                    {s.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card>
          <CardTitle>I'm the parent or guardian</CardTitle>
          <form onSubmit={create} className="mt-4 grid gap-4">
            <div>
              <label htmlFor="pname" className="text-sm font-bold">
                What does your child call you?
              </label>
              <input id="pname" className={input} value={parentName} maxLength={24} onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="cname" className="text-sm font-bold">
                Your child's name
              </label>
              <input id="cname" className={input} value={childName} maxLength={24} placeholder="Mia" onChange={(e) => setChildName(e.target.value)} />
            </div>
            <div>
              <span className="text-sm font-bold">Raise a pet or a plant?</span>
              <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Companion type">
                {(["pet", "plant"] as const).map((k) => (
                  <button
                    type="button"
                    key={k}
                    role="radio"
                    aria-checked={kind === k}
                    onClick={() => setKind(k)}
                    className={`flex flex-col items-center rounded-2xl p-3 font-display text-lg font-semibold capitalize transition ${
                      kind === k ? "bg-mint ring-2 ring-forest" : "bg-leaf/60"
                    }`}
                  >
                    <img src={k === "pet" ? "/assets/pet-happy.png" : "/assets/plant-happy.png"} alt="" className="h-20 w-20 object-contain" />
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comp" className="text-sm font-bold">
                Its name
              </label>
              <input id="comp" className={input} value={companionName} maxLength={20} onChange={(e) => setCompanionName(e.target.value)} />
            </div>
            {error ? <p className="text-sm font-bold text-[#B5482E]">{error}</p> : null}
            <button
              disabled={busy}
              className="rounded-2xl bg-sprout py-4 font-display text-xl font-semibold text-forest shadow-[0_6px_0_-1px_#3a9a5d] transition active:translate-y-[2px] active:shadow-none disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create a family"}
            </button>
          </form>
        </Card>

        <Card>
          <CardTitle>I'm the child</CardTitle>
          <form onSubmit={join} className="mt-3">
            <label htmlFor="code" className="text-sm font-bold">
              Code from your parent
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="code"
                className={`${input} mt-0 tracking-[0.15em]`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="abcd2345"
                autoCapitalize="none"
              />
              <button className="rounded-2xl bg-sun px-5 font-display text-lg font-semibold text-forest active:scale-95">Join</button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
