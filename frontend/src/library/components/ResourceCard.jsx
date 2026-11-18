import React from 'react';
import { FiFileText, FiEye } from 'react-icons/fi';

export default function ResourceCard({ fileName, subjectName, unitName, date, onPreview }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* File icon */}
      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
        <FiFileText className="w-5 h-5 text-red-500" />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{fileName}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {subjectName}
          {unitName && <span> · {unitName}</span>}
        </p>
      </div>

      {/* Date */}
      <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">{date}</span>

      {/* Preview button */}
      {onPreview && (
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-xs font-medium flex-shrink-0"
        >
          <FiEye className="w-4 h-4" />
          Preview
        </button>
      )}
    </div>
  );
}
