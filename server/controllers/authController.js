const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendOTP = require("../utils/sendOTP");

// 1. เช็กอีเมล
exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();

        if (error || !user) return res.status(404).json({ message: "ไม่พบอีเมลในระบบ กรุณาติดต่อสถานพยาบาลเพื่อลงทะเบียน" });
        if (user.status === 'inactive') return res.status(403).json({ message: "บัญชีถูกระงับ" });

        return res.status(200).json({ exists: true, hasPassword: !!user.password_hash });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
};

// 2. ขอ OTP (สำหรับคนที่ยังไม่มีรหัส)
exports.requestOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
        if (!user) return res.status(404).json({ message: "ไม่พบอีเมลในระบบ" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await supabase.from("otp").insert({ user_id: user.user_id, otp_code: otp, type: "register", status: "pending", expires_at: expiresAt });
        await sendOTP(email, otp);

        return res.status(200).json({ message: "ส่งรหัส OTP แล้ว" });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
};

// 3. ยืนยัน OTP (ผ่านแล้วให้แอปพาไปหน้าตั้งรหัสผ่าน)
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

        const { data: otpData } = await supabase.from("otp")
            .select("*").eq("user_id", user.user_id).eq("otp_code", otp).eq("status", "pending")
            .order("created_at", { ascending: false }).limit(1).maybeSingle();

        if (!otpData) return res.status(400).json({ message: "รหัส OTP ไม่ถูกต้อง" });
        if (new Date(otpData.expires_at) < new Date()) return res.status(400).json({ message: "รหัส OTP หมดอายุแล้ว" });

        await supabase.from("otp").update({ status: "used" }).eq("otp_id", otpData.otp_id);

        return res.status(200).json({ message: "ยืนยัน OTP สำเร็จ" });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
};

// 4. ตั้งรหัสผ่านใหม่ (หลังจากผ่าน OTP แล้วแจก Token เลย)
exports.createPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: user } = await supabase.from("users").select("*").eq("email", email).single();

        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        if (user.password_hash) return res.status(400).json({ message: "บัญชีนี้มีการตั้งรหัสผ่านไปแล้ว" });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        await supabase.from("users").update({ password_hash: hashed, verified: true }).eq("user_id", user.user_id);

        const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
        let profileData = null;
        if (user.role === "pet_owner") {
            const { data } = await supabase.from("pet_owners").select("*").eq("user_id", user.user_id).maybeSingle();
            profileData = data;
        }

        return res.status(200).json({ message: "ตั้งรหัสผ่านสำเร็จ", token, user: { user_id: user.user_id, email: user.email, role: user.role }, profile: profileData });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
};

// 5. ล็อกอินด้วยรหัสผ่านปกติ
exports.loginWithPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        if (!user.password_hash) return res.status(400).json({ message: "บัญชีนี้ยังไม่ได้ตั้งรหัสผ่าน" });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });

        const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
        let profileData = null;
        if (user.role === "pet_owner") {
            const { data } = await supabase.from("pet_owners").select("*").eq("user_id", user.user_id).maybeSingle();
            profileData = data;
        }

        return res.status(200).json({ message: "เข้าสู่ระบบสำเร็จ", token, user: { user_id: user.user_id, email: user.email, role: user.role }, profile: profileData });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
};
// 6. เปลี่ยนรหัสผ่านใหม่ (สำหรับคนที่ผ่านการยืนยัน OTP แล้ว)
exports.changePassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: user } = await supabase.from("users").select("*").eq("email", email).single();
        
        if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

        // เข้ารหัสผ่านใหม่
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        // อัปเดตลง Database
        await supabase.from("users").update({ password_hash: hashed }).eq("user_id", user.user_id);

        return res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" });
    }
};