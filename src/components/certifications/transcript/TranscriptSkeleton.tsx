
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

interface TranscriptSkeletonProps {
  onBack: () => void;
}

const TranscriptSkeleton = ({ onBack }: TranscriptSkeletonProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="outline" className="mr-4" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Skeleton className="h-8 w-64" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptSkeleton;
