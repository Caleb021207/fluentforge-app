
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UnauthenticatedProgress = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/");
  };

  return (
    <div className="text-center py-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
      <p className="mb-6">Please sign in to view your progress data and personalized recommendations.</p>
      <Button 
        onClick={handleSignIn} 
        className="bg-lingua-primary hover:bg-lingua-primary/90"
      >
        Sign In
      </Button>
    </div>
  );
};

export default UnauthenticatedProgress;
