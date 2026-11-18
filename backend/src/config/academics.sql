CREATE TABLE IF NOT EXISTS timetable (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject VARCHAR(120) NOT NULL,
  room VARCHAR(80) NOT NULL DEFAULT '',
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL CHECK (ends_at > starts_at),
  archived BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS timetable_class_day_idx ON timetable (class_id, weekday) WHERE NOT archived;

CREATE TABLE IF NOT EXISTS attendance (
  timetable_id INTEGER REFERENCES timetable(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(120) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (timetable_id, session_date, student_id)
);
CREATE INDEX IF NOT EXISTS attendance_student_idx ON attendance (student_id, session_date);
