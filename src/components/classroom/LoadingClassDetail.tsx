
import React from 'react';
import AnimatedLoader from "@/components/ui/animated-loader";

interface LoadingClassDetailProps {
  loadingText: string;
}

const LoadingClassDetail: React.FC<LoadingClassDetailProps> = ({ loadingText }) => {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <AnimatedLoader 
        size="lg" 
        color="text-palavox-primary"
        message={loadingText}
      />
    </div>
  );
};

export default LoadingClassDetail;
