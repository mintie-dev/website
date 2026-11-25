-- Letters: archived_at is NULL while a letter sits in the mailbox (counts toward the 10),
-- and set once Thi moves it into the box.
CREATE TABLE IF NOT EXISTS letters (
  id TEXT PRIMARY KEY,
  html TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  archived_at INTEGER
);
CREATE INDEX IF NOT EXISTS letters_waiting ON letters (archived_at);

-- Wrong-password counter per IP per hour, to slow down guessing.
CREATE TABLE IF NOT EXISTS login_tries (
  key TEXT PRIMARY KEY,
  tries INTEGER NOT NULL
);
