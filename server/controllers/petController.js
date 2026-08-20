
const supabase = require("../config/supabase"); // ดึงการเชื่อมต่อ Supabase มาใช้

// ภายในไฟล์ server/controllers/petController.js
exports.addPet = async (req, res) => {
    try {
        // 🟢 จุดที่ 1: เพิ่มการรับค่า pet_image_public_id จากแอป
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
            pet_image_public_id // 🔥 เพิ่มตัวแปรนี้เข้ามา
        } = req.body;

        // ... (โค้ดเช็กข้อมูลว่ากรอกครบไหม หรืออื่นๆ ของคุณถ้ามี) ...

        // 🟢 จุดที่ 2: เพิ่มลงไปในคำสั่ง Insert เข้าฐานข้อมูล
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
        const { owner_id } = req.params; // รับ ID มาจาก URL

        // ดึงข้อมูลสัตว์เลี้ยงจากตาราง pets ที่ตรงกับเจ้าของ
        const { data, error } = await supabase
            .from("pets")
            .select("*")
            .eq("pet_owners_id", owner_id)
            .order('created_at', { ascending: false }); // เรียงจากตัวล่าสุดขึ้นก่อน

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