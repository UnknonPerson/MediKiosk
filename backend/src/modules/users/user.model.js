import mongoose from 'mongoose';

export const ACCOUNT_TYPES = Object.freeze([
  'PATIENT',
  'DOCTOR',
  'HOSPITAL_ADMIN',
  'HOSPITAL_STAFF',
  'SYSTEM_ADMIN',
]);

export const AUTHENTICATION_METHODS = Object.freeze([
  'PASSWORD',
  'PHONE_OTP',
  'ABHA',
  'AADHAAR_VERIFICATION',
]);

export const USER_STATUSES = Object.freeze([
  'PENDING',
  'UNDER_REVIEW',
  'ACTIVE',
  'REJECTED',
  'SUSPENDED',
]);

const emailSchema = new mongoose.Schema({
  value: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Email must be valid',
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: Date,
}, { _id: false });

const phoneSchema = new mongoose.Schema({
  value: {
    type: String,
    trim: true,
    validate: {
      validator: (value) => !value || /^\+[1-9]\d{7,14}$/.test(value),
      message: 'Phone number must use E.164 format',
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: Date,
}, { _id: false });

function validateVerificationMetadata() {
  if (this.verified && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }

  if (!this.verified && this.verifiedAt) {
    this.invalidate('verifiedAt', 'verifiedAt can only be set for a verified contact method');
  }

}

emailSchema.pre('validate', validateVerificationMetadata);
phoneSchema.pre('validate', validateVerificationMetadata);

const userSchema = new mongoose.Schema({
  accountType: {
    type: String,
    enum: ACCOUNT_TYPES,
    required: true,
    index: true,
  },
  email: emailSchema,
  phone: phoneSchema,
  passwordHash: {
    type: String,
    trim: true,
    minlength: 20,
    maxlength: 512,
    select: false,
  },
  authenticationMethods: {
    type: [{
      type: String,
      enum: AUTHENTICATION_METHODS,
    }],
    default: [],
  },
  status: {
    type: String,
    enum: USER_STATUSES,
    default: 'PENDING',
    required: true,
    index: true,
  },
  lastLogin: Date,
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_document, result) => {
      delete result.passwordHash;
      delete result.__v;
      return result;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_document, result) => {
      delete result.passwordHash;
      delete result.__v;
      return result;
    },
  },
});

userSchema.index({ 'email.value': 1 }, { unique: true, sparse: true, name: 'unique_email_value' });
userSchema.index({ 'phone.value': 1 }, { unique: true, sparse: true, name: 'unique_phone_value' });
userSchema.index({ accountType: 1, status: 1 }, { name: 'account_type_status' });

userSchema.methods.toSafeObject = function toSafeObject() {
  const safeUser = {
    id: this._id.toString(),
    accountType: this.accountType,
    status: this.status,
  };

  if (this.email?.value) {
    safeUser.email = {
      value: this.email.value,
      verified: this.email.verified,
      verifiedAt: this.email.verifiedAt,
    };
  }

  if (this.phone?.value) {
    safeUser.phone = {
      value: this.phone.value,
      verified: this.phone.verified,
      verifiedAt: this.phone.verifiedAt,
    };
  }

  return safeUser;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
