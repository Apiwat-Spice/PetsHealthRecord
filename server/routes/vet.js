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

module.exports = router;