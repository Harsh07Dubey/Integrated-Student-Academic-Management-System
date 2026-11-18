import React from 'react';
import { FiEye, FiDownload } from 'react-icons/fi';

const yearColors = {
  2025: 'bg-purple-100 text-purple-700',
  2024: 'bg-blue-100 text-blue-700',
  2023: 'bg-green-100 text-green-700',
  2022: 'bg-orange-100 text-orange-700',
};

export default function PYQCard({
  year,
  subjectName,
  code,
  semester,
  examType,
  duration,
  marks,
  onPreview,
  onDownload,
}) {
  const yearColor = yearColors[year] || 'bg-gray-100 text-gray-700';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col">
      {/* Top badges */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${yearColor}`}>
          {year}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-50 text-red-600">
          PDF
        </span>
      </div>

      {/* Subject info */}
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{subjectName}</h3>
      <p className="text-xs text-gray-500 mb-3">{code} · Semester {semester}</p>

      {/* Exam details */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
        {examType && <span className="capitalize">{examType.replace('_', ' ')}</span>}
        {duration && <span>{duration} hrs</span>}
        {marks && <span>{marks} marks</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={onPreview}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50"
        >
          <FiEye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs font-medium hover:opacity-90 shadow-sm"
        >
          <FiDownload className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
