
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield } from "lucide-react";

interface PolicyHeaderProps {
  title: string;
  description: string;
}

const PolicyHeader: React.FC<PolicyHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-3 flex items-center text-lingua-primary">
        <Shield className="mr-2 h-8 w-8" />
        {title}
      </h1>
      <p className="text-gray-700 text-lg">
        {description}
      </p>
    </div>
  );
};

export default PolicyHeader;
