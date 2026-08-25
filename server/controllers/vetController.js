const supabase = require("../config/supabase");
const cloudinary = require("cloudinary").v2;

// ตั้งค่า Cloudinary (ถ้ามีอยู่แล้วในไฟล์ ให้ข้ามบรรทัดนี้ไปได้เลยครับ)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadVetLicense = async (req, res) => {
    try {
        const { user_id } = req.body;
        const files = req.files; // รับไฟล์จาก Multer

        // 1. เช็กว่ามีการส่งไฟล์มาครบ 2 ไฟล์ไหม
        if (!files || !files.vet_license_pdf || !files.vet_id_card_pdf) {
            return res.status(400).json({ message: "กรุณาอัปโหลดเอกสารให้ครบทั้ง 2 ไฟล์" });
        }

        // ฟังก์ชันช่วยอัปโหลดไฟล์ขึ้น Cloudinary แบบ Stream (เหมาะสำหรับไฟล์จาก Memory)
        const uploadToCloudinary = (fileBuffer, folder) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: "auto", folder: folder }, // auto รองรับทั้งภาพและ pdf
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        console.log("กำลังอัปโหลดไฟล์ขึ้น Cloudinary...");
        
        // 2. อัปโหลดทั้ง 2 ไฟล์
        const licenseResult = await uploadToCloudinary(files.vet_license_pdf[0].buffer, "vet_documents");
        const idCardResult = await uploadToCloudinary(files.vet_id_card_pdf[0].buffer, "vet_documents");

        console.log("อัปโหลด Cloudinary สำเร็จ! กำลังบันทึกลง Supabase...");

        // 3. บันทึกข้อมูลลงตาราง vet_license
        const { data: licenseData, error: licenseError } = await supabase
            .from('vet_license')
            .insert({
                vet_license_pdf_url: licenseResult.secure_url,
                vet_license_pdf_public_id: licenseResult.public_id,
                vet_id_card_pdf_url: idCardResult.secure_url,
                vet_id_card_pdf_public_id: idCardResult.public_id
            })
            .select('vet_license_id')
            .single();

        if (licenseError) throw licenseError;

        // 4. นำ vet_license_id ไปอัปเดตในตาราง vet ของ user คนนี้
        const { error: vetUpdateError } = await supabase
            .from('vet')
            .update({ vet_license_document_id: licenseData.vet_license_id })
            .eq('user_id', user_id);

        if (vetUpdateError) throw vetUpdateError;

        return res.status(200).json({ message: "ส่งเอกสารยืนยันตัวตนสำเร็จ!" });

    } catch (error) {
        console.error("Upload License Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร" });
    }
};