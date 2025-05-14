
import React from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import AuthenticatedAccuracy from "@/components/accuracy/AuthenticatedAccuracy";
import UnauthenticatedAccuracy from "@/components/accuracy/UnauthenticatedAccuracy";

const Accuracy = () => {
  const { isLoading, isAuthenticated } = useAuthGuard({ redirectIfNotAuthenticated: false });

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6">
      {isAuthenticated ? <AuthenticatedAccuracy /> : <UnauthenticatedAccuracy />}
      {!isAuthenticated && <AuthRequiredPrompt />}
    </div>
  );
};

export default Accuracy;
