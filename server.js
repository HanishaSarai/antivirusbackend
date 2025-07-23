const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const License = require("./models/License");
const getMachineId = () => "DUMMY-MACHINE-ID-V0-12345";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// ✅ License file fallback (optional)
let licenseDatabase = new Map();
const DB_FILE = path.join(__dirname, "licenses.json");

function loadLicenses() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      licenseDatabase = new Map(JSON.parse(data));
      console.log(`Loaded ${licenseDatabase.size} licenses from file`);
    } catch (error) {
      console.error("Error loading licenses from file:", error);
    }
  }
}

function saveLicenses() {
  try {
    const data = JSON.stringify(Array.from(licenseDatabase.entries()), null, 2);
    fs.writeFileSync(DB_FILE, data, "utf8");
    console.log("✅ Licenses saved to file");
  } catch (error) {
    console.error("Error saving licenses to file:", error);
  }
}

// ✅ Generate key
function generateLicenseKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 14; i++) {
    if (i === 4 || i === 9) key += "-";
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// ✅ Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ /send-license endpoint
app.post("/send-license", async (req, res) => {
  const { email } = req.body;
  const machineId = getMachineId();

  if (!email) return res.status(400).json({ message: "Email is required" });

  const licenseKey = generateLicenseKey();

  const htmlBody = `
    <div style="font-family:sans-serif;font-size:16px;">
      <h2 style="color:#0057b7;">Welcome to Virex Antivirus</h2>
      <p>Here is your license key:</p>
      <div style="background:#f3f3f3;padding:10px 15px;border-radius:5px;font-size:20px;">
        <strong>${licenseKey}</strong>
      </div>
      <p>This key is tied to your machine and email.</p>
      <p>Thanks, The Virex Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Virex Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Virex License Key 🔐",
      html: htmlBody
    });

    const newLicense = new License({ email, licenseKey, machineId });
    await newLicense.save();

    console.log(`✅ License saved for ${email}: ${licenseKey}`);
    res.json({ status: "SUCCESS", message: "License sent and saved." });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ status: "ERROR", message: "Failed to send or save license." });
  }
});

// ✅ /validate-license-machine endpoint
app.post("/validate-license-machine", async (req, res) => {
  const { email, licenseKey, machineId } = req.body;

  if (!email || !licenseKey || !machineId) {
    return res.status(400).json({ status: "ERROR", message: "Missing required fields." });
  }

  try {
    const license = await License.findOne({ email });

    if (!license) {
      return res.status(404).json({ status: "ERROR", message: "License not found." });
    }

    if (license.machineId !== machineId) {
      return res.json({ status: "ERROR", message: "License used on another device." });
    }

    if (license.licenseKey === licenseKey) {
      return res.json({ status: "ALREADY_ACTIVATED", message: "Already active on this device." });
    }

    license.licenseKey = licenseKey;
    license.machineId = machineId;
    await license.save();

    return res.json({ status: "VALID", message: "License validated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "ERROR", message: "Validation failed." });
  }
});

// ✅ Start server
loadLicenses();
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
