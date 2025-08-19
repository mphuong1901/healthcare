import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDoctors,
  getPatients,
  getPendingDoctors,
  approveDoctor,

} from '../controllers/userController.js';
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.get('/doctors', getDoctors);
router.get('/patients', protect, doctorOrAdmin, getPatients);

router.get("/pending-doctors", getPendingDoctors);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);
router.put("/:id/approve", approveDoctor);

export default router;