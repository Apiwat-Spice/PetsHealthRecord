const supabase = require("../config/supabase");

// 1. สร้างการนัดหมาย (ไม่ต้องใช้ clinic_id แล้ว)
exports.bookAppointment = async (req, res) => {
    try {
        const { pet_id, appointment_date, appointment_time, type, title, detail, status } = req.body;

        const { data, error: insertError } = await supabase.from("appointments").insert([{
            pet_id: pet_id,
            appointment_date: appointment_date,
            appointment_time: appointment_time,
            type: type || 'Appointment',
            title: title || 'Health Checkup',
            detail: detail || '',
            status: status || 'pending'
        }]).select();

        if (insertError) throw insertError;

        return res.status(201).json({ message: "สร้างการนัดหมายสำเร็จ", data });
    } catch (error) {
        console.error("Booking Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
    }
};

// 2. ดึงประวัติการนัดหมายทั้งหมดของสัตว์เลี้ยง แล้วแปะชื่อคลินิกที่ล็อกไว้
exports.getHistory = async (req, res) => {
    try {
        const { ownerId } = req.params;
        if (!ownerId) return res.status(400).json({ message: "ไม่พบรหัสเจ้าของสัตว์เลี้ยง" });

        const FIXED_CLINIC_ID = 2; // รหัสคลินิกที่ต้องการล็อกชื่อ

        const { data: pets, error: petsError } = await supabase
            .from("pets")
            .select("pet_id")
            .eq("pet_owner_id", ownerId);

        if (petsError) throw petsError;
        if (!pets || pets.length === 0) return res.status(200).json([]);

        const petIds = pets.map(pet => pet.pet_id);

        // ดึงข้อมูลการนัดหมายทั้งหมดของสัตว์เลี้ยงตัวนี้ (ไม่กรอง clinic_id)
        const { data: appointments, error } = await supabase
            .from("appointments")
            .select("*, pets(pet_name, animal_type)")
            .in("pet_id", petIds)
            .order("appointment_date", { ascending: false })
            .order("appointment_time", { ascending: false });

        if (error) throw error;

        // ดึงชื่อคลินิกที่ล็อกไว้ (เช่น คลินิก ID 2) มาเตรียมแปะ
        const { data: clinicData } = await supabase
            .from("clinics")
            .select("clinic_name")
            .eq("clinic_id", FIXED_CLINIC_ID)
            .single();

        const clinicName = clinicData?.clinic_name || 'คลินิกรักษาสัตว์';

        // เติมชื่อคลินิกที่ล็อกไว้เข้าไปในทุก item ของประวัติที่ดึงมาได้
        const enrichedData = appointments.map(item => ({
            ...item,
            clinics: { clinic_name: clinicName }
        }));

        return res.status(200).json(enrichedData);
    } catch (error) {
        console.error("Get History Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงประวัติ" });
    }
};

// 3. ดึงรายละเอียดนัดหมายตาม ID พร้อมแปะชื่อคลินิกที่ล็อกไว้
exports.getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const FIXED_CLINIC_ID = 2; //รหัสคลินิกที่ล็อกไว้

        const { data: appointment, error: appError } = await supabase
            .from("appointments")
            .select(`
                *,
                pets(pet_name, animal_type),
                vets(first_name, last_name),
                clinic_staff(first_name, last_name)
            `)
            .eq("appointment_id", id)
            .single();

        if (appError) throw appError;
        if (!appointment) return res.status(404).json({ message: "ไม่พบข้อมูลการนัดหมายนี้" });

        //ดึงชื่อคลินิกที่ล็อกไว้มาใส่เพิ่ม
        const { data: clinicData } = await supabase
            .from("clinics")
            .select("clinic_name")
            .eq("clinic_id", FIXED_CLINIC_ID)
            .single();

        appointment.clinics = { clinic_name: clinicData?.clinic_name || 'คลินิกรักษาสัตว์' };

        return res.status(200).json(appointment);
    } catch (error) {
        console.error("Get Detail Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" });
    }
};
// ดึงรายการนัดหมายตามวันที่ เพื่อนำไปเช็กเวลาที่ไม่ว่าง
exports.getAppointmentsByClinicAndDate = async (req, res) => {
    try {
        const { clinicId, date } = req.params;
        const FIXED_CLINIC_ID = Number(clinicId) || 2;

        // 1. นับจำนวนสัตวแพทย์ทั้งหมดที่มีในคลินิกนี้ (หรือในระบบ)
        const { count: vetCount, error: vetError } = await supabase
            .from("vets")
            .select("*", { count: 'exact', head: true });

        if (vetError) throw vetError;
        // กำหนดจำนวนหมออย่างน้อย 1 คน (ถ้าในตาราง vets ว่างเปล่า)
        const totalVets = (vetCount && vetCount > 0) ? vetCount : 1;

        // 2. ดึงรายการนัดหมายในวันที่เลือก (เฉพาะที่สถานะ pending หรือ confirmed)
        const { data: appointments, error: apptError } = await supabase
            .from("appointments")
            .select(`
                appointment_id,
                appointment_date,
                appointment_time,
                status
            `)
            .eq("appointment_date", date)
            .in("status", ["pending", "confirmed"]);

        if (apptError) throw apptError;

        return res.status(200).json({
            totalVets,
            appointments: appointments || []
        });
    } catch (error) {
        console.error("Get Appointments By Date Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลนัดหมาย" });
    }
};
//ยกเลิกการนัดหมายโดยเจ้าของสัตว์เลี้ยง
exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_detail } = req.body;

        const { data, error } = await supabase
            .from("appointments")
            .update({
                status: 'cancelled',
                status_detail: status_detail || 'เจ้าของสัตว์เลี้ยงยกเลิกนัดหมายเอง'
            })
            .eq("appointment_id", id)
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({ message: "ยกเลิกนัดหมายสำเร็จ", data });
    } catch (error) {
        console.error("Cancel Appointment Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการยกเลิกนัดหมาย" });
    }
};