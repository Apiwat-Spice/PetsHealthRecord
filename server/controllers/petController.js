const supabase = require("../config/supabase"); // ดึงการเชื่อมต่อ Supabase มาใช้

const cloudinary = require("cloudinary").v2;
// ตั้งค่า Cloudinary ด้วยข้อมูลจาก .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getPetsByOwnerId = async (req, res) => {
    try {
        const ownerId = req.params.ownerId;

        // ค้นหาสัตว์เลี้ยงที่ pet_owner_id ตรงกับคนที่ล็อกอิน
        const { data, error } = await supabase
            .from("pets")
            .select("*")
            .eq("pet_owner_id", ownerId);

        if (error) throw error;

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง" });
    }
};

exports.getPetsByOwner = async (req, res) => {
    try {
        const { owner_id } = req.params;

        // ดึงข้อมูลสัตว์เลี้ยงจากตาราง pets ที่ตรงกับเจ้าของ
        const { data, error } = await supabase
            .from("pets")
            .select("*")
            .eq("pet_owner_id", owner_id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Fetch Pets Error:", error);
            return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลสัตว์เลี้ยงได้" });
        }

        return res.status(200).json({ pets: data });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
};

// ส่วนของแอปเจ้าของสัตว์เลี้ยง: รายละเอียด / ประวัติสุขภาพ / แก้ไขโปรไฟล์

// วันเวลาปัจจุบันตามเวลาไทย (ไม่พึ่ง timezone ของเซิร์ฟเวอร์)
const bangkokNow = () => {
    const shifted = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString();
    return { date: shifted.slice(0, 10), time: shifted.slice(11, 19) };
};

const fullName = (row) => (row ? `${row.first_name || ''} ${row.last_name || ''}`.trim() : '');

// จัดหมวดการเข้ารับบริการ: vaccine / checkup / treatment / other
const classifyVisit = (appt, visit) => {
    const type = String(appt?.type || '').toLowerCase();
    if (type.includes('vaccin')) return 'vaccine';
    if (type.includes('health') || type.includes('check')) return 'checkup';
    if (type.includes('treat')) return 'treatment';

    const text = `${appt?.title || ''} ${visit?.treatment || ''} ${visit?.diagnosis || ''}`.toLowerCase();
    if (/วัคซีน|vaccin/.test(text)) return 'vaccine';
    if (/ตรวจ|check/.test(text)) return 'checkup';
    if (/รักษา|ผ่าตัด|treat/.test(text)) return 'treatment';
    return 'other';
};

const uploadBufferToCloudinary = (buffer, folderName) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "Pet/PetProfile",
                resource_type: "image"
            },
            (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
    });

// GET /pets/detail/:petId?ownerId=123
exports.getPetDetail = async (req, res) => {
    try {
        const petId = Number(req.params.petId);
        const ownerId = Number(req.query.ownerId);
        if (!petId || !ownerId) return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });

        const { data: pet, error: petError } = await supabase
            .from("pets")
            .select("*")
            .eq("pet_id", petId)
            .eq("pet_owner_id", ownerId)
            .maybeSingle();
        if (petError) throw petError;
        if (!pet) return res.status(404).json({ message: "ไม่พบข้อมูลสัตว์เลี้ยง" });

        const { data: apptRows, error: apptError } = await supabase
            .from("appointments")
            .select("appointment_id, vet_id, appointment_date, appointment_time, type, title, detail, status")
            .eq("pet_id", petId);
        if (apptError) throw apptError;
        const appts = apptRows || [];
        const apptById = Object.fromEntries(appts.map((a) => [a.appointment_id, a]));

        const now = bangkokNow();
        const upcoming = appts
            .filter((a) =>
                ["pending", "confirmed"].includes(a.status) &&
                (a.appointment_date > now.date || (a.appointment_date === now.date && a.appointment_time >= now.time))
            )
            .sort((a, b) => `${a.appointment_date} ${a.appointment_time}`.localeCompare(`${b.appointment_date} ${b.appointment_time}`))
            .map((a) => ({
                appointment_id: a.appointment_id,
                title: a.title,
                detail: a.detail,
                status: a.status,
                appointment_date: a.appointment_date,
                appointment_time: a.appointment_time,
            }));

        let visits = [];
        if (appts.length > 0) {
            const apptIds = appts.map((a) => a.appointment_id);
            const { data: visitRows, error: visitError } = await supabase
                .from("visit_records")
                .select("visit_id, appointment_id, clinic_staff_id, visit_date, visit_time, weight, symptoms, diagnosis, treatment, note")
                .in("appointment_id", apptIds)
                .order("visit_date", { ascending: false });

            if (visitError) {
                console.error("Get Visit Records Error:", visitError);
            } else {
                visits = visitRows || [];
            }
        }

        const vetIds = [...new Set(visits.map((v) => apptById[v.appointment_id]?.vet_id).filter(Boolean))];
        let vetMap = {};
        if (vetIds.length > 0) {
            const { data: vets, error: vetError } = await supabase
                .from("vets")
                .select("vet_id, first_name, last_name")
                .in("vet_id", vetIds);
            if (!vetError && vets) {
                vetMap = Object.fromEntries(vets.map((v) => [v.vet_id, v]));
            }
        }

        const stats = { checkup: 0, vaccine: 0, treatment: 0, other: 0 };

        const history = visits.map((v) => {
            const appt = apptById[v.appointment_id];
            const category = classifyVisit(appt, v);
            stats[category] += 1;

            return {
                visit_id: v.visit_id,
                appointment_id: v.appointment_id,
                visit_date: v.visit_date,
                visit_time: v.visit_time,
                title: appt?.title || v.treatment || "เข้ารับบริการ",
                category,
                symptoms: v.symptoms,
                diagnosis: v.diagnosis,
                treatment: v.treatment,
                note: v.note,
                weight: v.weight != null ? Number(v.weight) : null,
                vet_name: fullName(vetMap[appt?.vet_id]) || null,
            };
        });

        const weightTrend = visits
            .filter((v) => v.weight !== null && v.weight !== undefined)
            .map((v) => ({ date: v.visit_date, weight: Number(v.weight) }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return res.status(200).json({
            pet,
            upcoming,
            history,
            weightTrend: weightTrend.length > 0 ? weightTrend : (pet.weight ? [{ date: pet.created_at?.slice(0, 10) || '2026-01-01', weight: Number(pet.weight) }] : []),
            stats
        });

    } catch (error) {
        console.error("Get Pet Detail Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์เลี้ยง" });
    }
};

