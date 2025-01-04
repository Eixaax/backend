const mongoose = require('mongoose');

const audioRecordingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'UserInfo' },
    fileName: { type: String, required: true },
    audioData: { type: Buffer, required: true }, // Store audio as binary data
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

const AudioRecordings = mongoose.model('AudioRecordings', audioRecordingSchema);

module.exports = AudioRecordings; // Export the model for use in other files