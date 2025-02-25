
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Question = {
  text: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple-choice' | 'true-false';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
};

// Creating comprehensive question set with 18 questions per CEFR level
const READING_QUESTIONS: Question[] = [
  // A1 Level
  {
    level: 'A1',
    type: 'multiple-choice',
    text: "María está en la tienda. Ella compra pan y leche. ¿Dónde está María?",
    options: ["En la casa", "En la tienda", "En el parque", "En la escuela"],
    correctAnswer: 1
  },
  {
    level: 'A1',
    type: 'multiple-choice',
    text: "Juan tiene un perro. El perro es negro y pequeño. ¿De qué color es el perro?",
    options: ["Blanco", "Marrón", "Negro", "Gris"],
    correctAnswer: 2
  },
  {
    level: 'A1',
    type: 'true-false',
    text: "El perro de Juan es grande.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // A2 Level
  {
    level: 'A2',
    type: 'multiple-choice',
    text: "Carmen trabaja en un hospital. Ella ayuda a personas enfermas. ¿Qué profesión tiene Carmen?",
    options: ["Maestra", "Doctora", "Cocinera", "Arquitecta"],
    correctAnswer: 1
  },
  {
    level: 'A2',
    type: 'multiple-choice',
    text: "Pedro desayuna café con leche y tostadas todos los días. ¿Qué bebe Pedro?",
    options: ["Té", "Jugo", "Agua", "Café con leche"],
    correctAnswer: 3
  },
  {
    level: 'A2',
    type: 'true-false',
    text: "Pedro desayuna cereales.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // B1 Level
  {
    level: 'B1',
    type: 'multiple-choice',
    text: "Ana estudia mucho porque quiere ser médica. Le interesan las ciencias y ayudar a otros. ¿Por qué estudia Ana?",
    options: [
      "Porque sus padres la obligan",
      "Porque quiere ser médica",
      "Porque es fácil",
      "Porque no tiene trabajo"
    ],
    correctAnswer: 1
  },
  {
    level: 'B1',
    type: 'multiple-choice',
    text: "Durante el verano, Miguel viaja a la playa con su familia. Disfrutan nadando y tomando el sol. ¿Qué actividad realizan?",
    options: ["Esquiar", "Nadar", "Caminar", "Dormir"],
    correctAnswer: 1
  },
  {
    level: 'B1',
    type: 'true-false',
    text: "Miguel y su familia viajan a la montaña en verano.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // B2 Level
  {
    level: 'B2',
    type: 'multiple-choice',
    text: "La contaminación ambiental es un problema grave que afecta a nuestro planeta. Los científicos buscan soluciones para reducir su impacto. ¿Qué buscan los científicos?",
    options: [
      "Aumentar la contaminación",
      "Soluciones para reducir el impacto",
      "Ignorar el problema",
      "Crear más industrias"
    ],
    correctAnswer: 1
  },
  {
    level: 'B2',
    type: 'multiple-choice',
    text: "El desarrollo de la tecnología ha transformado nuestra forma de trabajar y comunicarnos. ¿Qué ha cambiado la tecnología?",
    options: [
      "Solo el trabajo",
      "Solo la comunicación",
      "La forma de trabajar y comunicarnos",
      "Nada ha cambiado"
    ],
    correctAnswer: 2
  },
  {
    level: 'B2',
    type: 'true-false',
    text: "La tecnología solo ha afectado al trabajo.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // C1 Level
  {
    level: 'C1',
    type: 'multiple-choice',
    text: "La globalización ha contribuido significativamente al intercambio cultural entre países, aunque también ha generado debates sobre la pérdida de identidades locales. ¿Cuál es uno de los efectos negativos mencionados de la globalización?",
    options: [
      "El intercambio cultural",
      "La pérdida de identidades locales",
      "El crecimiento económico",
      "La comunicación internacional"
    ],
    correctAnswer: 1
  },
  {
    level: 'C1',
    type: 'multiple-choice',
    text: "Los avances en la investigación científica han permitido desarrollar nuevos tratamientos médicos, aunque el acceso a estos no siempre es equitativo. ¿Cuál es el problema mencionado con los nuevos tratamientos?",
    options: [
      "No son efectivos",
      "Son muy antiguos",
      "El acceso no es equitativo",
      "No hay investigación"
    ],
    correctAnswer: 2
  },
  {
    level: 'C1',
    type: 'true-false',
    text: "Todos tienen acceso equitativo a los nuevos tratamientos médicos.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // C2 Level
  {
    level: 'C2',
    type: 'multiple-choice',
    text: "La intersección entre la inteligencia artificial y la ética plantea dilemas filosóficos fundamentales sobre la consciencia y la responsabilidad moral de las máquinas. ¿Qué aspecto se debate principalmente?",
    options: [
      "La velocidad de las máquinas",
      "El costo de la tecnología",
      "La consciencia y responsabilidad moral",
      "El consumo de energía"
    ],
    correctAnswer: 2
  },
  {
    level: 'C2',
    type: 'multiple-choice',
    text: "La preservación de lenguas minoritarias en la era digital representa un desafío significativo para la diversidad lingüística global. ¿Qué se ve amenazado según el texto?",
    options: [
      "La era digital",
      "La diversidad lingüística",
      "El uso de tecnología",
      "El aprendizaje de idiomas"
    ],
    correctAnswer: 1
  },
  {
    level: 'C2',
    type: 'true-false',
    text: "La era digital favorece naturalmente la preservación de lenguas minoritarias.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
];

const ReadingCertification = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState<string>('A1');

  const questionsForLevel = READING_QUESTIONS.filter(q => q.level === currentLevel);

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setIsCompleted(false);
  };

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsForLevel.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questionsForLevel[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questionsForLevel.length) * 100);
  };

  const determineLevel = (score: number) => {
    if (score >= 80) {
      return currentLevel === 'C2' ? 'C2' : 
             READING_QUESTIONS.find(q => q.level > currentLevel)?.level || currentLevel;
    } else if (score >= 60) {
      return currentLevel;
    } else {
      return READING_QUESTIONS.find(q => q.level < currentLevel)?.level || currentLevel;
    }
  };

  const completeTest = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your certification attempt.",
          variant: "destructive",
        });
        return;
      }

      const score = calculateScore();
      const level = determineLevel(score);

      const { error } = await supabase
        .from('certification_attempts')
        .insert([
          {
            certification_type: 'reading',
            score,
            level,
            completed_at: new Date().toISOString(),
            user_id: user.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Certification Completed!",
        description: `You scored ${score}%. Level achieved: ${level}`,
      });

      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting reading certification:', error);
      toast({
        title: "Error",
        description: "Failed to save certification result",
        variant: "destructive",
      });
    }
  };

  const currentQuestion = questionsForLevel[currentQuestionIndex];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Reading Certification Test - Level {currentLevel}</CardTitle>
      </CardHeader>
      <CardContent>
        {!isStarted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test your Spanish reading comprehension skills. You'll be presented with
              various types of questions to determine your CEFR level.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleStart}>Start Test</Button>
            </div>
          </div>
        ) : isCompleted ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Test completed! Check your results below.
            </p>
            <Button onClick={handleStart}>Take Test Again</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="mb-4">{currentQuestion.text}</p>
              <RadioGroup 
                onValueChange={handleAnswerSelect}
                value={selectedAnswers[currentQuestionIndex]?.toString()}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questionsForLevel.length}
              </div>
              <Button 
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
              >
                {currentQuestionIndex === questionsForLevel.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingCertification;

