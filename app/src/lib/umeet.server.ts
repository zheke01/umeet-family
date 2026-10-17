import type { z } from "zod";
import type { createFamilySchema, getFamilySchema, setMoodSchema, sendNoteSchema, setLocationSchema, careForCompanionSchema, submitCheckinSchema, decideSessionSchema, requestSessionSchema } from "./umeet-schemas";
import { bindings } from "./bindings.server";
import {
  LOCATIONS,
  MOOD_IDS,
  QUESTIONS,
  type ActionResult,
  type FamilyView,
  type MoodId,
  type Therapy,
} from "./umeet-shared";

type FamilyRow = {
  id: number;
  parent_key: string;
  child_key: string;
  parent_name: string;
  child_name: string;
  companion_kind: string;
  companion_name: string;
  energy: number;
  coins: number;
  health: number;
  health_at: number;
  sick: number;
  therapy: string;
  child_mood: string | null;
  child_mood_at: number | null;
  parent_mood: string | null;
  parent_mood_at: number | null;
  location: string | null;
  location_at: number | null;
  created_at: number;
};

type NoteRow = { id: number; sender: string; text: string; created_at: number };
type CheckinRow = { answers: string; flagged: number; strengths: string; created_at: number };

function getDb() {
  const { DB } = bindings();
  if (!DB) throw new Error("Family storage is not available right now. Please try again soon.");
  return DB;
}

const KEY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
function newKey(len = 10) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => KEY_ALPHABET[b % KEY_ALPHABET.length]).join("");
}

function normKey(key: string) {
  return key.trim().toLowerCase();
}

async function load(rawKey: string) {
  const DB = getDb();
  const key = normKey(rawKey);
  const row = await DB.prepare("SELECT * FROM families WHERE parent_key = ?1 OR child_key = ?1")
    .bind(key)
    .first<FamilyRow>();
  if (!row) throw new Error("We couldn't find a family with this link or code.");
  const role: "parent" | "child" = row.parent_key === key ? "parent" : "child";
  return { DB, row, role };
}

function currentHealth(row: FamilyRow, now: number) {
  const hours = Math.max(0, Math.floor((now - row.health_at) / 3_600_000));
  let h = row.health - hours * 2;
  if (row.sick) h = Math.min(h, 35);
  return Math.max(10, Math.min(100, h));
}

type DB = ReturnType<typeof getDb>;

async function buildView(DB: DB, familyId: number, role: "parent" | "child"): Promise<FamilyView> {
  const row = await DB.prepare("SELECT * FROM families WHERE id = ?1").bind(familyId).first<FamilyRow>();
  if (!row) throw new Error("Family not found.");
  const now = Date.now();
  const notes = await DB.prepare(
    "SELECT id, sender, text, created_at FROM notes WHERE family_id = ?1 ORDER BY id DESC LIMIT 12",
  )
    .bind(row.id)
    .all<NoteRow>();
  const c = await DB.prepare(
    "SELECT answers, flagged, strengths, created_at FROM checkins WHERE family_id = ?1 ORDER BY id DESC LIMIT 1",
  )
    .bind(row.id)
    .first<CheckinRow>();

  let checkin: FamilyView["checkin"] = null;
  if (c && role === "parent") {
    const answers = JSON.parse(c.answers) as number[];
    const areas: { area: string; level: number }[] = [];
    QUESTIONS.forEach((q, i) => {
      if (q.area) areas.push({ area: q.area, level: q.reverse ? 3 - answers[i] : answers[i] });
    });
    checkin = {
      createdAt: c.created_at,
      flagged: c.flagged === 1,
      areas,
      strengths: JSON.parse(c.strengths) as string[],
    };
  }

  return {
    role,
    parentName: row.parent_name,
    childName: row.child_name,
    companion: {
      kind: row.companion_kind === "plant" ? "plant" : "pet",
      name: row.companion_name,
      health: currentHealth(row, now),
      energy: row.energy,
      coins: row.coins,
      sick: row.sick === 1,
    },
    therapy: row.therapy as Therapy,
    childMood: (row.child_mood as MoodId | null) ?? null,
    childMoodAt: row.child_mood_at,
    parentMood: (row.parent_mood as MoodId | null) ?? null,
    parentMoodAt: row.parent_mood_at,
    location: row.location,
    locationAt: row.location_at,
    notes: (notes.results ?? []).map((n) => ({
      id: n.id,
      sender: n.sender === "child" ? "child" : "parent",
      text: n.text,
      createdAt: n.created_at,
    })),
    checkin,
    lastCheckinAt: c?.created_at ?? null,
    childKey: role === "parent" ? row.child_key : null,
  };
}

export async function createFamilyImpl(data: z.infer<typeof createFamilySchema>) {
    const DB = getDb();
    const parentKey = newKey(12);
    const childKey = newKey(8);
    const now = Date.now();
    await DB.prepare(
      "INSERT INTO families (parent_key, child_key, parent_name, child_name, companion_kind, companion_name, health_at, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
    )
      .bind(parentKey, childKey, data.parentName, data.childName, data.companionKind, data.companionName, now)
      .run();
    return { parentKey, childKey };
}

export async function getFamilyImpl(data: z.infer<typeof getFamilySchema>): Promise<FamilyView> {
    const { DB, row, role } = await load(data.key);
    return buildView(DB, row.id, role);
}

export async function setMoodImpl(data: z.infer<typeof setMoodSchema>): Promise<ActionResult> {
    const { DB, row, role } = await load(data.key);
    const col = role === "parent" ? "parent" : "child";
    await DB.prepare(`UPDATE families SET ${col}_mood = ?1, ${col}_mood_at = ?2 WHERE id = ?3`)
      .bind(data.mood, Date.now(), row.id)
      .run();
    return { view: await buildView(DB, row.id, role), message: "Mood shared on the widget." };
}

