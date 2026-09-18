const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');

// รายชื่อสัตวแพทย์ที่รับผิดชอบคลินิก (สำหรับ dropdown มอบหมายหมอ)
router.get('/clinic-vets/:vetClinicId', appointmentController.getClinicVets);

// รายการนัดหมายทั้งหมดของคลินิก
router.get('/clinic-appointments/:vetClinicId', appointmentController.getClinicAppointments);

// เปลี่ยนสถานะนัดหมาย (รับนัด / ปฏิเสธ / ยกเลิก / เสร็จสิ้น) — มอบหมายหมอพร้อมกันได้
router.patch('/appointment/:appointmentId/status', appointmentController.updateAppointmentStatus);

// เลื่อนนัดหมาย (เปลี่ยนวันเวลา)
router.patch('/appointment/:appointmentId/reschedule', appointmentController.rescheduleAppointment);

// มอบหมาย/เปลี่ยนสัตวแพทย์ผู้รับผิดชอบ โดยไม่เปลี่ยนสถานะ
router.patch('/appointment/:appointmentId/assign-vet', appointmentController.assignAppointmentVet);

module.exports = router;
