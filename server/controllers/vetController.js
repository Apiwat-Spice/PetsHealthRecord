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
    // (โค้ดส่วนนี้เหมือนเดิม ไม่มีการเปลี่ยนแปลง)
    try {
        const { vet_id, vet_license_expired, vet_id_card_expired, vet_class } = req.body;
        const files = req.files;

        console.log("==== 📥 [API] ได้รับคำขอส่งเอกสาร ====");
        console.log("📝 vet_id ที่แอปส่งมาคือ:", vet_id);

        if (!files || !files.vet_license_pdf || !files.vet_id_card_pdf) {
            return res.status(400).json({ message: "กรุณาอัปโหลดเอกสารให้ครบทั้ง 2 ไฟล์" });
        }

        const uploadToCloudinary = (fileBuffer, folder) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        folder: folder,
                        format: "jpg"
                    },
                    (error, result) => {
                        if (error) reject(error); else resolve(result);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        const { data: oldLicense } = await supabase
            .from('vet_license')
            .select('vet_license_pdf_public_id, vet_id_card_pdf_public_id')
            .eq('vet_id', vet_id)
            .single();

        if (oldLicense) {
            if (oldLicense.vet_license_pdf_public_id) {
                await cloudinary.uploader.destroy(oldLicense.vet_license_pdf_public_id).catch(err => console.log("ลบรูปเก่า license ไม่สำเร็จ", err));
            }
            if (oldLicense.vet_id_card_pdf_public_id) {
                await cloudinary.uploader.destroy(oldLicense.vet_id_card_pdf_public_id).catch(err => console.log("ลบรูปเก่า id card ไม่สำเร็จ", err));
            }
        }

        const licenseResult = await uploadToCloudinary(files.vet_license_pdf[0].buffer, "vet_documents/vet_licenes");
        const idCardResult = await uploadToCloudinary(files.vet_id_card_pdf[0].buffer, "vet_documents/vet_id");

        console.log("✅ อัปโหลด Cloudinary สำเร็จ");

        if (vet_class) {
            const { error: vetUpdateError } = await supabase
                .from('vet')
                .update({ vet_class: parseInt(vet_class) })
                .eq('vet_id', vet_id);
            if (vetUpdateError) throw vetUpdateError;
        }

        const { data: licenseData, error: licenseError } = await supabase
            .from('vet_license')
            .upsert({
                vet_id: vet_id,
                vet_license_pdf_url: licenseResult.secure_url,
                vet_license_pdf_public_id: licenseResult.public_id,
                vet_license_expired: vet_license_expired || null,
                vet_id_card_pdf_url: idCardResult.secure_url,
                vet_id_card_pdf_public_id: idCardResult.public_id,
                vet_id_card_expired: vet_id_card_expired || null
            }, { onConflict: 'vet_id' })
            .select('*')
            .single();

        if (licenseError) throw licenseError;

        const { data: docData, error: documentError } = await supabase
            .from('vet_license_document')
            .insert({
                vet_license_id: licenseData.vet_license_id,
                status: 'pending'
            })
            .select('*');

        if (documentError) throw documentError;

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
    // (โค้ดส่วนนี้เหมือนเดิม ไม่มีการเปลี่ยนแปลง)
    try {
        const vetId = req.params.vetId || req.params.userId;
        if (!vetId || vetId === 'undefined') return res.status(200).json({ status: 'unsubmitted' });

        const { data: licenseData, error: licenseError } = await supabase
            .from('vet_license')
            .select('*')
            .eq('vet_id', vetId)
            .order('created_at', { ascending: false });

        if (!licenseData || licenseData.length === 0) return res.status(200).json({ status: 'unsubmitted' });

        const latestLicense = licenseData[0];

        const { data: docData, error: docError } = await supabase
            .from('vet_license_document')
            .select('status, detail')
            .eq('vet_license_id', latestLicense.vet_license_id)
            .order('created_at', { ascending: false })
            .limit(1);

        const { data: vetData } = await supabase
            .from('vet')
            .select('vet_class, profile_image_url')
            .eq('vet_id', vetId)
            .single();

        if (docData && docData.length > 0) {
            const latestDoc = docData[0];
            return res.status(200).json({
                status: latestDoc.status,
                detail: latestDoc.detail,
                // 🟢 แนบ URL รูปโปรไฟล์ส่งกลับไปให้แอป
                profile_image_url: vetData?.profile_image_url,
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
    // (โค้ดส่วนนี้เหมือนเดิม ไม่มีการเปลี่ยนแปลง)
    try {
        const data = req.body;
        const files = req.files;

        if (!files || !files.ss3_license_pdf || !files.ss4_license_pdf) {
            return res.status(400).json({ message: "กรุณาแนบไฟล์เอกสาร SS3 และ SS4 ให้ครบถ้วน" });
        }

        const uploadToCloudinary = (fileBuffer, folder) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "image", folder: folder, format: "jpg" },
                    (error, result) => { if (error) reject(error); else resolve(result); }
                );
                stream.end(fileBuffer);
            });
        };

        const { data: oldClinicLicense } = await supabase.from('clinic_license').select('ss3_license_public_id, ss4_license_public_id').eq('vet_id', data.vet_id).single();
        if (oldClinicLicense) {
            if (oldClinicLicense.ss3_license_public_id) await cloudinary.uploader.destroy(oldClinicLicense.ss3_license_public_id).catch(() => { });
            if (oldClinicLicense.ss4_license_public_id) await cloudinary.uploader.destroy(oldClinicLicense.ss4_license_public_id).catch(() => { });
        }

        console.log("1. กำลังอัปโหลดเอกสารคลินิกขึ้น Cloud...");
        const ss3Result = await uploadToCloudinary(files.ss3_license_pdf[0].buffer, "clinic_documents/ss.3");
        const ss4Result = await uploadToCloudinary(files.ss4_license_pdf[0].buffer, "clinic_documents/ss.4");

        console.log("2. กำลังบันทึกข้อมูลลงฐานข้อมูล 4 ตาราง...");

        const { data: clinicLicenseData, error: clinicLicenseError } = await supabase
            .from('clinic_license')
            .upsert({
                vet_id: data.vet_id,
                ss3_license_url: ss3Result.secure_url,
                ss3_license_public_id: ss3Result.public_id,
                ss3_license_expired: data.ss3_license_expired || null,
                ss4_license_url: ss4Result.secure_url,
                ss4_license_public_id: ss4Result.public_id,
                ss4_license_expired: data.ss4_license_expired || null
            }, { onConflict: 'vet_id' })
            .select('clinic_license_id')
            .single();

        if (clinicLicenseError) throw clinicLicenseError;

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

        if (addressError) throw addressError;

        const { data: documentData, error: documentError } = await supabase
            .from('vet_clinic_document')
            .insert({
                clinic_license_id: clinicLicenseData.clinic_license_id,
                vetclinic_address_id: addressData.vetclinic_address_id,
                status: 'pending'
            })
            .select('vet_clinic_document_id')
            .single();

        if (documentError) throw documentError;

        const { error: clinicError } = await supabase
            .from('vet_clinic')
            .insert({
                vet_clinic_document_id: documentData.vet_clinic_document_id,
                vet_clinic_name: data.clinicName,
                vet_clinic_open: data.openTime,
                vet_clinic_close: data.closeTime,
                vet_clinic_verified: false
            });

        if (clinicError) throw clinicError;

        console.log("✅ ส่งคำขอคลินิกและบันทึกลง Database ครบถ้วน!");
        return res.status(200).json({ message: "ส่งคำขอสร้างสถานพยาบาลเรียบร้อยแล้ว!" });

    } catch (error) {
        console.error("Create Clinic Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างสถานพยาบาล" });
    }
};

