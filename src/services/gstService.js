import api from './api';

export const gstService = {
  // --- Invoices ---
  getInvoices: async (params = {}) => {
    const response = await api.get('/v1/gst/invoices/', { params });
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await api.get(`/v1/gst/invoices/${id}/`);
    return response.data;
  },

  createInvoice: async (data) => {
    const response = await api.post('/v1/gst/invoices/', data);
    return response.data;
  },

  updateInvoice: async (id, data) => {
    const response = await api.put(`/v1/gst/invoices/${id}/`, data);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await api.delete(`/v1/gst/invoices/${id}/`);
    return response.data;
  },

  getNextInvoiceNo: async (invoice_type = 'sale') => {
    const response = await api.get('/v1/gst/invoices/next-invoice-no/', {
      params: { invoice_type },
    });
    return response.data;
  },

  getInvoiceSummary: async (invoice_type = null) => {
    const params = invoice_type ? { invoice_type } : {};
    const response = await api.get('/v1/gst/invoices/summary/', { params });
    return response.data;
  },

  // --- PDF Printing ---
  printInvoice: async (id) => {
    const response = await api.get(`/v1/gst/invoices/${id}/print/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  printAllInvoices: async (params = {}) => {
    const response = await api.get('/v1/gst/invoices/print-all/', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  openPdfBlob: (blobData, filename = 'GST_Invoice.pdf') => {
    const blob = new Blob([blobData], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
  },

  // --- GST Products Master ---
  getProducts: async (params = {}) => {
    const response = await api.get('/v1/gst/products/', { params });
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post('/v1/gst/products/', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/v1/gst/products/${id}/`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/v1/gst/products/${id}/`);
    return response.data;
  },

  // --- GST Customers Master ---
  getCustomers: async (params = {}) => {
    const response = await api.get('/v1/gst/customers/', { params });
    return response.data;
  },

  createCustomer: async (data) => {
    const response = await api.post('/v1/gst/customers/', data);
    return response.data;
  },

  updateCustomer: async (id, data) => {
    const response = await api.put(`/v1/gst/customers/${id}/`, data);
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`/v1/gst/customers/${id}/`);
    return response.data;
  },

  // --- Purchase GST Suppliers Master ---
  getSuppliers: async (params = {}) => {
    const response = await api.get('/v1/gst/suppliers/', { params });
    return response.data;
  },

  createSupplier: async (data) => {
    const response = await api.post('/v1/gst/suppliers/', data);
    return response.data;
  },

  updateSupplier: async (id, data) => {
    const response = await api.put(`/v1/gst/suppliers/${id}/`, data);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await api.delete(`/v1/gst/suppliers/${id}/`);
    return response.data;
  },
};

export default gstService;
