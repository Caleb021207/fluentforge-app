
import { TranslationRecord } from "../types";

const errorsTranslations: TranslationRecord = {
  // General errors
  generalError: "An error occurred",
  networkError: "Network error",
  serverError: "Server error",
  unknownError: "Unknown error",
  
  // Authentication errors
  authError: "Authentication error",
  sessionExpired: "Session expired",
  unauthorizedAccess: "Unauthorized access",
  
  // Form errors
  invalidInput: "Invalid input",
  requiredField: "This field is required",
  invalidEmail: "Invalid email address",
  invalidPassword: "Invalid password",
  
  // API errors
  apiError: "API error",
  requestFailed: "Request failed",
  responseError: "Response error",
  
  // File errors
  fileUploadError: "File upload error",
  fileDownloadError: "File download error",
  fileNotFound: "File not found",
  
  // Connection errors
  connectionError: "Connection error",
  connectionLost: "Connection lost",
  reconnecting: "Reconnecting..."
};

export default errorsTranslations;
