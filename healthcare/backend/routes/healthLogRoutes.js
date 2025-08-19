import express from 'express';
import {
  createHealthLog,
  getHealthLogs,
  getHealthLogById,
  updateHealthLog,
  deleteHealthLog,
  getHealthStats
} from '../controllers/healthLogController.js';
import { protect, patient } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getHealthLogs)
  .post(protect, patient, createHealthLog);

router.get('/stats', protect, getHealthStats);

router.route('/:id')
  .get(protect, getHealthLogById)
  .put(protect, updateHealthLog)
  .delete(protect, deleteHealthLog);

export default router;