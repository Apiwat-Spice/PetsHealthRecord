const supabase = require("../config/supabase");

const ALLOWED_STATUS = ['pending', 'confirm', 'cancel', 'completed'];

// ==========================================
// 1. รายชื่อสัตวแพทย์ที่รับผิดชอบคลินิกนี้ (เจ้าของ + สัตวแพทย์ประจำ)
//    ใช้เติม dropdown "เลือกหมอที่อยู่ในคลินิกรับผิดชอบ"
// ==========================================
exports.getClinicVets = async (req, res) => {
    try {
        const vetClinicId = req.params.vetClinicId;
        if (!vetClinicId || vetClinicId === 'undefined') return res.status(200).json({ vets: [] });

        const vetIds = new Set();

        // 1) เจ้าของสถานพยาบาล
        const { data: clinicRow } = await supabase
            .from('vet_clinic')
            .select('vet_clinic_document_id')
            .eq('vet_clinic_id', vetClinicId)
            .maybeSingle();

        if (clinicRow?.vet_clinic_document_id) {
            const { data: docRow } = await supabase
                .from('vet_clinic_document')
                .select('clinic_license_id')
                .eq('vet_clinic_document_id', clinicRow.vet_clinic_document_id)
                .maybeSingle();

            if (docRow?.clinic_license_id) {
                const { data: licenseRow } = await supabase
                    .from('clinic_license')
                    .select('vet_id')
                    .eq('clinic_license_id', docRow.clinic_license_id)
                    .maybeSingle();
                if (licenseRow?.vet_id) vetIds.add(licenseRow.vet_id);
            }
        }

        // 2) สัตวแพทย์ประจำคลินิก (staff)
        const { data: staffVets } = await supabase
            .from('clinic_vet_staff')
            .select('vet_id')
            .eq('vet_clinic_id', vetClinicId)
            .eq('status', 'active');

        (staffVets || []).forEach((s) => vetIds.add(s.vet_id));

        if (vetIds.size === 0) return res.status(200).json({ vets: [] });

        const { data: vetsData, error } = await supabase
            .from('vet')
            .select('vet_id, firstname, lastname, vet_class')
            .in('vet_id', Array.from(vetIds));

        if (error) return res.status(500).json({ message: error.message });

        return res.status(200).json({ vets: vetsData || [] });
    } catch (error) {
        console.error("Get Clinic Vets Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงรายชื่อสัตวแพทย์" });
    }
};

// ==========================================
// 2. รายการนัดหมายทั้งหมดของคลินิก พร้อมข้อมูลสัตว์เลี้ยง/เจ้าของ/หมอ/พนักงาน
// ==========================================
exports.getClinicAppointments = async (req, res) => {
    try {
        const vetClinicId = req.params.vetClinicId;
        if (!vetClinicId || vetClinicId === 'undefined') return res.status(200).json({ appointments: [] });

        const { data: appointments, error } = await supabase
            .from('appointment')
            .select('*')
            .eq('vet_clinic_id', vetClinicId)
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true });

        if (error) return res.status(500).json({ message: error.message });
        if (!appointments || appointments.length === 0) return res.status(200).json({ appointments: [] });

        const petIds = [...new Set(appointments.map((a) => a.pet_id).filter(Boolean))];
        const vetIds = [...new Set(appointments.map((a) => a.vet_id).filter(Boolean))];
        const staffIds = [...new Set(appointments.map((a) => a.clinic_staff).filter(Boolean))];

        const [petsRes, vetsRes, staffRes] = await Promise.all([
            petIds.length ? supabase.from('pets').select('pet_id, pet_name, animal_type, pet_owners_id').in('pet_id', petIds) : { data: [] },
            vetIds.length ? supabase.from('vet').select('vet_id, firstname, lastname').in('vet_id', vetIds) : { data: [] },
            staffIds.length ? supabase.from('clinic_staff').select('clinic_staff_permission_id, firstname, lastname').in('clinic_staff_permission_id', staffIds) : { data: [] },
        ]);

        const pets = petsRes.data || [];
        const vets = vetsRes.data || [];
        const staffRows = staffRes.data || [];

        const ownerIds = [...new Set(pets.map((p) => p.pet_owners_id).filter(Boolean))];
        const { data: owners } = ownerIds.length
            ? await supabase.from('pet_owners').select('pet_owners_id, firstname, lastname, phone').in('pet_owners_id', ownerIds)
            : { data: [] };

        const petMap = Object.fromEntries(pets.map((p) => [p.pet_id, p]));
        const ownerMap = Object.fromEntries((owners || []).map((o) => [o.pet_owners_id, o]));
        const vetMap = Object.fromEntries(vets.map((v) => [v.vet_id, v]));
        const staffMap = Object.fromEntries(staffRows.map((s) => [s.clinic_staff_permission_id, s]));

        const result = appointments.map((a) => {
            const pet = petMap[a.pet_id];
            const owner = pet ? ownerMap[pet.pet_owners_id] : null;
            const vet = vetMap[a.vet_id];
            const staff = staffMap[a.clinic_staff];
            return {
                ...a,
                pet_name: pet?.pet_name || 'ไม่ระบุ',
                animal_type: pet?.animal_type || '',
                owner_name: owner ? `${owner.firstname || ''} ${owner.lastname || ''}`.trim() || 'ไม่ระบุ' : 'ไม่ระบุ',
                owner_phone: owner?.phone || '',
                vet_name: vet ? `${vet.firstname} ${vet.lastname}` : null,
                staff_name: staff ? `${staff.firstname} ${staff.lastname}` : null,
            };
        });

        return res.status(200).json({ appointments: result });
    } catch (error) {
        console.error("Get Clinic Appointments Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลนัดหมาย" });
    }
};

