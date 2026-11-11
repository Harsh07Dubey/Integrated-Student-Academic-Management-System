# Subjects, Resources & PYQ — Backend API

REST API for managing academic subjects, course units, study resources, and previous year question papers (PYQs).

## Setup

```bash
cd subjects_resources_pyq/backend
cp .env.example .env   # edit with your DB credentials
npm install
npm run dev             # development (nodemon)
npm start               # production
```

Run the migration before first use:

```bash
psql -U <user> -d <database> -f src/config/migrations.sql
```

## Integration

This module does **not** include its own `server.js`. Mount the router in the main project server:

```js
const subjectsResourcesRoutes = require('../subjects_resources_pyq/backend/src/routes');
app.use('/api', subjectsResourcesRoutes);
```

## API Endpoints

All list endpoints support **pagination** via `?page=1&limit=10` query parameters.

### Subjects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/subjects` | List all subjects (paginated) |
| `GET` | `/api/subjects/:id` | Get subject by ID |
| `GET` | `/api/subjects/class/:classId` | Get subjects by class (paginated) |
| `POST` | `/api/subjects` | Create a subject |
| `PUT` | `/api/subjects/:id` | Update a subject |
| `DELETE` | `/api/subjects/:id` | Delete a subject |

**Create / Update body:**

```json
{
  "name": "Data Structures",
  "code": "CS201",
  "semester": 3,
  "class_id": 1
}
```

### Units

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/units` | List all units (paginated) |
| `GET` | `/api/units/:id` | Get unit by ID |
| `GET` | `/api/units/subject/:subjectId` | Get units by subject (paginated) |
| `POST` | `/api/units` | Create a unit |
| `PUT` | `/api/units/:id` | Update a unit |
| `DELETE` | `/api/units/:id` | Delete a unit |

**Create / Update body:**

```json
{
  "unit_number": 1,
  "title": "Introduction to Arrays",
  "description": "Covers 1D and 2D arrays",
  "subject_id": 1
}
```

### Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/resources` | List all resources (paginated, filterable) |
| `GET` | `/api/resources/:id` | Get resource metadata |
| `GET` | `/api/resources/:id/download` | Download resource file |
| `GET` | `/api/resources/subject/:subjectId` | Resources by subject (paginated) |
| `GET` | `/api/resources/unit/:unitId` | Resources by unit (paginated) |
| `POST` | `/api/resources` | Upload a resource (multipart) |
| `DELETE` | `/api/resources/:id` | Delete resource & file |

**Upload** — `multipart/form-data` with field `file` plus:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Resource title |
| `subject_id` | Yes | Associated subject |
| `class_id` | No | Associated class |
| `unit_id` | No | Associated unit |
| `resource_type` | No | `notes` (default), `slides`, `assignment`, etc. |

**Filters** on `GET /api/resources`:

- `?subject_id=1`
- `?class_id=2`
- `?resource_type=notes`

### PYQs (Previous Year Questions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pyqs` | List all PYQs (paginated, filterable) |
| `GET` | `/api/pyqs/:id` | Get PYQ metadata |
| `GET` | `/api/pyqs/:id/download` | Download PYQ file |
| `GET` | `/api/pyqs/subject/:subjectId` | PYQs by subject (paginated) |
| `POST` | `/api/pyqs` | Upload a PYQ (multipart) |
| `DELETE` | `/api/pyqs/:id` | Delete PYQ & file |

**Upload** — `multipart/form-data` with field `file` plus:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | PYQ title |
| `subject_id` | Yes | Associated subject |
| `exam_year` | Yes | Year of the exam |
| `semester` | No | Semester number |
| `exam_type` | No | `end_semester` (default), `mid_semester`, `supplementary` |
| `duration_hours` | No | Exam duration in hours |
| `total_marks` | No | Total marks |

**Filters** on `GET /api/pyqs`:

- `?subject_id=1`
- `?exam_year=2024`
- `?exam_type=end_semester`
- `?semester=3`

## Response Format

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Resource not found"
}
```

## File Upload Constraints

- **Max size:** 10 MB
- **Allowed types:** pdf, doc, docx, ppt, pptx, xls, xlsx, jpg, png
- Resources are stored in `uploads/resources/`
- PYQs are stored in `uploads/pyqs/`

## Project Structure

```
subjects_resources_pyq/backend/
├── .env.example
├── package.json
├── README.md
├── uploads/
│   ├── resources/
│   └── pyqs/
└── src/
    ├── config/
    │   ├── db.js
    │   └── migrations.sql
    ├── controllers/
    │   ├── subjectController.js
    │   ├── unitController.js
    │   ├── resourceController.js
    │   └── pyqController.js
    ├── middleware/
    │   └── validateRequest.js
    ├── routes/
    │   ├── index.js
    │   ├── subjectRoutes.js
    │   ├── unitRoutes.js
    │   ├── resourceRoutes.js
    │   └── pyqRoutes.js
    └── services/
        └── fileUploadService.js
```
