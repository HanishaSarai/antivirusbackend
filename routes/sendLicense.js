// backend/routes/sendLicense.js

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const License = require("../models/License"); // ✅ Import Mongoose model
require("dotenv").config();
require("../config/db"); // ✅ Ensure DB is connected

router.post("/", async (req, res) => {
  const { email, licenseKey } = req.body;

  if (!email || !licenseKey) {
    return res.status(400).json({ error: "Email and License Key are required." });
  }

  try {
    // ✅ Save to MongoDB
    await License.create({ email, licenseKey });
    console.log(`✅ Saved license for ${email} to MongoDB.`);

    // 📧 Configure transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">🛡️ Virex Security - License Key</h2>
        <p>Hello,</p>
        <p>Thank you for choosing <strong>Virex Security</strong>!</p>
        <div style="background-color: #f0f4f8; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 18px;">Here is your license key:</p>
          <p style="font-size: 24px; font-weight: bold; color: #111827;">${licenseKey}</p>
        </div>
        <p>This key is tied to your email and machine and cannot be reused elsewhere.</p>
        <p>Regards,<br/>The Virex Team</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Virex Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🛡️ Your Virex Security License Key",
      html: htmlContent,
    });

    console.log(`✅ License key email sent to ${email}`);
    res.status(200).json({ status: "SUCCESS", message: "License key sent and saved." });

  } catch (error) {
    console.error("❌ Error in /send-license:", error);
    res.status(500).json({ status: "ERROR", message: "Failed to send or save license." });
  }
});

module.exports = router;
