<<<<<<< HEAD
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const nodemailer = require("nodemailer")
const { spawn } = require("child_process")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Add CORS headers for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")

  if (req.method === "OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📨 Body:`, req.body)
  }
  next()
})

// Connect to MongoDB (optional)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err))
} else {
  console.log("📝 MongoDB not configured, using file-based storage")
}

// licenseDatabase will now store licenseKey -> { email, userId, name, phoneNumber, machineId, status }
let licenseDatabase = new Map()
const DB_FILE = path.join(__dirname, "licenses.json")
// ADD THESE TWO LINES
let usedUserIds = new Set(); // In-memory set for fast lookups
const USED_IDS_FILE = path.join(__dirname, "used-user-ids.json"); // File for persistent storage

// Path to your C++ scanner executable
const scannerExe = process.platform === "win32" ? "scanner.exe" : "scanner"
const scannerPath = path.join(__dirname, scannerExe)

console.log(`🔍 Scanner path: ${scannerPath}`)
console.log(`🔍 Scanner exists: ${fs.existsSync(scannerPath)}`)

// Load licenses from file
function loadLicenses() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8")
      const parsedData = JSON.parse(data)
      licenseDatabase = new Map(parsedData)
      console.log(`✅ Loaded ${licenseDatabase.size} licenses from ${DB_FILE}`)
    } catch (error) {
      console.error("❌ Error loading licenses:", error)
=======
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
>>>>>>> 3c5c441519c0f9dd78e5b0a16f69bb52632960c5
    }
  } else {
    console.log(`📝 Creating new license database at ${DB_FILE}`)
  }
}

function saveLicenses() {
  try {
<<<<<<< HEAD
    const data = JSON.stringify(Array.from(licenseDatabase.entries()), null, 2)
    fs.writeFileSync(DB_FILE, data, "utf8")
    console.log(`✅ Saved ${licenseDatabase.size} licenses to ${DB_FILE}`)
  } catch (error) {
    console.error("❌ Error saving licenses:", error)
  }
}

/**
 * Generates a unique 14-character license key in the format XXXX-XXXX-XXXX.
 */
function generateUniqueLicenseKey() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase()
  let key
  do {
    key = `${segment()}-${segment()}-${segment()}`
  } while (licenseDatabase.has(key))
  return key
}

/**
 * SIMPLIFIED: Validates User ID directly (fallback if C++ scanner not available)
 */
function validateUserIdDirect(userId) {
  const validUserIds = ["user_01", "user_08", "user_09", "user_15", "user_18", "user_20", "user_22"]
  return validUserIds.includes(userId)
}

// Checks if a User ID is in the list of valid IDs
function isUserIdValid(userId) {
  const validUserIds = ["user_01", "user_08", "user_09", "user_15", "user_18", "user_20", "user_22"];
  return validUserIds.includes(userId);
}

// Checks if a User ID has already been used
function isUserIdAlreadyUsed(userId) {
  return usedUserIds.has(userId);
}

// Adds a User ID to the used list and saves it to the file
function markUserIdAsUsed(userId) {
  usedUserIds.add(userId);
  const data = JSON.stringify(Array.from(usedUserIds), null, 2);
  fs.writeFileSync(USED_IDS_FILE, data, "utf8");
  console.log(`✅ Marked User ID '${userId}' as used.`);
}

// This new function checks both validity AND usage
function validateUserIdDirectAndUnused(userId) {
  if (!isUserIdValid(userId)) {
    return { valid: false, message: `User ID '${userId}' is not a valid ID.` };
  }
  if (isUserIdAlreadyUsed(userId)) {
    return { valid: false, message: `User ID '${userId}' has already been used.` };
  }
  return { valid: true };
}



/**
 * Validates User ID with C++ backend (with fallback)
 */
