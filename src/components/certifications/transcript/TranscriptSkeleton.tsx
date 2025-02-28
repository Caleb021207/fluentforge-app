
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TranscriptSkeletonProps {
  onBack: () => void;
}

const TranscriptSkeleton: React.FC<TranscriptSkeletonProps> = ({ onBack }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button onClick={onBack} variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Certificates
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            {/* Assessment skeleton */}
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-full md:w-1/3">
                <Skeleton className="h-40 w-full" />
              </div>
              <div className="w-full md:w-2/3">
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
            
            {/* Feedback skeleton */}
            <Skeleton className="h-32 w-full" />
            
            {/* Transcript skeleton */}
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptSkeleton;
