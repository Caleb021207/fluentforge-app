
import AuthDebugPanel from "@/components/debug/AuthDebugPanel";

interface ProfileDebugPanelProps {
  debugInfo: any;
}

const ProfileDebugPanel = ({ debugInfo }: ProfileDebugPanelProps) => {
  return (
    <div className="mb-6 space-y-4">
      <AuthDebugPanel />
      {debugInfo && (
        <div className="bg-muted p-4 rounded">
          <h3 className="font-semibold mb-2">Profile Detection Debug:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProfileDebugPanel;
