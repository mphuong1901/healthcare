import express from 'express';
import {
  createQuestion,
  getDoctorQuestions,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  answerQuestion
} from '../controllers/questionController.js';
import { protect, doctor, patient } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route gốc cho bệnh nhân tạo câu hỏi và public xem danh sách câu hỏi
router.route('/')
  .get(getQuestions)                       // Public: xem danh sách câu hỏi
  .post(protect, patient, createQuestion); // Bệnh nhân tạo câu hỏi

// Route dành cho bác sĩ xem danh sách câu hỏi
router.get('/doctor', protect, doctor, getDoctorQuestions);

// Routes theo ID câu hỏi
router.route('/:id')
  .get(getQuestionById)                   // Public: xem chi tiết câu hỏi
  .put(protect, updateQuestion)           // Bệnh nhân (hoặc admin) cập nhật câu hỏi
  .delete(protect, deleteQuestion);       // Bệnh nhân (hoặc admin) xóa câu hỏi

// Route trả lời câu hỏi (chỉ bác sĩ)
router.put('/:id/answer', protect, doctor, answerQuestion);

export default router;
