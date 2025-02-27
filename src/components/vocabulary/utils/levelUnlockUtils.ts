
import { supabase } from "@/integrations/supabase/client";
import { FlashcardSet } from "../types";

// Map of level dependencies - each level requires the previous level to be completed
export const LEVEL_DEPENDENCIES: Record<string, string> = {
  "A1": "",  // A1 has no prerequisites
  "A2": "A1",
  "B1": "A2",
  "B2": "B1",
  "C1-C2": "B2",
  "Grammar": ""  // Grammar has no prerequisites
};

// Required score to unlock next level (75%)
export const REQUIRED_SCORE = 75;

// Check if a specific level is unlocked for the current user
export const isLevelUnlocked = async (
  level: string,
  userId: string | undefined
): Promise<boolean> => {
  // A1 is ALWAYS unlocked for ALL users, absolutely guaranteed
  if (level === "A1") {
    console.log("A1 level check - should always return true");
    return true;
  }
  
  // Grammar is always unlocked for everyone
  if (level === "Grammar") {
    return true;
  }
  
  // If no userId, user is not logged in - only allow A1 and Grammar
  if (!userId) {
    return false;
  }

  try {
    // Check if user has passed a certification for this level or higher
    const { data: certData, error: certError } = await supabase
      .from('certification_attempts')
      .select('level, score')
      .eq('user_id', userId)
      .gte('score', REQUIRED_SCORE)
      .order('completed_at', { ascending: false });

    if (certError) {
      console.error('Error checking certifications:', certError);
    } else if (certData && certData.length > 0) {
      // Get CEFR levels in order from lowest to highest
      const ceferLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      
      // Clean up the level name (remove -C2 if present)
      const cleanLevel = level.replace('-C2', '');
      const requiredLevelIndex = ceferLevels.indexOf(cleanLevel);
      
      if (requiredLevelIndex === -1) {
        return false; // Invalid level
      }
      
      // Find the highest certification level the user has achieved
      let highestCertLevelIndex = -1;
      for (const cert of certData) {
        const certLevelIndex = ceferLevels.indexOf(cert.level);
        if (certLevelIndex > highestCertLevelIndex) {
          highestCertLevelIndex = certLevelIndex;
        }
      }
      
      // If the user's highest certification level is equal to or higher than the required level,
      // or if the level the user wants to access is lower than or equal to their certified level,
      // then unlock the level
      if (highestCertLevelIndex >= requiredLevelIndex) {
        return true;
      }
    }

    // If no valid certification found, check completion of prerequisite level
    const prerequisiteLevel = LEVEL_DEPENDENCIES[level];
    
    if (!prerequisiteLevel) {
      return true; // No prerequisite means it's unlocked
    }
    
    // Check if completed prerequisite level flashcard sets
    const progressKey = `flashcard_progress_${userId}`;
    const progressStr = localStorage.getItem(progressKey);
    const progress = progressStr ? JSON.parse(progressStr) : {};
    
    // Check if all sets from the prerequisite level are completed with sufficient score
    const setsCompleted = progress[prerequisiteLevel] || [];
    const allSetsCompleted = setsCompleted.every((set: {id: string, score: number}) => 
      set.score >= REQUIRED_SCORE
    );
    
    // If the user has completed all prerequisite level sets with sufficient score
    if (allSetsCompleted && setsCompleted.length > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking level unlock status:", error);
    return false;
  }
};

// Save flashcard set progress
export const saveFlashcardSetProgress = (
  userId: string | undefined,
  level: string,
  setId: string,
  score: number
): void => {
  if (!userId) return;

  try {
    const progressKey = `flashcard_progress_${userId}`;
    const progressStr = localStorage.getItem(progressKey);
    const progress = progressStr ? JSON.parse(progressStr) : {};
    
    // Initialize level array if it doesn't exist
    if (!progress[level]) {
      progress[level] = [];
    }
    
    // Check if this set already has progress
    const existingSetIndex = progress[level].findIndex(
      (set: {id: string, score: number}) => set.id === setId
    );
    
    if (existingSetIndex >= 0) {
      // Update existing record if the new score is higher
      if (progress[level][existingSetIndex].score < score) {
        progress[level][existingSetIndex].score = score;
      }
    } else {
      // Add new record
      progress[level].push({ id: setId, score });
    }
    
    // Save back to localStorage
    localStorage.setItem(progressKey, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving flashcard progress:", error);
  }
};

// Check if all sets in a level are completed with sufficient score
export const isLevelCompleted = (
  userId: string | undefined,
  level: string,
  sets: FlashcardSet[]
): boolean => {
  if (!userId) return false;
  
  try {
    const progressKey = `flashcard_progress_${userId}`;
    const progressStr = localStorage.getItem(progressKey);
    const progress = progressStr ? JSON.parse(progressStr) : {};
    
    // Get completed sets for this level
    const completedSets = progress[level] || [];
    
    // If no sets are completed, return false
    if (completedSets.length === 0) return false;
    
    // Check if all sets are completed with sufficient score
    const allSetIds = sets.map(set => set.id);
    const completedSetIds = completedSets.map((set: {id: string}) => set.id);
    
    // Check if every set in this level has been completed
    const allSetsCompleted = allSetIds.every(id => 
      completedSetIds.includes(id) && 
      completedSets.find((set: {id: string, score: number}) => 
        set.id === id && set.score >= REQUIRED_SCORE
      )
    );
    
    return allSetsCompleted;
  } catch (error) {
    console.error("Error checking level completion:", error);
    return false;
  }
};
