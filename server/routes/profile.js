const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.get("/petowner/:id", profileController.getProfile);
router.put("/petowner/:id", profileController.updateProfile);

module.exports = router;