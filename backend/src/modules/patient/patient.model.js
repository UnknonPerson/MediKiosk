import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
      default: "PREFER_NOT_TO_SAY",
    },

    preferredLanguage: {
      type: String,
      default: "en",
      trim: true,
      maxlength: 50,
    },

    consent: {
      medicalDataProcessing: {
        type: Boolean,
        default: false,
      },

      documentProcessing: {
        type: Boolean,
        default: false,
      },

      aiProcessing: {
        type: Boolean,
        default: false,
      },

      consentUpdatedAt: {
        type: Date,
        default: null,
      },
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

patientSchema.set("toJSON", {
  transform(document, returnedObject) {
    delete returnedObject.isDeleted;

    return returnedObject;
  },
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;