import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { AppShell, Card, Toast } from "../components/umeet/app-ui";
import { ChildView, ParentView, type Actions } from "../components/umeet/family-views";
import {
  careForCompanion,
  decideSession,
  getFamily,
  requestSession,
  sendNote,
  setLocation,
  setMood,
  submitCheckin,
} from "../lib/api/umeet.functions";
import type { ActionResult, FamilyView } from "../lib/umeet-shared";

export const Route = createFileRoute("/family/$key")({
  head: () => ({ meta: [{ title: "Umeet family space" }, { name: "robots", content: "noindex" }] }),
  component: FamilyPage,
});

function Skeleton() {
  return (
    <div className="grid gap-4 pt-2" aria-busy="true">
      <div className="h-10 w-48 animate-pulse rounded-2xl bg-leaf" />
      <div className="h-56 animate-pulse rounded-[28px] bg-mint/60" />
      <div className="h-40 animate-pulse rounded-[24px] bg-leaf" />
      <div className="h-48 animate-pulse rounded-[24px] bg-leaf" />
    </div>
  );
}

function FamilyPage() {
  const { key } = Route.useParams();
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const clearToast = useCallback(() => setToast(null), []);

  const query = useQuery({
    queryKey: ["family", key],
    queryFn: () => getFamily({ data: { key } }),
    refetchInterval: 8000,
    retry: 1,
  });

  // Remember this family on this device so it can be reopened from /app.
  useEffect(() => {
    const v = query.data;
    if (!v) return;
    try {
      const saved = JSON.parse(localStorage.getItem("umeet-families") ?? "[]") as {
        key: string;
        label: string;
      }[];
      const label = v.role === "parent" ? `${v.parentName} (parent of ${v.childName})` : `${v.childName}`;
      const next = [{ key, label }, ...saved.filter((s) => s.key !== key)].slice(0, 5);
      localStorage.setItem("umeet-families", JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, [query.data, key]);

  const run = useCallback(
    async (fn: () => Promise<ActionResult>) => {
      setBusy(true);
      try {
        const r = await fn();
        qc.setQueryData<FamilyView>(["family", key], r.view);
        setToast(r.message);
        return true;
      } catch (e) {
        setToast(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [qc, key],
  );

  const actions: Actions = {
    busy,
    setMood: (mood) => void run(() => setMood({ data: { key, mood } })),
    sendNote: (text) => void run(() => sendNote({ data: { key, text } })),
    care: (action) => void run(() => careForCompanion({ data: { key, action } })),
    setLocation: (location) => void run(() => setLocation({ data: { key, location } })),
    submitCheckin: (answers) => run(() => submitCheckin({ data: { key, answers } })),
    decide: (allow) => void run(() => decideSession({ data: { key, allow } })),
    requestSession: () => void run(() => requestSession({ data: { key } })),
  };

  return (
    <AppShell>
      {query.isPending ? (
        <Skeleton />
      ) : query.isError || !query.data ? (
        <Card className="mt-4 text-center">
          <img src="/assets/pet-sick.png" alt="" className="mx-auto w-28" />
          <h1 className="mt-3 font-display text-2xl font-semibold">We couldn't open this family.</h1>
          <p className="mt-1 text-[15px] text-moss">
            {query.error instanceof Error ? query.error.message : "Check the link or code and try again."}
          </p>
          <Link to="/app" className="mt-4 inline-block rounded-2xl bg-sprout px-6 py-3 font-display text-lg font-semibold text-forest">
            Back to start
          </Link>
        </Card>
      ) : query.data.role === "parent" ? (
        <ParentView view={query.data} actions={actions} />
      ) : (
        <ChildView view={query.data} actions={actions} />
      )}
      <p className="mt-10 text-center text-xs text-moss">
        Umeet demo. Widgets are shown here as a preview, and no real specialists are contacted.
      </p>
      <Toast message={toast} onDone={clearToast} />
    </AppShell>
  );
}
