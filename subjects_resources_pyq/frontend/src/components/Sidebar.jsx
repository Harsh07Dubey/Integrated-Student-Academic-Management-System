import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiLayers,
  FiFileText,
  FiArchive,
  FiClock,
  FiCheckSquare,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/classes', icon: FiBook, label: 'My Classes' },
  { to: '/subjects', icon: FiLayers, label: 'Subjects & Units' },
  { to: '/resources', icon: FiFileText, label: 'Notes & Resources' },
  { to: '/pyq', icon: FiArchive, label: 'PYQ Repository' },
  { to: '/timetable', icon: FiClock, label: 'Timetable' },
  { to: '/attendance', icon: FiCheckSquare, label: 'Attendance' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar text-white flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <FiLayers className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-wide">ISAMS</span>
      </div>

      {/* Section label */}
      <div className="px-6 pt-6 pb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Academic Workspace
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        {/* Academic Year Selector */}
        <div className="bg-white/5 rounded-lg px-3 py-2.5">
          <p className="text-xs text-gray-400 mb-0.5">Academic Year</p>
          <p className="text-sm font-medium text-white">2026-27 · Odd semester</p>
        </div>

        {/* Logout */}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white w-full">
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
