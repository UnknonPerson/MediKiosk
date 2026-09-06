import mongoose from 'mongoose';

export const DOCTOR_GENDERS = Object.freeze([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]);

export const DOCTOR_VERIFICATION_STATUSES = Object.freeze([
  'DRAFT',
  'UNDER_REVIEW',
  'VERIFIED',
  'REJECTED',
]);

export const DOCTOR_DOCUMENT_TYPES = Object.freeze([
  'MEDICAL_REGISTRATION',
  'DEGREE_CERTIFICATE',
  'IDENTITY_DOCUMENT',
  'OTHER_PROFESSIONAL_DOCUMENT',
]);

export const CONSULTATION_LANGUAGES = Object.freeze([
  'ENGLISH',
  'HINDI',
  'BENGALI',
  'TELUGU',
  'MARATHI',
  'TAMIL',
  'URDU',
  'GUJARATI',
  'KANNADA',
  'ODIA',
  'MALAYALAM',
  'PUNJABI',
  'ASSAMESE',
  'SANSKRIT',
  'KASHMIRI',
  'NEPALI',
  'KONKANI',
  'MANIPURI',
  'SINDHI',
  'BODO',
  'DOGRI',
  'MAITHILI',
  'SANTALI',
]);

const currentYear = new Date().getUTCFullYear();

const profilePhotoSchema = new mongoose.Schema({
  secureUrl: {
    type: String,
    trim: true,
  },
  publicId: {
    type: String,
    trim: true,
  },
  resourceType: {
    type: String,
    enum: ['image', 'raw'],
  },
}, { _id: false });

const professionalRegistrationSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 80,
  },
  registrationAuthority: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 120,
  },
  state: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 80,
  },
  registrationYear: {
    type: Number,
    min: 1900,
    max: currentYear,
  },
}, { _id: false });

const qualificationSchema = new mongoose.Schema({
  degree: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 120,
  },
  institution: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 160,
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: currentYear,
  },
}, { _id: false });

const professionalDocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: DOCTOR_DOCUMENT_TYPES,
    required: true,
  },
  secureUrl: {
    type: String,
    trim: true,
    required: true,
  },
  publicId: {
    type: String,
    trim: true,
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['image', 'raw'],
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, { _id: false });

const verificationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: DOCTOR_VERIFICATION_STATUSES,
    required: true,
    default: 'DRAFT',
    index: true,
  },
  submittedAt: Date,
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, { _id: false });

const doctorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  fullName: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 120,
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: (value) => !value || value <= new Date(),
      message: 'Date of birth cannot be in the future',
    },
  },
  gender: {
    type: String,
    enum: DOCTOR_GENDERS,
  },
  profilePhoto: profilePhotoSchema,
  professionalRegistration: professionalRegistrationSchema,
  specialization: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 120,
  },
  qualifications: {
    type: [qualificationSchema],
    default: [],
  },
  experienceYears: {
    type: Number,
    min: 0,
    max: 80,
  },
  consultationLanguages: {
    type: [{
      type: String,
      enum: CONSULTATION_LANGUAGES,
    }],
    default: [],
  },
  professionalDocuments: {
    type: [professionalDocumentSchema],
    default: [],
  },
  verification: {
    type: verificationSchema,
    default: () => ({}),
  },
  profileCompleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_document, result) => {
      delete result.__v;
      return result;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_document, result) => {
      delete result.__v;
      return result;
    },
  },
});

doctorProfileSchema.index({ 'verification.status': 1 }, { name: 'doctor_verification_status' });

const DoctorProfile = mongoose.models.DoctorProfile
  || mongoose.model('DoctorProfile', doctorProfileSchema);

export default DoctorProfile;
