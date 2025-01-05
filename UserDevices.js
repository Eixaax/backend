const mongoose = require('mongoose');

const UserDevicesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: String, required: true },
});

const UserDevices = mongoose.model('UserDevices', UserDevicesSchema);

module.exports = UserDevices;
