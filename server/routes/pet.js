// ไฟล์: server/routes/pet.js
const express = require("express");
const router = express.Router();

const petController = require("../controllers/petController");

// สร้าง API Endpoint (เมื่อยิง POST มาที่ /pets จะเรียกใช้ฟังก์ชัน addPet)
router.post("/add", petController.addPet);
router.get("/:owner_id", petController.getPetsByOwner); 
router.delete("/:pet_id", petController.deletePet);

module.exports = router;