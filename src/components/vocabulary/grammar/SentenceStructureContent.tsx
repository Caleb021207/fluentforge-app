
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const SentenceStructureContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentence Structure</CardTitle>
        <CardDescription>
          Learn how to form sentences in Spanish
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="basic-sentence">
            <AccordionTrigger>Basic Sentence Structure</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>The basic Spanish sentence structure is similar to English: Subject + Verb + Object</p>
                
                <div className="bg-slate-50 p-3 rounded-md">
                  <p><span className="font-medium">Example:</span> "Yo como manzanas" (I eat apples)</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li><span className="font-medium">Subject:</span> Yo (I)</li>
                    <li><span className="font-medium">Verb:</span> como (eat)</li>
                    <li><span className="font-medium">Object:</span> manzanas (apples)</li>
                  </ul>
                </div>
                
                <div className="mt-3">
                  <h4 className="font-medium">Subject Pronouns</h4>
                  <p className="text-sm mt-1">In Spanish, the subject pronoun is often omitted because the verb ending already indicates who is performing the action.</p>
                  <div className="bg-slate-50 p-3 rounded-md mt-2">
                    <p><span className="font-medium">With pronoun:</span> "Yo hablo español"</p>
                    <p><span className="font-medium">Without pronoun:</span> "Hablo español" (I speak Spanish)</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="questions">
            <AccordionTrigger>Questions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>In Spanish, questions are formed by changing the intonation or by using question words.</p>
                
                <div className="bg-slate-50 p-3 rounded-md">
                  <h4 className="font-medium">Yes/No Questions</h4>
                  <p className="text-sm mt-1">Simply raise the intonation at the end of a statement or invert the subject and verb.</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li><span className="font-medium">Statement:</span> "Tienes hambre" (You are hungry)</li>
                    <li><span className="font-medium">Question:</span> "¿Tienes hambre?" (Are you hungry?)</li>
                  </ul>
                </div>
                
                <div className="mt-3">
                  <h4 className="font-medium">Question Words (Interrogative Words)</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-sm"><span className="font-medium">¿Qué?</span> - What?</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-sm"><span className="font-medium">¿Quién?</span> - Who?</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-sm"><span className="font-medium">¿Dónde?</span> - Where?</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-sm"><span className="font-medium">¿Cuándo?</span> - When?</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-sm"><span className="font-medium">¿Por qué?</span> - Why?</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-md">
                      <p className="text-sm"><span className="font-medium">¿Cómo?</span> - How?</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="negation">
            <AccordionTrigger>Negation</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>To make a sentence negative in Spanish, place "no" before the verb.</p>
                
                <div className="bg-slate-50 p-3 rounded-md">
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-medium">Affirmative:</span> "Tengo dinero" (I have money)</li>
                    <li><span className="font-medium">Negative:</span> "No tengo dinero" (I don't have money)</li>
                  </ul>
                </div>
                
                <div className="mt-3">
                  <h4 className="font-medium">Double Negation</h4>
                  <p className="text-sm mt-1">In Spanish, double negation is grammatically correct and required in certain contexts.</p>
                  <div className="bg-slate-50 p-3 rounded-md mt-2">
                    <p className="text-sm"><span className="font-medium">Example:</span> "No veo a nadie" (I don't see anyone)</p>
                    <p className="text-sm mt-1"><span className="italic">Literal translation: "I don't see nobody"</span></p>
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

export default SentenceStructureContent;
