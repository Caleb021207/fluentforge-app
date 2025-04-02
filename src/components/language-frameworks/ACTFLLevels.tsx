
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ACTFLSublevel {
  name: string;
  description: string;
}

interface ACTFLLevel {
  level: string;
  description: string;
  sublevels?: ACTFLSublevel[];
}

interface ACTFLLevelsProps {
  levels: ACTFLLevel[];
}

export const ACTFLLevels = ({ levels }: ACTFLLevelsProps) => {
  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <Card key={level.level} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{level.level}</h3>
              <CardDescription className="text-sm mb-2">
                {level.description}
              </CardDescription>
              
              {level.sublevels && level.sublevels.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sublevels">
                    <AccordionTrigger className="text-sm font-medium">
                      View Sublevels
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {level.sublevels.map((sublevel) => (
                          <div key={sublevel.name} className="pl-4 border-l-2 border-muted">
                            <h4 className="font-medium text-sm">{sublevel.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {sublevel.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
