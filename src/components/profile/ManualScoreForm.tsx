
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, X } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const ManualScoreForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [certType, setCertType] = useState("reading");
  const [level, setLevel] = useState("B1");
  const [score, setScore] = useState("40");
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  const { currentLanguage } = useLocalization();

  const certificationTypes = [
    { value: "reading", label: currentLanguage === "spanish" ? "Lectura" : "Reading" },
    { value: "writing", label: currentLanguage === "spanish" ? "Escritura" : "Writing" },
    { value: "speaking", label: currentLanguage === "spanish" ? "Habla" : "Speaking" },
    { value: "listening", label: currentLanguage === "spanish" ? "Comprensión Auditiva" : "Listening" },
  ];

  const levels = [
    { value: "A1", label: "A1" },
    { value: "A2", label: "A2" },
    { value: "B1", label: "B1" },
    { value: "B2", label: "B2" },
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: currentLanguage === "spanish" ? "Error" : "Error",
          description: currentLanguage === "spanish" 
            ? "Debes iniciar sesión para agregar puntuaciones" 
            : "You must be logged in to add scores",
          variant: "destructive",
        });
        return;
      }

      const scoreValue = parseInt(score);
      if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
        toast({
          title: currentLanguage === "spanish" ? "Puntuación Inválida" : "Invalid Score",
          description: currentLanguage === "spanish"
            ? "La puntuación debe ser un número entre 0 y 100"
            : "Score must be a number between 0 and 100",
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
        title: currentLanguage === "spanish" ? "¡Éxito!" : "Success!",
        description: currentLanguage === "spanish"
          ? `Añadida puntuación de certificación de ${certType} nivel ${level}`
          : `Added ${level} level ${certType} certification score`,
      });
      
      // Hide the form after successful submission
      setIsVisible(false);
    } catch (error) {
      console.error("Error adding certification score:", error);
      toast({
        title: currentLanguage === "spanish" ? "Error" : "Error",
        description: currentLanguage === "spanish"
          ? "Error al agregar puntuación de certificación. Ver consola para detalles."
          : "Failed to add certification score. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <div className="flex justify-center mt-4 sm:mt-8">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          {currentLanguage === "spanish" ? "Agregar Puntuación de Certificación" : "Add Certification Score"}
        </Button>
      </div>
    );
  }

  return (
    <Card className="mt-4 sm:mt-8 max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 sm:px-6 sm:py-4">
        <CardTitle className="text-base sm:text-lg">
          {currentLanguage === "spanish" ? "Agregar Puntuación de Certificación" : "Add Certification Score"}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
        >
          <span className="sr-only">
            {currentLanguage === "spanish" ? "Cancelar" : "Cancel"}
          </span>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">
              {currentLanguage === "spanish" ? "Tipo de Certificación" : "Certification Type"}
            </label>
            <Select 
              value={certType} 
              onValueChange={setCertType}
            >
              <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-10">
                <SelectValue placeholder={
                  currentLanguage === "spanish" 
                    ? "Selecciona tipo de certificación" 
                    : "Select certification type"
                } />
              </SelectTrigger>
              <SelectContent>
                {certificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs sm:text-sm">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">
              {currentLanguage === "spanish" ? "Nivel" : "Level"}
            </label>
            <Select 
              value={level} 
              onValueChange={setLevel}
            >
              <SelectTrigger className="w-full text-xs sm:text-sm h-8 sm:h-10">
                <SelectValue placeholder={
                  currentLanguage === "spanish" 
                    ? "Selecciona nivel" 
                    : "Select level"
                } />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs sm:text-sm">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">
              {currentLanguage === "spanish" ? "Puntuación (0-100)" : "Score (0-100)"}
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full text-xs sm:text-sm h-8 sm:h-10"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-8 sm:h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                {currentLanguage === "spanish" ? "Agregando Puntuación..." : "Adding Score..."}
              </>
            ) : (
              currentLanguage === "spanish" ? "Agregar Puntuación" : "Add Score"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualScoreForm;