// ==========================================
// 4. ฟังก์ชันเช็กสถานะคำขอสร้างสถานพยาบาล 
// ==========================================
exports.checkClinicStatus = async (req, res) => {
    try {
        const vetId = req.params.vetId;

        // ส่วนที่ 1: เจ้าของสถานพยาบาล
        const { data: licenseData } = await supabase
            .from('clinic_license')
            .select('*')
            .eq('vet_id', vetId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (licenseData && licenseData.length > 0) {
            const latestLicense = licenseData[0];

            const { data: docData } = await supabase
                .from('vet_clinic_document')
                .select('vet_clinic_document_id, status, detail, vetclinic_address_id')
                .eq('clinic_license_id', latestLicense.clinic_license_id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (docData && docData.length > 0) {
                const latestDoc = docData[0];

                let addressData = null;
                if (latestDoc.vetclinic_address_id) {
                    const { data: addrData } = await supabase.from('vetclinic_address').select('*').eq('vetclinic_address_id', latestDoc.vetclinic_address_id).single();
                    addressData = addrData;
                }

                let clinicInfo = null;
                if (latestDoc.vet_clinic_document_id) {
                    const { data: vClinicData } = await supabase
                        .from('vet_clinic')
                        // เพิ่ม vet_clinic_image_url ในคำสั่ง Select
                        .select('vet_clinic_name, vet_clinic_open, vet_clinic_close, vet_clinic_image_url')
                        .eq('vet_clinic_document_id', latestDoc.vet_clinic_document_id)
                        .single();
                    clinicInfo = vClinicData;
                }

                let operating_hours = '-';
                if (clinicInfo && clinicInfo.vet_clinic_open && clinicInfo.vet_clinic_close) {
                    operating_hours = `${clinicInfo.vet_clinic_open.slice(0, 5)} - ${clinicInfo.vet_clinic_close.slice(0, 5)}`;
                }

                return res.status(200).json({
                    status: latestDoc.status,
                    detail: latestDoc.detail,
                    role: 'owner',
                    submittedDocs: {
                        ...latestLicense,
                        clinic_name: clinicInfo?.vet_clinic_name || '-',
                        operating_hours: operating_hours,
                        address: addressData,
                        // ส่งรูปโลโก้กลับไปให้แอป
                        vet_clinic_image_url: clinicInfo?.vet_clinic_image_url
                    }
                });
            }
        }

        // ส่วนที่ 2: สัตวแพทย์ประจำ (พนักงาน)
        const { data: staffData } = await supabase
            .from('clinic_vet_staff')
            .select('vet_clinic_id, status')
            .eq('vet_id', vetId)
            .eq('status', 'active')
            .single();

        if (staffData) {
            const { data: clinicData } = await supabase
                .from('vet_clinic')
                // เพิ่ม vet_clinic_image_url ในคำสั่ง Select ด้วย
                .select(`
                    vet_clinic_name, 
                    vet_clinic_open, 
                    vet_clinic_close,
                    vet_clinic_image_url,
                    vet_clinic_document (
                        vetclinic_address_id
                    )
                `)
                .eq('vet_clinic_id', staffData.vet_clinic_id)
                .single();

            let addressData = null;
            if (clinicData?.vet_clinic_document?.vetclinic_address_id) {
                const { data: addrData } = await supabase
                    .from('vetclinic_address')
                    .select('*')
                    .eq('vetclinic_address_id', clinicData.vet_clinic_document.vetclinic_address_id)
                    .single();
                addressData = addrData;
            }

            let operating_hours = '-';
            if (clinicData && clinicData.vet_clinic_open && clinicData.vet_clinic_close) {
                operating_hours = `${clinicData.vet_clinic_open.slice(0, 5)} - ${clinicData.vet_clinic_close.slice(0, 5)}`;
            }

            return res.status(200).json({
                status: 'pass',
                detail: '',
                role: 'staff',
                submittedDocs: {
                    clinic_name: clinicData?.vet_clinic_name || '-',
                    operating_hours: operating_hours,
                    address: addressData,
                    // ส่งรูปโลโก้กลับไปให้แอป
                    vet_clinic_image_url: clinicData?.vet_clinic_image_url
                }
            });
        }

        return res.status(200).json({ status: 'unsubmitted' });

    } catch (error) {
        console.error("Check Clinic Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะคลินิก" });
    }
};

// ==========================================
// 5. เพิ่มฟังก์ชันอัปโหลดรูปร้าน (เชื่อมกับ ProfileClinic.js)
// ==========================================
exports.uploadClinicLogo = async (req, res) => {
    try {
        console.log("==== 📥 [API] เริ่มอัปโหลดรูปสถานพยาบาล ====");
        const { vet_id } = req.body;
        const files = req.files;

        console.log("📝 vet_id ที่ได้รับ:", vet_id);

        if (!files || !files.clinic_logo) {
            console.log("❌ ไม่พบไฟล์รูปภาพที่ส่งมา");
            return res.status(400).json({ message: "กรุณาอัปโหลดรูปภาพสถานพยาบาล" });
        }

        console.log("1️⃣ กำลังค้นหาข้อมูล clinic_license...");
        //  แก้จาก .single() เป็น .order().limit(1)
        const { data: licenseData, error: err1 } = await supabase
            .from('clinic_license')
            .select('clinic_license_id')
            .eq('vet_id', vet_id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (err1 || !licenseData || licenseData.length === 0) {
            console.log("❌ ไม่พบสิทธิ์ความเป็นเจ้าของ:", err1);
            return res.status(403).json({ message: "ไม่พบสิทธิ์การเป็นเจ้าของสถานพยาบาล" });
        }
        const clinicLicense = licenseData[0]; // หยิบแถวแรกมาใช้

        console.log("2️⃣ กำลังค้นหาข้อมูล vet_clinic_document...");
        //  แก้จาก .single() เป็น .order().limit(1) ป้องกัน Error กรณีมี 2 แถว
        const { data: docDataArray, error: err2 } = await supabase
            .from('vet_clinic_document')
            .select('vet_clinic_document_id')
            .eq('clinic_license_id', clinicLicense.clinic_license_id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (err2 || !docDataArray || docDataArray.length === 0) {
            console.log("❌ ไม่พบข้อมูลเอกสารคลินิก:", err2);
            return res.status(404).json({ message: "ไม่พบข้อมูลการเปิดคลินิกในระบบ" });
        }
        const docData = docDataArray[0];

        console.log("3️⃣ กำลังค้นหาข้อมูล vet_clinic...");
        //  แก้จาก .single() เป็น .order().limit(1)
        const { data: clinicArray, error: err3 } = await supabase
            .from('vet_clinic')
            .select('vet_clinic_id, vet_clinic_image_public_id')
            .eq('vet_clinic_document_id', docData.vet_clinic_document_id)
            .order('created_at', { ascending: false })
            .limit(1);

        if (err3 || !clinicArray || clinicArray.length === 0) {
            console.log("❌ ไม่พบข้อมูลสถานพยาบาล:", err3);
            return res.status(404).json({ message: "ไม่พบข้อมูลสถานพยาบาลในระบบ" });
        }
        const clinic = clinicArray[0];

        console.log("4️⃣ กำลังตรวจสอบรูปภาพเก่า...");
        // เช็กว่าในฐานข้อมูลมี ID รูปเก่าอยู่หรือไม่
        if (clinic.vet_clinic_image_public_id) {
            console.log("🗑️ กำลังลบรูปเก่าบน Cloudinary ID:", clinic.vet_clinic_image_public_id);
            // สั่งลบรูปเก่าบน Cloudinary ออกทันที
            await cloudinary.uploader.destroy(clinic.vet_clinic_image_public_id).catch((e) => console.log("⚠️ ลบรูปเก่าไม่สำเร็จ:", e));
        }

        console.log("5️⃣ กำลังอัปโหลดรูปใหม่ขึ้น Cloudinary...");
        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "image", folder: "Clinic/ClinicProfile", format: "jpg" },
                    (error, result) => { if (error) reject(error); else resolve(result); }
                );
                stream.end(fileBuffer);
            });
        };

        const result = await uploadToCloudinary(files.clinic_logo[0].buffer);
        console.log("✅ อัปโหลด Cloudinary สำเร็จ! URL:", result.secure_url);

        console.log("6️⃣ กำลังอัปเดต URL ลงฐานข้อมูล...");
        const { error: updateError } = await supabase
            .from('vet_clinic')
            .update({
                vet_clinic_image_url: result.secure_url,
                vet_clinic_image_public_id: result.public_id
            })
            .eq('vet_clinic_id', clinic.vet_clinic_id);

        if (updateError) {
            console.log("❌ อัปเดตฐานข้อมูลไม่สำเร็จ:", updateError);
            throw updateError;
        }

        console.log("🎉 อัปโหลดรูปภาพเสร็จสมบูรณ์!");
        return res.status(200).json({
            message: "อัปโหลดรูปภาพสถานพยาบาลสำเร็จ",
            logo_url: result.secure_url
        });

    } catch (error) {
        console.error("🚨 Upload Clinic Image Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" });
    }
};
// ==========================================
// 6. เพิ่มฟังก์ชันอัปโหลดรูปโปรไฟล์สัตวแพทย์
// ==========================================
exports.uploadVetProfile = async (req, res) => {
    try {
        const { vet_id } = req.body;
        const files = req.files;

        if (!files || !files.profile_image) {
            return res.status(400).json({ message: "กรุณาอัปโหลดรูปภาพโปรไฟล์" });
        }

        // 1. ดึงข้อมูลว่าสัตวแพทย์คนนี้มีรูปเก่าอยู่หรือไม่
        const { data: vetData, error: findError } = await supabase
            .from('vet')
            .select('vet_id, profile_image_public_id')
            .eq('vet_id', vet_id)
            .single();

        if (findError || !vetData) {
            return res.status(404).json({ message: "ไม่พบข้อมูลสัตวแพทย์ในระบบ" });
        }

        // 2. ลบรูปเก่าบน Cloudinary (ถ้ามี)
        if (vetData.profile_image_public_id) {
            await cloudinary.uploader.destroy(vetData.profile_image_public_id).catch(() => {});
        }

        // 3. อัปโหลดรูปใหม่ขึ้น Cloudinary ในโฟลเดอร์ Vet/VetProfile
        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "image", folder: "Vet/VetProfile", format: "jpg" },
                    (error, result) => { if (error) reject(error); else resolve(result); }
                );
                stream.end(fileBuffer);
            });
        };

        const result = await uploadToCloudinary(files.profile_image[0].buffer);

        // 4. บันทึก URL ลง Database ตาราง vet
        const { error: updateError } = await supabase
            .from('vet')
            .update({
                profile_image_url: result.secure_url,
                profile_image_public_id: result.public_id
            })
            .eq('vet_id', vetData.vet_id);

        if (updateError) throw updateError;

        return res.status(200).json({ 
            message: "อัปโหลดรูปโปรไฟล์สำเร็จ",
            profile_image_url: result.secure_url 
        });

    } catch (error) {
        console.error("Upload Vet Profile Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" });
    }
};