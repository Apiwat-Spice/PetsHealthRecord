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

        //  ตรวจสอบว่าเคยมีรูปเก่าไหม ถ้ามีให้ลบทิ้งก่อน
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
            .select('vet_class')
            .eq('vet_id', vetId)
            .single();

        if (docData && docData.length > 0) {
            const latestDoc = docData[0];
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
                    { resource_type: "image", folder: folder, format: "jpg" },
                    (error, result) => { if (error) reject(error); else resolve(result); }
                );
                stream.end(fileBuffer);
            });
        };

        const { data: oldClinicLicense } = await supabase.from('clinic_license').select('ss3_license_public_id, ss4_license_public_id').eq('vet_id', data.vet_id).single();
        if (oldClinicLicense) {
            if (oldClinicLicense.ss3_license_public_id) await cloudinary.uploader.destroy(oldClinicLicense.ss3_license_public_id).catch(() => {});
            if (oldClinicLicense.ss4_license_public_id) await cloudinary.uploader.destroy(oldClinicLicense.ss4_license_public_id).catch(() => {});
        }

        console.log("1. กำลังอัปโหลดเอกสารคลินิกขึ้น Cloud...");
        const ss3Result = await uploadToCloudinary(files.ss3_license_pdf[0].buffer, "clinic_documents/ss.3");
        const ss4Result = await uploadToCloudinary(files.ss4_license_pdf[0].buffer, "clinic_documents/ss.4");

        console.log("2. กำลังบันทึกข้อมูลลงฐานข้อมูล 4 ตาราง...");

        // ตารางที่ 1: clinic_license
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

        // ตารางที่ 2: vetclinic_address
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

        // ตารางที่ 3: vet_clinic_document
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

        //  ตารางที่ 4: vet_clinic (บันทึกชื่อ และ เวลาเปิดปิด)
        const { error: clinicError } = await supabase
            .from('vet_clinic')
            .insert({
                vet_clinic_document_id: documentData.vet_clinic_document_id,
                vet_clinic_name: data.clinicName,
                vet_clinic_open: data.openTime, // e.g., '08:00:00'
                vet_clinic_close: data.closeTime, // e.g., '20:00:00'
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
// 4. ฟังก์ชันเช็กสถานะคำขอสร้างสถานพยาบาล (และเช็กว่าเป็นพนักงานหรือไม่)
// ==========================================
exports.checkClinicStatus = async (req, res) => {
    try {
        const vetId = req.params.vetId;

        //  ส่วนที่ 1: ตรวจสอบว่าเป็น "เจ้าของสถานพยาบาล" หรือไม่? (จาก clinic_license)
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
                        .select('vet_clinic_name, vet_clinic_open, vet_clinic_close')
                        .eq('vet_clinic_document_id', latestDoc.vet_clinic_document_id)
                        .single();
                    clinicInfo = vClinicData;
                }

                let operating_hours = '-';
                if (clinicInfo && clinicInfo.vet_clinic_open && clinicInfo.vet_clinic_close) {
                    operating_hours = `${clinicInfo.vet_clinic_open.slice(0, 5)} - ${clinicInfo.vet_clinic_close.slice(0, 5)}`;
                }

                //  คืนค่าข้อมูลสำหรับ "เจ้าของคลินิก" (owner)
                return res.status(200).json({ 
                    status: latestDoc.status, 
                    detail: latestDoc.detail,
                    role: 'owner', // <-- ระบุ Role ว่าเป็นเจ้าของ
                    submittedDocs: {
                        ...latestLicense,
                        clinic_name: clinicInfo?.vet_clinic_name || '-', 
                        operating_hours: operating_hours, 
                        address: addressData 
                    } 
                });
            }
        }

        //  ส่วนที่ 2: ถ้าไม่ใช่เจ้าของ ให้ไปตรวจว่าเป็น "สัตวแพทย์ประจำ (พนักงาน)" หรือไม่?
        // ค้นหาในตาราง clinic_vet_staff
        const { data: staffData } = await supabase
            .from('clinic_vet_staff')
            .select('vet_clinic_id, status')
            .eq('vet_id', vetId)
            .eq('status', 'active') // เอาเฉพาะคนที่สถานะยัง Active อยู่
            .single();

        if (staffData) {
            // ถ้าเจอว่าเป็นพนักงาน ให้ไปดึงข้อมูลคลินิกที่เขาสังกัดมาโชว์
            const { data: clinicData } = await supabase
                .from('vet_clinic')
                .select(`
                    vet_clinic_name, 
                    vet_clinic_open, 
                    vet_clinic_close,
                    vet_clinic_document (
                        vetclinic_address_id
                    )
                `)
                .eq('vet_clinic_id', staffData.vet_clinic_id)
                .single();

            // ดึงที่อยู่ของคลินิก (ถ้ามี)
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

            //  คืนค่าข้อมูลสำหรับ "พนักงาน" (staff)
            // ให้สถานะเป็น 'pass' เพื่อให้แอปโชว์ Badge สีม่วงได้
            return res.status(200).json({
                status: 'pass',
                detail: '',
                role: 'staff', // <-- ระบุ Role ว่าเป็นพนักงาน
                submittedDocs: {
                    clinic_name: clinicData?.vet_clinic_name || '-',
                    operating_hours: operating_hours,
                    address: addressData
                }
            });
        }

        //  ส่วนที่ 3: ถ้าไม่เจอทั้งในฐานะเจ้าของและพนักงาน
        return res.status(200).json({ status: 'unsubmitted' });

    } catch (error) {
        console.error("Check Clinic Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสถานะคลินิก" });
    }
};