import React from 'react';
import { FiEdit2, FiFolder, FiBookOpen } from 'react-icons/fi';

const circleColors = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-green-500',
];

export default function UnitCard({ unitNumber, title, description, resourceCount, topicCount, onEdit }) {
  const colorClass = circleColors[(unitNumber - 1) % circleColors.length];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Unit number circle */}
        <div
          className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
        >
          {unitNumber}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center gap-1"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FiFolder className="w-3.5 h-3.5" />
              <span>{resourceCount ?? 0} resources</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FiBookOpen className="w-3.5 h-3.5" />
              <span>{topicCount ?? 0} topics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
