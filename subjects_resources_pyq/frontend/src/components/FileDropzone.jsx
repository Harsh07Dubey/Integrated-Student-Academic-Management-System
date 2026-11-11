import React, { useRef, useState, useCallback } from 'react';
import { FiUploadCloud } from 'react-icons/fi';

export default function FileDropzone({ onFileSelect, acceptedTypes, maxSize }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = useCallback(
    (file) => {
      if (acceptedTypes && acceptedTypes.length > 0) {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!acceptedTypes.includes(ext)) {
          return `File type ${ext} is not supported. Accepted: ${acceptedTypes.join(', ')}`;
        }
      }
      if (maxSize && file.size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
        return `File size exceeds the ${maxMB}MB limit.`;
      }
      return null;
    },
    [acceptedTypes, maxSize]
  );

  const handleFiles = useCallback(
    (files) => {
      setError('');
      if (files.length === 0) return;
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, validateFile]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes?.join(',')}
          onChange={handleChange}
        />
        <FiUploadCloud
          className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
        />
        <p className="text-sm font-medium text-gray-700">
          Drop your files here or{' '}
          <span className="text-primary-600 underline">browse files</span>
        </p>
        {acceptedTypes && (
          <p className="text-xs text-gray-400 mt-1">
            Supported: {acceptedTypes.join(', ')}
          </p>
        )}
        {maxSize && (
          <p className="text-xs text-gray-400">
            Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
          </p>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
