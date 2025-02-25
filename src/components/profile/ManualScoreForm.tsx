
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle } from "lucide-react";

const certificationTypes = [
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
  { value: "listening", label: "Listening" },
];

const levels = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

const ManualScoreForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [certType, setCertType] = useState("reading");
  const [level, setLevel] = useState("B1");
  const [score, setScore] = useState("40");
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add scores",
          variant: "destructive",
        });
        return;
      }

      const scoreValue = parseInt(score);
      if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        toast({
          title: "Invalid Score",
          description: "Score must be a number between 0 and 100",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: certType,
            score: scoreValue,
            level,
            user_id: user.id,
            completed_at: new Date().toISOString(),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Added ${level} level ${certType} certification score`,
      });
      
      // Hide the form after successful submission
      setIsVisible(false);
    } catch (error) {
      console.error("Error adding certification score:", error);
      toast({
        title: "Error",
        description: "Failed to add certification score. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add Certification Score
        </Button>
      </div>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add Certification Score</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(false)}
        >
          Cancel
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Certification Type</label>
            <Select 
              value={certType} 
              onValueChange={setCertType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select certification type" />
              </SelectTrigger>
              <SelectContent>
                {certificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Level</label>
            <Select 
              value={level} 
              onValueChange={setLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Score (0-100)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Score...
              </>
            ) : (
              "Add Score"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualScoreForm;
