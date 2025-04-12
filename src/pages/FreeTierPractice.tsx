
import React from 'react';
import { useLocalization } from "@/context/LocalizationContext";

const FreeTierPractice = () => {
  const { t } = useLocalization();
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Free Practice</h1>
      <p className="text-lg">Practice your language skills for free.</p>
    </div>
  );
};

export default FreeTierPractice;
