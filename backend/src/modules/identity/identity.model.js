import mongoose from 'mongoose';

export const IDENTITY_PROVIDERS = Object.freeze(['ABHA', 'AADHAAR']);

const identityDataSchema = new mongoose.Schema({
  abhaNumber: {
    type: String,
    trim: true,
    maxlength: 128,
  },
  abhaAddress: {
    type: String,
    trim: true,
    maxlength: 256,
  },
  maskedIdentifier: {
    type: String,
    trim: true,
    maxlength: 128,
  },
}, { _id: false });

const metadataSchema = new mongoose.Schema({
  verificationMode: {
    type: String,
    enum: ['MOCK', 'OFFICIAL'],
    required: true,
  },
}, { _id: false });

const identitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: IDENTITY_PROVIDERS,
    required: true,
  },
  // This is an HMAC-derived stable link key, never a raw Aadhaar or provider identifier.
  providerReferenceId: {
    type: String,
    required: true,
    select: false,
    match: /^[a-f0-9]{64}$/,
  },
  identityData: {
    type: identityDataSchema,
    default: () => ({}),
  },
  verified: {
    type: Boolean,
    required: true,
    default: true,
  },
  verifiedAt: {
    type: Date,
    required: true,
  },
  metadata: {
    type: metadataSchema,
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (_document, result) => {
      delete result.providerReferenceId;
      delete result.__v;
      return result;
    },
  },
  toObject: {
    transform: (_document, result) => {
      delete result.providerReferenceId;
      delete result.__v;
      return result;
    },
  },
});

identitySchema.index({ provider: 1, providerReferenceId: 1 }, {
  unique: true,
  name: 'unique_provider_identity_reference',
});
identitySchema.index({ userId: 1, provider: 1 }, {
  unique: true,
  name: 'unique_user_provider_identity',
});

identitySchema.methods.toSafeObject = function toSafeObject() {
  return {
    provider: this.provider,
    verified: this.verified,
    verifiedAt: this.verifiedAt,
  };
};

const Identity = mongoose.models.Identity || mongoose.model('Identity', identitySchema);

export default Identity;
