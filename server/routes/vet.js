const express = require('express');
const router = express.Router();
const multer = require('multer');

// ตั้งค่า Multer ให้เก็บไฟล์ไว้ใน Memory ก่อนส่งขึ้น Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

const vetController = require('../controllers/vetController'); // ชี้ไปที่ไฟล์ที่คุณสร้างฟังก์ชันเมื่อกี้

// 🟢 สร้าง Route สำหรับอัปโหลด โดยระบุชื่อฟิลด์ให้ตรงกับฝั่งแอป
router.post('/upload-vet-license',
  upload.fields([
    { name: 'vet_license_pdf', maxCount: 1 },
    { name: 'vet_id_card_pdf', maxCount: 1 }
  ]),
  vetController.uploadVetLicense
);
router.post('/create-clinic-request',
  upload.fields([
    { name: 'ss3_license_pdf', maxCount: 1 },
    { name: 'ss4_license_pdf', maxCount: 1 },
    { name: 'clinic_vet_license_pdf', maxCount: 1 } // เผื่อส่งมาด้วย
  ]),
  vetController.createClinicRequest
);
// ดึงข้อมูลสถานะการยืนยันตัวตน
router.get('/check-vet-status/:userId', vetController.checkVetStatus);
// ดึงข้อมูลสถานะคำขอคลินิก
router.get('/check-clinic-status/:vetId', vetController.checkClinicStatus);

module.exports = router;