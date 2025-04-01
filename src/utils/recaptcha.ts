
import { supabase } from "@/integrations/supabase/client";

// This ensures TypeScript recognizes the global grecaptcha object
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Executes reCAPTCHA v3 verification and returns a token
 * @param action The action name for analytics
 * @returns The reCAPTCHA token
 */
export const executeRecaptcha = async (action = "signup"): Promise<string> => {
  try {
    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            "6LeEpwYrAAAAAN0M565bTJlpcM-Bd5e_0bZfEBmU", 
            { action }
          );
          resolve(token);
        } catch (error) {
          console.error("reCAPTCHA execution error:", error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("reCAPTCHA not loaded properly:", error);
    throw new Error("reCAPTCHA failed to load. Please refresh the page.");
  }
};

/**
 * Verifies a reCAPTCHA token using Supabase Edge Function
 * @param token The reCAPTCHA token to verify
 * @returns Object containing verification results
 */
export const verifyRecaptchaToken = async (token: string): Promise<{
  success: boolean;
  score?: number;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke("verify-recaptcha", {
      body: { token }
    });

    if (error) {
      console.error("Error verifying reCAPTCHA token:", error);
      return { success: false, message: error.message };
    }

    return data;
  } catch (error) {
    console.error("Error calling verify-recaptcha function:", error);
    return { 
      success: false, 
      message: "Failed to verify human presence. Please try again." 
    };
  }
};
