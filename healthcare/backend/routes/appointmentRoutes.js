import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getDoctorSchedule,
  getAppointmentStats
} from '../controllers/appointmentController.js';
import { protect, doctor, patient } from '../middleware/authMiddleware.js';

const router = express.Router();

// Lấy tất cả lịch hẹn hoặc tạo lịch hẹn mới
router.route('/')
  .get(protect, getAllAppointments)                 // Ai login cũng xem được (có thể filter theo role trong controller)
  .post(protect, patient, createAppointment);   // Chỉ bệnh nhân tạo được lịch hẹn

// Thống kê và lịch làm việc bác sĩ
router.get('/stats', protect, doctor, getAppointmentStats);          // Chỉ bác sĩ xem thống kê
router.get('/doctor/schedule', protect, doctor, getDoctorSchedule);  // Chỉ bác sĩ xem lịch của mình

// Lịch hẹn cụ thể theo ID
router.route('/:id')
  .get(protect, getAppointmentById)   // Ai liên quan (bác sĩ/bệnh nhân) thì mới xem được -> kiểm tra trong controller
  .put(protect, updateAppointment)    // Chỉ chủ sở hữu (bệnh nhân hoặc bác sĩ liên quan) mới update -> check trong controller
  .delete(protect, deleteAppointment); // Chỉ bệnh nhân tạo hoặc admin mới xóa -> check trong controller

// Update trạng thái (chỉ bác sĩ được phép)
router.put('/:id/status', protect, doctor, updateAppointmentStatus);

export default router;
