
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const VerbTensesContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verb Tenses & Conjugations</CardTitle>
        <CardDescription>
          Spanish has numerous verb tenses that express when an action takes place
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="present-tense">
            <AccordionTrigger>Present Tense (Presente)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Regular Verbs</h4>
                  <p>Spanish has three types of regular verbs: -ar, -er, and -ir verbs.</p>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm mb-2">-AR Verbs (hablar)</h5>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">yo</span> habl<span className="text-green-600 font-bold">o</span></li>
                        <li><span className="font-medium">tú</span> habl<span className="text-green-600 font-bold">as</span></li>
                        <li><span className="font-medium">él/ella/usted</span> habl<span className="text-green-600 font-bold">a</span></li>
                        <li><span className="font-medium">nosotros</span> habl<span className="text-green-600 font-bold">amos</span></li>
                        <li><span className="font-medium">vosotros</span> habl<span className="text-green-600 font-bold">áis</span></li>
                        <li><span className="font-medium">ellos/ellas/ustedes</span> habl<span className="text-green-600 font-bold">an</span></li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm mb-2">-ER Verbs (comer)</h5>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">yo</span> com<span className="text-blue-600 font-bold">o</span></li>
                        <li><span className="font-medium">tú</span> com<span className="text-blue-600 font-bold">es</span></li>
                        <li><span className="font-medium">él/ella/usted</span> com<span className="text-blue-600 font-bold">e</span></li>
                        <li><span className="font-medium">nosotros</span> com<span className="text-blue-600 font-bold">emos</span></li>
                        <li><span className="font-medium">vosotros</span> com<span className="text-blue-600 font-bold">éis</span></li>
                        <li><span className="font-medium">ellos/ellas/ustedes</span> com<span className="text-blue-600 font-bold">en</span></li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm mb-2">-IR Verbs (vivir)</h5>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">yo</span> viv<span className="text-purple-600 font-bold">o</span></li>
                        <li><span className="font-medium">tú</span> viv<span className="text-purple-600 font-bold">es</span></li>
                        <li><span className="font-medium">él/ella/usted</span> viv<span className="text-purple-600 font-bold">e</span></li>
                        <li><span className="font-medium">nosotros</span> viv<span className="text-purple-600 font-bold">imos</span></li>
                        <li><span className="font-medium">vosotros</span> viv<span className="text-purple-600 font-bold">ís</span></li>
                        <li><span className="font-medium">ellos/ellas/ustedes</span> viv<span className="text-purple-600 font-bold">en</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mt-4">Common Irregular Verbs</h4>
                  <p className="mb-2">Some of the most common Spanish verbs are irregular in the present tense:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm mb-2">ser (to be)</h5>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">yo</span> soy</li>
                        <li><span className="font-medium">tú</span> eres</li>
                        <li><span className="font-medium">él/ella/usted</span> es</li>
                        <li><span className="font-medium">nosotros</span> somos</li>
                        <li><span className="font-medium">vosotros</span> sois</li>
                        <li><span className="font-medium">ellos/ellas/ustedes</span> son</li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm mb-2">ir (to go)</h5>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">yo</span> voy</li>
                        <li><span className="font-medium">tú</span> vas</li>
                        <li><span className="font-medium">él/ella/usted</span> va</li>
                        <li><span className="font-medium">nosotros</span> vamos</li>
                        <li><span className="font-medium">vosotros</span> vais</li>
                        <li><span className="font-medium">ellos/ellas/ustedes</span> van</li>
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

export default VerbTensesContent;
