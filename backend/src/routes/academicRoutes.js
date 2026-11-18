const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

const router = express.Router({ mergeParams: true });
const teacher = authorizeRole("TEACHER");
const id = (value) => /^\d+$/.test(String(value)) && Number(value) > 0 && Number(value) <= 2147483647;
const clock = /^([01]\d|2[0-3]):[0-5]\d$/;

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

function route(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (!error.status) console.error(error);
      res.status(error.status || 500).json({ message: error.status ? error.message : "Academic request failed" });
    }
  };
}

async function checkClass(req, db, lock = false) {
  const { classId } = req.params;
  if (!id(classId)) fail(400, "Invalid class");
  const ownsClass = req.user.role === "TEACHER";
  const result = await db.query(
    `SELECT c.id FROM classes c WHERE c.id = $1 AND ${ownsClass
      ? "c.teacher_id = $2"
      : "EXISTS (SELECT 1 FROM enrollments WHERE class_id = c.id AND student_id = $2)"}
      ${lock ? "FOR UPDATE" : ""}`,
    [classId, req.user.id],
  );
  if (!result.rowCount) fail(404, "Class not found");
  return classId;
}

async function withClassLock(req, operation) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const classId = await checkClass(req, client, true);
    const result = await operation(client, classId);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

router.use(authenticateToken);

router.get("/timetable", route(async (req, res) => {
  const classId = await checkClass(req, pool);
  const { rows } = await pool.query(
    "SELECT * FROM timetable WHERE class_id = $1 AND NOT archived ORDER BY weekday, starts_at",
    [classId],
  );
  res.json({ slots: rows });
}));

