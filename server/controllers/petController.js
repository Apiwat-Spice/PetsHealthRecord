
const supabase = require("../config/supabase"); // ดึงการเชื่อมต่อ Supabase มาใช้

const cloudinary = require("cloudinary").v2;
// ตั้งค่า Cloudinary ด้วยข้อมูลจาก .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.deletePet = async (req, res) => {
    try {
        const { pet_id } = req.params; // รับ ID ของสัตว์เลี้ยงจาก URL
        
        // 🔹 สเตป 1: ดึงข้อมูลสัตว์เลี้ยงมาเช็กก่อนว่ามี pet_image_public_id ให้ลบไหม
        const { data: petData, error: fetchError } = await supabase
            .from('pets')
            .select('pet_image_public_id')
            .eq('pet_id', pet_id)
            .single(); // ใช้ single() เพราะเราดึงแค่ตัวเดียว

        if (fetchError || !petData) {
            console.error("Fetch Error:", fetchError);
            return res.status(404).json({ message: "ไม่พบข้อมูลสัตว์เลี้ยงในระบบ" });
        }

        // 🔹 สเตป 2: ถ้ามีรูป (public_id) ให้สั่งลบที่ Cloudinary ก่อน
        if (petData.pet_image_public_id) {
            console.log(`กำลังลบรูป: ${petData.pet_image_public_id} ออกจาก Cloudinary...`);
            try {
                const cloudResult = await cloudinary.uploader.destroy(petData.pet_image_public_id);
                console.log("✅ ลบรูปจาก Cloudinary สำเร็จ:", cloudResult);
            } catch (cloudErr) {
                console.error("❌ ลบรูปล้มเหลว:", cloudErr);
                // เราไม่ return ตรงนี้ เผื่อให้มันข้ามไปลบข้อมูลใน DB ต่อได้แม้รูปลบไม่ผ่าน
            }
        } else {
             console.log("⚠️ สัตว์เลี้ยงตัวนี้ไม่มีรูปในระบบ (ข้ามการลบจากคลาวด์)");
        }

        // 🔹 สเตป 3: ลบข้อมูลสัตว์เลี้ยงจากฐานข้อมูล Supabase
        const { data, error } = await supabase
            .from('pets')
            .delete()
            .eq('pet_id', pet_id);

        if (error) {
            console.error("Supabase Delete Error:", error);
            return res.status(500).json({ message: "ไม่สามารถลบข้อมูลสัตว์เลี้ยงได้", error: error.message });
        }
        
        return res.status(200).json({ message: "ลบข้อมูลสัตว์เลี้ยงสำเร็จ", data: data });
        
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
};

// ภายในไฟล์ server/controllers/petController.js
exports.addPet = async (req, res) => {
    try {
        const { 
            pet_owners_id, 
            pet_name, 
            animal_type, 
            species, 
            sex, 
            birth_date, 
            weight, 
            detail, 
            pet_image_url,
            pet_image_public_id 
        } = req.body;


        const { data, error } = await supabase
            .from('pets')
            .insert([
                {
                    pet_owners_id: pet_owners_id,
                    pet_name: pet_name,
                    animal_type: animal_type,
                    species: species || null,
                    sex: sex,
                    birth_date: birth_date || null,
                    weight: weight || null,
                    detail: detail || null,
                    pet_image_url: pet_image_url || null,
                    
                    // 🔥 สั่งให้บันทึก public_id ลงคอลัมน์ใน Supabase
                    pet_image_public_id: pet_image_public_id || null 
                }
            ])
            .select();

        if (error) {
            console.error("Supabase Insert Error:", error);
            return res.status(500).json({ message: "ไม่สามารถเพิ่มข้อมูลสัตว์เลี้ยงได้", error: error.message });
        }

        return res.status(201).json({ message: "เพิ่มข้อมูลสัตว์เลี้ยงสำเร็จ", data: data });

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
    }
};
exports.getPetsByOwner = async (req, res) => {
    try {
        const { owner_id } = req.params;

        // ดึงข้อมูลสัตว์เลี้ยงจากตาราง pets ที่ตรงกับเจ้าของ
        const { data, error } = await supabase
            .from("pets")
            .select("*")
            .eq("pet_owners_id", owner_id)
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