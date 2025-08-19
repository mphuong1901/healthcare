import express from 'express';
import {
  createAdvice,
  getAdvice,
  getAdviceById,
  updateAdvice,
  deleteAdvice,
  getAdviceByCategory,
  getDoctorAdvice
} from '../controllers/adviceController.js';
import { protect, doctor, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAdvice)
  .post(protect, doctor, createAdvice);
router.get('/doctor', protect, doctor, getDoctorAdvice);
router.get('/category/:category', getAdviceByCategory);

router.route('/:id')
  .get(protect,getAdviceById)
  .put(protect, doctor, updateAdvice)
  .delete(protect, admin, deleteAdvice);

export default router;