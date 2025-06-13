
import { supabase } from "@/integrations/supabase/client";

export interface AccessCodeResult {
  success: boolean;
  message: string;
  role?: string;
  assignment?: string;
}

/**
 * Process an access code and update user's role/assignment
 */
export const processAccessCode = async (code: string): Promise<AccessCodeResult> => {
  try {
    const { data, error } = await supabase.rpc('process_access_code', {
      p_code: code.trim().toUpperCase()
    });

    if (error) {
      console.error('Error processing access code:', error);
      return {
        success: false,
        message: 'Failed to process access code. Please try again.'
      };
    }

    // Safely parse the JSON response
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const result = data as Record<string, any>;
      return {
        success: result.success || false,
        message: result.message || 'Unknown response',
        role: result.role,
        assignment: result.assignment
      };
    }

    return {
      success: false,
      message: 'Invalid response from server.'
    };
  } catch (error) {
    console.error('Error in processAccessCode:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Generate an access code (for admins/teachers)
 */
export const generateAccessCode = async (
  codeType: 'district' | 'school' | 'teacher' | 'class',
  targetId: string,
  targetName: string,
  expiresAt?: string,
  maxUses?: number
): Promise<{ success: boolean; code?: string; message: string }> => {
  try {
    const { data, error } = await supabase.rpc('generate_access_code', {
      p_code_type: codeType,
      p_target_id: targetId,
      p_target_name: targetName,
      p_expires_at: expiresAt || null,
      p_max_uses: maxUses || null
    });

    if (error) {
      console.error('Error generating access code:', error);
      return {
        success: false,
        message: 'Failed to generate access code. Please try again.'
      };
    }

    return {
      success: true,
      code: data,
      message: `Access code generated successfully: ${data}`
    };
  } catch (error) {
    console.error('Error in generateAccessCode:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Get access codes created by the current user
 */
export const getUserAccessCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching access codes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserAccessCodes:', error);
    return [];
  }
};
