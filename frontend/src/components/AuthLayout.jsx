import { BookOpen, CalendarDays, ClipboardCheck, GraduationCap } from "lucide-react";

const features = [
  [CalendarDays, "Weekly timetables"],
  [ClipboardCheck, "Attendance history"],
  [BookOpen, "Study materials and past papers"],
];

function Brand() {
  return <div className="auth-brand"><GraduationCap size={26} aria-hidden="true" /> ISAMS</div>;
}

export default function AuthLayout({ title, description, children }) {
  return (
    <main className="auth-container">
      <aside className="auth-intro">
        <Brand />
        <div className="auth-intro-content">
          <h2>Integrated Student Academic Management System</h2>
          <ul>
            {features.map(([Icon, label]) => <li key={label}><Icon size={20} aria-hidden="true" /> {label}</li>)}
          </ul>
        </div>
      </aside>
      <section className="auth-form-panel" aria-labelledby="auth-title">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-brand"><Brand /></div>
          <header className="form-heading">
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
