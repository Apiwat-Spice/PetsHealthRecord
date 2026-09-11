const supabase = require("../config/supabase");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// 1. ฟังก์ชันสำหรับอัปโหลดเอกสารยืนยันตัวตนแพทย์
// ==========================================
exports.uploadVetLicense = async (req, res) => {
    try {
        // เพิ่มรับค่าตัวแปรวันหมดอายุและ vet_class จาก Frontend
        const { vet_id, vet_license_expired, vet_id_card_expired, vet_class } = req.body;
        const files = req.files;

        console.log("==== 📥 [API] ได้รับคำขอส่งเอกสาร ====");
        console.log("📝 vet_id ที่แอปส่งมาคือ:", vet_id);
        console.log("📅 วันหมดอายุใบประกอบฯ:", vet_license_expired);
        console.log("📅 วันหมดอายุบัตรประจำตัว:", vet_id_card_expired);
        console.log("🎓 ระดับชั้นของสัตวแพทย์:", vet_class);

        if (!files || !files.vet_license_pdf || !files.vet_id_card_pdf) {
            return res.status(400).json({ message: "กรุณาอัปโหลดเอกสารให้ครบทั้ง 2 ไฟล์" });
        }

        const uploadToCloudinary = (fileBuffer, folder) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image", // 🟢 1. บังคับให้มองเป็นรูปภาพ
                        folder: folder,
                        format: "jpg" // 🟢 2. แปลงไฟล์ทุกชนิด (รวมถึง PDF) ให้กลายเป็น JPG ทันที
                    },
                    (error, result) => {
                        if (error) reject(error); else resolve(result);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        // เก็บใบประกอบวิชาชีพลงโฟลเดอร์ vet_licenes
        const licenseResult = await uploadToCloudinary(files.vet_license_pdf[0].buffer, "vet_documents/vet_licenes");

        // เก็บบัตรประจำตัวลงโฟลเดอร์ vet_id
        const idCardResult = await uploadToCloudinary(files.vet_id_card_pdf[0].buffer, "vet_documents/vet_id");

        console.log("✅ อัปโหลด Cloudinary สำเร็จ");

        // 🟢 1. ทำการอัปเดตข้อมูล vet_class ลงในตาราง vet
        if (vet_class) {
            const { error: vetUpdateError } = await supabase
                .from('vet')
                .update({ vet_class: parseInt(vet_class) }) // แปลงเป็นตัวเลข (smallint)
                .eq('vet_id', vet_id);

            if (vetUpdateError) {
                console.error("❌ Error Update ตาราง vet:", vetUpdateError);
                throw vetUpdateError;
            }
            console.log("✅ อัปเดต vet_class ลงตาราง vet สำเร็จ");
        }

        // 🟢 2. บันทึกข้อมูลเอกสารลงตาราง vet_license (ใช้ upsert และใส่ฟิลด์วันหมดอายุลงไป)
        const { data: licenseData, error: licenseError } = await supabase
            .from('vet_license')
            .upsert({
                vet_id: vet_id,
                vet_license_pdf_url: licenseResult.secure_url,
                vet_license_pdf_public_id: licenseResult.public_id,
                vet_license_expired: vet_license_expired || null, // บันทึกวันหมดอายุ
                vet_id_card_pdf_url: idCardResult.secure_url,
                vet_id_card_pdf_public_id: idCardResult.public_id,
                vet_id_card_expired: vet_id_card_expired || null // บันทึกวันหมดอายุ
            }, { onConflict: 'vet_id' })
            .select('*')
            .single();

        if (licenseError) {
            console.error("❌ Error ตาราง vet_license:", licenseError);
            throw licenseError;
        }

        console.log("✅ บันทึกลง vet_license สำเร็จ ได้ ID:", licenseData.vet_license_id);

        // 🟢 3. บันทึกข้อมูลลงตาราง vet_license_document
        const { data: docData, error: documentError } = await supabase
            .from('vet_license_document')
            .insert({
                vet_license_id: licenseData.vet_license_id,
                status: 'pending'
            })
            .select('*');

        if (documentError) {
            console.error("❌ Error ตาราง vet_license_document:", documentError);
            throw documentError;
        }

        console.log("✅ บันทึกลง vet_license_document สำเร็จ ข้อมูลเข้าครบสมบูรณ์!");
        return res.status(200).json({ message: "ส่งเอกสารยืนยันตัวตนสำเร็จ!" });

    } catch (error) {
        console.error("🚨 สรุป Error ทั้งหมด:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร" });
    }
};

