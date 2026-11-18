import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { FiUpload, FiDownload, FiFileText } from 'react-icons/fi';
import { getPyqs, getSubjects, downloadPyq, openLibraryFile } from '../services/api';
import PYQCard from '../components/PYQCard';
import Pagination from '../components/Pagination';
import UploadPyqModal from './UploadPyqModal';
import Modal from '../components/Modal';

export default function PYQRepository() {
  const { teacher } = useOutletContext();
  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [subjectFilter, setSubjectFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('5');
  const [yearFilter, setYearFilter] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 6;

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewPaper, setPreviewPaper] = useState(null);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await getSubjects();
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setSubjects(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load subjects.');
    }
  }, []);

  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (subjectFilter) params.subject_id = subjectFilter;
      if (semesterFilter) params.semester = semesterFilter;
      if (yearFilter) params.exam_year = yearFilter;
      if (examTypeFilter) params.exam_type = examTypeFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await getPyqs(params);
      const data = res.data?.data || res.data || [];

      setPapers(data);
      setTotalCount(res.data?.pagination?.total ?? data.length);
    } catch (err) {
      setPapers([]);
      setTotalCount(0);
      setError(err.response?.data?.message || 'Could not load papers.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, subjectFilter, semesterFilter, yearFilter, examTypeFilter, searchQuery]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleDownload = async (paper, preview = false) => {
    try {
      const { data } = await downloadPyq(paper.id);
      openLibraryFile(data, paper.file_name || paper.title + '.pdf', preview);
    } catch {
      setPreviewPaper(null);
      setError('Could not open this question paper.');
    }
  };

  const handlePreview = (paper) => {
    setPreviewPaper(paper);
  };

  const handlePaperUploaded = () => {
    setShowUploadModal(false);
    fetchPapers();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Hero space */}
      <div className="bg-gradient-to-r from-violet-50/60 via-purple-50/30 to-blue-50/40 border border-violet-100 rounded-2xl p-6 relative">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              PYQ Repository
            </h1>
            <p className="text-sm text-gray-500">
              Browse previous-year question papers by subject and exam.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              hidden={!teacher}
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <FiUpload className="w-4 h-4" />
              Upload paper
            </button>
          </div>
        </div>

      </div>

      <label className="block text-sm font-medium text-gray-700">
        Search question papers
        <input type="search" value={searchQuery} onChange={(event) => {
          setCurrentPage(1);
          setSearchQuery(event.target.value);
        }} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2" />
      </label>
      {error && <p role="alert" className="academic-error">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Subject dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Subject
          </label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">All subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Semester
          </label>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">All semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={String(sem)}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Year dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Year
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">All years</option>
            {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - i).map((year) =>
              <option value={year} key={year}>{year}</option>)}
          </select>
        </div>

        {/* Exam Type dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Exam type
          </label>
          <select
            value={examTypeFilter}
            onChange={(e) => setExamTypeFilter(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="">All examinations</option>
            <option value="end_semester">End semester</option>
            <option value="mid_semester">Mid semester</option>
            <option value="internal">Internal assessment</option>
          </select>
        </div>
      </div>

      {/* Grid of PYQ Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl border border-gray-200 p-5 h-48 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">No question papers found</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search filters or upload a new paper.
          </p>
          <button
            hidden={!teacher}
              onClick={() => setShowUploadModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
          >
            <FiUpload className="w-4 h-4" />
            Upload paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map((paper) => (
            <PYQCard
              key={paper.id}
              year={paper.exam_year}
              subjectName={paper.subject_name || paper.title}
              code={paper.code || 'CS301'}
              semester={paper.semester || 5}
              examType={paper.exam_type}
              duration={paper.duration_hours || '3'}
              marks={paper.total_marks || 100}
              onPreview={() => handlePreview(paper)}
              onDownload={() => handleDownload(paper)}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="pt-2 border-t border-gray-100">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalCount / itemsPerPage) || 1}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Upload Paper Modal */}
      {showUploadModal && (
        <UploadPyqModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handlePaperUploaded}
        />
      )}

      {/* Preview Modal */}
      {previewPaper && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewPaper(null)}
          title={`Paper Preview: ${previewPaper.subject_name || previewPaper.title}`}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Subject:</span>
                <span className="font-semibold text-gray-800">{previewPaper.subject_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Code / Semester:</span>
                <span className="font-semibold text-gray-800">
                  {previewPaper.code} · Semester {previewPaper.semester}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Year / Exam Type:</span>
                <span className="font-semibold text-gray-800 capitalize">
                  {previewPaper.exam_year} · {previewPaper.exam_type?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Duration & Marks:</span>
                <span className="font-semibold text-gray-800">
                  {previewPaper.duration_hours} Hours · {previewPaper.total_marks} Marks
                </span>
              </div>
            </div>

            <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
              <FiFileText className="w-12 h-12 text-violet-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">{previewPaper.file_name || 'Question Paper Document'}</p>
              <button type="button" className="mt-3 text-sm font-medium text-violet-700"
                onClick={() => handleDownload(previewPaper, true)}>Open PDF</button>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setPreviewPaper(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownload(previewPaper)}
                className="px-4 py-2 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-lg inline-flex items-center gap-1.5"
              >
                <FiDownload className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
