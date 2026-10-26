const supabase = require("../config/supabase");

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params; // pet_owner_id
        const { data, error } = await supabase
            .from('pet_owners')
            .select('*')
            .eq('pet_owner_id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: "ไม่พบข้อมูลโปรไฟล์" });

        return res.status(200).json(data);
    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            username,
            first_name,
            last_name,
            gender,
            phone,
            address_line,
            subdistrict,
            district,
            province,
            postal_code,
            profile_image_url,
            profile_image_public_id
        } = req.body;

        if (username) {
            const { data: existUser } = await supabase
                .from('pet_owners')
                .select('pet_owner_id')
                .eq('username', username)
                .neq('pet_owner_id', id)
                .maybeSingle();

            if (existUser) return res.status(400).json({ message: "Username นี้มีคนใช้แล้ว" });
        }

        const { data, error } = await supabase
            .from('pet_owners')
            .update({
                username: username || null,
                first_name: first_name,
                last_name: last_name,
                gender: gender || null,
                phone: phone || null,
                address_line: address_line || null,
                subdistrict: subdistrict || null,
                district: district || null,
                province: province || null,
                postal_code: postal_code || null,
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