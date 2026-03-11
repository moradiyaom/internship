import api from './api';

const menuService = {
  getAll: async (params = {}) => {
    const response = await api.get('/menu', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/menu', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/menu/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },
};

export default menuService;

