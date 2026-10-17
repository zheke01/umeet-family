-- Umeet families, notes and check-ins (additive).
CREATE TABLE IF NOT EXISTS families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_key TEXT NOT NULL UNIQUE,
  child_key TEXT NOT NULL UNIQUE,
  parent_name TEXT NOT NULL,
  child_name TEXT NOT NULL,
  companion_kind TEXT NOT NULL,
  companion_name TEXT NOT NULL,
  energy INTEGER NOT NULL DEFAULT 30,
  coins INTEGER NOT NULL DEFAULT 20,
  health INTEGER NOT NULL DEFAULT 80,
  health_at INTEGER NOT NULL,
  sick INTEGER NOT NULL DEFAULT 0,
  therapy TEXT NOT NULL DEFAULT 'none',
  child_mood TEXT,
  child_mood_at INTEGER,
  parent_mood TEXT,
  parent_mood_at INTEGER,
  location TEXT,
  location_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id INTEGER NOT NULL,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS notes_family_idx ON notes (family_id, id);

CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id INTEGER NOT NULL,
  answers TEXT NOT NULL,
  concern INTEGER NOT NULL,
  flagged INTEGER NOT NULL,
  strengths TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS checkins_family_idx ON checkins (family_id, id);
