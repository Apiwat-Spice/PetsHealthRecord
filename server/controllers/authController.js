const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../config/mailer");
const sendOTP = require("../utils/sendOTP");

// ==========================================
// 1. REGISTER
// ==========================================
exports.register = async (req, res) => {
  try {
    const {
      role, // รับค่า 'petowner' หรือ 'vet' จากแอปมือถือ
      firstname,
      lastname,
      email,
      password,
      phone_number
    } = req.body;

    if (!firstname || !lastname || !email || !password || !phone_number) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // ตรวจสอบว่า Email ซ้ำหรือไม่
    const { data: existUser, error: existError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (existError) return res.status(500).json({ message: existError.message });
    if (existUser) return res.status(400).json({ message: "Email already exists" });

    // แปลงรหัสผ่าน (Hash)
    const password_hash = await bcrypt.hash(password, 10);

    // กำหนด Role ให้ถูกต้อง (เพื่อนำไปบันทึกลงฐานข้อมูล)
    const dbRole = role === "vet" ? "vet" : "pet_owner";

    // บันทึกลงตาราง users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        role: dbRole,
        email,
        password_hash,
        verified: false,
        status: "active",
      })
      .select()
      .single();

    if (userError) return res.status(400).json({ message: userError.message });

    // แยกบันทึกข้อมูลโปรไฟล์ตาม Role
    if (dbRole === "pet_owner") {
      const { error: ownerError } = await supabase
        .from("pet_owners")
        .insert({
          user_id: userData.user_id,
          firstname,
          lastname,
          phone: phone_number,
          profile_image_url: null,
          profile_image_public_id: null,
        });

      if (ownerError) {
        await supabase.from("users").delete().eq("user_id", userData.user_id);
        return res.status(400).json({ message: ownerError.message });
      }
    } else if (dbRole === "vet") {
      const { error: vetError } = await supabase
        .from("vet") 
        .insert({
          user_id: userData.user_id,
          firstname,
          lastname,
          phone: phone_number,
          profile_image_url: null,
          profile_image_public_id: null
        });

      if (vetError) {
        await supabase.from("users").delete().eq("user_id", userData.user_id);
        return res.status(400).json({ message: vetError.message });
      }
    }

    // สร้างและส่ง OTP ยืนยันอีเมล
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: otpError } = await supabase
      .from("otp")
      .insert({
        user_id: userData.user_id,
        otp_code: otp,
        type: "register",
        status: "pending",
        expires_at: expiresAt,
      });

    if (otpError) {
      console.error("OTP Error:", otpError);
      // ทำการ Rollback ข้อมูล
      if (dbRole === "pet_owner") {
        await supabase.from("pet_owners").delete().eq("user_id", userData.user_id);
      } else {
        await supabase.from("vet").delete().eq("user_id", userData.user_id);
      }
      await supabase.from("users").delete().eq("user_id", userData.user_id);
      return res.status(500).json({ message: otpError.message });
    }

    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error("Send OTP Error:", emailError);
      return res.status(500).json({ message: "Register successful but failed to send OTP" });
    }

    return res.status(201).json({
      message: "Register Success. OTP has been sent to your email.",
      success: true,
      email: email,
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // หา User จากตาราง users
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    // ตรวจสอบ Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // ถ้ายังไม่ได้ Verify
    if (!user.verified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const { error: otpError } = await supabase
        .from("otp")
        .insert({
          user_id: user.user_id,
          otp_code: otp,
          type: "register",
          status: "pending",
          expires_at: expiresAt,
        });

      if (otpError) return res.status(500).json({ message: "ไม่สามารถสร้าง OTP ได้" });

      try {
        await sendOTP(email, otp);
      } catch (emailError) {
        return res.status(500).json({ message: "ไม่สามารถส่ง OTP ได้" });
      }

      return res.status(403).json({
        message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
        require_otp: true,
        email: email,
      });
    }

    // ถ้า Verify แล้ว → สร้าง JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    let profileData = null;
    if (user.role === "pet_owner") {
      const { data } = await supabase.from("pet_owners").select("*").eq("user_id", user.user_id).maybeSingle();
      profileData = data;
    } else if (user.role === "vet") {
      const { data } = await supabase.from("vet").select("*").eq("user_id", user.user_id).maybeSingle();
      profileData = data;
    }

    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ!",
      token: token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      profile: profileData || null 
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // หา User
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("user_id, email, verified")
      .eq("email", email)
      .single();

    if (userError) return res.status(500).json({ message: userError.message });
    if (!user) return res.status(404).json({ message: "User not found" });

    // หา OTP
    const { data: otpData, error: otpError } = await supabase
      .from("otp")
      .select("*")
      .eq("user_id", user.user_id)
      .eq("otp_code", otp)
      .eq("type", "register")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) return res.status(500).json({ message: otpError.message });
    if (!otpData) return res.status(400).json({ message: "Invalid OTP" });

    // ตรวจสอบหมดอายุ
    if (new Date(otpData.expires_at) < new Date()) {
      await supabase.from("otp").update({ status: "expired" }).eq("otp_id", otpData.otp_id);
      return res.status(400).json({ message: "OTP has expired" });
    }

    // ยืนยัน User
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ verified: true })
      .eq("user_id", user.user_id);

    if (updateUserError) return res.status(500).json({ message: updateUserError.message });

    // เปลี่ยน OTP เป็น used
    const { error: updateOTPError } = await supabase
      .from("otp")
      .update({ status: "used" })
      .eq("otp_id", otpData.otp_id);

    if (updateOTPError) return res.status(500).json({ message: updateOTPError.message });

    return res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// RESEND OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (userError) return res.status(500).json({ message: userError.message });
    if (!user) return res.status(404).json({ message: "User not found" });

    // สร้าง OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // บันทึก OTP ด้วย Supabase
    const { error: otpError } = await supabase
      .from("otp")
      .insert({
        user_id: user.user_id,
        otp_code: otp,
        type: "register",
        status: "pending",
        expires_at: expiresAt
      });

    if (otpError) return res.status(500).json({ message: "Server error" });

    // ส่ง Email
    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({ message: "OTP has been sent again" });

  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};