const express = require("express");
const router = express.Router();
const visitController = require("../controllers/visitController"); // ปรับ path ตามโครงสร้างของคุณ

// Endpoint: GET /api/visit-records/owner/:ownerId
router.get("/owner/:ownerId", visitController.getVisitHistoryByOwnerId);

module.exports = router;