
import { Card, CardContent, CardDescription } from "@/components/ui/card";

interface CEFRLevel {
  level: string;
  name: string;
  description: string;
}

interface CEFRLevelsProps {
  levels: CEFRLevel[];
}

export const CEFRLevels = ({ levels }: CEFRLevelsProps) => {
  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <Card key={level.level} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                {level.level}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold flex items-center">
                  {level.name}
                </h3>
                <CardDescription className="text-sm">
                  {level.description}
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
