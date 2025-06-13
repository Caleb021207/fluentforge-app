import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";

interface TestingRoleChangerProps {
  onRoleChanged: () => void;
}

const TestingRoleChanger = ({ onRoleChanged }: TestingRoleChangerProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isChanging, setIsChanging] = useState(false);
  const { toast } = useToast();

  const handleRoleChange = async () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive"
      });
      return;
    }

    setIsChanging(true);
    try {
      const { data, error } = await supabase.rpc('change_user_role_for_testing', {
        target_role: selectedRole
      });

      if (error) {
        throw error;
      }

      const result = data as { success: boolean; message: string };
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        onRoleChanged();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: "Error",
        description: "Failed to change role for testing",
        variant: "destructive"
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Settings className="h-5 w-5" />
          Testing Role Changer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-orange-600">
          This is a testing tool to switch between different user roles to test the interface.
        </p>
        
        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select role to test" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="district">District Admin</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleRoleChange}
            disabled={isChanging || !selectedRole}
            variant="outline"
          >
            {isChanging ? "Changing..." : "Change Role"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingRoleChanger;