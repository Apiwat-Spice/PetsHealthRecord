const express = require('express');
const router = express.Router();
const multer = require('multer');

// ตั้งค่า Multer ให้เก็บไฟล์ไว้ใน Memory ก่อนส่งขึ้น Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

const vetController = require('../controllers/vetController'); // ชี้ไปที่ไฟล์ที่คุณสร้างฟังก์ชันเมื่อกี้

//  สร้าง Route สำหรับอัปโหลดใบประกอบวิชาชีพ
router.post('/upload-vet-license',
  upload.fields([
    { name: 'vet_license_pdf', maxCount: 1 },
    { name: 'vet_id_card_pdf', maxCount: 1 }
  ]),
  vetController.uploadVetLicense
);

router.post('/upload-vet-profile',
  upload.fields([
    { name: 'profile_image', maxCount: 1 }
  ]),
  vetController.uploadVetProfile
);

//  สร้าง Route สำหรับคำขอเปิดสถานพยาบาล
router.post('/create-clinic-request',
  upload.fields([
    { name: 'ss3_license_pdf', maxCount: 1 },
    { name: 'ss4_license_pdf', maxCount: 1 },
    { name: 'clinic_vet_license_pdf', maxCount: 1 } // เผื่อส่งมาด้วย
  ]),
  vetController.createClinicRequest
);

//  สร้าง Route สำหรับอัปโหลดโลโก้สถานพยาบาล (เพิ่มใหม่ตรงนี้ครับ!)
router.post('/upload-clinic-logo',
  upload.fields([
    { name: 'clinic_logo', maxCount: 1 }
  ]),
  vetController.uploadClinicLogo
);

// ดึงข้อมูลสถานะการยืนยันตัวตน
router.get('/check-vet-status/:userId', vetController.checkVetStatus);
// ดึงข้อมูลสถานะคำขอคลินิก
router.get('/check-clinic-status/:vetId', vetController.checkClinicStatus);

// ==== จัดการพนักงานคลินิก (Receptionist / Cashier) =====
// สร้างบัญชีพนักงานใหม่
router.post('/create-clinic-staff', vetController.createClinicStaff);
// ดึงรายชื่อพนักงานของคลินิก
router.get('/clinic-staff/:vetClinicId', vetController.getClinicStaff);
// ลบ/ปิดใช้งาน หรือเปิดใช้งานพนักงานอีกครั้ง
router.patch('/clinic-staff/:staffId/status', vetController.updateClinicStaffStatus);

module.exports = router;
