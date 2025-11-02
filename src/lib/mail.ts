import nodemailer from "nodemailer";

export const sendOTP = async (to: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"E-Commerce OTP" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Kode OTP Login Anda",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Kode OTP Login Anda</h2>
          <p>Kode OTP Anda adalah <b style="font-size: 1.2em;">${otp}</b>.</p>
          <p>Kode ini berlaku selama <b>5 menit</b>.</p>
          <hr />
          <p style="font-size: 0.9em; color: gray;">
            Jika Anda tidak meminta kode ini, abaikan email ini.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
    throw new Error("Failed to send OTP email");
  }
};
