// backend/config/db.js

const mongoose = require('mongoose');
require('dotenv').config();

console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI); // Debug log

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Connection error:", err));
