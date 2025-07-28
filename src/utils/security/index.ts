/**
 * Security utilities index - exports all security-related functions
 */

// Secure settings management
export {
  getSecureSetting,
  setSecureSetting,
  checkRateLimit,
  logSecurityEvent
} from './secureSettings';

// File validation and security
export {
  validateFile,
  sanitizeFilename,
  validateBase64Image
} from './fileValidation';

// Data encryption for client-side storage
export {
  encryptData,
  decryptData,
  secureStorage
} from './dataEncryption';

// Security initialization
export {
  initializeSecureSettings,
  getSecurityConfig
} from './initializeSecureSettings';