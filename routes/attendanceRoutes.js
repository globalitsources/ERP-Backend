import express from "express";
import { getAllAttendance, getStatus, markTimeIn, markTimeOut } from "../controllers/attendanceController.js";
const router = express.Router();

// Define routes
router.get("/status/:userId", getStatus);
router.post("/time-in", markTimeIn);
router.post("/time-out", markTimeOut);
router.get("/allAttendance",getAllAttendance)

export default router;
