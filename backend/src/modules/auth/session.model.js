import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  refreshTokenHash: {
    type: String,
    required: true,
    unique: true,
    select: false,
    match: /^[a-f0-9]{64}$/,
  },
  deviceInfo: {
    type: String,
    trim: true,
    maxlength: 512,
  },
  ipAddress: {
    type: String,
    trim: true,
    maxlength: 45,
  },
  expiresAt: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value > new Date(),
      message: 'Session expiry must be in the future',
    },
  },
  revokedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: (_document, result) => {
      delete result.refreshTokenHash;
      delete result.__v;
      return result;
    },
  },
  toObject: {
    transform: (_document, result) => {
      delete result.refreshTokenHash;
      delete result.__v;
      return result;
    },
  },
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'session_expiry_ttl' });
sessionSchema.index({ userId: 1, revokedAt: 1 }, { name: 'user_active_sessions' });

sessionSchema.methods.isActive = function isActive(now = new Date()) {
  return !this.revokedAt && this.expiresAt > now;
};

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;
