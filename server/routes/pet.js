// ไฟล์: server/routes/pet.js
const express = require("express");
const multer = require("multer");
const router = express.Router();

const petController = require("../controllers/petController");
const showQrController = require("../controllers/showQrController"); // นำเข้า ShowQr Controller

// รับไฟล์รูปไว้ใน memory (ไม่เกิน 5MB เฉพาะไฟล์รูป) แล้วส่งต่อขึ้น Cloudinary ใน controller
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("ไฟล์ต้องเป็นรูปภาพเท่านั้น"));
    },
});

// ครอบ multer เพื่อให้ error (เช่น ไฟล์ใหญ่เกิน) ตอบเป็น JSON แทนหน้า HTML ของ Express
const handleImageUpload = (req, res, next) => {
    upload.single("pet_image")(req, res, (err) => {
        if (err) {
            const message = err.code === "LIMIT_FILE_SIZE" ? "ไฟล์รูปต้องมีขนาดไม่เกิน 5MB" : err.message;
            return res.status(400).json({ message });
        }
        next();
    });
};

// Routes ที่มี Prefix เฉพาะ
router.get("/detail/:petId", petController.getPetDetail);
router.get("/owner/:ownerId", petController.getPetsByOwnerId);
router.get("/dashboard/:owner_id", petController.getDashboardSummary);

// Routes สำหรับจัดการสถานะเปิด/ปิดข้อมูล QR Code (ShowQr)
router.get("/showqr/:petId", showQrController.getShowQrSettings);
router.put("/showqr/:petId", showQrController.updateShowQrSettings);

// Routes ที่รับ Parameter ทั่วไป
router.get("/:owner_id", petController.getPetsByOwner);

// เจ้าของแก้ไขโปรไฟล์สัตว์เลี้ยง
router.put("/:pet_id", handleImageUpload, petController.updatePet);

router.put("/:pet_id/reset-qr", petController.resetQrCode);


module.exports = router;