function validateUserIdWithCppBackend(userId) {
  return new Promise((resolve) => {
    console.log(`🔍 Validating User ID: ${userId}`)

    // Check if scanner exists
    if (!fs.existsSync(scannerPath)) {
      console.warn(`⚠️ Scanner not found at ${scannerPath}, using direct validation`)
      resolve(validateUserIdDirect(userId))
      return
    }

    console.log(`🚀 Starting C++ scanner for User ID validation`)

    const proc = spawn(scannerPath, [], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    let output = ""
    let validationResult = false
    let hasResult = false

    proc.stdout.on("data", (data) => {
      const dataStr = data.toString()
      output += dataStr
      console.log(`C++ stdout: ${dataStr.trim()}`)

      const lines = dataStr.split("\n")
      for (const line of lines) {
        if (line.includes("SUCCESS:User ID validated")) {
          validationResult = true
          hasResult = true
        } else if (line.includes("ERROR:User ID") && line.includes("not valid")) {
          validationResult = false
          hasResult = true
        }
      }
    })

    proc.stderr.on("data", (data) => {
      console.error(`C++ stderr: ${data}`)
    })

    proc.on("close", (code) => {
      console.log(`🔚 C++ validation process exited with code ${code}`)
      if (!hasResult) {
        console.warn(`⚠️ No validation result from C++, using direct validation`)
        resolve(validateUserIdDirect(userId))
      } else {
        resolve(validationResult)
      }
    })

    proc.on("error", (error) => {
      console.error(`❌ Failed to start C++ process: ${error}`)
      console.warn(`⚠️ Falling back to direct validation`)
      resolve(validateUserIdDirect(userId))
    })

    // Send validation command to C++ backend
    try {
      proc.stdin.write(`validate-userid ${userId}\n`)
      proc.stdin.end()
    } catch (error) {
      console.error(`❌ Failed to write to C++ process: ${error}`)
      resolve(validateUserIdDirect(userId))
    }

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!proc.killed) {
        console.warn(`⏰ C++ validation timeout, killing process`)
        proc.kill()
        if (!hasResult) {
          resolve(validateUserIdDirect(userId))
        }
      }
    }, 10000)
  })
}

// Test endpoint
app.get("/", (req, res) => {
  res.json({
    status: "SUCCESS",
    message: "V-Nashak License Server is running",
    timestamp: new Date().toISOString(),
    endpoints: ["/send-license", "/activate-license", "/test-userid"],
    emailConfigured: !!process.env.EMAIL_USER,
  })
})

// Test endpoint for User ID validation
app.post("/test-userid", async (req, res) => {
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({
      status: "ERROR",
      message: "userId is required",
    })
  }

  try {
    const isValid = await validateUserIdWithCppBackend(userId)
    res.json({
      status: "SUCCESS",
      userId: userId,
      isValid: isValid,
      message: isValid ? "User ID is valid" : "User ID is not valid",
    })
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    })
  }
})

// ENHANCED: Endpoint to validate User ID and send license key
// REPLACE your existing /send-license route with this one
app.post("/send-license", async (req, res) => {
  console.log(`📧 /send-license endpoint called`);
  const { email, userId, name, phoneNumber } = req.body;

  if (!email || !userId || !name || !phoneNumber) {
    return res.status(400).json({ status: "ERROR", message: "All fields are required." });
  }

  // STEP 1: Validate User ID for validity AND one-time use
  const validation = validateUserIdDirectAndUnused(userId);
  if (!validation.valid) {
    console.log(`❌ User ID validation failed: ${validation.message}`);
    return res.status(400).json({ status: "ERROR", message: validation.message });
  }

  console.log(`✅ User ID '${userId}' is valid and unused.`);
  
  // Steps 2, 3, and 4 proceed only if validation passes
  const newLicenseKey = generateUniqueLicenseKey();
  licenseDatabase.set(newLicenseKey, { email, userId, name, phoneNumber, status: "ASSIGNED" });
  saveLicenses();

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`⚠️ Email credentials not configured.`);
    markUserIdAsUsed(userId); // Mark as used even if email fails
    return res.json({
      status: "SUCCESS",
      message: "User ID validated, but email is not configured on the server.",
      licenseKey: newLicenseKey,
    });
  }

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
    // IMPORTANT: Mark the User ID as used ONLY after the email is sent successfully
    markUserIdAsUsed(userId);
    res.json({ status: "SUCCESS", message: "User ID validated and license key sent to your email!" });
  } catch (emailError) {
    console.error("❌ Failed to send email:", emailError);
    res.status(500).json({ status: "ERROR", message: "Server failed to send the license key email." });
  }
});

