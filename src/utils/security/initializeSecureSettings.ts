/**
 * Initialize secure settings for the application
 * This should be called by administrators to set up secure configuration
 */

import { setSecureSetting, getSecureSetting } from './secureSettings';

/**
 * Initialize default secure settings
 */
export const initializeSecureSettings = async (): Promise<void> => {
  try {
    // Check if signup passcode is already set
    const existingPasscode = await getSecureSetting('signup_passcode');
    
    if (!existingPasscode) {
      // Set default signup passcode (should be changed by admin)
      await setSecureSetting('signup_passcode', '08132010', false);
      console.log('Default signup passcode set. Please change this in production.');
    }

    // Initialize other default settings
    const settings = [
      { key: 'max_upload_size_mb', value: '5', encrypted: false },
      { key: 'max_uploads_per_hour', value: '10', encrypted: false },
      { key: 'session_timeout_minutes', value: '60', encrypted: false },
      { key: 'enable_audit_logging', value: 'true', encrypted: false }
    ];

    for (const setting of settings) {
      const existing = await getSecureSetting(setting.key);
      if (!existing) {
        await setSecureSetting(setting.key, setting.value, setting.encrypted);
      }
    }

    console.log('Secure settings initialized successfully');
  } catch (error) {
    console.error('Failed to initialize secure settings:', error);
  }
};

/**
 * Get all security-related configuration
 */
export const getSecurityConfig = async () => {
  try {
    const [
      maxUploadSize,
      maxUploadsPerHour,
      sessionTimeout,
      auditLogging
    ] = await Promise.all([
      getSecureSetting('max_upload_size_mb'),
      getSecureSetting('max_uploads_per_hour'),
      getSecureSetting('session_timeout_minutes'),
      getSecureSetting('enable_audit_logging')
    ]);

    return {
      maxUploadSizeMB: parseInt(maxUploadSize || '5'),
      maxUploadsPerHour: parseInt(maxUploadsPerHour || '10'),
      sessionTimeoutMinutes: parseInt(sessionTimeout || '60'),
      enableAuditLogging: auditLogging === 'true'
    };
  } catch (error) {
    console.error('Failed to get security config:', error);
    return {
      maxUploadSizeMB: 5,
      maxUploadsPerHour: 10,
      sessionTimeoutMinutes: 60,
      enableAuditLogging: true
    };
  }
};