const supabase = require("../config/supabase");

exports.getClinicById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("clinics")
      .select("*")
      .eq("clinic_id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "ไม่พบข้อมูลคลินิก" });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Get Clinic By ID Error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};