const SEX_VALUES = ["male", "female", "unknown"];

exports.updatePet = async (req, res) => {
    try {
        const petId = Number(req.params.pet_id);
        const body = req.body || {};
        const ownerId = Number(body.pet_owner_id);
        if (!petId || !ownerId) return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });

        const { data: current, error: findError } = await supabase
            .from("pets")
            .select("pet_id, pet_image_public_id")
            .eq("pet_id", petId)
            .eq("pet_owner_id", ownerId)
            .maybeSingle();
        if (findError) throw findError;
        if (!current) return res.status(404).json({ message: "ไม่พบข้อมูลสัตว์เลี้ยง" });

        const updates = {};

        if (body.pet_name !== undefined) {
            const name = String(body.pet_name).trim();
            if (!name || name.length > 100) {
                return res.status(400).json({ message: "กรุณากรอกชื่อสัตว์เลี้ยง (ไม่เกิน 100 ตัวอักษร)" });
            }
            updates.pet_name = name;
        }

        if (body.species !== undefined) {
            const species = String(body.species).trim();
            if (species.length > 100) return res.status(400).json({ message: "พันธุ์ยาวเกินไป" });
            updates.species = species || null;
        }

        if (body.sex !== undefined) {
            if (!SEX_VALUES.includes(body.sex)) return res.status(400).json({ message: "เพศไม่ถูกต้อง" });
            updates.sex = body.sex;
        }

        if (body.birthdate !== undefined) {
            const b = String(body.birthdate).trim();
            if (b === "") {
                updates.birthdate = null;
            } else {
                const valid = /^\d{4}-\d{2}-\d{2}$/.test(b) && new Date(`${b}T00:00:00Z`).toISOString().slice(0, 10) === b;
                if (!valid) return res.status(400).json({ message: "รูปแบบวันเกิดไม่ถูกต้อง" });
                if (b > bangkokNow().date) return res.status(400).json({ message: "วันเกิดต้องไม่เป็นวันในอนาคต" });
                updates.birthdate = b;
            }
        }

        if (body.weight !== undefined) {
            const w = String(body.weight).trim();
            if (w === "") {
                updates.weight = null;
            } else {
                const n = Number(w);
                if (!Number.isFinite(n) || n < 0 || n > 9999.99) {
                    return res.status(400).json({ message: "น้ำหนักไม่ถูกต้อง" });
                }
                updates.weight = Math.round(n * 100) / 100;
            }
        }

        if (body.detail !== undefined) {
            updates.detail = String(body.detail).trim() || null;
        }

        if (body.sterilization !== undefined) {
            updates.sterilization = body.sterilization === true || body.sterilization === "true";
        }

        let uploaded = null;
        if (req.file) {
            try {
                uploaded = await uploadBufferToCloudinary(req.file.buffer, "pets");
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({ message: "อัปโหลดรูปภาพไม่สำเร็จ" });
            }
            updates.pet_image_url = uploaded.secure_url;
            updates.pet_image_public_id = uploaded.public_id;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "ไม่มีข้อมูลที่ต้องการแก้ไข" });
        }

        const { data: updated, error: updateError } = await supabase
            .from("pets")
            .update(updates)
            .eq("pet_id", petId)
            .eq("pet_owner_id", ownerId)
            .select()
            .single();

        if (updateError) {
            console.error("Update Pet Error:", updateError);
            if (uploaded) cloudinary.uploader.destroy(uploaded.public_id).catch(() => { });
            return res.status(500).json({ message: "ไม่สามารถแก้ไขข้อมูลสัตว์เลี้ยงได้" });
        }

        if (uploaded && current.pet_image_public_id) {
            try {
                await cloudinary.uploader.destroy(current.pet_image_public_id);
            } catch (e) {
                console.error("ลบรูปเก่าไม่สำเร็จ:", e);
            }
        }

        return res.status(200).json({ message: "แก้ไขข้อมูลสัตว์เลี้ยงสำเร็จ", pet: updated });
    } catch (error) {
        console.error("Update Pet Server Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const ownerId = Number(req.params.owner_id);
        if (!ownerId) return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });

        const FIXED_CLINIC_ID = 2; // รหัสคลินิกหลัก

        const { data: pets, error: petsError } = await supabase
            .from("pets")
            .select("pet_id, pet_name")
            .eq("pet_owner_id", ownerId);
        if (petsError) throw petsError;

        const petIds = pets.map(p => p.pet_id);
        const petMap = Object.fromEntries(pets.map(p => [p.pet_id, p.pet_name]));

        // ดึงชื่อคลินิกหลัก
        const { data: clinicData } = await supabase
            .from("clinics")
            .select("clinic_name")
            .eq("clinic_id", FIXED_CLINIC_ID)
            .single();
        const clinicName = clinicData?.clinic_name || 'Happy Paws Clinic';

        if (petIds.length === 0) {
            return res.status(200).json({ petCount: 0, pendingCount: 0, historyCount: 0, upcoming: null, recentHistory: null });
        }

        const { data: appts, error: apptsError } = await supabase
            .from("appointments")
            .select("*")
            .in("pet_id", petIds);
        if (apptsError) throw apptsError;

        const pendingCount = appts.filter(a => a.status === "pending").length;

        const now = new Date();
        const bangkokDate = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const bangkokTime = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(11, 19);

        const upcoming = appts
            .filter(a => ["pending", "confirmed"].includes(a.status) &&
                (a.appointment_date > bangkokDate || (a.appointment_date === bangkokDate && a.appointment_time >= bangkokTime)))
            .sort((a, b) => `${a.appointment_date} ${a.appointment_time}`.localeCompare(`${b.appointment_date} ${b.appointment_time}`))[0];

        const apptIds = appts.map(a => a.appointment_id);
        let recentHistory = null;
        let historyCount = 0;

        if (apptIds.length > 0) {
            const { data: visits, error: visitError } = await supabase
                .from("visit_records")
                .select("*, appointments(pet_id, title, vet_id)")
                .in("appointment_id", apptIds)
                .order("visit_date", { ascending: false })
                .order("visit_time", { ascending: false });

            if (!visitError && visits && visits.length > 0) {
                historyCount = visits.length;
                const latestVisit = visits[0];
                const appt = appts.find(a => a.appointment_id === latestVisit.appointment_id);

                let vetName = null;
                if (appt?.vet_id) {
                    const { data: vetData } = await supabase
                        .from("vets")
                        .select("first_name, last_name")
                        .eq("vet_id", appt.vet_id)
                        .maybeSingle();
                    if (vetData) {
                        vetName = `น.สพ. ${vetData.first_name} ${vetData.last_name || ''}`.trim();
                    }
                }

                recentHistory = {
                    ...latestVisit,
                    pet_name: petMap[appt?.pet_id],
                    vet_name: vetName || 'ไม่ระบุสัตวแพทย์',
                    clinic_name: clinicName
                };
            }
        }

        return res.status(200).json({
            petCount: pets.length,
            pendingCount,
            historyCount,
            upcoming: upcoming ? { ...upcoming, pet_name: petMap[upcoming.pet_id], clinic_name: clinicName } : null,
            recentHistory
        });

    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด" });
    }
};

exports.resetQrCode = async (req, res) => {
    try {
        const petId = Number(req.params.pet_id);
        if (!petId) return res.status(400).json({ message: "ไม่พบรหัสสัตว์เลี้ยง" });

        const newQrCode = `PET-${petId}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const { data, error } = await supabase
            .from("pets")
            .update({ qr_code: newQrCode })
            .eq("pet_id", petId)
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({
            message: "รีเซ็ต QR Code สำเร็จ",
            qr_code: newQrCode,
            pet: data
        });
    } catch (error) {
        console.error("Reset QR Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการรีเซ็ต QR Code" });
    }
};