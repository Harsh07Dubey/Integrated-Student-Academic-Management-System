
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassStudents from "./pages/ClassStudents";
import ProtectedRoute from "./components/ProtectedRoute";
import AcademicPortal from "./pages/AcademicPortal";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import SubjectsAndUnits from "./library/pages/SubjectsAndUnits";
import NotesAndResources from "./library/pages/NotesAndResources";
import PYQRepository from "./library/pages/PYQRepository";
import "./library/library.css";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRole="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute allowedRole="TEACHER">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/classes/:id/students"
        element={
          <ProtectedRoute allowedRole="TEACHER">
            <ClassStudents />
          </ProtectedRoute>
        }
      />

      <Route element={<ProtectedRoute><AcademicPortal /></ProtectedRoute>}>
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/subjects" element={<SubjectsAndUnits />} />
        <Route path="/resources" element={<NotesAndResources />} />
        <Route path="/pyq" element={<PYQRepository />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
