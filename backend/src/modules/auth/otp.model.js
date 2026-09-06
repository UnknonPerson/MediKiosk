import mongoose from 'mongoose';

export const OTP_PURPOSES = Object.freeze([
  'PATIENT_PHONE_LOGIN',
  'DOCTOR_PHONE_VERIFICATION',
  'HOSPITAL_PHONE_VERIFICATION',
  'ACCOUNT_RECOVERY',
]);

const otpRequestSchema = new mongoose.Schema({
  purpose: {
    type: String,
    enum: OTP_PURPOSES,
    required: true,
  },
  target: {
    type: String,
    required: true,
    trim: true,
    match: /^\+91[6-9]\d{9}$/,
  },
  otpHash: {
    type: String,
    required: true,
    select: false,
    match: /^[a-f0-9]{64}$/,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  maxAttempts: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  consumedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: true },
  toJSON: {
    transform: (_document, result) => {
      delete result.otpHash;
      delete result.__v;
      return result;
    },
  },
  toObject: {
    transform: (_document, result) => {
      delete result.otpHash;
      delete result.__v;
      return result;
    },
  },
});

otpRequestSchema.index({ purpose: 1, target: 1 }, { unique: true, name: 'unique_otp_purpose_target' });
otpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'otp_expiry_ttl' });

otpRequestSchema.methods.isUsable = function isUsable(now = new Date()) {
  return !this.consumedAt && this.expiresAt > now && this.attempts < this.maxAttempts;
};

const OtpRequest = mongoose.models.OtpRequest || mongoose.model('OtpRequest', otpRequestSchema);

export default OtpRequest;
