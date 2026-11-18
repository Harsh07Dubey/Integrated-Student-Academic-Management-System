import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { academicRequest, ClassWorkspace } from "./AcademicPortal";
import { weekdays } from "./Timetable";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: import.meta.env.VITE_CAMPUS_TIMEZONE || "Asia/Kolkata" }).format(new Date());

function MarkAttendance({ base, slots, onSaved }) {
  const [date, setDate] = useState(today);
  const [slotId, setSlotId] = useState("");
  const [roster, setRoster] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const weekday = date ? new Date(date + "T00:00:00Z").getUTCDay() || 7 : 0;

  function selectSession(nextDate, nextSlot) {
    setDate(nextDate);
    setSlotId(nextSlot);
    setRoster(null);
    setError("");
    setMessage("");
  }

  useEffect(() => {
    if (!slotId || !date) return;
    const controller = new AbortController();
    const query = new URLSearchParams({ date, slotId });
    academicRequest(`${base}/attendance/roster?${query}`, { signal: controller.signal })
      .then(({ roster }) => setRoster(roster))
      .catch((error) => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [base, date, slotId]);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await academicRequest(`${base}/attendance`, {
        method: "PUT",
        body: JSON.stringify({ date, slotId, marks: roster.map(({ id, status }) => ({ studentId: id, status })) }),
      });
      setMessage("Attendance saved.");
      onSaved();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <form className="academic-panel academic-form" onSubmit={save}>
    <h2>Mark attendance</h2>
    <div className="academic-fields">
      <label>Session date<input type="date" max={today()} required disabled={busy} value={date} onChange={(event) => selectSession(event.target.value, "")} /></label>
      <label>Scheduled session<select aria-label="Scheduled session" value={slotId} disabled={busy || !weekday} onChange={(event) => selectSession(date, event.target.value)}>
        <option value="">Select a session</option>
        {slots.filter((slot) => slot.weekday === weekday).map((slot) =>
          <option key={slot.id} value={slot.id}>{slot.starts_at.slice(0, 5)} · {slot.subject}</option>)}
      </select></label>
    </div>
    {!slotId && weekday > 0 && !slots.some((slot) => slot.weekday === weekday) && <p className="academic-muted">No sessions scheduled on {weekdays[weekday - 1]}.</p>}
    {error && <p role="alert" className="academic-error">{error}</p>}
    {message && <p role="status" className="academic-success">{message}</p>}
    {slotId && !roster && !error && <p role="status">Loading roster…</p>}
    {roster?.length === 0 && <p className="academic-muted">No students were enrolled for this date.</p>}
    {!!roster?.length && <>
      <div className="academic-actions"><button disabled={busy} type="button" onClick={() => setRoster(roster.map((student) => ({ ...student, status: "present" })))}>Mark all present</button></div>
      <div className="academic-roster">
        {roster.map((student) => <label key={student.id}>{student.name}
          <select aria-label={student.name} value={student.status || ""} disabled={busy} required onChange={(event) => setRoster(roster.map((item) =>
            item.id === student.id ? { ...item, status: event.target.value } : item))}>
            <option value="">Choose status</option><option value="present">Present</option><option value="absent">Absent</option>
          </select>
        </label>)}
      </div>
      <div><button className="academic-primary" disabled={busy}>{busy ? "Saving…" : "Save attendance"}</button></div>
    </>}
  </form>;
}

function ClassAttendance({ classId, teacher }) {
  const base = `/classes/${classId}`;
  const [slots, setSlots] = useState([]);
  const [report, setReport] = useState(null);
  const [revision, setRevision] = useState(0);
  const [historyError, setHistoryError] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  useEffect(() => {
    if (!teacher) return;
    const controller = new AbortController();
    academicRequest(`${base}/timetable`, { signal: controller.signal }).then(({ slots }) => setSlots(slots))
      .catch((error) => { if (!controller.signal.aborted) setScheduleError(error.message); });
    return () => controller.abort();
  }, [base, teacher]);
  useEffect(() => {
    const controller = new AbortController();
    academicRequest(`${base}/attendance`, { signal: controller.signal }).then((data) => {
      setReport(data);
      setHistoryError("");
    }).catch((error) => { if (!controller.signal.aborted) setHistoryError(error.message); });
    return () => controller.abort();
  }, [base, revision]);

  return <>
    {scheduleError && <p role="alert" className="academic-error">{scheduleError}</p>}
    {teacher && !scheduleError && <MarkAttendance base={base} slots={slots} onSaved={() => setRevision((value) => value + 1)} />}
    {historyError && <p role="alert" className="academic-error">{historyError}</p>}
    {!report && !historyError && <p role="status">Loading attendance…</p>}
    {report && <>
      <section className="academic-panel">
        <h2>{teacher ? "Class attendance summary" : "Your attendance"}</h2>
        <p className="academic-muted">Attendance percentage is the share of recorded sessions marked present.</p>
        {report.summary.length === 0 ? <p>No recorded sessions yet.</p> : <div className="academic-table">
          <table><thead><tr>{teacher && <th>Student</th>}<th>Present</th><th>Absent</th><th>Total sessions</th><th>Attendance</th></tr></thead>
            <tbody>{report.summary.map((item) => <tr key={item.studentId}>
              {teacher && <td>{item.name}</td>}<td>{item.present}</td><td>{item.sessions - item.present}</td><td>{item.sessions}</td>
              <td><strong>{item.percentage}%</strong></td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>
      <section className="academic-panel">
        <h2>Attendance history</h2>
        {report.history.length === 0 ? <p>No attendance has been recorded for this class.</p> : <div className="academic-table">
          <table><thead><tr><th>Date</th><th>Subject</th>{teacher && <th>Student</th>}<th>Status</th></tr></thead>
            <tbody>{report.history.map((row) => <tr key={`${row.session_date}-${row.timetable_id}-${row.student_id}`}>
              <td>{row.session_date}</td><td>{row.subject}</td>{teacher && <td>{row.name}</td>}
              <td><span className={`academic-status ${row.status}`}>{row.status}</span></td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>
    </>}
  </>;
}

export default function Attendance() {
  const { teacher } = useOutletContext();
  return <ClassWorkspace title="Attendance" description={teacher ? "Record attendance and review participation by class." : "Review your attendance history and percentage by class."}>
    {(classId) => <ClassAttendance key={classId} classId={classId} teacher={teacher} />}
  </ClassWorkspace>;
}
