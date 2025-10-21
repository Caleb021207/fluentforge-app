import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Exercise, GuidedConvoTextPayload } from '@/types/exercises';

interface Props {
  exercise: Exercise;
  onComplete: (outcome: 'correct' | 'partial' | 'incorrect', score: number) => void;
}

const GuidedConvoTextExercise = ({ exercise, onComplete }: Props) => {
  const payload = exercise.payload as GuidedConvoTextPayload;
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [totalScore, setTotalScore] = useState(0);

  const step = payload.steps[currentStep];

  const handleNext = (isCorrect: boolean) => {
    const score = isCorrect ? 100 / payload.steps.length : 0;
    setTotalScore(prev => prev + score);

    if (currentStep < payload.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUserAnswer('');
      setSelectedOption('');
    } else {
      onComplete(totalScore + score >= 60 ? 'correct' : 'partial', totalScore + score);
    }
  };

  const handleChoice = () => {
    if (step.kind !== 'choice') return;
    
    const isCorrect = parseInt(selectedOption) === step.answer;
    setConversation(prev => [...prev, 
      { role: 'system', content: step.prompt },
      { role: 'user', content: step.options[parseInt(selectedOption)] }
    ]);
    
    handleNext(isCorrect);
  };

  const handleCloze = () => {
    if (step.kind !== 'cloze') return;
    
    const normalized = userAnswer.trim().toLowerCase();
    const isCorrect = step.answers.some(ans => ans.toLowerCase() === normalized);
    
    setConversation(prev => [...prev,
      { role: 'system', content: step.prompt },
      { role: 'user', content: userAnswer }
    ]);
    
    handleNext(isCorrect);
  };

  const handleShort = () => {
    if (step.kind !== 'short') return;
    
    setConversation(prev => [...prev,
      { role: 'system', content: step.prompt },
      { role: 'user', content: userAnswer }
    ]);
    
    // Accept any reasonable attempt for short answers
    handleNext(userAnswer.trim().length > 5);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Guided Conversation</h3>
        <p className="text-sm text-muted-foreground">
          Topic: {payload.topic} • Level: {payload.cefr}
        </p>
        <div className="text-xs text-muted-foreground mt-2">
          Step {currentStep + 1} of {payload.steps.length}
        </div>
      </div>

      {/* Conversation history */}
      {conversation.length > 0 && (
        <Card className="p-4 max-h-48 overflow-y-auto space-y-2">
          {conversation.map((msg, i) => (
            <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
              <span className={`inline-block px-3 py-2 rounded-lg ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {msg.content}
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* Current step */}
      <Card className="p-6">
        {step.kind === 'choice' && (
          <div className="space-y-4">
            <p className="text-lg mb-4">{step.prompt}</p>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {step.options.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                  <Label htmlFor={`option-${i}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={handleChoice} disabled={!selectedOption} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step.kind === 'cloze' && (
          <div className="space-y-4">
            <p className="text-lg mb-4">{step.prompt}</p>
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && handleCloze()}
              placeholder="Type your answer..."
              autoFocus
            />
            <Button onClick={handleCloze} disabled={!userAnswer.trim()} className="w-full">
              Submit
            </Button>
          </div>
        )}

        {step.kind === 'short' && (
          <div className="space-y-4">
            <p className="text-lg mb-4">{step.prompt}</p>
            {step.rubric && (
              <p className="text-sm text-muted-foreground mb-2">Hint: {step.rubric}</p>
            )}
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && handleShort()}
              placeholder="Type your response..."
              autoFocus
            />
            <Button onClick={handleShort} disabled={!userAnswer.trim()} className="w-full">
              Submit
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GuidedConvoTextExercise;
