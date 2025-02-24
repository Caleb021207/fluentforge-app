
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "What's the meaning of 'Hello' in Spanish?",
    options: ["Hola", "Adiós", "Gracias", "Por favor"],
    correctAnswer: "Hola",
  },
  {
    id: 2,
    text: "Which tense is used in: 'I am eating'?",
    options: ["Present Simple", "Present Continuous", "Past Simple", "Future"],
    correctAnswer: "Present Continuous",
  },
  {
    id: 3,
    text: "Choose the correct article: '___ book is on the table.",
    options: ["A", "An", "The", "None"],
    correctAnswer: "The",
  },
];

const PlacementQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and redirect to lessons
      const score = newAnswers.reduce(
        (acc, curr, idx) =>
          curr === questions[idx].correctAnswer ? acc + 1 : acc,
        0
      );
      const level = score <= 1 ? "beginner" : score === 2 ? "intermediate" : "advanced";
      navigate(`/lessons?level=${level}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-lingua-text">Placement Quiz</h1>
          <p className="text-gray-600">
            Let's find the perfect starting point for your language learning journey.
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <p className="text-lg mb-6">{questions[currentQuestion].text}</p>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option) => (
              <Button
                key={option}
                variant="outline"
                className="w-full text-left justify-start h-auto py-4 text-lg"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlacementQuiz;
