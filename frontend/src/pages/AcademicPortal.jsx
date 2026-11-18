import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { BookOpen, CalendarDays, ClipboardCheck, FileText, GraduationCap, LayoutDashboard } from "lucide-react";
import "./academics.css";

export const academicLinks = [
  ["/timetable", "Timetable", CalendarDays],
  ["/attendance", "Attendance", ClipboardCheck],
  ["/subjects", "Subjects & units", BookOpen],
  ["/resources", "Resources", FileText],
  ["/pyq", "Question papers", GraduationCap],
];

export async function academicRequest(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...(options.body && { "Content-Type": "application/json" }),
    },
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export default function AcademicPortal() {
  const user = JSON.parse(localStorage.getItem("user"));
  const teacher = user.role === "TEACHER";
  const dashboard = teacher ? "/teacher-dashboard" : "/student-dashboard";
  return (
    <div className="academic-portal">
      <aside className="academic-sidebar">
        <Link to={dashboard} className="academic-brand"><GraduationCap size={24} /> ISAMS</Link>
        <nav aria-label="Academic navigation">
          <Link to={dashboard}><LayoutDashboard size={18} /> Dashboard</Link>
          {academicLinks.map(([href, label, Icon]) => (
            <NavLink key={href} to={href}><Icon size={18} />{label}</NavLink>
          ))}
        </nav>
        <div className="academic-profile"><strong>{user.name}</strong><span>{teacher ? "Teacher" : "Student"}</span></div>
      </aside>
      <main className="academic-main"><Outlet context={{ teacher }} /></main>
    </div>
  );
}

export function ClassWorkspace({ title, description, children }) {
  const [classes, setClasses] = useState(null);
  const [classId, setClassId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    academicRequest("/classes", { signal: controller.signal }).then(({ classes }) => {
      setClasses(classes);
      setClassId(classes[0] ? String(classes[0].id) : "");
    }).catch((error) => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, []);
  return (
    <>
      <header className="academic-heading">
        <div><h1>{title}</h1><p>{description}</p></div>
        {!!classes?.length && <label>Class<select value={classId} onChange={(event) => setClassId(event.target.value)}>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.class_name}</option>)}
        </select></label>}
      </header>
      {error && <p role="alert" className="academic-error">{error}</p>}
      {!classes && !error && <p role="status">Loading classes…</p>}
      {classes?.length === 0 && <div className="academic-panel">Create or join a class from your dashboard to get started.</div>}
      {classId && children(classId)}
    </>
  );
}
