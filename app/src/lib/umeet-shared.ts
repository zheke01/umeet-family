// Client-safe shared constants and types for Umeet.

export type MoodId = "happy" | "excited" | "calm" | "okay" | "sad" | "missing";

export const MOODS: { id: MoodId; label: string; color: string }[] = [
  { id: "happy", label: "Happy", color: "#FFD966" },
  { id: "excited", label: "Excited", color: "#FFB38A" },
  { id: "calm", label: "Calm", color: "#B5E8D3" },
  { id: "okay", label: "Okay", color: "#DCEBE1" },
  { id: "sad", label: "Sad", color: "#C9D6DF" },
  { id: "missing", label: "Missing you", color: "#FFCDB8" },
];

export const MOOD_IDS = ["happy", "excited", "calm", "okay", "sad", "missing"] as const;

export function moodOf(id: string | null | undefined) {
  return MOODS.find((m) => m.id === id) ?? null;
}

export const PARENT_NOTES = [
  "I'm close",
  "I think about you",
  "I'm always here for you",
  "I'm proud of you",
  "Sleep tight",
];

export const CHILD_NOTES = ["I miss you", "I love you", "I'm okay", "Call me later"];

export const LOCATIONS = ["Home", "School", "Grandma's", "Outside", "After-school club"] as const;

export const ANSWERS = ["Not at all", "A little", "Quite a bit", "A lot"];

export type Question = {
  id: string;
  text: string;
  area?: string;
  reverse?: boolean;
  strength?: string;
};

export const QUESTIONS: Question[] = [
  { id: "sad", text: "Today I felt sad or worried.", area: "Feelings" },
  { id: "still", text: "It was hard to sit still or wait my turn.", area: "Energy and focus" },
  { id: "friends", text: "I had someone to play or talk with.", area: "Friends", reverse: true },
  { id: "lonely", text: "I felt lonely.", area: "Loneliness" },
  { id: "kind", text: "I helped someone or was kind.", strength: "Kind" },
  { id: "creative", text: "I made, drew or built something I liked.", strength: "Creative" },
  { id: "brave", text: "I tried something even when it felt hard.", strength: "Brave" },
];

export type Therapy = "none" | "waiting_parent" | "approved" | "declined" | "requested";

export type FamilyView = {
  role: "parent" | "child";
  parentName: string;
  childName: string;
  companion: {
    kind: "pet" | "plant";
    name: string;
    health: number;
    energy: number;
    coins: number;
    sick: boolean;
  };
  therapy: Therapy;
  childMood: MoodId | null;
  childMoodAt: number | null;
  parentMood: MoodId | null;
  parentMoodAt: number | null;
  location: string | null;
  locationAt: number | null;
  notes: { id: number; sender: "parent" | "child"; text: string; createdAt: number }[];
  checkin: null | {
    createdAt: number;
    flagged: boolean;
    areas: { area: string; level: number }[];
    strengths: string[];
  };
  lastCheckinAt: number | null;
  childKey: string | null;
};

export type ActionResult = { view: FamilyView; message: string };

export function timeAgo(ms: number | null, now = Date.now()) {
  if (!ms) return "";
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} d ago`;
}
