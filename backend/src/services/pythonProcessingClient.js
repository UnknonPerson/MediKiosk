import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

/**
 * Client for communicating with Python document processing service.
 */
class PythonProcessingClient {
  constructor(
    serviceUrl = env.pythonService.url,
    serviceToken = env.pythonService.token,
    timeoutMs = env.pythonService.timeoutMs
  ) {
    this.serviceUrl = serviceUrl;
    this.serviceToken = serviceToken;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Check if Python service is healthy and accessible.
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.serviceUrl}/health`, {
        method: "GET",
        timeout: this.timeoutMs,
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new ApiError(
        503,
        "Document processing service is unavailable. Please try again later."
      );
    }
  }

  /**
   * Process a document and extract text.
   *
   * @param {string} storageKey - Document storage key (from Node backend)
   * @param {string} mimeType - Document MIME type
   * @param {string} originalFilename - Original filename for reference
   * @param {boolean} enableOcrFallback - Enable OCR fallback for PDFs
   * @returns {Promise<Object>} Processing result with extracted text
   */
  async processDocument(
    storageKey,
    mimeType,
    originalFilename,
    enableOcrFallback = true
  ) {
    if (!this.serviceToken) {
      throw new ApiError(
        500,
        "Document processing is not configured."
      );
    }

    const payload = {
      storage_key: storageKey,
      mime_type: mimeType,
      original_filename: originalFilename,
      enable_ocr_fallback: enableOcrFallback,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(
        `${this.serviceUrl}/internal/process-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.serviceToken}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.status === 401) {
        throw new ApiError(
          500,
          "Document processing service authentication failed."
        );
      }

      if (response.status === 503) {
        throw new ApiError(
          503,
          "Document processing service is temporarily unavailable."
        );
      }

      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Processing failed");
      }

      return result.result;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError(
          504,
          "Document processing timed out. Please try again."
        );
      }

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Log but don't expose internal errors
      console.error("Document processing error:", error);
      throw new ApiError(
        500,
        "Document processing failed. Please try again."
      );
    }
  }
}

export const createPythonProcessingClient = (
  serviceUrl,
  serviceToken,
  timeoutMs
) => {
  return new PythonProcessingClient(serviceUrl, serviceToken, timeoutMs);
};

// Default client instance
export const pythonProcessingClient = new PythonProcessingClient();