const saveSlot = route(async (req, res) => {
  const { slotId } = req.params;
  const { subject, room = "", weekday, starts_at, ends_at } = req.body || {};
  if ((slotId && !id(slotId)) || typeof subject !== "string" || !subject.trim() ||
      subject.trim().length > 120 || typeof room !== "string" || room.trim().length > 80 ||
      !Number.isInteger(weekday) || weekday < 1 || weekday > 7 ||
      typeof starts_at !== "string" || typeof ends_at !== "string" ||
      !clock.test(starts_at) || !clock.test(ends_at) || starts_at >= ends_at) {
    fail(400, "Enter a subject, a weekday, and start and end times in order");
  }
  const slot = await withClassLock(req, async (db, classId) => {
    const overlap = await db.query(
      `SELECT 1 FROM timetable WHERE class_id = $1 AND weekday = $2 AND NOT archived
       AND starts_at < $4 AND ends_at > $3 AND id IS DISTINCT FROM $5::integer`,
      [classId, weekday, starts_at, ends_at, slotId || null],
    );
    if (overlap.rowCount) fail(409, "This time overlaps another session in the class");
    const values = [classId, subject.trim(), room.trim(), weekday, starts_at, ends_at];
    const result = slotId
      ? await db.query(
        `UPDATE timetable SET subject = $2, room = $3, weekday = $4, starts_at = $5, ends_at = $6
         WHERE class_id = $1 AND id = $7 AND NOT archived RETURNING *`, [...values, slotId],
      )
      : await db.query(
        `INSERT INTO timetable (class_id, subject, room, weekday, starts_at, ends_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, values,
      );
    if (!result.rowCount) fail(404, "Session not found");
    return result.rows[0];
  });
  res.status(slotId ? 200 : 201).json({ slot });
});

router.post("/timetable", teacher, saveSlot);
router.put("/timetable/:slotId", teacher, saveSlot);
router.delete("/timetable/:slotId", teacher, route(async (req, res) => {
  if (!id(req.params.slotId)) fail(400, "Invalid session");
  await withClassLock(req, async (db, classId) => {
    const result = await db.query(
      "UPDATE timetable SET archived = TRUE WHERE class_id = $1 AND id = $2 AND NOT archived",
      [classId, req.params.slotId],
    );
    if (!result.rowCount) fail(404, "Session not found");
  });
  res.sendStatus(204);
}));

function sessionDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01") {
    fail(400, "Enter a valid session date");
  }
  const date = new Date(value + "T00:00:00Z");
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
    fail(400, "Enter a valid session date");
  }
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: process.env.CAMPUS_TIMEZONE || "Asia/Kolkata" }).format(new Date());
  if (value > today) fail(400, "Attendance cannot be marked for a future date");
  return date;
}

async function getRoster(db, classId, slotId, date) {
  if (!id(slotId)) fail(400, "Select a timetable session");
  const day = sessionDate(date);
  const slot = await db.query(
    "SELECT * FROM timetable WHERE class_id = $1 AND id = $2", [classId, slotId],
  );
  if (!slot.rowCount) fail(404, "Session not found");
  const saved = await db.query(
    `SELECT u.id, u.name, a.status, a.subject FROM attendance a
     JOIN users u ON u.id = a.student_id WHERE a.timetable_id = $1 AND a.session_date = $2
     ORDER BY u.name, u.id`, [slotId, date],
  );
  if (saved.rowCount) return { roster: saved.rows, subject: saved.rows[0].subject };
  if (slot.rows[0].archived || slot.rows[0].weekday !== (day.getUTCDay() || 7)) {
    fail(400, "Choose an active session scheduled on this day");
  }
  const { rows } = await db.query(
    `SELECT u.id, u.name, NULL AS status FROM enrollments e JOIN users u ON u.id = e.student_id
     WHERE e.class_id = $1 AND (e.joined_at AT TIME ZONE $3)::date <= $2 ORDER BY u.name, u.id`,
    [classId, date, process.env.CAMPUS_TIMEZONE || "Asia/Kolkata"],
  );
  return { roster: rows, subject: slot.rows[0].subject };
}

router.get("/attendance/roster", teacher, route(async (req, res) => {
  const classId = await checkClass(req, pool);
  const { slotId, date } = req.query;
  res.json(await getRoster(pool, classId, slotId, date));
}));

router.put("/attendance", teacher, route(async (req, res) => {
  const { slotId, date, marks } = req.body || {};
  if (!Array.isArray(marks) || !marks.length || marks.some((mark) =>
    !mark || !id(mark.studentId) || !["present", "absent"].includes(mark.status))) {
    fail(400, "Choose Present or Absent for every student");
  }
  await withClassLock(req, async (db, classId) => {
    const { roster, subject } = await getRoster(db, classId, slotId, date);
    const statuses = new Map(marks.map((mark) => [String(mark.studentId), mark.status]));
    if (marks.length !== roster.length || statuses.size !== roster.length ||
        roster.some((student) => !statuses.has(String(student.id)))) {
      fail(409, "The roster changed. Reload it before saving");
    }
    await db.query(
      `INSERT INTO attendance (timetable_id, session_date, student_id, subject, status)
       SELECT $1, $2, student_id, $3, status FROM unnest($4::integer[], $5::text[]) AS marks(student_id, status)
       ON CONFLICT (timetable_id, session_date, student_id)
       DO UPDATE SET status = EXCLUDED.status, marked_at = now()`,
      [slotId, date, subject, roster.map((student) => student.id), roster.map((student) => statuses.get(String(student.id)))],
    );
  });
  res.json({ message: "Attendance saved" });
}));

router.get("/attendance", route(async (req, res) => {
  const classId = await checkClass(req, pool);
  const teacherView = req.user.role === "TEACHER";
  const { rows } = await pool.query(
    `SELECT a.timetable_id, a.session_date::text, a.student_id, a.subject, a.status, u.name
     FROM attendance a JOIN timetable t ON t.id = a.timetable_id JOIN users u ON u.id = a.student_id
     WHERE t.class_id = $1 ${teacherView ? "" : "AND a.student_id = $2"}
     ORDER BY a.session_date DESC, a.timetable_id, u.name`,
    teacherView ? [classId] : [classId, req.user.id],
  );
  const totals = new Map();
  for (const record of rows) {
    const total = totals.get(record.student_id) || {
      studentId: record.student_id, name: record.name, present: 0, sessions: 0,
    };
    total.sessions++;
    if (record.status === "present") total.present++;
    totals.set(record.student_id, total);
  }
  const summary = Array.from(totals.values(), (total) => ({
    ...total, percentage: Math.round(total.present * 10000 / total.sessions) / 100,
  }));
  res.json({ history: rows, summary });
}));

module.exports = router;
