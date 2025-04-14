
/**
 * Format seconds into a readable time format (mm:ss)
 * @param seconds Number of seconds to format
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  if (seconds === null || seconds === undefined) return "--:--";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format cooldown time into a readable format
 * @param seconds Number of seconds to format
 * @returns Formatted time string
 */
export const formatCooldownTime = (seconds: number): string => {
  if (seconds === null || seconds === undefined) return "";
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};
