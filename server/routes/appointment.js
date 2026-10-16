const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

router.post("/", appointmentController.bookAppointment);
router.get("/history/:ownerId", appointmentController.getHistory);
router.get("/:id", appointmentController.getAppointmentById);
router.get("/clinic/:clinicId/date/:date", appointmentController.getAppointmentsByClinicAndDate);
router.put("/cancel/:id", appointmentController.cancelAppointment);

module.exports = router;