
import React from 'react';
import ChatContainer from "@/components/practice/ChatContainer";
import PracticeHeader from "@/components/practice/PracticeHeader";
import { useLocalization } from "@/context/LocalizationContext";

const FreeTierPractice = () => {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto p-4">
      <PracticeHeader />
      <ChatContainer />
    </div>
  );
};

export default FreeTierPractice;
