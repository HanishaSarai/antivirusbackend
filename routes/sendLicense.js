const express = require("express")
const router = express.Router()
const nodemailer = require("nodemailer")
const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

// Path to your C++ scanner executable
const scannerExe = process.platform === "win32" ? "scanner.exe" : "scanner"
const scannerPath = path.join(__dirname, "..", scannerExe) // Assuming scanner is in root directory

/**
 * Generates a unique 14-character license key in the format XXXX-XXXX-XXXX.
 */
function generateUniqueLicenseKey() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${segment()}-${segment()}-${segment()}`
}

/**
 * SIMPLIFIED: Validates User ID directly (fallback if C++ scanner not available)
 */
function validateUserIdDirect(userId) {
  const validUserIds = ["final11", "admin123", "user456", "test123", "demo001"]
  return validUserIds.includes(userId)
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

    let validationResult = false
    let hasResult = false

    proc.stdout.on("data", (data) => {
      const dataStr = data.toString()
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

// UPDATED: Handle the new User ID validation and license generation
router.post("/", async (req, res) => {
  console.log(`📧 /send-license route called`)
  console.log(`📧 Request body:`, req.body)

  const { email, userId, name, phoneNumber } = req.body

  // Validate required fields
  if (!email || !userId || !name || !phoneNumber) {
    console.log(`❌ Missing required fields`)
    return res.status(400).json({
      status: "ERROR",
      message: "Email, userId, name, and phoneNumber are required.",
    })
  }

  console.log(`📧 Processing license request for: Email=${email}, UserId=${userId}, Name=${name}, Phone=${phoneNumber}`)

  try {
    // STEP 1: Validate User ID
    console.log(`🔍 Step 1: Validating User ID: ${userId}`)
    const isUserIdValid = await validateUserIdWithCppBackend(userId)

    if (!isUserIdValid) {
      console.log(`❌ User ID validation failed: ${userId}`)
      return res.json({
        status: "ERROR",
        message: `User ID '${userId}' is not valid. Please check your User ID and try again.`,
      })
    }

    console.log(`✅ Step 1 Complete: User ID validated successfully: ${userId}`)

    // STEP 2: Generate license key
    console.log(`🔑 Step 2: Generating license key`)
    const newLicenseKey = generateUniqueLicenseKey()
    console.log(`🔑 Generated license key: ${newLicenseKey}`)

    // STEP 3: Send email with license key
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn(`⚠️ Email credentials not configured, returning license key directly`)
      return res.json({
        status: "SUCCESS",
        message: `User ID validated and license key generated: ${newLicenseKey} (Email not configured)`,
        licenseKey: newLicenseKey, // Include for testing
      })
    }

    console.log(`📧 Step 3: Sending email to ${email}`)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const htmlContent = `
      <div style="font-family:sans-serif;font-size:16px;">
        <h2 style="color:#0057b7;">Welcome to V-Nashak Antivirus</h2>
        <p>Hello ${name},</p>
        <p>Your User ID <strong>${userId}</strong> has been validated successfully.</p>
        <p>Here is your license key:</p>
        <div style="background:#f3f3f3;padding:15px;border-radius:8px;font-size:24px;text-align:center;margin:20px 0;">
          <strong style="color:#0057b7;">${newLicenseKey}</strong>
        </div>
        <p>Use this key to activate your antivirus software.</p>
       
        <p>Thank you for choosing V-Nashak Security!</p>
        <p>Best regards,<br>The V-Nashak Team</p>
      </div>
    `

    const mailOptions = {
      from: `"V-Nashak Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your V-Nashak License Key 🔐",
      html: htmlContent,
    }

    try {
      const info = await transporter.sendMail(mailOptions)
      console.log("✅ Email sent successfully")
      console.log("✅ Message ID:", info.messageId)

      return res.status(200).json({
        status: "SUCCESS",
        message: "User ID validated and license key sent to your email successfully!",
        messageId: info.messageId,
      })
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError)

      // Enhanced error logging
      console.error("❌ Nodemailer configuration:", {
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.error("❌ Mail options:", mailOptions);

      return res.status(500).json({ // Changed to 500 for server-side error
        status: "ERROR",
        message: `Failed to send email: ${emailError.message}`, // Simplified message
      });
    }
  } catch (error) {
    console.error("❌ Error in send-license route:", error)
    return res.status(500).json({
      status: "ERROR",
      message: `Internal server error: ${error.message}`,
    })
  }
})

module.exports = router
