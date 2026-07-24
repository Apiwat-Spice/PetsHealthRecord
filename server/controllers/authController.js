const supabase = require("../config/supabase");

exports.register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  await supabase.from("pet_owners").insert({
    id: data.user.id,
    firstname,
    lastname,
    profile_img: null,
  });

  res.json({
    message: "Register Success",
  });
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