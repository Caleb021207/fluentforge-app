
import React from 'react';
import { AlertCircle } from 'lucide-react';

const ScriptInstructions = () => {
  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-blue-500" />
        How to Generate the Copyright Deposit
      </h3>
      <ol className="list-decimal ml-5 space-y-2">
        <li>Open your terminal</li>
        <li>Navigate to the project root directory</li>
        <li>Make the script executable by running:<br/>
          <code className="bg-gray-200 px-2 py-1 rounded">chmod +x prepare_copyright_deposit.sh</code>
        </li>
        <li>Run the script with:<br/>
          <code className="bg-gray-200 px-2 py-1 rounded">./prepare_copyright_deposit.sh</code>
        </li>
      </ol>
      <p className="mt-4 text-sm text-gray-600">
        After running the script, the ZIP file will be created and you can download it using the button above.
      </p>
    </div>
  );
};

export default ScriptInstructions;