export async function sendNoteImpl(data: z.infer<typeof sendNoteSchema>): Promise<ActionResult> {
    const { DB, row, role } = await load(data.key);
    await DB.prepare("INSERT INTO notes (family_id, sender, text, created_at) VALUES (?1, ?2, ?3, ?4)")
      .bind(row.id, role, data.text, Date.now())
      .run();
    const to = role === "parent" ? row.child_name : row.parent_name;
    return { view: await buildView(DB, row.id, role), message: `Sent to ${to}.` };
}

export async function setLocationImpl(data: z.infer<typeof setLocationSchema>): Promise<ActionResult> {
    const { DB, row, role } = await load(data.key);
    if (role !== "child") throw new Error("Only the child can share where they are.");
    await DB.prepare("UPDATE families SET location = ?1, location_at = ?2 WHERE id = ?3")
      .bind(data.location, Date.now(), row.id)
      .run();
    return { view: await buildView(DB, row.id, role), message: `${row.parent_name} can see you're at: ${data.location}.` };
}

export async function careForCompanionImpl(data: z.infer<typeof careForCompanionSchema>): Promise<ActionResult> {
    const { DB, row, role } = await load(data.key);
    const now = Date.now();
    let health = currentHealth(row, now);
    let { energy, coins } = row;
    const name = row.companion_name;
    let message: string;
    if (data.action === "feed") {
      if (coins < 10) throw new Error("Not enough coins. Answer today's questions to earn more.");
      coins -= 10;
      health += 15;
      message = row.companion_kind === "plant" ? `${name} got fresh water and sunshine.` : `${name} enjoyed the snack.`;
    } else {
      if (energy < 10) throw new Error("Not enough energy. Answer today's questions to earn more.");
      energy -= 10;
      coins += 5;
      health += 10;
      message = row.companion_kind === "plant" ? `You sang to ${name}. +5 coins.` : `You played with ${name}. +5 coins.`;
    }
    if (row.sick) {
      health = Math.min(health, 35);
      message = `${name} still feels unwell and needs a visit to the doctor.`;
    }
    health = Math.max(10, Math.min(100, health));
    await DB.prepare("UPDATE families SET energy = ?1, coins = ?2, health = ?3, health_at = ?4 WHERE id = ?5")
      .bind(energy, coins, health, now, row.id)
      .run();
    return { view: await buildView(DB, row.id, role), message };
}

export async function submitCheckinImpl(data: z.infer<typeof submitCheckinSchema>): Promise<ActionResult> {
    const { DB, row, role } = await load(data.key);
    if (role !== "child") throw new Error("Check-ins are answered by the child.");
    const a = data.answers;
    let concern = 0;
    QUESTIONS.forEach((q, i) => {
      if (q.area) concern += q.reverse ? 3 - a[i] : a[i];
    });
    const flagged = concern >= 8 ? 1 : 0;
    const strengths = QUESTIONS.filter((q, i) => q.strength && a[i] >= 2).map((q) => q.strength as string);
    const now = Date.now();
    await DB.prepare(
      "INSERT INTO checkins (family_id, answers, concern, flagged, strengths, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
    )
      .bind(row.id, JSON.stringify(a), concern, flagged, JSON.stringify(strengths), now)
      .run();
    const energy = Math.min(100, row.energy + 15);
    const coins = row.coins + 10;
    if (flagged) {
      const therapy = row.therapy === "approved" ? "approved" : "waiting_parent";
      await DB.prepare("UPDATE families SET energy = ?1, coins = ?2, sick = 1, therapy = ?3 WHERE id = ?4")
        .bind(energy, coins, therapy, row.id)
        .run();
    } else {
      await DB.prepare("UPDATE families SET energy = ?1, coins = ?2 WHERE id = ?3").bind(energy, coins, row.id).run();
    }
    const strengthText = strengths.length ? ` Your strong sides today: ${strengths.join(", ")}.` : "";
    const sickText = flagged
      ? ` ${row.companion_name} is feeling a bit unwell. ${row.parent_name} will take a look.`
      : "";
    return {
      view: await buildView(DB, row.id, role),
      message: `Thank you! +15 energy, +10 coins.${strengthText}${sickText}`,
    };
}

export async function decideSessionImpl(data: z.infer<typeof decideSessionSchema>): Promise<ActionResult> {
    const { DB, row, role } = await load(data.key);
    if (role !== "parent") throw new Error("Only a parent or guardian can decide this.");
    if (!row.sick) throw new Error("There is nothing to decide right now.");
    const therapy = data.allow ? "approved" : "declined";
    await DB.prepare("UPDATE families SET therapy = ?1 WHERE id = ?2").bind(therapy, row.id).run();
    return {
      view: await buildView(DB, row.id, role),
      message: data.allow
        ? `Thank you. ${row.child_name} can now ask for a session with a specialist.`
        : "Okay. You can change your mind any time.",
    };
}

export async function requestSessionImpl(data: z.infer<typeof requestSessionSchema>): Promise<ActionResult> {
    const { DB, row, role } = await load(data.key);
    if (role !== "child") throw new Error("The session is requested by the child.");
    if (row.therapy !== "approved") throw new Error(`${row.parent_name} needs to say yes first.`);
    await DB.prepare("UPDATE families SET therapy = 'requested', sick = 0, health = 80, health_at = ?1 WHERE id = ?2")
      .bind(Date.now(), row.id)
      .run();
    return {
      view: await buildView(DB, row.id, role),
      message: `Session requested. ${row.companion_name} already feels better!`,
    };
}
