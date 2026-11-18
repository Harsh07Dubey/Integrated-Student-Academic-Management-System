import React, { useState } from 'react';
import Modal from '../components/Modal';
import { createUnit, updateUnit } from '../services/api';

export default function AddUnitModal({ subjectId, subjectName, unit, onClose, onSuccess }) {
  const [unitNumber, setUnitNumber] = useState(unit?.unit_number ?? 1);
  const [title, setTitle] = useState(unit?.title ?? '');
  const [description, setDescription] = useState(unit?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !unitNumber) {
      setError('Unit number and title are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const values = {
        subject_id: subjectId,
        unit_number: Number(unitNumber),
        title: title.trim(),
        description: description.trim(),
      };
      await (unit ? updateUnit(unit.id, values) : createUnit(values));
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not save the unit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={unit ? 'Edit unit' : `Add Unit to ${subjectName || 'Subject'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number *
          </label>
          <input
            type="number"
            min="1"
            max="20"
            required
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction & Complexity"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Algorithm analysis, time and space complexity"
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
            {loading ? 'Saving…' : 'Save unit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
