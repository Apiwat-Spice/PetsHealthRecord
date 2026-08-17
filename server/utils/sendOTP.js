const transporter = require("../config/mailer");

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "PetHealthRecord - OTP Verification",
    html: `
      <div>
        <h2>PetHealthRecord</h2>

        <p>Your OTP verification code is:</p>

        <h1>${otp}</h1>

        <p>This OTP will expire in 5 minutes.</p>

        <p>If you did not register for this account,
        please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOTP;