const supabase = require("../config/supabase");
const bcrypt = require("bcrypt");
exports.register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      phone_number,
    } = req.body;

    if (!firstname || !lastname  || !email || !password || !phone_number) {
      return res.status(400).json({
        message: "Please fill all fields2",
      });
    }

    // เช็ค Email ซ้ำ
    const { data: existUser } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();

    if (existUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash Password
    const password_hash = await bcrypt.hash(password, 10);

    // เพิ่ม User
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

    // เพิ่ม Pet Owner
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
      return res.status(400).json({
        message: ownerError.message,
      });
    }

    res.status(201).json({
      message: "Register Success",
      success: true,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    //หาจากตาราง users
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single(); 

    //ถ้าไม่เจออีเมลนี้ในตาราง
    if (error || !user) {
      return res.status(401).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    }

    //นำรหัสผ่านที่กรอกมา เทียบกับช่อง password_hash
    if (user.password_hash !== password) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    //ถ้ารหัสผ่านตรงกัน เข้าสู่ระบบได้
    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ!",
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
};