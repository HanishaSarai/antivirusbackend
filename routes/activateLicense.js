// // routes/activateLicense.js

// const express = require("express");
// const router = express.Router();
// const License = require("../models/License");

// router.post("/", async (req, res) => {
//   console.log(`🔐 /activate-license route called`);
//   const { email, licenseKey, machineId } = req.body;

//   // userId: { type: String, required: true },
//   // name: { type: String, required: true },
//   // phoneNumber: { type: String, required: true },
//   // status: { 
//   //   type: String, 
//   //   enum: ['ASSIGNED', 'ACTIVATED'], 
//   //   default: 'ASSIGNED' 
//   // },
//   // activatedAt

//   if (!email || !licenseKey || !machineId || !name || !userId || !phoneNumber || !status || !activatedAt ) {
//     return res.status(400).json({ status: "ERROR", message: "Email, licenseKey, and machineId name phoen and userid are required." });
//   }

//   try {
//     // Find the license that was assigned to this email with this key
//     const license = await License.findOne({ licenseKey: licenseKey, email: email });

//     if (!license) {
//       return res.status(404).json({ status: "ERROR", message: "License key not found or email does not match." });
//     }

//     if (license.status === 'ACTIVATED' && license.machineId !== machineId) {
//         return res.status(403).json({ status: "ERROR", message: "This license key is already activated on a different machine."});
//     }

//     // Update the existing license document
//     license.status = "ACTIVATED";
//     license.machineId = machineId;
//     license.activatedAt = new Date();
//     await license.save();
    
//     console.log(`✅ Activated license ${licenseKey} in MongoDB.`);
//     res.json({ status: "VALID", message: "License activated successfully." });

//   } catch (dbError) {
//     console.error("❌ Error activating license in MongoDB:", dbError);
//     return res.status(500).json({ status: "ERROR", message: "Database error during activation." });
//   }
// });

// module.exports = router;

// routes/activateLicense.js

// routes/activateLicense.js

const express = require("express");
const router = express.Router();
const License = require("../models/License");

router.post("/", async (req, res) => {
  console.log(`🔐 /activate-license route called`);
  const { email, licenseKey, machineId } = req.body;

  if (!email || !licenseKey || !machineId) {
    return res.status(400).json({ status: "ERROR", message: "Email, licenseKey, and machineId are required." });
  }

  try {
    // Find the license that was assigned to this email with this key
    const license = await License.findOne({ licenseKey: licenseKey, email: email });

    if (!license) {
      return res.status(404).json({ status: "ERROR", message: "License key not found or email does not match." });
    }

    if (license.status === 'ACTIVATED' && license.machineId !== machineId) {
        return res.status(403).json({ status: "ERROR", message: "This license key is already activated on a different machine."});
    }

    // Update the existing license document
    license.status = "ACTIVATED";
    license.machineId = machineId;
    license.activatedAt = new Date();
    await license.save();
    
    console.log(`✅ Activated license ${licenseKey} in MongoDB.`);
    res.json({ status: "VALID", message: "License activated successfully." });

  } catch (dbError) {
    console.error("❌ Error activating license in MongoDB:", dbError);
    return res.status(500).json({ status: "ERROR", message: "Database error during activation." });
  }
});

module.exports = router;