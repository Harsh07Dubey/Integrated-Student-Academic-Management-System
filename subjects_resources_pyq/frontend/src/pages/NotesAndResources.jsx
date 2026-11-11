import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiSearch,
  FiUploadCloud,
  FiFile,
  FiChevronRight,
  FiX,
} from 'react-icons/fi';
import {
  getResources,
  getSubjects,
  getUnitsBySubject,
  uploadResource,
} from '../services/api';

const RESOURCE_TABS = ['All resources', 'Notes', 'PDFs', 'Study materials'];

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'A-Z', value: 'name_asc' },
];

export default function NotesAndResources() {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All resources');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadUnit, setUploadUnit] = useState('');
  const [uploadUnits, setUploadUnits] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { search: searchQuery, sort: sortBy };
      if (selectedSubjectFilter) params.subject_id = selectedSubjectFilter;
      if (selectedUnitFilter) params.unit_id = selectedUnitFilter;
      if (activeTab === 'Notes') params.resource_type = 'notes';
      else if (activeTab === 'PDFs') params.file_type = 'pdf';
      else if (activeTab === 'Study materials')
        params.resource_type = 'study_material';

      const res = await getResources(params);
      const data = res.data?.data || res.data || [];
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load resources.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, selectedSubjectFilter, selectedUnitFilter, sortBy]);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await getSubjects();
      const data = res.data?.data || res.data || [];
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Fetch units for the upload form when subject changes
  useEffect(() => {
    if (uploadSubject) {
      getUnitsBySubject(uploadSubject)
        .then((res) => {
          const data = res.data?.data || res.data || [];
          setUploadUnits(Array.isArray(data) ? data : []);
        })
        .catch(() => setUploadUnits([]));
    } else {
      setUploadUnits([]);
    }
  }, [uploadSubject]);

  // Fetch units for filter when subject filter changes
  useEffect(() => {
    if (selectedSubjectFilter) {
      getUnitsBySubject(selectedSubjectFilter)
        .then((res) => {
          const data = res.data?.data || res.data || [];
          setUnits(Array.isArray(data) ? data : []);
        })
        .catch(() => setUnits([]));
    } else {
      setUnits([]);
      setSelectedUnitFilter('');
    }
  }, [selectedSubjectFilter]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadSubject) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('subject_id', uploadSubject);
      if (uploadUnit) formData.append('unit_id', uploadUnit);
      await uploadResource(formData);
      // Reset form
      setUploadFile(null);
      setUploadTitle('');
      setUploadSubject('');
      setUploadUnit('');
      fetchResources();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notes &amp; Resources
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Everything your students need, organized in one place.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FiUploadCloud className="w-4 h-4" />
              Upload material
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center gap-2">
          {RESOURCE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-filter row */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={selectedUnitFilter}
            onChange={(e) => setSelectedUnitFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All units</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.unit_number} – {u.title}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content — split layout */}
      <div className="flex gap-8 px-8 py-6" style={{ minHeight: 'calc(100vh - 260px)' }}>
        {/* Left — Resource list */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Recently uploaded
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm py-8 text-center">{error}</div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12">
              <FiFile className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No resources found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  {/* File icon */}
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <FiFile className="w-5 h-5 text-red-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {resource.title || resource.file_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {resource.subject_name || 'Unknown subject'}
                      {resource.unit_title
                        ? ` · Unit ${resource.unit_number}`
                        : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(resource.created_at)}
                    </p>
                  </div>

                  <button className="text-violet-600 hover:text-violet-700 text-sm font-medium flex items-center gap-1 shrink-0">
                    Preview
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Upload panel */}
        <div className="w-96 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Upload material
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Create a file in a few steps
            </p>

            {/* Drag-drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
              }`}
            >
              <FiUploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              {uploadFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FiFile className="w-4 h-4 text-violet-600" />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {uploadFile.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadFile(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 font-medium">
                    Drop your files here or{' '}
                    <span className="text-violet-600">browse files</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, DOC, PPT, XLS, Images
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png"
                onChange={handleFileChange}
              />
            </div>

            {/* Form fields */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter resource title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={uploadUnit}
                  onChange={(e) => setUploadUnit(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  disabled={!uploadSubject}
                >
                  <option value="">Select unit</option>
                  {uploadUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unit_number} – {u.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpload}
                disabled={!uploadFile || !uploadTitle || !uploadSubject || uploading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload & share'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
