
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PronounsContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pronouns</CardTitle>
        <CardDescription>
          Learn about different types of pronouns in Spanish
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="subject-pronouns">
            <AccordionTrigger>Subject Pronouns</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>Subject pronouns replace the subject noun in a sentence.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="font-medium">Singular</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li><span className="font-medium">yo</span> - I</li>
                      <li><span className="font-medium">tú</span> - you (informal)</li>
                      <li><span className="font-medium">usted</span> - you (formal)</li>
                      <li><span className="font-medium">él</span> - he</li>
                      <li><span className="font-medium">ella</span> - she</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="font-medium">Plural</h4>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li><span className="font-medium">nosotros/nosotras</span> - we</li>
                      <li><span className="font-medium">vosotros/vosotras</span> - you all (informal, Spain)</li>
                      <li><span className="font-medium">ustedes</span> - you all (formal/Latin America)</li>
                      <li><span className="font-medium">ellos</span> - they (masculine/mixed)</li>
                      <li><span className="font-medium">ellas</span> - they (feminine)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="direct-indirect">
            <AccordionTrigger>Direct & Indirect Object Pronouns</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Direct Object Pronouns</h4>
                  <p className="text-sm mt-1">Direct object pronouns replace the noun that directly receives the action of the verb.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm mb-1">Singular</h5>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">me</span> - me</li>
                        <li><span className="font-medium">te</span> - you</li>
                        <li><span className="font-medium">lo</span> - him/it (masculine)</li>
                        <li><span className="font-medium">la</span> - her/it (feminine)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm mb-1">Plural</h5>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">nos</span> - us</li>
                        <li><span className="font-medium">os</span> - you all</li>
                        <li><span className="font-medium">los</span> - them (masculine)</li>
                        <li><span className="font-medium">las</span> - them (feminine)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="reflexive">
            <AccordionTrigger>Reflexive Pronouns</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>Reflexive pronouns are used when the subject and object are the same person.</p>
                
                <div className="bg-slate-50 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">me</span> - myself</li>
                        <li><span className="font-medium">te</span> - yourself</li>
                        <li><span className="font-medium">se</span> - himself/herself/itself</li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">nos</span> - ourselves</li>
                        <li><span className="font-medium">os</span> - yourselves</li>
                        <li><span className="font-medium">se</span> - themselves</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PronounsContent;
