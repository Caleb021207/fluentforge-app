
import { useState } from "react";
import { FlashcardSet } from "./types";
import FlashcardSetCard from "./FlashcardSetCard";
import { Skeleton } from "@/components/ui/skeleton";

interface FlashcardSetsListProps {
  sets: FlashcardSet[];
  onSelectSet: (setId: string) => void;
  isLoading?: boolean;
}

const FlashcardSetsList = ({ sets, onSelectSet, isLoading = false }: FlashcardSetsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No flashcard sets available for this level yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {sets.map((set) => (
        <FlashcardSetCard 
          key={set.id} 
          set={set} 
          onSelect={onSelectSet} 
        />
      ))}
    </div>
  );
};

export default FlashcardSetsList;
