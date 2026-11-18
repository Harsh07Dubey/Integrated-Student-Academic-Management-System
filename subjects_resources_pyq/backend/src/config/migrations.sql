-- ============================================================
-- Subjects, Resources & PYQ Module — Database Migrations
-- ============================================================

-- subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  semester INTEGER NOT NULL,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- units table
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  unit_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- resources table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  resource_type VARCHAR(50) DEFAULT 'notes',
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- pyqs table
CREATE TABLE IF NOT EXISTS pyqs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  semester INTEGER,
  exam_year INTEGER NOT NULL,
  exam_type VARCHAR(50) DEFAULT 'end_semester',
  duration_hours NUMERIC(3,1),
  total_marks INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
