import assert from "node:assert/strict";
import test from "node:test";

import {
  getNextRequiredSection,
  meetsCompletionRequirements,
} from "../src/modules/intake/engine/intake.engine.js";
import { dynamicQuestionSchema } from "../src/modules/intake/engine/question.schema.js";
import { validateAnswer } from "../src/modules/intake/intake.service.js";
import {
  submitIntakeAnswerSchema,
} from "../src/modules/intake/intake.validation.js";
import {
  updatePatientConsentSchema,
  updatePatientProfileSchema,
} from "../src/modules/patient/patient.validation.js";

test("MODERN intakes progress in the backend-defined section order", () => {
  const intake = {
    intakeType: "MODERN",
    answers: [
      {
        section: "CHIEF_COMPLAINT",
        answer: "Persistent cough",
      },
      {
        section: "SYMPTOM_HISTORY",
        answer: "It started three days ago.",
      },
    ],
  };

  assert.equal(getNextRequiredSection(intake), "SEVERITY");
  assert.equal(meetsCompletionRequirements(intake), false);
});

test("an intake only meets completion requirements after every section", () => {
  const sections = [
    "CHIEF_COMPLAINT",
    "CURRENT_COMPLAINT",
    "DIGESTION",
    "APPETITE",
    "SLEEP",
    "BOWEL_HABITS",
    "LIFESTYLE",
    "AYUSH_OBSERVATIONS",
  ];
  const intake = {
    intakeType: "AYUSH",
    answers: sections.map((section) => ({
      section,
      answer: "Recorded",
    })),
  };

  assert.equal(getNextRequiredSection(intake), null);
  assert.equal(meetsCompletionRequirements(intake), true);
});

test("answer validation uses backend-owned select options and answer types", () => {
  const question = {
    answerType: "MULTI_SELECT",
    options: ["Mild", "Moderate", "Severe"],
    required: true,
  };

  assert.deepEqual(
    validateAnswer(question, ["Mild", "Mild", "Severe"]),
    ["Mild", "Severe"]
  );
  assert.throws(
    () => validateAnswer(question, ["Unknown"]),
    /invalid/
  );
  assert.throws(
    () =>
      validateAnswer(
        { answerType: "DATE", options: null, required: true },
        "2026-02-31"
      ),
    /valid date/
  );
});

test("AI question contract rejects unsafe IDs, incorrect options, and duplicates", () => {
  const validQuestion = {
    questionId: "symptom_history_1",
    section: "SYMPTOM_HISTORY",
    question: "When did the symptoms begin?",
    answerType: "SINGLE_SELECT",
    options: ["Today", "This week"],
    required: true,
  };

  assert.equal(dynamicQuestionSchema.safeParse(validQuestion).success, true);
  assert.equal(
    dynamicQuestionSchema.safeParse({
      ...validQuestion,
      questionId: "unsafe.id",
    }).success,
    false
  );
  assert.equal(
    dynamicQuestionSchema.safeParse({
      ...validQuestion,
      options: ["Today", "today"],
    }).success,
    false
  );
});

test("sensitive answer metadata and empty profile updates are rejected", () => {
  assert.equal(
    submitIntakeAnswerSchema.safeParse({
      answer: "yes",
      questionId: "client-controlled",
    }).success,
    false
  );
  assert.equal(updatePatientProfileSchema.safeParse({}).success, false);
  assert.equal(updatePatientConsentSchema.safeParse({}).success, false);
});
