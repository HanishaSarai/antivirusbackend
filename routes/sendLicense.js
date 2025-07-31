// // routes/sendLicense.js

// const express = require("express");
// const router = express.Router();
// const nodemailer = require("nodemailer");
// const License = require("../models/License"); // Correct path to model

// // Import only the functions you need from the main server file for now
// const { validateUserIdDirectAndUnused, generateUniqueLicenseKey, markUserIdAsUsed } = require("../server.js");

// router.post("/", async (req, res) => {
//   console.log(`📧 /send-license route called`);
//   const { email, userId, name, phoneNumber } = req.body;

//   if (!email || !userId || !name || !phoneNumber) {
//     return res.status(400).json({ status: "ERROR", message: "All fields are required." });
//   }

//   // 1. Validate the User ID
//   const validation = validateUserIdDirectAndUnused(userId);
//   if (!validation.valid) {
//     console.log(`❌ User ID validation failed: ${validation.message}`);
//     return res.status(400).json({ status: "ERROR", message: validation.message });
//   }
//   console.log(`✅ User ID '${userId}' is valid and unused.`);

//   // 2. Prepare the complete license data
//   const newLicenseKey = generateUniqueLicenseKey();
//   const licenseData = { email, userId, name, phoneNumber, licenseKey: newLicenseKey, status: "ASSIGNED" };

//   try {
//     // 3. Save the complete data to MongoDB
//     const newLicense = new License(licenseData);
//     await newLicense.save();
//     console.log(`✅ Saved license ${newLicenseKey} to MongoDB with all details.`);
//   } catch (dbError) {
//     console.error("❌ Error saving license to MongoDB:", dbError);
//     return res.status(500).json({ status: "ERROR", message: "Failed to save license to the database." });
//   }
  
//   // 4. Send the confirmation email
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//   });
  
//   const mailOptions = {
//     from: `"V-Nashak Security" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Your V-Nashak License Key 🔐",
//     html: `<p>Hello ${name},</p><p>Your User ID <strong>${userId}</strong> has been validated. Here is your license key:</p><h2 style="text-align:center;">${newLicenseKey}</h2>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Email sent successfully to ${email}`);
//     markUserIdAsUsed(userId);
//     res.json({ status: "SUCCESS", message: "User ID validated and license key sent!" });
//   } catch (emailError) {
//     console.error("❌ Failed to send email:", emailError);
//     res.status(500).json({ status: "ERROR", message: "Server failed to send the license key email." });
//   }
// });

// module.exports = router;


// routes/sendLicense.js

// routes/sendLicense.js

const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const License = require("../models/License"); // Correct path to model

// Import functions from the utility file
const { validateUserIdDirectAndUnused, generateUniqueLicenseKey, markUserIdAsUsed } = require("../utils/licenseUtils");

// Test endpoint to check all licenses in database
router.get("/test", async (req, res) => {
  try {
    const allLicenses = await License.find({});
    res.json({
      status: "SUCCESS",
      count: allLicenses.length,
      licenses: allLicenses
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message
    });
  }
});

router.post("/", async (req, res) => {
  console.log(`📧 /send-license route called`);
  const { email, userId, name, phoneNumber } = req.body;

  if (!email || !userId || !name || !phoneNumber) {
    return res.status(400).json({ status: "ERROR", message: "All fields are required." });
  }

  // 1. Validate the User ID
  const validation = validateUserIdDirectAndUnused(userId);
  if (!validation.valid) {
    console.log(`❌ User ID validation failed: ${validation.message}`);
    return res.status(400).json({ status: "ERROR", message: validation.message });
  }
  console.log(`✅ User ID '${userId}' is valid and unused.`);

  // 2. Prepare the complete license data
  const newLicenseKey = generateUniqueLicenseKey();
  const licenseData = { email, userId, name, phoneNumber, licenseKey: newLicenseKey, status: "ASSIGNED" };

  try {
    // 3. Save the complete data to MongoDB
    const newLicense = new License(licenseData);
    await newLicense.save();
    console.log(`✅ Saved license ${newLicenseKey} to MongoDB with all details.`);
    
    // Log the saved data for debugging
    console.log("🔍 Saved license data:", JSON.stringify(newLicense.toObject(), null, 2));
  } catch (dbError) {
    console.error("❌ Error saving license to MongoDB:", dbError);
    return res.status(500).json({ status: "ERROR", message: "Failed to save license to the database." });
  }
  
  // 4. Send the confirmation email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  
  const mailOptions = {
    from: `"V-Nashak Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your V-Nashak License Key 🔐",
    html: `<p>Hello ${name},</p><p>Your User ID <strong>${userId}</strong> has been validated. Here is your license key:</p><h2 style="text-align:center;">${newLicenseKey}</h2>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email}`);
    markUserIdAsUsed(userId);
    res.json({ status: "SUCCESS", message: "User ID validated and license key sent!" });
  } catch (emailError) {
    console.error("❌ Failed to send email:", emailError);
    res.status(500).json({ status: "ERROR", message: "Server failed to send the license key email." });
  }
});

module.exports = router;