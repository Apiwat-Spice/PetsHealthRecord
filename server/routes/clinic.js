const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const clinicController = require("../controllers/clinicController");

router.get("/:id", clinicController.getClinicById)
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase.from("clinics").select("*");
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลคลินิกได้", error });
    }
});

module.exports = router;