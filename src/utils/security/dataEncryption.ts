
/**
 * Client-side data encryption utilities for sensitive localStorage data
 */

// Enhanced encryption using Web Crypto API for better security
/**
 * Generate a secure key from a passphrase using PBKDF2
 */
const generateKey = async (passphrase: string, salt: BufferSource): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Simple obfuscation for backward compatibility (synchronous)
 * For true security, use encryptDataSecure
 */
export const encryptData = (data: string): string => {
  try {
    // Input validation
    if (!data || typeof data !== 'string') {
      return data;
    }
    
    // Simple obfuscation for backward compatibility
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
};

/**
 * Simple deobfuscation for backward compatibility (synchronous)
 * For true security, use decryptDataSecure
 */
export const decryptData = (encryptedData: string): string => {
  try {
    // Input validation
    if (!encryptedData || typeof encryptedData !== 'string') {
      return encryptedData;
    }
    
    return decodeURIComponent(atob(encryptedData));
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData;
  }
};

/**
 * Enhanced encryption using AES-GCM (async for high security)
 */
export const encryptDataSecure = async (data: string): Promise<string> => {
  try {
    // Input validation
    if (!data || typeof data !== 'string') {
      throw new Error('Invalid input data');
    }
    
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    // Generate encryption key
    const key = await generateKey('edu_platform_secure_2024', salt);
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(data)
    );
    
    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to simple obfuscation
    return btoa(data);
  }
};

/**
 * Enhanced decryption using AES-GCM (async for high security)
 */
export const decryptDataSecure = async (encryptedData: string): Promise<string> => {
  try {
    // Input validation
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Invalid encrypted data');
    }
    
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract salt, IV, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    // Generate decryption key
    const key = await generateKey('edu_platform_secure_2024', salt);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    // Fallback to base64 decoding
    try {
      return atob(encryptedData);
    } catch {
      return encryptedData;
    }
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

  // High-security async versions
  setItemSecure: async (key: string, value: string): Promise<void> => {
    try {
      const dataToStore = await encryptDataSecure(value);
      localStorage.setItem(key, dataToStore);
      
      // Set expiration (7 days default)
      const expirationKey = `${key}_expires`;
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
      localStorage.setItem(expirationKey, expirationTime.toString());
    } catch (error) {
      console.error('Secure storage setItemSecure error:', error);
    }
  },

  getItemSecure: async (key: string): Promise<string | null> => {
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

      return await decryptDataSecure(data);
    } catch (error) {
      console.error('Secure storage getItemSecure error:', error);
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
