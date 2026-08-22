const supabase = require("../config/supabase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../config/mailer");
const sendOTP = require("../utils/sendOTP");

exports.register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      phone_number,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !phone_number
    ) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }
    const { data: existUser, error: existError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (existError) {
      return res.status(500).json({
        message: existError.message,
      });
    }

    if (existUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        role: "pet_owner",
        email,
        password_hash,
        verified: false,
        status: "active",
      })
      .select()
      .single();

    if (userError) {
      return res.status(400).json({
        message: userError.message,
      });
    }

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
      await supabase
        .from("users")
        .delete()
        .eq("user_id", userData.user_id);

      return res.status(400).json({
        message: ownerError.message,
      });
    }


    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP หมดอายุ 5 นาที
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    ).toISOString();

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

      // ลบข้อมูลที่สร้างไปก่อนหน้า
      await supabase
        .from("pet_owners")
        .delete()
        .eq("user_id", userData.user_id);

      await supabase
        .from("users")
        .delete()
        .eq("user_id", userData.user_id);

      return res.status(500).json({
        message: otpError.message,
      });
    }
    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      console.error("Send OTP Error:", emailError);

      return res.status(500).json({
        message: "Register successful but failed to send OTP",
      });
    }

    return res.status(201).json({
      message: "Register Success. OTP has been sent to your email.",
      success: true,
      email: email,
    });

  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. หา User จากตาราง users
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // ไม่พบ Email
    if (error || !user) {
      return res.status(401).json({
        message: "ไม่พบอีเมลนี้ในระบบ",
      });
    }

    // 2. ตรวจสอบ Password ก่อน
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "รหัสผ่านไม่ถูกต้อง",
      });
    }

    // 3. ถ้ายังไม่ได้ Verify
    if (!user.verified) {

      // สร้าง OTP ใหม่
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // OTP หมดอายุใน 5 นาที
      const expiresAt = new Date(
        Date.now() + 5 * 60 * 1000
      ).toISOString();

      // บันทึก OTP
      const { error: otpError } = await supabase
        .from("otp")
        .insert({
          user_id: user.user_id,
          otp_code: otp,
          type: "register",
          status: "pending",
          expires_at: expiresAt,
        });

      if (otpError) {
        console.error("Create OTP Error:", otpError);

        return res.status(500).json({
          message: "ไม่สามารถสร้าง OTP ได้",
        });
      }

      // ส่ง OTP ทาง Email
      try {
        await sendOTP(email, otp);
      } catch (emailError) {
        console.error("Send OTP Error:", emailError);

        return res.status(500).json({
          message: "ไม่สามารถส่ง OTP ได้",
        });
      }

      // ส่งกลับไปให้ Mobile
      return res.status(403).json({
        message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
        require_otp: true,
        email: email,
      });
    }

    // 4. ถ้า Verify แล้ว → สร้าง JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // 🔥 5. ค้นหาข้อมูล Pet Owner ของ User คนนี้ (เพิ่มส่วนนี้เข้ามา)
    const { data: petOwnerData, error: ownerError } = await supabase
      .from("pet_owners")
      .select("*")
      .eq("user_id", user.user_id)
      .maybeSingle();

    if (ownerError) {
      console.error("Fetch Pet Owner Error:", ownerError);
    }

    // 🔥 6. Login สำเร็จ (เพิ่ม pet_owner ส่งกลับไปใน Response ด้วย)
    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ!",
      token: token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      pet_owner: petOwnerData || null // ส่งข้อมูลโปรไฟล์กลับไปให้แอปเซฟ
    });

  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์",
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("===== VERIFY OTP =====");
    console.log("email:", email);
    console.log("otp:", otp);

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // 1. หา User
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("user_id, email, verified")
      .eq("email", email)
      .single();

    if (userError) {
      console.error("USER ERROR:", userError);

      return res.status(500).json({
        message: userError.message,
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log("USER:", user);

    // 2. หา OTP
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

    if (otpError) {
      console.error("OTP ERROR:", otpError);

      return res.status(500).json({
        message: otpError.message,
      });
    }

    if (!otpData) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    console.log("OTP DATA:", otpData);

    // 3. ตรวจสอบหมดอายุ
    if (new Date(otpData.expires_at) < new Date()) {
      await supabase
        .from("otp")
        .update({
          status: "expired",
        })
        .eq("otp_id", otpData.otp_id);

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // 4. ยืนยัน User
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        verified: true,
      })
      .eq("user_id", user.user_id);

    if (updateUserError) {
      console.error("UPDATE USER ERROR:", updateUserError);

      return res.status(500).json({
        message: updateUserError.message,
      });
    }

    // 5. เปลี่ยน OTP เป็น used
    const { error: updateOTPError } = await supabase
      .from("otp")
      .update({
        status: "used",
      })
      .eq("otp_id", otpData.otp_id);

    if (updateOTPError) {
      console.error("UPDATE OTP ERROR:", updateOTPError);

      return res.status(500).json({
        message: updateOTPError.message,
      });
    }

    console.log("OTP VERIFIED SUCCESSFULLY");

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // หา User
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    // สร้าง OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // หมดอายุ 5 นาที
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // บันทึก OTP
    await db.query(
      `INSERT INTO otp
       (user_id, otp, expires_at, used)
       VALUES (?, ?, ?, 0)`,
      [user.user_id, otp, expiresAt]
    );

    // ส่ง Email
    // await sendOTPEmail(email, otp);

    console.log("New OTP:", otp);

    return res.status(200).json({
      message: "OTP has been sent again",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};