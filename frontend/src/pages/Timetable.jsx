import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { academicRequest, ClassWorkspace } from "./AcademicPortal";

export const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const emptySlot = { subject: "", room: "", weekday: 1, starts_at: "", ends_at: "" };

function WeeklySchedule({ classId, teacher }) {
  const path = `/classes/${classId}/timetable`;
  const [slots, setSlots] = useState(null);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    academicRequest(path, { signal: controller.signal }).then(({ slots }) => setSlots(slots))
      .catch((error) => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [path]);

  async function mutate(method, slot) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const data = await academicRequest(slot.id ? `${path}/${slot.id}` : path, {
        method,
        ...(method !== "DELETE" && { body: JSON.stringify(slot) }),
      });
      setSlots((current) => {
        const remaining = current.filter((item) => item.id !== slot.id);
        if (data) remaining.push(data.slot);
        return remaining.sort((a, b) => a.weekday - b.weekday || a.starts_at.localeCompare(b.starts_at));
      });
      setEditor(null);
      setMessage(method === "DELETE" ? "Session removed from the weekly timetable." : "Session saved.");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="academic-section-header">
        <h2><CalendarDays size={20} /> Weekly schedule</h2>
        {teacher && slots && <button className="academic-primary" disabled={busy} onClick={() => setEditor(emptySlot)}><Plus size={17} /> Add session</button>}
      </div>
      {message && <p role="status" className="academic-success">{message}</p>}
      {error && <p role="alert" className="academic-error">{error}</p>}
      {editor && (
        <form className="academic-panel academic-form" onSubmit={(event) => {
          event.preventDefault();
          mutate(editor.id ? "PUT" : "POST", editor);
        }}>
          <h3>{editor.id ? "Edit session" : "New session"}</h3>
          <div className="academic-fields">
            <label>Subject<input required maxLength={120} value={editor.subject} onChange={(e) => setEditor({ ...editor, subject: e.target.value })} /></label>
            <label>Room<input maxLength={80} value={editor.room} onChange={(e) => setEditor({ ...editor, room: e.target.value })} /></label>
            <label>Day<select aria-label="Day" value={editor.weekday} onChange={(e) => setEditor({ ...editor, weekday: Number(e.target.value) })}>
              {weekdays.map((day, index) => <option key={day} value={index + 1}>{day}</option>)}
            </select></label>
            <label>Starts<input required type="time" value={editor.starts_at} onChange={(e) => setEditor({ ...editor, starts_at: e.target.value })} /></label>
            <label>Ends<input required type="time" value={editor.ends_at} onChange={(e) => setEditor({ ...editor, ends_at: e.target.value })} /></label>
          </div>
          <div className="academic-actions"><button disabled={busy} className="academic-primary">Save session</button>
            <button disabled={busy} type="button" onClick={() => setEditor(null)}>Cancel</button></div>
        </form>
      )}
      {!slots && !error && <p role="status">Loading timetable…</p>}
      {slots?.length === 0 && <div className="academic-panel">There are no scheduled sessions yet.</div>}
      {slots?.length > 0 && (
        <div className="academic-week">
          {weekdays.map((day, index) => {
            const entries = slots.filter((slot) => slot.weekday === index + 1);
            if (!entries.length && index >= 5) return null;
            return <section className="academic-day" key={day}>
              <h3>{day}</h3>
              {entries.length === 0 && <p className="academic-muted">No sessions</p>}
              {entries.map((slot) => (
                <article key={slot.id} className="academic-slot">
                  <time>{slot.starts_at.slice(0, 5)} – {slot.ends_at.slice(0, 5)}</time>
                  <strong>{slot.subject}</strong>
                  {slot.room && <span><MapPin size={14} /> {slot.room}</span>}
                  {teacher && <div className="academic-actions">
                    <button disabled={busy} onClick={() => setEditor({ ...slot, starts_at: slot.starts_at.slice(0, 5), ends_at: slot.ends_at.slice(0, 5) })}>Edit</button>
                    <button disabled={busy} onClick={() => {
                      if (window.confirm(`Remove ${slot.subject} from the weekly timetable?`)) mutate("DELETE", slot);
                    }}>Remove</button>
                  </div>}
                </article>
              ))}
            </section>;
          })}
        </div>
      )}
    </>
  );
}

export default function Timetable() {
  const { teacher } = useOutletContext();
  return <ClassWorkspace title="Timetable" description={teacher ? "Plan recurring sessions for each class." : "See when and where your classes meet."}>
    {(classId) => <WeeklySchedule key={classId} classId={classId} teacher={teacher} />}
  </ClassWorkspace>;
}
