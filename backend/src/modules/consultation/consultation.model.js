
import mongoose from "mongoose";

const CONSULTATION_SYSTEMS = [
  "MODERN",
  "AYUSH",
];

const CONSULTATION_STATUSES = [
  "CREATED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const safetyFlagSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    detectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    healthcareSystem: {
      type: String,
      enum: CONSULTATION_SYSTEMS,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: CONSULTATION_STATUSES,
      default: "CREATED",
      required: true,
      index: true,
    },

    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },

    intake: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    safetyFlags: {
      type: [safetyFlagSchema],
      default: [],
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

consultationSchema.index({
  patientId: 1,
  createdAt: -1,
});

consultationSchema.set("toJSON", {
  transform(document, returnedObject) {
    delete returnedObject.isDeleted;

    return returnedObject;
  },
});

const Consultation = mongoose.model(
  "Consultation",
  consultationSchema
);

export {
  CONSULTATION_SYSTEMS,
  CONSULTATION_STATUSES,
};

export default Consultation;