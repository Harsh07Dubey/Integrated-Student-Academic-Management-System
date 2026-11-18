import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import FileDropzone from '../components/FileDropzone';
import { uploadPyq, getSubjects } from '../services/api';

export default function UploadPyqModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [semester, setSemester] = useState(5);
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [examType, setExamType] = useState('end_semester');
  const [durationHours, setDurationHours] = useState('3.0');
  const [totalMarks, setTotalMarks] = useState('100');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSubjects()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setSubjects(Array.isArray(data) ? data : []);
        if (data.length > 0 && !subjectId) {
          setSubjectId(data[0].id);
          if (data[0].semester) setSemester(data[0].semester);
        }
      })
      .catch((err) => console.error('Failed to load subjects for PYQ upload', err));
  }, []);

  const handleSubjectChange = (e) => {
    const id = e.target.value;
    setSubjectId(id);
    const sub = subjects.find((s) => String(s.id) === String(id));
    if (sub && sub.semester) {
      setSemester(sub.semester);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a question paper file (PDF).');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || `${subjects.find((s) => String(s.id) === String(subjectId))?.name || 'PYQ'} - ${examYear}`);
      formData.append('subject_id', subjectId);
      formData.append('semester', semester);
      formData.append('exam_year', examYear);
      formData.append('exam_type', examType);
      if (durationHours) formData.append('duration_hours', durationHours);
      if (totalMarks) formData.append('total_marks', totalMarks);

      await uploadPyq(formData);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload question paper.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Upload Previous Year Question Paper">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Paper File (PDF) *
          </label>
          <FileDropzone
            onFileSelect={(selectedFile) => setFile(selectedFile)}
            acceptedTypes={['.pdf']}
            maxSize={15}
          />
          {file && (
            <p className="mt-1 text-xs text-green-600 font-medium">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paper Title / Description
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. End Semester Exam Paper 2025"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={handleSubjectChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Select subject</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester *
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Year *
            </label>
            <input
              type="number"
              min="2000"
              max="2030"
              required
              value={examYear}
              onChange={(e) => setExamYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Type
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="end_semester">End Semester</option>
              <option value="mid_semester">Mid Semester</option>
              <option value="internal">Internal Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Marks
            </label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (Hours)
          </label>
          <input
            type="number"
            step="0.5"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="3.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Paper'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