// License activation endpoint
app.post("/activate-license", async (req, res) => {
  console.log(`🔐 /activate-license endpoint called`)
  console.log(`🔐 Request body:`, req.body)

  const { email, licenseKey, machineId } = req.body

  if (!email || !licenseKey || !machineId) {
    return res.status(400).json({
      status: "ERROR",
      message: "Email, licenseKey, and machineId are required.",
    })
  }

  console.log(`🔐 Activating license: Email=${email}, Key=${licenseKey}, MachineId=${machineId}`)

  const stored = licenseDatabase.get(licenseKey)
  if (!stored) {
    return res.json({
      status: "ERROR",
      message: "Invalid license key.",
    })
  }

  if (stored.email !== email) {
    return res.json({
      status: "ERROR",
      message: "This license key is not valid for this email address.",
    })
  }

  if (stored.status === "ACTIVATED") {
    if (stored.machineId === machineId) {
      console.log(`✅ License already active for ${email} on ${machineId}`)
      return res.json({
        status: "ALREADY_ACTIVATED",
        message: "This license is already active on this device.",
      })
    } else {
      return res.json({
        status: "ERROR",
        message: "This license key is already activated on a different machine.",
      })
=======
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
>>>>>>> 3c5c441519c0f9dd78e5b0a16f69bb52632960c5
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
<<<<<<< HEAD

  licenseDatabase.set(licenseKey, {
    ...stored,
    machineId,
    status: "ACTIVATED",
    activatedAt: new Date().toISOString(),
  })
  saveLicenses()

  console.log(`✅ License ${licenseKey} activated for ${email} on ${machineId}`)
  res.json({
    status: "VALID",
    message: "License activated successfully.",
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Server error:", error)
  res.status(500).json({
    status: "ERROR",
    message: "Internal server error",
    error: error.message,
  })
})

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`)
  res.status(404).json({
    status: "ERROR",
    message: `Route not found: ${req.method} ${req.url}`,
    availableRoutes: ["/", "/send-license", "/activate-license", "/test-userid"],
  })
})

// Start server
loadLicenses()

app.listen(PORT, () => {
   // Load the used user IDs from the file when the server starts
  if (fs.existsSync(USED_IDS_FILE)) {
    const data = fs.readFileSync(USED_IDS_FILE, "utf8");
    usedUserIds = new Set(JSON.parse(data));
    console.log(`✅ Loaded ${usedUserIds.size} used User IDs.`);
  }

  // console.log(`✅ V-Nashak License Server running on http://localhost:${PORT}`);
  console.log(`✅ V-Nashak License Server running on http://localhost:${PORT}`)
  console.log(`🔍 Scanner path: ${scannerPath}`)
  console.log(`🔍 Scanner exists: ${fs.existsSync(scannerPath)}`)
  console.log(`📧 Email configured: ${!!process.env.EMAIL_USER}`)
  console.log(`📧 Email user: ${process.env.EMAIL_USER || "Not configured"}`)
  console.log(`📝 Available endpoints:`)
  console.log(`   GET  / - Server status`)
  console.log(`   POST /send-license - Validate User ID and send license`)
  console.log(`   POST /activate-license - Activate license key`)
  console.log(`   POST /test-userid - Test User ID validation`)
})

=======
});

// ✅ Start server
loadLicenses();
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
>>>>>>> 3c5c441519c0f9dd78e5b0a16f69bb52632960c5
