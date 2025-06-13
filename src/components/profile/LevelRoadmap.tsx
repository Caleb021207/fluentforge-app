import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, BarChart } from "lucide-react";
import { getLevelDescription, CEFR_TO_ACTFL } from "@/components/certifications/utils/scoreUtils";
import { useLocalization } from "@/context/LocalizationContext";

interface LevelRoadmapProps {
  currentLevel: string;
  targetLevel: string;
  targetDate: string;
  testScores?: {
    reading?: number;
    writing?: number;
    speaking?: number;
    listening?: number;
  };
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LevelRoadmap = ({ currentLevel, targetLevel, targetDate, testScores }: LevelRoadmapProps) => {
  const { t, currentLanguage } = useLocalization();
  
  const calculateProgressToNextLevel = () => {
    // If no target level (C2 users) or current level not found, return 100%
    if (!targetLevel || CEFR_LEVELS.indexOf(currentLevel) === -1) return 100;
    
    const currentLevelIndex = CEFR_LEVELS.indexOf(currentLevel);
    const targetLevelIndex = CEFR_LEVELS.indexOf(targetLevel);
    
    if (currentLevelIndex === -1 || targetLevelIndex === -1) return 0;
    if (currentLevelIndex >= targetLevelIndex) return 100;
    
    const totalLevels = targetLevelIndex - currentLevelIndex;
    return Math.round((1 / totalLevels) * 100);
  };

  const getRemainingTime = () => {
    if (!targetDate) return currentLanguage === "spanish" ? "No hay fecha objetivo establecida" : "No target date set";
    if (!targetLevel) return currentLanguage === "spanish" ? "Nivel máximo alcanzado" : "Maximum level achieved";
    
    const target = new Date(targetDate);
    const now = new Date();
    const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return currentLanguage === "spanish" ? "La fecha objetivo ha pasado" : "Target date has passed";
    if (days === 0) return currentLanguage === "spanish" ? "Hoy es la fecha objetivo" : "Today is the target date";
    return currentLanguage === "spanish" ? `${days} días restantes` : `${days} days remaining`;
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {currentLanguage === "spanish" ? "Mapa de Ruta de Niveles CEFR" : "CEFR Level Roadmap"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currentLevel === 'C2' ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
              <h3 className="font-medium text-emerald-800 dark:text-emerald-200">
                {currentLanguage === "spanish" ? "¡Felicitaciones!" : "Congratulations!"}
              </h3>
              <p className="text-emerald-700 dark:text-emerald-300">
                {currentLanguage === "spanish" 
                  ? "Has alcanzado C2, el nivel más alto de competencia. ¡Sigue practicando para mantener tus habilidades!" 
                  : "You've reached C2, the highest proficiency level. Keep practicing to maintain your skills!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentLevel || (currentLanguage === "spanish" ? "No evaluado" : "Not assessed")}</span>
                <span>{targetLevel}</span>
              </div>
              <Progress value={calculateProgressToNextLevel()} />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">
                  {currentLanguage === "spanish" ? "Progreso hacia la Meta" : "Progress to Goal"}
                </span>
                <span className="text-sm text-muted-foreground">{calculateProgressToNextLevel()}%</span>
              </div>
            </div>
          )}

          {testScores && (
            <div className="bg-muted p-4 rounded-lg border border-border mt-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart className="h-4 w-4 text-primary" />
                <h3 className="font-medium">
                  {currentLanguage === "spanish" ? "Tus Puntajes de Prueba" : "Your Test Scores"}
                </h3>
              </div>
              <div className="grid gap-2">
                {testScores.reading !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{currentLanguage === "spanish" ? "Lectura:" : "Reading:"}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.reading} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.reading}%</span>
                    </div>
                  </div>
                )}
                {testScores.writing !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{currentLanguage === "spanish" ? "Escritura:" : "Writing:"}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.writing} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.writing}%</span>
                    </div>
                  </div>
                )}
                {testScores.speaking !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{currentLanguage === "spanish" ? "Habla:" : "Speaking:"}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.speaking} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.speaking}%</span>
                    </div>
                  </div>
                )}
                {testScores.listening !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{currentLanguage === "spanish" ? "Comprensión Auditiva:" : "Listening:"}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={testScores.listening} className="w-24 h-2" />
                      <span className="text-sm font-medium">{testScores.listening}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{getRemainingTime()}</span>
          </div>

          <div className="bg-muted p-3 rounded-lg border border-border mb-4">
            <h4 className="text-sm font-medium mb-2">
              {currentLanguage === "spanish" ? "Conversión de CEFR a ACTFL" : "CEFR to ACTFL Conversion"}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {Object.entries(CEFR_TO_ACTFL).map(([cefr, actfl]) => (
                <div key={cefr} className="flex justify-between">
                  <span className="font-medium">{cefr}:</span>
                  <span>{actfl}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {CEFR_LEVELS.map((level, index) => {
              const currentLevelIndex = CEFR_LEVELS.indexOf(currentLevel);
              const targetLevelIndex = CEFR_LEVELS.indexOf(targetLevel);
              const isCompleted = currentLevelIndex >= index;
              const isCurrent = currentLevelIndex === index;
              const isTarget = targetLevelIndex === index;

              return (
                <div
                  key={level}
                  className={`p-3 rounded-lg border ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                      : isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
                      : isTarget
                      ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
                      : 'bg-muted border-border'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{level}</span>
                    <span className="text-sm">
                      {isCurrent && (currentLanguage === "spanish" ? '(Actual)' : '(Current)')}
                      {isTarget && (currentLanguage === "spanish" ? '(Objetivo)' : '(Target)')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentLanguage === "spanish" 
                      ? getSpanishLevelDescription(level) 
                      : getLevelDescription(level)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get Spanish descriptions for CEFR levels
const getSpanishLevelDescription = (level: string) => {
  switch (level) {
    case 'C2':
      return 'Dominio: Puede entender prácticamente todo texto, producir textos con fluidez y precisión en situaciones complejas, y comprender a hablantes nativos en temas abstractos.';
    case 'C1':
      return 'Avanzado: Puede entender textos largos y complejos, expresarse con fluidez y espontaneidad, y usar el lenguaje con eficacia en contextos sociales y profesionales.';
    case 'B2':
      return 'Intermedio alto: Puede entender ideas principales de textos complejos, interactuar con fluidez con hablantes nativos, y producir textos detallados sobre diversos temas.';
    case 'B1':
      return 'Intermedio: Puede comprender puntos principales sobre temas familiares, desenvolverse en situaciones de viaje, y producir textos sencillos sobre temas de interés personal.';
    case 'A2':
      return 'Elemental: Puede entender frases y expresiones de uso frecuente, comunicarse en tareas sencillas y habituales, y describir aspectos de su pasado y entorno.';
    case 'A1':
      return 'Principiante: Puede entender y usar expresiones cotidianas básicas, presentarse a sí mismo y a otros, y responder a preguntas sobre detalles personales básicos.';
    default:
      return '';
  }
};

export default LevelRoadmap;
