import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env?.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn('Unauthorized request, token may be invalid or expired.');
    }
    return Promise.reject(error);
  }
);

/* ==========================================================================
   SUBJECTS API
   ========================================================================== */
export const getSubjects = (params = {}) => api.get('/subjects', { params });
export const getSubjectsByClass = (classId) => api.get(`/subjects/class/${classId}`);
export const getSubjectById = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

/* ==========================================================================
   UNITS API
   ========================================================================== */
export const getUnits = (params = {}) => api.get('/units', { params });
export const getUnitsBySubject = (subjectId) => api.get(`/units/subject/${subjectId}`);
export const getUnitById = (id) => api.get(`/units/${id}`);
export const createUnit = (data) => api.post('/units', data);
export const updateUnit = (id, data) => api.put(`/units/${id}`, data);
export const deleteUnit = (id) => api.delete(`/units/${id}`);

/* ==========================================================================
   RESOURCES API
   ========================================================================== */
export const getResources = (params = {}) => api.get('/resources', { params });
export const getResourcesBySubject = (subjectId) => api.get(`/resources/subject/${subjectId}`);
export const getResourcesByUnit = (unitId) => api.get(`/resources/unit/${unitId}`);
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const uploadResource = (formData) => {
  return api.post('/resources', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const downloadResource = (id) => {
  return api.get(`/resources/${id}/download`, {
    responseType: 'blob',
  });
};
export const deleteResource = (id) => api.delete(`/resources/${id}`);

/* ==========================================================================
   PYQ API
   ========================================================================== */
export const getPyqs = (params = {}) => api.get('/pyqs', { params });
export const getPyqsBySubject = (subjectId) => api.get(`/pyqs/subject/${subjectId}`);
export const getPyqById = (id) => api.get(`/pyqs/${id}`);
export const uploadPyq = (formData) => {
  return api.post('/pyqs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const downloadPyq = (id) => {
  return api.get(`/pyqs/${id}/download`, {
    responseType: 'blob',
  });
};
export const deletePyq = (id) => api.delete(`/pyqs/${id}`);

export default api;
