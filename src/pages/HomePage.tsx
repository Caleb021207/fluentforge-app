
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

const HomePage = () => {
  const { t } = useLocalization();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Language Learning Platform</h1>
      
      <div className="space-y-4 w-full max-w-md">
        <Link to="/practice" className="block w-full">
          <Button className="w-full" size="lg">
            Free Practice
          </Button>
        </Link>
        
        <Link to="/voice-chat" className="block w-full">
          <Button className="w-full" size="lg" variant="outline">
            Premium Voice Chat
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
