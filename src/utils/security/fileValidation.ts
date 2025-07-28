/**
 * File upload security validation utilities
 */

// Allowed file types for transcript uploads
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Maximum filename length
const MAX_FILENAME_LENGTH = 255;

/**
 * Validates file type, size, and filename for security
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    };
  }

  // Check filename length
  if (file.name.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Filename exceeds ${MAX_FILENAME_LENGTH} character limit`
    };
  }

  // Check for dangerous file extensions
  const dangerousExtensions = /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|jsp)$/i;
  if (dangerousExtensions.test(file.name)) {
    return {
      valid: false,
      error: 'File type not allowed'
    };
  }

  // Check MIME type
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload images (JPEG, PNG, WebP) or documents (PDF, DOC, DOCX)'
    };
  }

  return { valid: true };
};

/**
 * Sanitizes filename to prevent path traversal attacks
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal patterns
  let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '_');
  
  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\.\s]+|[\.\s]+$/g, '');
  
  // Ensure filename isn't empty
  if (!sanitized) {
    sanitized = 'uploaded_file';
  }
  
  // Limit length
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const extension = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    const maxNameLength = MAX_FILENAME_LENGTH - (extension ? extension.length + 1 : 0);
    sanitized = nameWithoutExt.substring(0, maxNameLength) + (extension ? '.' + extension : '');
  }
  
  return sanitized;
};

/**
 * Validates base64 image data for additional security
 */
export const validateBase64Image = (base64Data: string): { valid: boolean; error?: string } => {
  try {
    // Check if it's a valid base64 data URL
    if (!base64Data.startsWith('data:image/')) {
      return {
        valid: false,
        error: 'Invalid image data format'
      };
    }

    // Extract MIME type
    const mimeMatch = base64Data.match(/data:([^;]+);/);
    if (!mimeMatch) {
      return {
        valid: false,
        error: 'Unable to determine image type'
      };
    }

    const mimeType = mimeMatch[1];
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: 'Image type not allowed'
      };
    }

    // Check approximate size (base64 is ~33% larger than original)
    const sizeEstimate = (base64Data.length * 0.75);
    if (sizeEstimate > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'Image size too large'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid image data'
    };
  }
};