/**
 * Client-side data encryption utilities for sensitive localStorage data
 */

// Simple XOR encryption for client-side data (NOT for production secrets)
// This is basic obfuscation to prevent casual inspection of localStorage
const ENCRYPTION_KEY = 'edu_platform_key_2024';

/**
 * Simple XOR encryption for localStorage data
 */
export const encryptData = (data: string): string => {
  try {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return btoa(encrypted); // Base64 encode the result
  } catch (error) {
    console.error('Encryption error:', error);
    return data; // Return original data if encryption fails
  }
};

/**
 * Simple XOR decryption for localStorage data
 */
export const decryptData = (encryptedData: string): string => {
  try {
    const decoded = atob(encryptedData); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData; // Return original data if decryption fails
  }
};

/**
 * Secure localStorage wrapper with encryption
 */
export const secureStorage = {
  setItem: (key: string, value: string, encrypt: boolean = false): void => {
    try {
      const dataToStore = encrypt ? encryptData(value) : value;
      localStorage.setItem(key, dataToStore);
      
      // Set expiration (7 days default)
      const expirationKey = `${key}_expires`;
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(expirationKey, expirationTime.toString());
    } catch (error) {
      console.error('Secure storage setItem error:', error);
    }
  },

  getItem: (key: string, encrypted: boolean = false): string | null => {
    try {
      // Check expiration
      const expirationKey = `${key}_expires`;
      const expirationTime = localStorage.getItem(expirationKey);
      
      if (expirationTime && Date.now() > parseInt(expirationTime)) {
        // Remove expired data
        localStorage.removeItem(key);
        localStorage.removeItem(expirationKey);
        return null;
      }

      const data = localStorage.getItem(key);
      if (!data) return null;

      return encrypted ? decryptData(data) : data;
    } catch (error) {
      console.error('Secure storage getItem error:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_expires`);
  },

  // Clean up expired items
  cleanup: (): void => {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('_expires')) {
        const expirationTime = localStorage.getItem(key);
        if (expirationTime && Date.now() > parseInt(expirationTime)) {
          const dataKey = key.replace('_expires', '');
          keysToRemove.push(dataKey);
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Auto-cleanup on module load
secureStorage.cleanup();