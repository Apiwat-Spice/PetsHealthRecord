const supabase = require("../config/supabase");

/**
 * ดึงประวัติการรักษารวมทั้งหมดของเจ้าของสัตว์เลี้ยง (เรียงจากล่าสุดไปเก่าสุด)
 */
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
          ),
          vets (
            first_name,
            last_name
          )
        ),
        clinic_staff (
          first_name,
          last_name
        )
      `)
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
      // ชื่อสัตวแพทย์ผู้ตรวจ (แสดงชื่อ-นามสกุลตรงๆ ไม่ใส่คำนำหน้าระบุเพศ)
      vet_name: item.appointments?.vets
        ? `${item.appointments.vets.first_name} ${item.appointments.vets.last_name || ''}`.trim()
        : 'ไม่ระบุสัตวแพทย์',
      // ชื่อเจ้าหน้าที่ผู้บันทึกข้อมูล
      staff_name: item.clinic_staff
        ? `${item.clinic_staff.first_name} ${item.clinic_staff.last_name || ''}`.trim()
        : 'เจ้าหน้าที่คลินิก'
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Get All Visit History Error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};

/**
 * ดึงรายละเอียดประวัติการรักษาตาม visit_id (รวมข้อมูลจาก visit_records, appointments, vets และ clinic_staff)
 */
exports.getVisitDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("visit_records")
      .select(`
        *,
        appointments (
          appointment_id,
          title,
          type,
          appointment_date,
          appointment_time,
          vets (
            first_name,
            last_name,
            profile_image_url
          )
        ),
        clinic_staff (
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq("visit_id", id)
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(400).json({ message: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "ไม่พบข้อมูลประวัติการรักษา" });
    }

    const formattedData = {
      visit_id: data.visit_id,
      visit_date: data.visit_date,
      visit_time: data.visit_time,
      weight: data.weight,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      note: data.note,
      title: data.appointments?.title,
      type: data.appointments?.type,
      vet_name: data.appointments?.vets
        ? `${data.appointments.vets.first_name} ${data.appointments.vets.last_name || ''}`.trim()
        : null,
      vet_image_url: data.appointments?.vets?.profile_image_url || null,
      staff_name: data.clinic_staff
        ? `${data.clinic_staff.first_name} ${data.clinic_staff.last_name || ''}`.trim()
        : null,
      staff_image_url: data.clinic_staff?.profile_image_url || null
    };

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Get Visit Detail Error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
  }
};