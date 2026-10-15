const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/check-email", authController.checkEmail); // เช็กว่ามีเมลไหม และมีรหัสผ่านหรือยัง
router.post("/request-otp", authController.requestOTP); // ขอ OTP
router.post("/verify-otp", authController.verifyOTP); // ยืนยัน OTP
router.post("/create-password", authController.createPassword); // ตั้งรหัสผ่านใหม่ (ล็อกอินให้อัตโนมัติ)
router.post("/login", authController.loginWithPassword); // ล็อกอินด้วยรหัสผ่านปกติ
router.post("/change-password", authController.changePassword);

module.exports = router;