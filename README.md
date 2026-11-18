# Integrated Student Academic Management System

A third-year computer science project that gives teachers and students one place to manage classes, schedules, attendance, and study material.

## Run locally

1. Create a PostgreSQL database. In the backend directory, copy the example environment file to `.env` and set the database URL and a long random JWT secret. For hosted PostgreSQL, use the provider's TLS connection string.
2. In `backend`, run `npm ci`, `npm run db:migrate`, then `npm start`.
3. In `frontend`, run `npm ci` and `npm run dev`. Open the address printed by Vite. Vite proxies `/api` to port 5000. If you change the backend port, set `ISAMS_API_TARGET` before starting Vite.
4. Register separate teacher and student accounts. The teacher creates a class and shares its code. The student joins using that code.

The migration creates the authentication and class tables, the study library tables, and the `timetable` and `attendance` tables. For a deployment, route `/api` to Express and serve the frontend with a single-page app fallback. Keep the uploads directory on persistent storage.

## Demo a third-year class

Create a class called TY Computer Science, schedule a DBMS lecture and a lab, and have a student join the class. Show the timetable from both accounts. Record one present and one absent mark for the student on two sessions and verify the student sees 50%. Add the DBMS subject, a Normalization unit, a set of notes, and a past paper to demonstrate the shared study library.

## Rules

- Teachers manage schedules and attendance for classes they own. Enrolled students can view their classes' schedules and their own attendance.
- Timetable sessions recur weekly. Attendance uses a session and a date. Saving again updates the same records. Removing a scheduled slot preserves its history.
- Attendance percentage is present sessions divided by all recorded sessions. Classes with no recorded sessions display an empty state.
- The study library is shared across signed-in accounts. Teachers can add and edit its material. Registration lets users select their role for the classroom demo.
- Campus dates default to Asia/Kolkata. If you change the timezone, set both `CAMPUS_TIMEZONE` in the backend and `VITE_CAMPUS_TIMEZONE` in the frontend.
