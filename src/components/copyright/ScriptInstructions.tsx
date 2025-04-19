
import React from 'react';
import { AlertCircle, Info } from 'lucide-react';

const ScriptInstructions = () => {
  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <Info className="h-5 w-5 text-blue-500" />
        About Your Copyright Deposit
      </h3>
      <p className="mb-3">
        The copyright deposit package includes all necessary files required for registration:
      </p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Source code files</li>
        <li>Instructional content and translations</li>
        <li>Copyright documentation</li>
        <li>Legal notices and license information</li>
        <li>Application screenshots</li>
      </ul>
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-yellow-800">
          For technical users: If you prefer to generate the package manually, you can find the script 
          <code className="mx-1 bg-gray-200 px-1 py-0.5 rounded">prepare_copyright_deposit.sh</code>
          in the project root directory.
        </p>
      </div>
    </div>
  );
};

export default ScriptInstructions;
