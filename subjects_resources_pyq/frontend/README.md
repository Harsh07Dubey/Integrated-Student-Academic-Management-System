# Subjects, Resources & PYQ — Frontend

React + Vite frontend for the **Subjects, Resources & PYQ Module** of the Integrated Student Academic Management System (ISAMS).

Designed and styled according to the official project UI mockups with Tailwind CSS and React Icons.

## Features & Pages

1. **Subjects & Units (`/subjects`)**
   - Split-panel view: Left list of subjects with code and unit counts; Right panel showing unit cards with numbered badges, resource counts, topic counts, and edit actions.
   - Filter pills for semesters/departments and instant search.
   - Add Subject and Add Unit modals.

2. **Notes & Resources (`/resources`)**
   - Resource listing by tab (All resources, Notes, PDFs, Study materials).
   - Filtering by subject, unit, and sort order.
   - Drag-and-drop file uploader with class and unit selection.
   - File preview and download links.

3. **PYQ Repository (`/pyq`)**
   - Hero banner with exam preparation badge and total papers count.
   - Multi-criteria filter row: Subject, Semester, Year, and Exam Type.
   - 3-column responsive card grid with year badges, PDF tags, exam duration, and marks.
   - Direct download and paper preview modal.
   - Upload Question Paper modal with PDF validation.

4. **Reusable Components (`src/components/`)**
   - `Sidebar`: ISAMS navigation with active route highlights and Academic Year indicator.
   - `TopBar`: Page title, global search bar, user badge (Dr. Sarah Wilson).
   - `PYQCard`: Grid card for past papers.
   - `ResourceCard`: List item for uploaded notes and study materials.
   - `SubjectCard` & `UnitCard`: Components for subject and syllabus hierarchy.
   - `FileDropzone`: Drag-and-drop file upload zone.
   - `FilterTabs` & `Pagination`: Clean filtering and page navigation controls.
   - `Modal`: Accessible backdrop overlay modal.

## Setup & Running

```bash
cd subjects_resources_pyq/frontend
npm install
npm run dev
```

The application runs on Vite (default port 5173).

## Environment Variables

Create `.env` in `frontend/` if needed:
```env
VITE_API_URL=http://localhost:5000/api
```

## Integration into Main Project

This module is designed to mount seamlessly into the shared React application:
- Export the pages or routes from `src/pages/`
- All API calls are centralized in `src/services/api.js` with automatic JWT token attachment
