const supabase = require("../config/supabase"); // ปรับ path ตามไฟล์เชื่อมต่อ Supabase ของคุณ

// ดึงประวัติการรักษารวมทั้งหมดของเจ้าของสัตว์เลี้ยง (เรียงจากล่าสุดไปเก่าสุด)
exports.getVisitHistoryByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const { data, error } = await supabase
      .from("visit_records")
      .select(`
        visit_id,
        visit_date,
        visit_time,
        diagnosis,
        treatment,
        symptoms,
        note,
        appointments!inner (
          appointment_id,
          title,
          type,
          pets!inner (
            pet_id,
            pet_name,
            pet_owner_id
          )
        ),
        clinic_staff (
          first_name,
          last_name
        )
      `)
      // 🟢 ตรวจสอบตรงนี้: หากในตาราง pets ของคุณใช้ชื่อ pet_owner_id ให้เปลี่ยนตรงนี้ให้ตรงกัน
      .eq("appointments.pets.pet_owner_id", ownerId) 
      .order("visit_date", { ascending: false })
      .order("visit_time", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(400).json({ message: error.message });
    }

    const formattedData = data.map((item) => ({
      visit_id: item.visit_id,
      pet_id: item.appointments?.pets?.pet_id,
      pet_name: item.appointments?.pets?.pet_name,
      visit_date: item.visit_date,
      visit_time: item.visit_time,
      diagnosis: item.diagnosis,
      treatment: item.treatment,
      symptoms: item.symptoms,
      note: item.note,
      vet_name: item.clinic_staff 
        ? `น.สพ. ${item.clinic_staff.first_name} ${item.clinic_staff.last_name || ''}` 
        : 'คลินิกรักษาสัตว์'
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Get All Visit History Error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};