// ==========================================
// 2. ฟังก์ชันเช็กสถานะการยืนยันตัวตนของสัตวแพทย์
// ==========================================
exports.checkVetStatus = async (req, res) => {
    try {
        const vetId = req.params.vetId || req.params.userId;

        if (!vetId || vetId === 'undefined') {
            return res.status(200).json({ status: 'unsubmitted' });
        }

        // 1. ดึงข้อมูลเอกสารทั้งหมด (URL, วันที่) จาก vet_license
        const { data: licenseData, error: licenseError } = await supabase
            .from('vet_license')
            .select('*')
            .eq('vet_id', vetId)
            .order('created_at', { ascending: false });

        if (!licenseData || licenseData.length === 0) {
            return res.status(200).json({ status: 'unsubmitted' });
        }

        const latestLicense = licenseData[0]; // เอาใบเอกสารล่าสุด

        // 2. 🟢 ดึงสถานะและหมายเหตุจาก vet_license_document (ดึงเฉพาะอันที่ใหม่ที่สุด)
        const { data: docData, error: docError } = await supabase
            .from('vet_license_document')
            .select('status, detail')
            .eq('vet_license_id', latestLicense.vet_license_id)
            .order('created_at', { ascending: false }) // 👈 เรียงตามเวลาที่สร้างล่าสุด
            .limit(1); // 👈 ดึงมาแค่อันเดียว ป้องกัน Error หาเจอหลายแถว

        if (docError) {
            console.error("❌ Error querying document:", docError);
        }

        // 3. ดึงระดับชั้นสัตวแพทย์จากตาราง vet
        const { data: vetData } = await supabase
            .from('vet')
            .select('vet_class')
            .eq('vet_id', vetId)
            .single();

        // 🟢 เปลี่ยนวิธีเช็ก docData จาก Object เป็น Array
        if (docData && docData.length > 0) {
            const latestDoc = docData[0]; // เลือกข้อมูลแถวแรก (ที่ใหม่ที่สุด)
            return res.status(200).json({
                status: latestDoc.status,
                detail: latestDoc.detail,
                submittedDocs: {
                    ...latestLicense,
                    vet_class: vetData?.vet_class
                }
            });
        } else {
            return res.status(200).json({ status: 'unsubmitted' });
        }

    } catch (error) {
        console.error("Check Vet Status Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะ" });
    }
};

// ==========================================
// 3. ฟังก์ชันสำหรับสร้างคำขอเปิดสถานพยาบาล
// ==========================================
exports.createClinicRequest = async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;

        if (!files || !files.ss3_license_pdf || !files.ss4_license_pdf) {
            return res.status(400).json({ message: "กรุณาแนบไฟล์เอกสาร SS3 และ SS4 ให้ครบถ้วน" });
        }

        const uploadToCloudinary = (fileBuffer, folder) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto", folder: folder },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        console.log("1. กำลังอัปโหลดเอกสารคลินิกขึ้น Cloud...");
        const ss3Result = await uploadToCloudinary(files.ss3_license_pdf[0].buffer, "clinic_documents/ss.3");
        const ss4Result = await uploadToCloudinary(files.ss4_license_pdf[0].buffer, "clinic_documents/ss.4");

        console.log("2. กำลังบันทึกข้อมูลลงฐานข้อมูล 3 ตาราง...");

        const { data: clinicLicenseData, error: clinicLicenseError } = await supabase
            .from('clinic_license')
            .upsert({
                vet_id: data.vet_id,
                ss3_license_url: ss3Result.secure_url,
                ss3_license_public_id: ss3Result.public_id,
                ss4_license_url: ss4Result.secure_url,
                ss4_license_public_id: ss4Result.public_id
            }, { onConflict: 'vet_id' })
            .select('clinic_license_id')
            .single();

        if (clinicLicenseError) {
            console.error("Clinic License Upsert Error:", clinicLicenseError);
            throw clinicLicenseError;
        }

        const { data: addressData, error: addressError } = await supabase
            .from('vetclinic_address')
            .insert({
                address_line: data.addressLine,
                subdistrict: data.subdistrict,
                district: data.district,
                province: data.province,
                postal_code: data.postalCode,
                latitude: data.latitude ? parseFloat(data.latitude) : null,
                longitude: data.longitude ? parseFloat(data.longitude) : null,
                google_map_url: data.googleMapUrl
            })
            .select('vetclinic_address_id')
            .single();

        if (addressError) {
            console.error("Address Insert Error:", addressError);
            throw addressError;
        }

        const { error: documentError } = await supabase
            .from('vet_clinic_document')
            .insert({
                clinic_license_id: clinicLicenseData.clinic_license_id,
                vetclinic_address_id: addressData.vetclinic_address_id,
                status: 'pending'
            });

        if (documentError) {
            console.error("Vet Clinic Document Insert Error:", documentError);
            throw documentError;
        }

        console.log("✅ ส่งคำขอคลินิกและบันทึกลง Document สำเร็จ!");
        return res.status(200).json({ message: "ส่งคำขอสร้างสถานพยาบาลเรียบร้อยแล้ว!" });

    } catch (error) {
        console.error("Create Clinic Request Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างสถานพยาบาล" });
    }
};

// ==========================================
// 4. ฟังก์ชันเช็กสถานะคำขอสร้างสถานพยาบาล
// ==========================================
exports.checkClinicStatus = async (req, res) => {
    try {
        const vetId = req.params.vetId;

        const { data: licenseData, error: licenseError } = await supabase
            .from('clinic_license')
            .select('clinic_license_id')
            .eq('vet_id', vetId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (!licenseData || licenseData.length === 0) {
            return res.status(200).json({ status: 'unsubmitted' });
        }

        const latestLicenseId = licenseData[0].clinic_license_id;

        const { data: docData, error: docError } = await supabase
            .from('vet_clinic_document')
            .select('status, detail')
            .eq('clinic_license_id', latestLicenseId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (docData) {
            return res.status(200).json({ status: docData.status, detail: docData.detail });
        } else {
            return res.status(200).json({ status: 'unsubmitted' });
        }

    } catch (error) {
        console.error("Check Clinic Status Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะคลินิก" });
    }
};