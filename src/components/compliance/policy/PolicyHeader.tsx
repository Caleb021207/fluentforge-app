
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield } from "lucide-react";

interface PolicyHeaderProps {
  title: string;
  description: string;
}

const PolicyHeader: React.FC<PolicyHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <Shield className="mr-2 h-8 w-8 text-lingua-primary" />
        {title}
      </h1>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default PolicyHeader;
