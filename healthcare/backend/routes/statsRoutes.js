import express from "express";
import { getAdminStats, getDashboardStats, getDoctorStats, getReports, getPatientStats } from "../controllers/statsController.js";


import { doctor, patient, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", getAdminStats);
router.get("/dashboard", getDashboardStats);
router.get("/doctor",protect, doctor, getDoctorStats);
router.get("/reports", getReports);
router.get("/patient", protect, patient, getPatientStats);



export default router;
