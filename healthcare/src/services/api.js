// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// --------- Khởi tạo axios instance ----------
const api = axios.create({
  baseURL: API_BASE_URL,
});

// --------- Interceptor: tự động gắn token ----------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------- Điều hướng sau login/logout ----------
let navigate;
export const setNavigateFunction = (navFunc) => {
  navigate = navFunc;
};

// --------- Auth API ----------
const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  profile: () => api.get("/auth/profile"),
  logout: () => api.post("/auth/logout"),
};

// --------- User API ----------
const userAPI = {
  getUsers: () => api.get("/users"),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  getPatients: (params = {}) => api.get("/users/patients", { params }),
  getDoctors: () => api.get("/users/doctors"),

  getAllUsers: (search = "", role = "", page = 1, limit = 10) =>
    api.get(`/users?search=${search}&role=${role}&page=${page}&limit=${limit}`),
  getPendingDoctors: () => api.get("/users/pending-doctors"),
  approveDoctor: (id) => api.put(`/users/${id}/approve`),
};

// --------- Patient API ----------
export const patientAPI = {
  getAll: () => api.get("/patients"),
  delete: (id) => api.delete(`/patients/${id}`),
  sendAdvice: (id, data) => api.post(`/patients/${id}/advice`, data),
};

// --------- Doctor API ----------
export const doctorAPI = {
  sendAdvice: (patientId, data) => api.post(`/doctors/${patientId}/advice`, data),
  getQuestions: () => api.get("/doctors/questions"),
};

// --------- Health Log API ----------
const healthLogAPI = {
  createLog: (data) => api.post("/healthLogs", data),
  getLogs: () => api.get("/healthLogs"),
  getLogById: (id) => api.get(`/healthLogs/${id}`),
  updateLog: (id, data) => api.put(`/healthLogs/${id}`, data),
  deleteLog: (id) => api.delete(`/healthLogs/${id}`),
};

// --------- Question API ----------
const questionAPI = {
  createQuestion: (data) => api.post("/questions", data),
  getQuestions: () => api.get("/questions"),
  getQuestionsByPatientId: (id) => api.get(`/questions/patient/${id}`),
  getQuestionById: (id) => api.get(`/questions/${id}`),
  answerQuestion: (id, data) => api.put(`/questions/${id}/answer`, data),
  getDoctorQuestions: (status = "", search = "", page = 1, limit = 5) =>
    api.get(
      `/questions/doctor?status=${status}&search=${search}&page=${page}&limit=${limit}`
    ),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
};

// --------- Advice API ----------
const adviceAPI = {
  createAdvice: (data) => api.post("/advice", data),
  getDoctorAdvice: (page = 1, limit = 10) =>
    api.get(`/advice/doctor?page=${page}&limit=${limit}`),
  getPatientAdvice: (page = 1, limit = 10) =>
    api.get(`/advice/patient?page=${page}&limit=${limit}`),
  getAdvices: () => api.get("/advice"),
  getAdviceById: (id) => api.get(`/advice/${id}`),
};

// --------- Stats API ----------
const statsAPI = {
  getDashboardStats: () => api.get("/stats/dashboard"),
  getDoctorStats: () => api.get("/stats/doctor"),
  getPatientStats: () => api.get("/stats/patient"),
  getAdminStats: () => api.get("/stats/admin"),
  getReports: (params = {}) => api.get("/stats/reports", { params }),
};

// --------- Appointment API ----------
const appointmentAPI = {
  getAppointments: (filter, page = 1, limit = 10) =>
    api.get(`/appointments?filter=${filter}&page=${page}&limit=${limit}`),
  getAppointmentsByPatientId: (id) => api.get(`/appointments/patient/${id}`),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post("/appointments", data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),

  updateAppointmentStatus: (id, status) =>
    api.put(`/appointments/${id}/status`, { status }),

  getDoctorSchedule: () => api.get("/appointments/doctor/schedule"),
  getAppointmentStats: () => api.get("/appointments/stats"),
};

// --------- Export ----------
export {
  api,
  authAPI,
  userAPI,
  healthLogAPI,
  questionAPI,
  adviceAPI,
  statsAPI,
  appointmentAPI,
};
