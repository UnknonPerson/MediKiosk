import mongoose from "mongoose";

const INTAKE_TYPES = [
  "MODERN",
  "AYUSH",
];

const INTAKE_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
];

const QUESTION_ANSWER_TYPES = [
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "DATE",
];

const INTAKE_SECTIONS = [
  "CHIEF_COMPLAINT",
  "SYMPTOM_HISTORY",
  "SEVERITY",
  "ASSOCIATED_SYMPTOMS",
  "MEDICAL_HISTORY",
  "MEDICATIONS",
  "ALLERGIES",
  "LIFESTYLE",
  "CURRENT_COMPLAINT",
  "DIGESTION",
  "APPETITE",
  "SLEEP",
  "BOWEL_HABITS",
  "AYUSH_OBSERVATIONS",
];

/**
 * Stores a permanently answered intake question.
 *
 * This is the chronological interview history and can
 * later be used for summaries, timeline generation,
 * doctor review, and safety checks.
 */
const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      match: /^[A-Za-z][A-Za-z0-9_-]{2,99}$/,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      enum: INTAKE_SECTIONS,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    answerType: {
      type: String,
      required: true,
      enum: QUESTION_ANSWER_TYPES,
      trim: true,
      maxlength: 50,
    },

    answer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/**
 * Stores the exact question currently active
 * in the intake flow.
 *
 * The backend generates and validates this question.
 * The frontend only displays it and submits an answer.
 */
const currentQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      match: /^[A-Za-z][A-Za-z0-9_-]{2,99}$/,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      enum: INTAKE_SECTIONS,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    answerType: {
      type: String,
      required: true,
      enum: QUESTION_ANSWER_TYPES,
      trim: true,
      maxlength: 50,
    },

    options: {
      type: [String],
      default: null,
    },

    required: {
      type: Boolean,
      default: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/**
 * Stores AYUSH-specific structured information.
 *
 * The exact parameters can vary depending on the
 * AYUSH system and dynamic intake questions.
 */
const ayushDataSchema = new mongoose.Schema(
  {
    system: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },

    parameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false,
  }
);

/**
 * Main Intake schema.
 */
const intakeSchema = new mongoose.Schema(
  {
    /**
     * One intake belongs to exactly one consultation.
     */
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
      unique: true,
    },

    /**
     * Patient who owns this intake.
     */
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    /**
     * Derived from consultation.healthcareSystem.
     *
     * The client must not control this value.
     */
    intakeType: {
      type: String,
      enum: INTAKE_TYPES,
      required: true,
    },

    /**
     * Overall intake lifecycle.
     */
    status: {
      type: String,
      enum: INTAKE_STATUSES,
      default: "NOT_STARTED",
      required: true,
      index: true,
    },

    /**
     * Current section being processed.
     */
    currentSection: {
      type: String,
      default: "CHIEF_COMPLAINT",
      required: true,
      trim: true,
      maxlength: 100,
    },

    /**
     * Backend-controlled active question.
     *
     * This becomes null after the patient submits
     * a valid answer.
     */
    currentQuestion: {
      type: currentQuestionSchema,
      default: null,
    },

    /**
     * Immutable chronological interview history.
     */
    answers: {
      type: [answerSchema],
      default: [],
    },

    /**
     * Normalized structured clinical information.
     *
     * answers[]:
     *   Complete interview history.
     *
     * structuredData:
     *   Data organized for downstream processing such as
     *   summaries, timeline generation, and safety checks.
     */
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /**
     * AYUSH-specific structured information.
     *
     * Null for MODERN consultations unless explicitly needed.
     */
    ayushData: {
      type: ayushDataSchema,
      default: null,
    },

    /**
     * When the intake started.
     */
    startedAt: {
      type: Date,
      default: null,
    },

    /**
     * When the intake was completed.
     */
    completedAt: {
      type: Date,
      default: null,
    },

    /**
     * Soft deletion flag.
     */
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

/**
 * Useful for retrieving a patient's intake history.
 */
intakeSchema.index({
  patientId: 1,
  createdAt: -1,
});

/**
 * Hide internal fields from API responses.
 */
intakeSchema.set("toJSON", {
  transform(document, returnedObject) {
    delete returnedObject.isDeleted;

    return returnedObject;
  },
});

const Intake = mongoose.model(
  "Intake",
  intakeSchema
);

export {
  INTAKE_TYPES,
  INTAKE_STATUSES,
};

export default Intake;
