# Subjects, Resources & PYQ Module

Module for the **Integrated Student Academic Management System (ISAMS)** developed for PostgreSQL, Express.js, React.js, and Node.js.

## Assigned Responsibilities

1. **Subject and Unit Organization**: Organize subjects under classes, manage syllabus units with topic/resource associations.
2. **Notes and Resources Upload**: Upload and organize course notes, PDFs, and study materials linked to specific classes, subjects, and units.
3. **PDF & Study Material Management**: Filter by resource type, search, preview, and download.
4. **PYQ Repository**: Upload, categorize, browse, and download previous-year question papers by subject, semester, examination year, and exam type.

---

## Folder Structure

```text
subjects_resources_pyq/
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── README.md
│   ├── uploads/
│   │   ├── resources/
│   │   └── pyqs/
│   └── src/
│       ├── config/
│       │   ├── db.js
│       │   └── migrations.sql
│       ├── controllers/
│       │   ├── pyqController.js
│       │   ├── resourceController.js
│       │   ├── subjectController.js
│       │   └── unitController.js
│       ├── middleware/
│       │   └── validateRequest.js
│       ├── routes/
│       │   ├── index.js
│       │   ├── pyqRoutes.js
│       │   ├── resourceRoutes.js
│       │   ├── subjectRoutes.js
│       │   └── unitRoutes.js
│       └── services/
│           └── fileUploadService.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── README.md
    └── src/
        ├── App.jsx
        ├── index.css
        ├── index.jsx
        ├── components/
        │   ├── FileDropzone.jsx
        │   ├── FilterTabs.jsx
        │   ├── Modal.jsx
        │   ├── Pagination.jsx
        │   ├── PYQCard.jsx
        │   ├── ResourceCard.jsx
        │   ├── Sidebar.jsx
        │   ├── SubjectCard.jsx
        │   ├── TopBar.jsx
        │   └── UnitCard.jsx
        ├── pages/
        │   ├── AddSubjectModal.jsx
        │   ├── AddUnitModal.jsx
        │   ├── NotesAndResources.jsx
        │   ├── PYQRepository.jsx
        │   ├── SubjectsAndUnits.jsx
        │   └── UploadPyqModal.jsx
        └── services/
            └── api.js
```

---

## Database Schema (`migrations.sql`)

- `subjects`: `(id, name, code, semester, class_id REFERENCES classes(id), created_by REFERENCES users(id), created_at)`
- `units`: `(id, unit_number, title, description, subject_id REFERENCES subjects(id) ON DELETE CASCADE, created_at)`
- `resources`: `(id, title, file_name, file_path, file_size, file_type, resource_type, class_id, subject_id, unit_id, uploaded_by, created_at)`
- `pyqs`: `(id, title, file_name, file_path, file_size, subject_id, semester, exam_year, exam_type, duration_hours, total_marks, uploaded_by, created_at)`

---

## Integration Guide

### Backend Integration
In the main project's `backend/src/server.js`:
```javascript
const subjectsResourcesRoutes = require('../../subjects_resources_pyq/backend/src/routes');
// Mount under /api
app.use('/api', subjectsResourcesRoutes);
```

### Frontend Integration
Import pages into the main React router in `frontend/src/App.jsx`:
```javascript
import SubjectsAndUnits from '../../subjects_resources_pyq/frontend/src/pages/SubjectsAndUnits';
import NotesAndResources from '../../subjects_resources_pyq/frontend/src/pages/NotesAndResources';
import PYQRepository from '../../subjects_resources_pyq/frontend/src/pages/PYQRepository';
```