// ==========================================
// 3. เปลี่ยนสถานะนัดหมาย (รับนัด / ปฏิเสธ / ยกเลิก / เสร็จสิ้น)
//    ส่ง vet_id มาด้วยได้เพื่อมอบหมายหมอพร้อมกันในขั้นตอนเดียว
// ==========================================
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const { status, vet_id, clinic_staff } = req.body;

        if (!ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
        }

        const updatePayload = { status };
        if (vet_id !== undefined) updatePayload.vet_id = vet_id || null;
        if (clinic_staff !== undefined) updatePayload.clinic_staff = clinic_staff || null;

        const { data, error } = await supabase
            .from('appointment')
            .update(updatePayload)
            .eq('appointment_id', appointmentId)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        if (!data) return res.status(404).json({ message: "ไม่พบนัดหมายนี้" });

        return res.status(200).json({ message: "อัปเดตสถานะนัดหมายสำเร็จ", appointment: data });
    } catch (error) {
        console.error("Update Appointment Status Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตนัดหมาย" });
    }
};

// ==========================================
// 4. เลื่อนนัดหมาย (เปลี่ยนวัน/เวลา แล้วดึงกลับไปเป็นรออนุมัติ)
// ==========================================
exports.rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const { appointment_date, appointment_time } = req.body;

        if (!appointment_date || !appointment_time) {
            return res.status(400).json({ message: "กรุณาระบุวันและเวลานัดหมายใหม่" });
        }

        const { data, error } = await supabase
            .from('appointment')
            .update({ appointment_date, appointment_time, status: 'pending' })
            .eq('appointment_id', appointmentId)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        if (!data) return res.status(404).json({ message: "ไม่พบนัดหมายนี้" });

        return res.status(200).json({ message: "เลื่อนนัดหมายสำเร็จ", appointment: data });
    } catch (error) {
        console.error("Reschedule Appointment Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเลื่อนนัดหมาย" });
    }
};

// ==========================================
// 5. มอบหมาย/เปลี่ยนสัตวแพทย์ผู้รับผิดชอบ (แบบไม่เปลี่ยนสถานะ)
// ==========================================
exports.assignAppointmentVet = async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;
        const { vet_id } = req.body;

        const { data, error } = await supabase
            .from('appointment')
            .update({ vet_id: vet_id || null })
            .eq('appointment_id', appointmentId)
            .select()
            .single();

        if (error) return res.status(500).json({ message: error.message });
        if (!data) return res.status(404).json({ message: "ไม่พบนัดหมายนี้" });

        return res.status(200).json({ message: "มอบหมายสัตวแพทย์สำเร็จ", appointment: data });
    } catch (error) {
        console.error("Assign Appointment Vet Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการมอบหมายสัตวแพทย์" });
    }
};