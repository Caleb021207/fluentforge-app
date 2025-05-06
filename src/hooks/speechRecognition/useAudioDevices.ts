
import { useState, useEffect } from "react";

export const useAudioDevices = () => {
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  
  // Check available audio devices
  useEffect(() => {
    const checkDevices = async () => {
      try {
        // First request permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get all audio input devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        
        console.log("Available audio input devices:", audioInputDevices);
        setAvailableDevices(audioInputDevices);
        
        // Release the stream
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Error checking audio devices:", err);
      }
    };
    
    checkDevices();
    
    // Setup device change listener
    navigator.mediaDevices.addEventListener('devicechange', checkDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkDevices);
    };
  }, []);
  
  return { availableDevices };
};
