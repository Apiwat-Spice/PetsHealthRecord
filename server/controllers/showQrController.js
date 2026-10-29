const supabase = require("../config/supabase");

/**
 * ดึงการตั้งค่าการแสดงผลข้อมูลบน QR Code ของสัตว์เลี้ยง (สร้างค่าเริ่มต้นหากยังไม่มี)
 */
exports.getShowQrSettings = async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        if (!petId) return res.status(400).json({ message: "ไม่พบรหัสสัตว์เลี้ยง" });

        let { data, error } = await supabase
            .from("ShowQr")
            .select("*")
            .eq("pet_id", petId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const { data: newRow, error: insertError } = await supabase
                .from("ShowQr")
                .insert([{ pet_id: petId }])
                .select()
                .single();

            if (insertError) throw insertError;
            return res.status(200).json(newRow);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Get ShowQr Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
    }
};

/**
 * อัปเดตสถานะการแสดง/ซ่อนข้อมูลบน QR Code ของสัตว์เลี้ยง
 */
exports.updateShowQrSettings = async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const updateFields = req.body;

        if (!petId) return res.status(400).json({ message: "ไม่พบรหัสสัตว์เลี้ยง" });

        const { data, error } = await supabase
            .from("ShowQr")
            .update(updateFields)
            .eq("pet_id", petId)
            .select()
            .single();

        if (error) {
            console.error("Supabase Update ShowQr Error:", error);
            return res.status(500).json({ message: "ไม่สามารถบันทึกการตั้งค่าได้", error: error.message });
        }

        return res.status(200).json({ message: "บันทึกการตั้งค่าสำเร็จ", data });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
    }
};