/**
 * Get the current academic year based on the current date
 * Academic year runs from August to July
 * Example: If current date is October 2024, returns "2024-2025"
 *          If current date is June 2024, returns "2023-2024"
 */
export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January, 7 = August)

  // If we're in August (7) or later, it's the start of a new academic year
  // Otherwise, we're in the latter half of the previous academic year
  if (currentMonth >= 7) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

/**
 * Get the current semester based on the current date
 * Fall: August - December
 * Spring: January - July
 */
export const getCurrentSemester = (): 'fall' | 'spring' => {
  const currentMonth = new Date().getMonth(); // 0-indexed
  
  // August (7) through December (11) = Fall
  // January (0) through July (6) = Spring
  return currentMonth >= 7 ? 'fall' : 'spring';
};
