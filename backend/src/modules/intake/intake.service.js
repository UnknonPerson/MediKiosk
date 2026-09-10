import Intake from "./intake.model.js";

import Consultation from "../consultation/consultation.model.js";
import Patient from "../patient/patient.model.js";

import {
  generateNextQuestion,
} from "./engine/question.engine.js";
import {
  getNextRequiredSection,
  getRequiredSections,
  meetsCompletionRequirements,
} from "./engine/intake.engine.js";

import ApiError from "../../utils/ApiError.js";

const SAFE_QUESTION_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{2,99}$/;

/**
 * Find the patient profile belonging to an authenticated user.
 */
async function getPatientByUserId(userId) {
  const patient = await Patient.findOne({
    userId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient profile not found.");
  }

  return patient;
}

function requirePatientConsent(patient, consentField, message) {
  if (!patient.consent?.[consentField]) {
    throw new ApiError(403, message);
  }
}

/**
 * Find an intake and verify that it belongs to the authenticated patient.
 */
async function getOwnedIntake(userId, intakeId) {
  const patient = await getPatientByUserId(userId);

  const intake = await Intake.findOne({
    _id: intakeId,
    patientId: patient._id,
    isDeleted: false,
  });

  if (!intake) {
    throw new ApiError(404, "Intake not found.");
  }

  return { patient, intake };
}

function getPatientIntake(intake) {
  const response = intake.toObject();

  delete response.patientId;
  delete response.isDeleted;

  return response;
}

async function markConsultationCompleted(intake, completedAt) {
  const result = await Consultation.updateOne(
    {
      _id: intake.consultationId,
      patientId: intake.patientId,
      isDeleted: false,
      status: { $in: ["CREATED", "IN_PROGRESS"] },
    },
    {
      $set: {
        status: "COMPLETED",
        completedAt,
      },
    }
  );

  if (result.matchedCount === 0) {
    const consultation = await Consultation.findOne({
      _id: intake.consultationId,
      patientId: intake.patientId,
      isDeleted: false,
    }).select("status");

    if (!consultation || consultation.status !== "COMPLETED") {
      throw new ApiError(
        409,
        "Consultation can no longer be completed."
      );
    }
  }
}

async function completeIntakeIfEligible(intake) {
  if (!meetsCompletionRequirements(intake)) {
    return null;
  }

  const completedAt = new Date();
  const updatedIntake = await Intake.findOneAndUpdate(
    {
      _id: intake._id,
      patientId: intake.patientId,
      isDeleted: false,
      status: { $ne: "COMPLETED" },
      currentQuestion: null,
    },
    {
      $set: {
        status: "COMPLETED",
        completedAt,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (updatedIntake) {
    await markConsultationCompleted(updatedIntake, completedAt);
  }

  return updatedIntake;
}

/**
 * Create an intake for an existing consultation. The consultation's healthcare
 * system is the only source of the intake type.
 */
export async function createIntake(userId, consultationId) {
  const patient = await getPatientByUserId(userId);

  requirePatientConsent(
    patient,
    "medicalDataProcessing",
    "Medical data processing consent is required before starting an intake."
  );

  const consultation = await Consultation.findOne({
    _id: consultationId,
    patientId: patient._id,
    isDeleted: false,
  });

  if (!consultation) {
    throw new ApiError(404, "Consultation not found.");
  }

  if (consultation.status !== "CREATED") {
    throw new ApiError(
      409,
      "An intake can only be created for a new consultation."
    );
  }

  const existingIntake = await Intake.findOne({
    consultationId: consultation._id,
    isDeleted: false,
  }).select("_id");

  if (existingIntake) {
    throw new ApiError(
      409,
      "An intake already exists for this consultation."
    );
  }

  let intake;

  try {
    intake = await Intake.create({
      consultationId: consultation._id,
      patientId: patient._id,
      intakeType: consultation.healthcareSystem,
      status: "IN_PROGRESS",
      currentSection: "CHIEF_COMPLAINT",
      currentQuestion: null,
      structuredData: {},
      startedAt: new Date(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(
        409,
        "An intake already exists for this consultation."
      );
    }

    throw error;
  }

  const startedConsultation = await Consultation.findOneAndUpdate(
    {
      _id: consultation._id,
      patientId: patient._id,
      isDeleted: false,
      status: "CREATED",
    },
    {
      $set: { status: "IN_PROGRESS" },
    },
    { new: true }
  );

  if (!startedConsultation) {
    await Intake.updateOne(
      { _id: intake._id },
      { $set: { isDeleted: true } }
    );

    throw new ApiError(
      409,
      "Consultation can no longer start an intake."
    );
  }

  return getPatientIntake(intake);
}

/**
 * Retrieve an intake owned by the authenticated patient.
 */
export async function getIntakeById(userId, intakeId) {
  const { intake } = await getOwnedIntake(userId, intakeId);

  return getPatientIntake(intake);
}

/**
 * Retrieve the intake attached to an owned consultation without exposing the
 * patient ownership reference. This is deliberately scoped to the current
 * patient rather than a general consultation lookup.
 */
export async function getIntakeByConsultationId(userId, consultationId) {
  const patient = await getPatientByUserId(userId);
  const intake = await Intake.findOne({
    consultationId,
    patientId: patient._id,
    isDeleted: false,
  });

  if (!intake) {
    throw new ApiError(404, "Intake not found.");
  }

  return getPatientIntake(intake);
}

/**
 * Retrieve answer history without exposing the intake's owner reference.
 */
export async function getIntakeAnswers(userId, intakeId) {
  const { intake } = await getOwnedIntake(userId, intakeId);

  return intake.answers.map((answer) => answer.toObject());
}

/**
 * Get the active intake question, or generate it safely when absent.
 */
export async function getCurrentQuestion(userId, intakeId) {
  const { patient, intake } = await getOwnedIntake(userId, intakeId);

  if (intake.status === "COMPLETED") {
    throw new ApiError(409, "This intake has already been completed.");
  }

  if (intake.status !== "IN_PROGRESS") {
    throw new ApiError(409, "This intake is not active.");
  }

  if (intake.currentQuestion) {
    return intake.currentQuestion.toObject();
  }

  requirePatientConsent(
    patient,
    "medicalDataProcessing",
    "Medical data processing consent is required to continue this intake."
  );
  requirePatientConsent(
    patient,
    "aiProcessing",
    "AI processing consent is required to generate intake questions."
  );

  const targetSection = getNextRequiredSection(intake);

  if (!targetSection) {
    await completeIntakeIfEligible(intake);
    throw new ApiError(409, "This intake has already been completed.");
  }

  const consultation = await Consultation.findOne({
    _id: intake.consultationId,
    patientId: intake.patientId,
    isDeleted: false,
    status: "IN_PROGRESS",
  });

  if (!consultation) {
    throw new ApiError(409, "Consultation is not active for this intake.");
  }

  const generatedQuestion = await generateNextQuestion({
    intake,
    consultation,
    targetSection,
  });

  const currentQuestion = {
    questionId: generatedQuestion.questionId,
    section: generatedQuestion.section,
    question: generatedQuestion.question,
    answerType: generatedQuestion.answerType,
    options: generatedQuestion.options,
    required: generatedQuestion.required,
    generatedAt: new Date(),
  };

  /**
   * Only one concurrent request may claim an empty question slot. A losing
   * request returns the winner's saved question instead of creating another.
   */
  const updatedIntake = await Intake.findOneAndUpdate(
    {
      _id: intake._id,
      patientId: intake.patientId,
      isDeleted: false,
      status: "IN_PROGRESS",
      currentQuestion: null,
    },
    {
      $set: {
        currentQuestion,
        currentSection: currentQuestion.section,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (updatedIntake) {
    return updatedIntake.currentQuestion.toObject();
  }

  const latest = await Intake.findOne({
    _id: intake._id,
    patientId: intake.patientId,
    isDeleted: false,
  });

  if (!latest) {
    throw new ApiError(404, "Intake not found.");
  }

  if (latest.currentQuestion) {
    return latest.currentQuestion.toObject();
  }

  if (latest.status === "COMPLETED") {
    throw new ApiError(409, "This intake has already been completed.");
  }

  throw new ApiError(
    409,
    "The intake changed while generating a question. Please try again."
  );
}

/**
 * Validate an answer against backend-owned question metadata.
 */
export function validateAnswer(question, answer) {
  const { answerType, options, required } = question;
  const isEmpty =
    answer === undefined ||
    answer === null ||
    answer === "" ||
    (Array.isArray(answer) && answer.length === 0);

  if (required && isEmpty) {
    throw new ApiError(400, "Answer is required.");
  }

  if (!required && isEmpty) {
    return null;
  }

  if (answerType === "TEXT") {
    if (typeof answer !== "string") {
      throw new ApiError(400, "Answer must be text.");
    }

    const value = answer.trim();

    if (!value && required) {
      throw new ApiError(400, "Answer cannot be empty.");
    }

    if (value.length > 2000) {
      throw new ApiError(400, "Answer cannot exceed 2000 characters.");
    }

    return value;
  }

  if (answerType === "NUMBER") {
    if (typeof answer !== "number" || !Number.isFinite(answer)) {
      throw new ApiError(400, "Answer must be a valid number.");
    }

    return answer;
  }

  if (answerType === "BOOLEAN") {
    if (typeof answer !== "boolean") {
      throw new ApiError(400, "Answer must be true or false.");
    }

    return answer;
  }

  if (answerType === "SINGLE_SELECT") {
    if (typeof answer !== "string") {
      throw new ApiError(
        400,
        "Answer must be a single selected option."
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      throw new ApiError(500, "Current question options are invalid.");
    }

    const value = answer.trim();

    if (!options.includes(value)) {
      throw new ApiError(
        400,
        "Selected answer is not valid for this question."
      );
    }

    return value;
  }

  if (answerType === "MULTI_SELECT") {
    if (!Array.isArray(answer) || answer.length === 0) {
      throw new ApiError(
        400,
        "Answer must contain one or more selected options."
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      throw new ApiError(500, "Current question options are invalid.");
    }

    const values = answer.map((value) => {
      if (typeof value !== "string" || !value.trim()) {
        throw new ApiError(
          400,
          "One or more selected answers are invalid."
        );
      }

      return value.trim();
    });

    if (values.some((value) => !options.includes(value))) {
      throw new ApiError(
        400,
        "One or more selected answers are invalid."
      );
    }

    return [...new Set(values)];
  }

  if (answerType === "DATE") {
    if (
      typeof answer !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(answer)
    ) {
      throw new ApiError(400, "Answer must be a valid date.");
    }

    const parsedDate = new Date(`${answer}T00:00:00.000Z`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== answer
    ) {
      throw new ApiError(400, "Answer must be a valid date.");
    }

    return answer;
  }

  throw new ApiError(500, "Current question has an unsupported answer type.");
}

function getStructuredDataPath(intake, question) {
  if (
    !getRequiredSections(intake.intakeType).includes(question.section) ||
    !SAFE_QUESTION_ID_PATTERN.test(question.questionId)
  ) {
    throw new ApiError(500, "Current question is invalid.");
  }

  return `structuredData.${question.section}.${question.questionId}`;
}

/**
 * Submit an answer to exactly the active, backend-generated question.
 */
export async function submitIntakeAnswer(userId, intakeId, answer) {
  const { patient, intake } = await getOwnedIntake(userId, intakeId);

  requirePatientConsent(
    patient,
    "medicalDataProcessing",
    "Medical data processing consent is required to submit an answer."
  );

  if (intake.status === "COMPLETED") {
    throw new ApiError(409, "This intake has already been completed.");
  }

  if (intake.status !== "IN_PROGRESS") {
    throw new ApiError(409, "This intake is not active.");
  }

  if (!intake.currentQuestion) {
    throw new ApiError(409, "No active question is available for this intake.");
  }

  const question = intake.currentQuestion.toObject();
  const validatedAnswer = validateAnswer(question, answer);
  const answeredAt = new Date();
  const answerEntry = {
    questionId: question.questionId,
    section: question.section,
    question: question.question,
    answerType: question.answerType,
    answer: validatedAnswer,
    answeredAt,
  };
  const completesIntake = meetsCompletionRequirements({
    intakeType: intake.intakeType,
    answers: [...intake.answers, answerEntry],
  });
  const structuredDataPath = getStructuredDataPath(intake, question);
  const updateFields = {
    [structuredDataPath]: validatedAnswer,
    currentQuestion: null,
    status: completesIntake ? "COMPLETED" : "IN_PROGRESS",
  };

  if (completesIntake) {
    updateFields.completedAt = answeredAt;
  }

  /**
   * The query matches the exact active question. Once one request clears it,
   * duplicate or stale submissions cannot append another answer.
   */
  const updatedIntake = await Intake.findOneAndUpdate(
    {
      _id: intake._id,
      patientId: intake.patientId,
      isDeleted: false,
      status: "IN_PROGRESS",
      "currentQuestion.questionId": question.questionId,
      "currentQuestion.section": question.section,
      "currentQuestion.generatedAt": question.generatedAt,
    },
    {
      $push: { answers: answerEntry },
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedIntake) {
    throw new ApiError(
      409,
      "This question is no longer active. Please retrieve the current question."
    );
  }

  if (completesIntake) {
    await markConsultationCompleted(updatedIntake, answeredAt);
  }

  return getPatientIntake(updatedIntake);
}
