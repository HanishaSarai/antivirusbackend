// const fs = require("fs");
// const path = require("path");

// // Global variables for license management
// let licenseDatabase = new Map();
// const DB_FILE = path.join(__dirname, "..", "licenses.json");
// let usedUserIds = new Set();
// const USED_IDS_FILE = path.join(__dirname, "..", "used-user-ids.json");
// let validUserIds = new Set();
// const VALID_IDS_FILE = path.join(__dirname, "..", "user_ids.json");

// // Load licenses from file
// function loadLicenses() {
//   if (fs.existsSync(DB_FILE)) {
//     try {
//       const data = fs.readFileSync(DB_FILE, "utf8");
//       const parsedData = JSON.parse(data);
//       licenseDatabase = new Map(parsedData);
//       console.log(`✅ Loaded ${licenseDatabase.size} licenses from ${DB_FILE}`);
//     } catch (error) {
//       console.error("❌ Error loading licenses:", error);
//     }
//   } else {
//     console.log(`📝 Creating new license database at ${DB_FILE}`);
//   }
// }

// // Save licenses to file
// function saveLicenses() {
//   try {
//     const data = JSON.stringify(Array.from(licenseDatabase.entries()), null, 2);
//     fs.writeFileSync(DB_FILE, data, "utf8");
//     console.log(`✅ Saved ${licenseDatabase.size} licenses to ${DB_FILE}`);
//   } catch (error) {
//     console.error("❌ Error saving licenses:", error);
//   }
// }

// /**
//  * Generates a unique 14-character license key in the format XXXX-XXXX-XXXX.
//  */
// function generateUniqueLicenseKey() {
//   const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
//   let key;
//   do {
//     key = `${segment()}-${segment()}-${segment()}`;
//   } while (licenseDatabase.has(key));
//   return key;
// }

// // Function to load user IDs from the external JSON file
// function loadValidUserIds() {
//   try {
//     if (fs.existsSync(VALID_IDS_FILE)) {
//       const data = fs.readFileSync(VALID_IDS_FILE, "utf8");
//       const idsArray = JSON.parse(data);
//       validUserIds = new Set(idsArray);
//       console.log(`✅ Loaded ${validUserIds.size} valid User IDs from ${VALID_IDS_FILE}`);
//     } else {
//       console.error(`❌ CRITICAL: User ID file not found at ${VALID_IDS_FILE}`);
//       // Create an empty file to prevent crashes
//       fs.writeFileSync(VALID_IDS_FILE, "[]", "utf8");
//     }
//   } catch (error) {
//     console.error(`❌ Error loading or parsing user IDs from ${VALID_IDS_FILE}:`, error);
//   }
// }

// // Checks if a User ID is in the list of valid IDs
// function isUserIdValid(userId) {
//   return validUserIds.has(userId);
// }

// // Checks if a User ID has already been used
// function isUserIdAlreadyUsed(userId) {
//   return usedUserIds.has(userId);
// }

// // Adds a User ID to the used list and saves it to the file
// function markUserIdAsUsed(userId) {
//   usedUserIds.add(userId);
//   const data = JSON.stringify(Array.from(usedUserIds), null, 2);
//   fs.writeFileSync(USED_IDS_FILE, data, "utf8");
//   console.log(`✅ Marked User ID '${userId}' as used.`);
// }

// // This new function checks both validity AND usage
// function validateUserIdDirectAndUnused(userId) {
//   if (!isUserIdValid(userId)) {
//     return { valid: false, message: `User ID '${userId}' is not a valid ID.` };
//   }
//   if (isUserIdAlreadyUsed(userId)) {
//     return { valid: false, message: `User ID '${userId}' has already been used.` };
//   }
//   return { valid: true };
// }

// // Initialize data on module load
// loadLicenses();
// loadValidUserIds();

// // Load used user IDs from file
// if (fs.existsSync(USED_IDS_FILE)) {
//   try {
//     const data = fs.readFileSync(USED_IDS_FILE, "utf8");
//     usedUserIds = new Set(JSON.parse(data));
//     console.log(`✅ Loaded ${usedUserIds.size} used User IDs.`);
//   } catch (e) {
//     console.error("❌ Failed to parse used-user-ids.json, starting fresh.", e);
//     usedUserIds = new Set();
//   }
// }

// module.exports = {
//   generateUniqueLicenseKey,
//   validateUserIdDirectAndUnused,
//   markUserIdAsUsed,
//   loadLicenses,
//   saveLicenses,
//   loadValidUserIds
// }; 


const fs = require("fs");
const path = require("path");

// Global variables for license management
let licenseDatabase = new Map();
const DB_FILE = path.join(__dirname, "..", "licenses.json");
let usedUserIds = new Set();
const USED_IDS_FILE = path.join(__dirname, "..", "used-user-ids.json");
let validUserIds = new Set();
const VALID_IDS_FILE = path.join(__dirname, "..", "user_ids.json");

// Load licenses from file
function loadLicenses() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      const parsedData = JSON.parse(data);
      licenseDatabase = new Map(parsedData);
      console.log(`✅ Loaded ${licenseDatabase.size} licenses from ${DB_FILE}`);
    } catch (error) {
      console.error("❌ Error loading licenses:", error);
    }
  } else {
    console.log(`📝 Creating new license database at ${DB_FILE}`);
  }
}

// Save licenses to file
function saveLicenses() {
  try {
    const data = JSON.stringify(Array.from(licenseDatabase.entries()), null, 2);
    fs.writeFileSync(DB_FILE, data, "utf8");
    console.log(`✅ Saved ${licenseDatabase.size} licenses to ${DB_FILE}`);
  } catch (error) {
    console.error("❌ Error saving licenses:", error);
  }
}

/**
 * Generates a unique 14-character license key in the format XXXX-XXXX-XXXX.
 */
function generateUniqueLicenseKey() {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  let key;
  do {
    key = `${segment()}-${segment()}-${segment()}`;
  } while (licenseDatabase.has(key));
  return key;
}

// Function to load user IDs from the external JSON file
function loadValidUserIds() {
  try {
    if (fs.existsSync(VALID_IDS_FILE)) {
      const data = fs.readFileSync(VALID_IDS_FILE, "utf8");
      const idsArray = JSON.parse(data);
      validUserIds = new Set(idsArray);
      console.log(`✅ Loaded ${validUserIds.size} valid User IDs from ${VALID_IDS_FILE}`);
    } else {
      console.error(`❌ CRITICAL: User ID file not found at ${VALID_IDS_FILE}`);
      // Create an empty file to prevent crashes
      fs.writeFileSync(VALID_IDS_FILE, "[]", "utf8");
    }
  } catch (error) {
    console.error(`❌ Error loading or parsing user IDs from ${VALID_IDS_FILE}:`, error);
  }
}

// Checks if a User ID is in the list of valid IDs
function isUserIdValid(userId) {
  return validUserIds.has(userId);
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

// Initialize data on module load
loadLicenses();
loadValidUserIds();

// Load used user IDs from file
if (fs.existsSync(USED_IDS_FILE)) {
  try {
    const data = fs.readFileSync(USED_IDS_FILE, "utf8");
    usedUserIds = new Set(JSON.parse(data));
    console.log(`✅ Loaded ${usedUserIds.size} used User IDs.`);
  } catch (e) {
    console.error("❌ Failed to parse used-user-ids.json, starting fresh.", e);
    usedUserIds = new Set();
  }
}

module.exports = {
  generateUniqueLicenseKey,
  validateUserIdDirectAndUnused,
  markUserIdAsUsed,
  loadLicenses,
  saveLicenses,
  loadValidUserIds
}; 