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
  // If no userId, user is not logged in - only allow A1 and Grammar
  if (!userId) {
    return level === "A1" || level === "Grammar";
  }

  // A1 and Grammar are always unlocked
  if (level === "A1" || level === "Grammar") {
    return true;
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
      // Check if user has achieved this level or higher in certification
      const ceferLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const requiredLevelIndex = ceferLevels.indexOf(level.replace('-C2', ''));
      
      // If any certification meets or exceeds the required level, unlock this level
      // and all levels below it
      for (const cert of certData) {
        const certLevelIndex = ceferLevels.indexOf(cert.level);
        // Check if certification level is equal or higher than required level
        if (certLevelIndex >= requiredLevelIndex) {
          return true;
        }
        // If user is certified at a lower level, automatically unlock all levels up to 
        // their certified level
        if (certLevelIndex >= 0 && requiredLevelIndex <= certLevelIndex) {
          return true;
        }
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
