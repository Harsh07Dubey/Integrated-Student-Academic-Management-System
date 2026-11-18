import React from 'react';

export default function SubjectCard({ name, code, unitCount, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-lg border transition-all ${
        isSelected
          ? 'border-l-4 border-l-primary-600 border-primary-200 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-gray-50'
      }`}
    >
      <h3 className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
        {name}
      </h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-500">{code}</span>
        <span className="text-xs text-gray-400">{unitCount} units</span>
      </div>
    </button>
  );
}
