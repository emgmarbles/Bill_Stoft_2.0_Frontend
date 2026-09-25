import api from './api';

export const companyProfileService = {
  getCompanyProfiles: async (params = {}) => {
    const response = await api.get('/v1/company-profiles/', { params });
    return response.data;
  },

  getCompanyProfile: async (id) => {
    const response = await api.get(`/v1/company-profiles/${id}/`);
    return response.data;
  },

  getPrimaryCompanyProfile: async () => {
    const response = await api.get('/v1/company-profiles/primary/');
    return response.data;
  },

  createCompanyProfile: async (data) => {
    const response = await api.post('/v1/company-profiles/', data);
    return response.data;
  },

  updateCompanyProfile: async (id, data) => {
    const response = await api.put(`/v1/company-profiles/${id}/`, data);
    return response.data;
  },

  deleteCompanyProfile: async (id) => {
    const response = await api.delete(`/v1/company-profiles/${id}/`);
    return response.data;
  },

  setPrimaryCompanyProfile: async (id) => {
    const response = await api.post(`/v1/company-profiles/${id}/set-primary/`);
    return response.data;
  },
};
