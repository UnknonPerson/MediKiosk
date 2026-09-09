export const ANSWER_TYPES = Object.freeze([
  "TEXT",
  "NUMBER",
  "BOOLEAN",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "DATE",
]);

export const MODERN_SECTIONS = Object.freeze([
  "CHIEF_COMPLAINT",
  "SYMPTOM_HISTORY",
  "SEVERITY",
  "ASSOCIATED_SYMPTOMS",
  "MEDICAL_HISTORY",
  "MEDICATIONS",
  "ALLERGIES",
  "LIFESTYLE",
]);

export const AYUSH_SECTIONS = Object.freeze([
  "CHIEF_COMPLAINT",
  "CURRENT_COMPLAINT",
  "DIGESTION",
  "APPETITE",
  "SLEEP",
  "BOWEL_HABITS",
  "LIFESTYLE",
  "AYUSH_OBSERVATIONS",
]);

export const QUESTION_SECTIONS = Object.freeze([
  ...new Set([
    ...MODERN_SECTIONS,
    ...AYUSH_SECTIONS,
  ]),
]);

/**
 * Each required section needs at least one meaningful, backend-validated
 * answer. This is the minimum safe completion rule; an AI response can never
 * complete an intake by itself.
 */
export const REQUIRED_SECTIONS_BY_TYPE = Object.freeze({
  MODERN: MODERN_SECTIONS,
  AYUSH: AYUSH_SECTIONS,
});

export function getRequiredSections(intakeType) {
  const sections = REQUIRED_SECTIONS_BY_TYPE[intakeType];

  if (!sections) {
    throw new Error("Unsupported intake type");
  }

  return sections;
}

export function isMeaningfulAnswer(answer) {
  if (answer === null || answer === undefined) {
    return false;
  }

  if (typeof answer === "string") {
    return answer.trim().length > 0;
  }

  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return true;
}

export function getAnsweredRequiredSections(intake) {
  const requiredSections = getRequiredSections(intake.intakeType);
  const answeredSections = new Set();

  for (const answer of intake.answers || []) {
    if (
      requiredSections.includes(answer.section) &&
      isMeaningfulAnswer(answer.answer)
    ) {
      answeredSections.add(answer.section);
    }
  }

  return answeredSections;
}

export function getNextRequiredSection(intake) {
  const answeredSections = getAnsweredRequiredSections(intake);

  return (
    getRequiredSections(intake.intakeType).find(
      (section) => !answeredSections.has(section)
    ) || null
  );
}

export function meetsCompletionRequirements(intake) {
  return getNextRequiredSection(intake) === null;
}
