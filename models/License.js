const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema({
  email: { type: String, required: true },
  licenseKey: { type: String, required: true, unique: true },
  machineId: { type: String, default: null },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['ASSIGNED', 'ACTIVATED'], 
    default: 'ASSIGNED' 
  },
  activatedAt: { type: Date }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("License", licenseSchema);