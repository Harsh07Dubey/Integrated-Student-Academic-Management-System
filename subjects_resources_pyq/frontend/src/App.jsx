import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SubjectsAndUnits from './pages/SubjectsAndUnits';
import NotesAndResources from './pages/NotesAndResources';
import PYQRepository from './pages/PYQRepository';

function Layout({ children }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/subjects':
        return 'Subjects & Units';
      case '/resources':
        return 'Notes & Resources';
      case '/pyq':
        return 'PYQ Repository';
      case '/classes':
        return 'My Classes';
      case '/timetable':
        return 'Timetable';
      case '/attendance':
        return 'Attendance';
      case '/profile':
        return 'Profile';
      case '/dashboard':
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar fixed on the left */}
      <Sidebar />

      {/* Main content area shifted by sidebar width */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopBar title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/subjects" replace />} />
          <Route path="/subjects" element={<SubjectsAndUnits />} />
          <Route path="/resources" element={<NotesAndResources />} />
          <Route path="/pyq" element={<PYQRepository />} />

          {/* Connected placeholder routes for complete sidebar navigation */}
          <Route
            path="/dashboard"
            element={
              <PlaceholderPage
                title="Academic Dashboard"
                description="Overview of your classes, upcoming lectures, student queries, and announcements."
              />
            }
          />
          <Route
            path="/classes"
            element={
              <PlaceholderPage
                title="My Classes"
                description="Managed by the Class & Batch management module."
              />
            }
          />
          <Route
            path="/timetable"
            element={
              <PlaceholderPage
                title="Timetable & Schedule"
                description="View and manage weekly lecture schedules, lab batches, and hall allocations."
              />
            }
          />
          <Route
            path="/attendance"
            element={
              <PlaceholderPage
                title="Attendance Tracker"
                description="Daily student attendance, session logs, and absence reports."
              />
            }
          />
          <Route
            path="/profile"
            element={
              <PlaceholderPage
                title="Faculty Profile"
                description="View and update faculty details, department, and contact information."
              />
            }
          />
          <Route path="*" element={<Navigate to="/subjects" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
