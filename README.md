# Integrated Student Academic Management System

A third-year computer science project that gives teachers and students one place to manage classes, schedules, attendance, and study materials. The project uses React and Vite for the frontend, Express for the backend, and Supabase PostgreSQL for the shared database.

## Before you start

- Install Node.js 22.12 or later and npm.
- Get the team's Supabase PostgreSQL **Session pooler** connection string and database password from the project owner. The shared DBMS project already has the nine application tables.

## Run the project

Run the following commands in PowerShell from the repository root. Keep both terminals open.

### 1. Configure and start the backend

```powershell
cd backend
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Edit `backend/.env` before starting the server.

| Setting | Value |
| --- | --- |
| `DATABASE_URL` | Your Supabase Session pooler connection string with the database password filled in. Use TLS and URL-encode special characters in the password. |
| `JWT_SECRET` | A long random value used by the backend to sign login tokens. |
| `PORT` | `5000` |
| `CAMPUS_TIMEZONE` | `Asia/Kolkata` |

Remove `DATABASE_SSL=false` if it appears in an earlier local setup. Keep `.env` private and out of Git. The backend expects a PostgreSQL connection string. Supabase's project URL and API keys are for other connection methods.

Use `sslmode=verify-full` in the connection URL. If Node reports a certificate-chain error, download the CA certificate from **Database Settings → SSL configuration** in Supabase and add its URL-encoded absolute path as the `sslrootcert` query parameter. [Supabase SSL guide](https://supabase.com/docs/guides/platform/ssl-enforcement)

```powershell
npm.cmd ci
npm.cmd start
```

Open [the database health check](http://localhost:5000/api/db-test). A working connection returns JSON with `"success": true`. The shared project already has its schema. For a separate, empty database, the administrator can use `npm.cmd run db:migrate` from `backend` to initialize the tables. When provisioning a new Supabase project, enable row-level security on the app tables and grant the backend login the permissions it needs.

### 2. Start the frontend

Open a second PowerShell terminal at the repository root.

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Open the URL Vite prints, usually [http://localhost:5173](http://localhost:5173/). Vite forwards `/api` requests to the backend on port 5000. If you change the backend port, set `ISAMS_API_TARGET` to its new URL before starting Vite.

### Troubleshooting

| Symptom | What to check |
| --- | --- |
| Sign-in or registration says the account server is unavailable | Check that the backend terminal is still running and visit the database health endpoint directly. |
| The database health endpoint returns `"success": false` | Check the backend terminal for the PostgreSQL error. Verify the pooler host, database username, password, and TLS settings. |
| Your old demo account cannot sign in | Create an account in the app. Accounts belong to the database the backend currently uses. |
| An imported student cannot sign in | Use the student's exact email from the local demo login file. Confirm the project owner has activated the demo passwords in the shared Supabase project. |
| A resource is listed but its download fails | Check that you are running the backend with access to the original uploads directory. The shared database stores the file metadata and the backend serves the files. |

## How the project works

The React frontend calls the Express APIs. Express checks login tokens, user roles, and class membership before reading or writing records in Supabase PostgreSQL.

| Module | Workflow | Database tables |
| --- | --- | --- |
| Accounts and classes | A teacher registers, creates a class, and shares its code. A student registers separately and enters the code to join. | `users`, `classes`, `enrollments` |
| Timetable | Teachers create, edit, or remove recurring sessions with a weekday, subject, time, and room. The backend rejects overlapping sessions within the same class. Enrolled students see their class timetable. | `timetable` |
| Attendance | A teacher selects a date and scheduled session, then marks the roster present or absent. Saving again updates the same session records. Students see their own history and percentage. Removing a timetable slot preserves recorded attendance. | `attendance`, `timetable`, `enrollments` |
| Study library | Teachers organize subjects and units and upload notes or past papers. Signed-in students can browse and download them. Supabase stores file metadata, and the backend stores uploaded files in its uploads directory. | `subjects`, `units`, `resources`, `pyqs` |

Attendance percentage is **present sessions ÷ recorded sessions × 100**. For example, one present mark and one absent mark produce **50%**. A class with zero recorded sessions displays an empty state.

## COMP A1 and COMP A2 demo

The shared Supabase demo has one subject, **Database Management Systems (DBMS)**, with **Bhupesh Tirodkar** as the teacher for both classes. The 71 students from the supplied roster were sorted by roll number and split into 36 students in **COMP A1** and 35 in **COMP A2**.

### Sign in and activate student accounts

On the computer used to set up the demo, open the local credentials file:

```powershell
notepad "$env:LOCALAPPDATA\ISAMS\bhupesh-and-student-logins.txt"
```

Use Bhupesh's details for the teacher demo. Each imported student has an individual email and uses the shared demo passcode from the file. If you're on another computer, ask the demo owner for the account details you need. Share them individually and keep the credential files out of Git.

If the student passcode hasn't been activated, the Supabase project owner must perform the one-time setup:

1. Open `%LOCALAPPDATA%\ISAMS\activate-student-logins.sql` and copy the whole script.
2. Paste it into the [DBMS project SQL Editor](https://supabase.com/dashboard/project/rmpojelclgetcusiyczf/sql/new) and select **Run**.
3. Look for `Activated 71 student logins` in the results. If the script reports a mismatch, stop and check the roster or prior activation status.
4. Open the app's **Sign in** page and try one student email with the passcode from the credential file.

The activation script sets the password hashes for the imported student accounts. Bhupesh's login uses its existing password.

### Timetable

Select the class from the **Timetable** page. The imported practical batches P21 and P22 map to COMP A1, and P23 and P24 map to COMP A2.

| Day | Time (campus local time) | Session | Class |
| --- | --- | --- | --- |
| Monday | 11:15 AM–12:15 PM | DBMS lecture | Both classes |
| Monday | 3–5 PM | DBMS lab, Research Lab | COMP A2 |
| Tuesday | 9–10 AM | DBMS lecture | Both classes |
| Tuesday | 3–5 PM | DBMS lab, Research Lab | COMP A1 |
| Wednesday | 3–4 PM | DBMS lecture | Both classes |
| Friday | 12:15–1:15 PM | DBMS lecture | Both classes |

### Attendance

1. Sign in as Bhupesh, open **Attendance**, and select COMP A1 or COMP A2.
2. Review the seeded history and percentages. Each student has 25 sample sessions labeled **Demo**. Adarsh Parsekar has 60% (15 of 25) and Harsh Dubey has 100% (25 of 25). Everyone else has randomized attendance above 75%. With 25 sessions, each mark changes the percentage by 4 points, and the calculation caps at 100%.
3. To demonstrate marking a new session, select a valid scheduled date and class session, mark the roster, and select **Save attendance**. Opening a saved session lets the teacher update its marks.
4. Sign out and sign in as a student to show that student's own timetable, attendance history, and percentage.

### Study materials

- **Question Papers** contains DBMS Assignments III and IV, filed under **Internal assessment** for Semester 5, 2026.
- **Resources** contains seven DBMS files, including SQL solutions, relational algebra examples, and lecture slides.
- Both classes use the same DBMS subject and study library. The roster PDF supplied the class lists.

### Start a separate demo from scratch

Register a teacher and a student in the app. Create a class as the teacher, share its code, and join the class as the student. Schedule two sessions, record one present and one absent mark, then sign in as the student and verify that the app shows 50% attendance.

## Deployment notes

- Route `/api` to Express and serve the frontend with a single-page app fallback. Keep the backend uploads directory on persistent storage.
- Registration lets users select their own role for the classroom demo.
- Campus dates default to Asia/Kolkata. If you change the timezone, set both `CAMPUS_TIMEZONE` in the backend and `VITE_CAMPUS_TIMEZONE` in the frontend.
