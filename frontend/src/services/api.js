import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (params) => api.get("/products/search", { params }),
  create: (data) => api.post("/products", data),
  createBatch: (data) => api.post("/products/batch", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get("/suppliers"),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Purchase Invoices API
export const purchaseInvoicesAPI = {
  getAll: (params) => api.get("/purchase-invoices", { params }),
  getById: (id) => api.get(`/purchase-invoices/${id}`),
  create: (data) => api.post("/purchase-invoices", data),
  delete: (id) => api.delete(`/purchase-invoices/${id}`),
  getNextInvoiceNumber: () => api.get("/purchase-invoices/next-number"),
};

// Sales Invoices API
export const salesInvoicesAPI = {
  getAll: (params) => api.get("/sales-invoices", { params }),
  getById: (id) => api.get(`/sales-invoices/${id}`),
  create: (data) => api.post("/sales-invoices", data),
  getNextInvoiceNumber: () => api.get("/sales-invoices/next-number"),
};

// Return / Exchange API
export const returnExchangesAPI = {
  getAll: (params) => api.get("/return-exchanges", { params }),
  getById: (id) => api.get(`/return-exchanges/${id}`),
  create: (data) => api.post("/return-exchanges", data),
};

// Reports API
export const reportsAPI = {
  getDaily: (date) => api.get("/reports/daily", { params: { date } }),
  getDailyDetail: (date) =>
    api.get("/reports/daily/detail", { params: { date } }),
  getWeekly: (year, week) =>
    api.get("/reports/weekly", { params: { year, week } }),
  getMonthly: (year, month) =>
    api.get("/reports/monthly", { params: { year, month } }),
  getYearly: (year) => api.get("/reports/yearly", { params: { year } }),
  getByDateRange: (start_date, end_date) =>
    api.get("/reports/range", { params: { start_date, end_date } }),
};

export default api;
