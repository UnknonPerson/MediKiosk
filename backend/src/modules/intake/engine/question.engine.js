import { generateAIContent } from "../../../services/ai/gemini.service.js";

import ApiError from "../../../utils/ApiError.js";
import { dynamicQuestionSchema } from "./question.schema.js";
import {
  ANSWER_TYPES,
  getRequiredSections,
} from "./intake.engine.js";

/**
 * Build context from previous answers.
 */
function buildAnswerHistory(answers = []) {
  if (!answers.length) {
    return "No previous answers yet.";
  }

  return answers
    .slice(-16)
    .map((item) => {
      return [
        `Question ID: ${item.questionId}`,
        `Section: ${item.section}`,
        `Question: ${String(item.question).slice(0, 300)}`,
        `Answer: ${String(JSON.stringify(item.answer)).slice(0, 500)}`,
      ].join("\n");
    })
    .join("\n\n")
    .slice(0, 8000);
}

function buildStructuredDataContext(structuredData) {
  try {
    return JSON.stringify(structuredData || {}).slice(0, 4000);
  } catch (error) {
    return "Structured data unavailable.";
  }
}

function normalizeQuestion(question) {
  return question
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseJsonResponse(rawResponse) {
  const response = String(rawResponse || "").trim();
  const fencedJsonMatch = response.match(
    /^```(?:json)?\s*([\s\S]*?)\s*```$/i
  );

  return JSON.parse(
    fencedJsonMatch ? fencedJsonMatch[1] : response
  );
}

function getQuestionValidationError({
  parsedResponse,
  targetSection,
  answeredQuestionIds,
  answeredQuestions,
}) {
  const validation = dynamicQuestionSchema.safeParse(parsedResponse);

  if (!validation.success) {
    return {
      error: new ApiError(
        502,
        "AI generated an invalid intake question."
      ),
    };
  }

  const question = validation.data;

  if (question.section !== targetSection) {
    return {
      error: new ApiError(
        502,
        "AI generated a question outside the required intake section."
      ),
    };
  }

  if (!question.required) {
    return {
      error: new ApiError(
        502,
        "AI generated an optional required intake question."
      ),
    };
  }

  if (answeredQuestionIds.has(question.questionId)) {
    return {
      error: new ApiError(
        502,
        "AI generated a duplicate intake question."
      ),
    };
  }

  if (answeredQuestions.has(normalizeQuestion(question.question))) {
    return {
      error: new ApiError(
        502,
        "AI generated a repeated intake question."
      ),
    };
  }

  if (!ANSWER_TYPES.includes(question.answerType)) {
    return {
      error: new ApiError(
        502,
        "AI generated an unsupported answer type."
      ),
    };
  }

  return { question };
}

/**
 * Generate the next intake question.
 */
export async function generateNextQuestion({
  intake,
  consultation,
  targetSection,
}) {
  const allowedSections = getRequiredSections(intake.intakeType);

  if (!allowedSections.includes(targetSection)) {
    throw new ApiError(500, "Invalid intake section requested.");
  }

  const answerHistory = buildAnswerHistory(
    intake.answers
  );
  const structuredDataContext = buildStructuredDataContext(
    intake.structuredData
  );

  const answeredQuestionIds = new Set(
    (intake.answers || []).map((answer) => answer.questionId)
  );
  const answeredQuestions = new Set(
    (intake.answers || []).map((answer) =>
      normalizeQuestion(answer.question)
    )
  );

  const prompt = `
You are an intake-question engine for a healthcare application.

Your task is to generate ONE next question.

IMPORTANT RULES:

1. Generate exactly one question.
2. Do not provide diagnosis.
3. Do not provide treatment.
4. Do not provide medication recommendations.
5. Do not claim certainty about a medical condition.
6. Use the required target section exactly. Do not select another section.
7. Do not repeat a question already answered.
8. The question must be relevant to the patient's complaint and previous answers.
9. Keep the question simple and understandable.
10. Return valid JSON only.
11. Do not include markdown.
12. Do not include explanations.

Healthcare system:
${intake.intakeType}

Chief complaint:
${consultation.chiefComplaint}

Allowed sections:
${allowedSections.join(", ")}

Required target section:
${targetSection}

Previous answers:
${answerHistory}

Structured data snapshot:
${structuredDataContext}

Return JSON in exactly this structure:

{
  "questionId": "short_unique_identifier",
  "section": "the_required_target_section",
  "question": "patient-friendly question",
  "answerType": "TEXT | NUMBER | BOOLEAN | SINGLE_SELECT | MULTI_SELECT | DATE",
  "options": null,
  "required": true
}

Rules for options:

- TEXT → options must be null
- NUMBER → options must be null
- BOOLEAN → options must be null
- DATE → options must be null
- SINGLE_SELECT → options must contain valid choices
- MULTI_SELECT → options must contain valid choices
`;

  let lastError = new ApiError(
    502,
    "Unable to generate the next intake question."
  );

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let rawResponse;

    try {
      rawResponse = await generateAIContent(prompt, {
        temperature: 0.2,
        responseMimeType: "application/json",
      });
    } catch (error) {
      console.error({
        level: "error",
        event: "intake.question_generation_failed",
        errorName: error.name,
      });
      lastError = new ApiError(
        502,
        "Unable to generate the next intake question."
      );
      continue;
    }

    let parsedResponse;

    try {
      parsedResponse = parseJsonResponse(rawResponse);
    } catch (error) {
      lastError = new ApiError(
        502,
        "AI returned an invalid question format."
      );
      continue;
    }

    const result = getQuestionValidationError({
      parsedResponse,
      targetSection,
      answeredQuestionIds,
      answeredQuestions,
    });

    if (result.question) {
      return result.question;
    }

    lastError = result.error;
  }

  throw lastError;
}
