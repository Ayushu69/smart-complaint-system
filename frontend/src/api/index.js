import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally - log out user
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Complaint endpoints
export const addComplaint = (data) => API.post("/complaints", data);
export const getAllComplaints = (params) => API.get("/complaints", { params });
export const getComplaintById = (id) => API.get(`/complaints/${id}`);
export const updateComplaintStatus = (id, status) => API.put(`/complaints/${id}`, { status });
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const searchByLocation = (location) =>
  API.get("/complaints/search", { params: { location } });

// AI endpoints
export const analyzeComplaint = (complaintId) =>
  API.post("/ai/analyze", { complaintId });

export default API;
