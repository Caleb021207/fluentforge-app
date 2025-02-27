
import { supabase } from "@/integrations/supabase/client";
import { FlashcardSet } from "../types";

// Map of level dependencies - each level requires the previous level to be completed
export const LEVEL_DEPENDENCIES: Record<string, string> = {
  "A1": "",  // A1 has no prerequisites
  "A2": "",  // Removed dependency
  "B1": "",  // Removed dependency
  "B2": "",  // Removed dependency
  "C1-C2": "",  // Removed dependency
  "Grammar": ""  // Grammar has no prerequisites
};

// Required score to unlock next level (75%)
export const REQUIRED_SCORE = 75;

// Check if a specific level is unlocked for the current user
export const isLevelUnlocked = async (
  level: string,
  userId: string | undefined
): Promise<boolean> => {
  // All levels are always unlocked for all users
  return true;
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
