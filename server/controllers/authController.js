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

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  res.json({
    message: "Login Success",
    user: data.user,
    session: data.session,
  });
};