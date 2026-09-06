import mongoose from 'mongoose';

export const PATIENT_GENDERS = Object.freeze([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]);

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 120,
  },
  phone: {
    type: String,
    trim: true,
    match: /^\+91[6-9]\d{9}$/,
  },
  relationship: {
    type: String,
    trim: true,
    maxlength: 80,
  },
}, { _id: false });

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

const patientProfileSchema = new mongoose.Schema({
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
    enum: PATIENT_GENDERS,
  },
  address: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  emergencyContact: emergencyContactSchema,
  profilePhoto: profilePhotoSchema,
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

const PatientProfile = mongoose.models.PatientProfile
  || mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;
