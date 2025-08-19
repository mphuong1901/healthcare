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
  rejectDoctor,

} from '../controllers/userController.js';
import { protect, admin, doctorOrAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.get('/doctors', getDoctors);
router.get('/patients', protect, doctorOrAdmin, getPatients);

router.get("/pending-doctors", getPendingDoctors);
router.put("/:id/reject", rejectDoctor);
router.put("/:id/approve", approveDoctor);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);


export default router;