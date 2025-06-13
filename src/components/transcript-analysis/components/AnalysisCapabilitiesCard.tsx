
import React from "react";

const AnalysisCapabilitiesCard: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">What our AI can analyze:</h3>
      </div>
      <div className="p-6 pt-0">
        <ul className="space-y-2">
          <li>• Overall scores and CEFR levels</li>
          <li>• Individual skill breakdowns (Reading, Writing, Speaking, Listening)</li>
          <li>• Strengths and areas for improvement</li>
          
          <li>• Progress tracking over time</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalysisCapabilitiesCard;
