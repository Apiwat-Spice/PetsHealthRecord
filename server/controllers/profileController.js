const supabase = require("../config/supabase");

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params; // pet_owner_id
        const { username, first_name, last_name, gender, profile_image_url, profile_image_public_id } = req.body;

        // เช็กก่อนว่า username ซ้ำกับคนอื่นไหม (ถ้ามีการเปลี่ยน)
        if (username) {
            const { data: existUser } = await supabase
                .from('pet_owners')
                .select('pet_owner_id')
                .eq('username', username)
                .neq('pet_owner_id', id)
                .maybeSingle();
            
            if (existUser) return res.status(400).json({ message: "Username นี้มีคนใช้แล้ว" });
        }

        // อัปเดตข้อมูลลงตาราง pet_owners
        const { data, error } = await supabase
            .from('pet_owners')
            .update({
                username: username || null,
                first_name: first_name,
                last_name: last_name,
                gender: gender || null,
                profile_image_url: profile_image_url || null,
                profile_image_public_id: profile_image_public_id || null,
                updated_at: new Date()
            })
            .eq('pet_owner_id', id)
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({ message: 'อัปเดตโปรไฟล์สำเร็จ', profile: data });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์" });
    }
};