import React, { createContext, useContext, useState, useCallback } from 'react';

interface XPNotificationContextType {
  showXPNotification: boolean;
  lastXPGain: number;
  triggerXPNotification: (amount: number) => void;
  clearXPNotification: () => void;
}

const XPNotificationContext = createContext<XPNotificationContextType | undefined>(undefined);

export const XPNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);

  const triggerXPNotification = useCallback((amount: number) => {
    console.log('🎯 XP Notification triggered:', amount);
    if (amount >= 50) {
      setLastXPGain(amount);
      setShowXPNotification(true);
      setTimeout(() => {
        setShowXPNotification(false);
        console.log('🎯 XP Notification hidden');
      }, 3000);
    } else {
      console.log('🎯 XP amount too small for notification:', amount);
    }
  }, []);

  const clearXPNotification = useCallback(() => {
    setShowXPNotification(false);
  }, []);

  return (
    <XPNotificationContext.Provider
      value={{
        showXPNotification,
        lastXPGain,
        triggerXPNotification,
        clearXPNotification,
      }}
    >
      {children}
    </XPNotificationContext.Provider>
  );
};

export const useXPNotification = () => {
  const context = useContext(XPNotificationContext);
  if (context === undefined) {
    throw new Error('useXPNotification must be used within an XPNotificationProvider');
  }
  return context;
};
