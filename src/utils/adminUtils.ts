
import { generateAccessCode } from "./accessCodeUtils";

/**
 * Helper function to create a district admin access code
 * This is for development/setup purposes
 */
export const createDistrictAdminCode = async (districtName: string) => {
  try {
    // Generate a district admin code with a random UUID as target_id
    // In a real system, this would be the actual district ID
    const result = await generateAccessCode(
      'district',
      crypto.randomUUID(), // Temporary district ID
      districtName,
      undefined, // No expiration
      1 // Single use
    );
    
    return result;
  } catch (error) {
    console.error('Error creating district admin code:', error);
    return {
      success: false,
      message: 'Failed to create district admin code'
    };
  }
};
