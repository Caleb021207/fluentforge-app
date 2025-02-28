
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
          <div className="space-y-6">
            {/* Skeleton for conversation items */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </div>
              </div>
            ))}
            
            {/* Skeleton for analysis section */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptSkeleton;
