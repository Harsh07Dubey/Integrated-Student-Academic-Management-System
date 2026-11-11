import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus, FiEdit, FiBook, FiLayers } from 'react-icons/fi';
import {
  getSubjects,
  getUnitsBySubject,
  getSubjectsByClass,
} from '../services/api';
import AddSubjectModal from './AddSubjectModal';
import AddUnitModal from './AddUnitModal';

const UNIT_COLORS = [
  'bg-violet-600',
  'bg-blue-500',
  'bg-pink-500',
  'bg-violet-600',
  'bg-blue-500',
];

const FILTER_TABS = [
  'All subjects',
  'Computer Science',
  'Semester 1',
  'Semester 2',
  'Semester 3',
];

const DEFAULT_SUBJECTS = [
  { id: 1, name: 'Data Structures & Algorithms', code: 'CS301', semester: 5, unit_count: 6, class_name: 'CS-5A' },
  { id: 2, name: 'Database Management Systems', code: 'CS302', semester: 5, unit_count: 5, class_name: 'CS-5A' },
  { id: 3, name: 'Operating Systems', code: 'CS303', semester: 5, unit_count: 5, class_name: 'CS-5B' },
  { id: 4, name: 'Computer Networks', code: 'CS304', semester: 5, unit_count: 6, class_name: 'CS-5A' },
  { id: 5, name: 'Object-oriented Programming', code: 'CS201', semester: 3, unit_count: 4, class_name: 'CS-3A' },
  { id: 6, name: 'Introduction to Programming', code: 'CS101', semester: 1, unit_count: 5, class_name: 'CS-1A' },
];

const DEFAULT_UNITS = [
  { id: 101, unit_number: 1, title: 'Introduction & Complexity', description: 'Algorithm analysis, time and space complexity', resource_count: 1, topic_count: 2 },
  { id: 102, unit_number: 2, title: 'Arrays, Stacks & Queues', description: 'Linear data structures and their applications', resource_count: 4, topic_count: 3 },
  { id: 103, unit_number: 3, title: 'Trees & Graphs', description: 'Binary trees, traversals, graph algorithms', resource_count: 3, topic_count: 3 },
  { id: 104, unit_number: 4, title: 'Sorting & Searching', description: 'Sorting techniques, hashing, and search methods', resource_count: 2, topic_count: 2 },
];

export default function SubjectsAndUnits() {
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All subjects');
  const [loading, setLoading] = useState(true);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSubjects({ search: searchQuery });
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setSubjects(data);
        if (!selectedSubject) setSelectedSubject(data[0]);
      } else {
        setSubjects(DEFAULT_SUBJECTS);
        if (!selectedSubject) setSelectedSubject(DEFAULT_SUBJECTS[0]);
      }
    } catch (err) {
      console.warn('API unavailable, loading mockup subjects:', err.message);
      setSubjects(DEFAULT_SUBJECTS);
      if (!selectedSubject) setSelectedSubject(DEFAULT_SUBJECTS[0]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject]);

  const fetchUnits = useCallback(async (subjectId) => {
    try {
      setUnitsLoading(true);
      const res = await getUnitsBySubject(subjectId);
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setUnits(data);
      } else {
        setUnits(DEFAULT_UNITS);
      }
    } catch (err) {
      console.warn('API unavailable, loading mockup units:', err.message);
      setUnits(DEFAULT_UNITS);
    } finally {
      setUnitsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (selectedSubject?.id) {
      fetchUnits(selectedSubject.id);
    }
  }, [selectedSubject, fetchUnits]);

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      !filterSearch ||
      s.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesTab =
      activeTab === 'All subjects' ||
      (activeTab.startsWith('Semester') &&
        s.semester === parseInt(activeTab.replace('Semester ', ''))) ||
      s.name.toLowerCase().includes(activeTab.toLowerCase());
    return matchesSearch && matchesTab;
  });

  const handleSubjectAdded = () => {
    setShowAddSubject(false);
    fetchSubjects();
  };

  const handleUnitAdded = () => {
    setShowAddUnit(false);
    if (selectedSubject?.id) fetchUnits(selectedSubject.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Subjects &amp; Units
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Subjects &amp; units — A clear structure for every subject you
              teach.
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
              onClick={() => setShowAddSubject(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add subject
            </button>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="bg-white border-b border-gray-200 px-8 py-3">
        <div className="flex items-center gap-2">
          {FILTER_TABS.map((tab) => (
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
          <div className="ml-auto relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-52"
            />
          </div>
        </div>
      </div>

      {/* Main content — split panel */}
      <div className="flex" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left panel — subject list */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Subjects
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
            </div>
          ) : error ? (
            <div className="px-5 py-8 text-center text-red-500 text-sm">
              {error}
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">
              No subjects found.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {filteredSubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedSubject?.id === subject.id
                      ? 'border-l-4 border-l-violet-600 bg-violet-50'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm">
                    {subject.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{subject.code}</p>
                  <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                    <FiLayers className="w-3 h-3" />
                    {subject.unit_count || 0} units
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Bottom info */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Academic Year 2026-27 · Odd semester
          </div>
        </div>

        {/* Right panel — subject details & units */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedSubject ? (
            <>
              {/* Subject header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSubject.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-500">
                      {selectedSubject.code}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">
                      Semester {selectedSubject.semester}
                    </span>
                  </div>
                  {selectedSubject.class_name && (
                    <p className="text-sm text-violet-600 mt-1">
                      Linked to {selectedSubject.class_name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddUnit(true)}
                  className="flex items-center gap-2 border-2 border-violet-600 text-violet-600 hover:bg-violet-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add unit
                </button>
              </div>

              {/* Units list */}
              {unitsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
                </div>
              ) : units.length === 0 ? (
                <div className="text-center py-12">
                  <FiBook className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No units added yet. Click &quot;+ Add unit&quot; to get
                    started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {units.map((unit, idx) => (
                    <div
                      key={unit.id}
                      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {/* Colored number circle */}
                        <div
                          className={`${
                            UNIT_COLORS[idx % UNIT_COLORS.length]
                          } text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0`}
                        >
                          {String(unit.unit_number || idx + 1).padStart(2, '0')}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">
                            {unit.title}
                          </h4>
                          {unit.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {unit.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiBook className="w-3.5 h-3.5" />
                              {unit.resource_count || 0} resources
                            </span>
                            <span className="flex items-center gap-1">
                              <FiLayers className="w-3.5 h-3.5" />
                              {unit.topic_count || 0} topics
                            </span>
                          </div>
                        </div>

                        <button className="text-violet-600 hover:text-violet-700 text-sm font-medium flex items-center gap-1">
                          <FiEdit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Select a subject to view its units
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddSubject && (
        <AddSubjectModal
          onClose={() => setShowAddSubject(false)}
          onSuccess={handleSubjectAdded}
        />
      )}
      {showAddUnit && selectedSubject && (
        <AddUnitModal
          subjectId={selectedSubject.id}
          subjectName={selectedSubject.name}
          onClose={() => setShowAddUnit(false)}
          onSuccess={handleUnitAdded}
        />
      )}
    </div>
  );
}
