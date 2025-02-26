
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const SpecialUsesContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Special Uses & Constructions</CardTitle>
        <CardDescription>
          Advanced grammar structures for more nuanced expression
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ser-estar">
            <AccordionTrigger>Ser vs. Estar (To Be)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>Spanish has two verbs that mean "to be": <span className="font-medium">ser</span> and <span className="font-medium">estar</span>. Each is used in specific contexts.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="font-medium">Ser (Permanent/Essential)</h4>
                    <p className="text-sm mt-1">Used for permanent or essential characteristics.</p>
                    <h5 className="font-medium text-sm mt-2">Uses:</h5>
                    <ul className="list-disc ml-4 mt-1 text-sm space-y-1">
                      <li>Identity: "Soy profesor" (I am a teacher)</li>
                      <li>Origin: "Son de España" (They are from Spain)</li>
                      <li>Inherent qualities: "Es inteligente" (He is intelligent)</li>
                      <li>Time: "Es la una" (It's one o'clock)</li>
                      <li>Possession: "Este libro es de María" (This book is Maria's)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="font-medium">Estar (Temporary/Condition)</h4>
                    <p className="text-sm mt-1">Used for temporary states, locations, or conditions.</p>
                    <h5 className="font-medium text-sm mt-2">Uses:</h5>
                    <ul className="list-disc ml-4 mt-1 text-sm space-y-1">
                      <li>Location: "Estoy en casa" (I am at home)</li>
                      <li>Temporary conditions: "Está enfermo" (He is sick)</li>
                      <li>Emotions: "Están felices" (They are happy)</li>
                      <li>Continuous actions: "Estoy comiendo" (I am eating)</li>
                      <li>Results of change: "La sopa está caliente" (The soup is hot)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md mt-3">
                  <h4 className="font-medium">Same Adjective, Different Meaning</h4>
                  <p className="text-sm mt-1">Some adjectives change meaning depending on whether they're used with ser or estar:</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li><span className="font-medium">Ser aburrido</span> - to be boring (character trait)</li>
                    <li><span className="font-medium">Estar aburrido</span> - to be bored (current state)</li>
                    <li><span className="font-medium">Ser listo</span> - to be clever (character trait)</li>
                    <li><span className="font-medium">Estar listo</span> - to be ready (current state)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="por-para">
            <AccordionTrigger>Por vs. Para (For)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p>Both "por" and "para" can be translated as "for" in English, but they are used in different contexts.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="font-medium">Por</h4>
                    <h5 className="font-medium text-sm mt-2">Uses:</h5>
                    <ul className="list-disc ml-4 mt-1 text-sm space-y-1">
                      <li>Duration: "Estudié por tres horas" (I studied for three hours)</li>
                      <li>Exchange: "Pagué 10 euros por el libro" (I paid 10 euros for the book)</li>
                      <li>Reason/cause: "Lo hice por ti" (I did it for you/because of you)</li>
                      <li>Means: "Te envié el mensaje por correo" (I sent you the message by mail)</li>
                      <li>Agent: "Escrito por Cervantes" (Written by Cervantes)</li>
                      <li>Movement through: "Caminar por el parque" (To walk through the park)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-md">
                    <h4 className="font-medium">Para</h4>
                    <h5 className="font-medium text-sm mt-2">Uses:</h5>
                    <ul className="list-disc ml-4 mt-1 text-sm space-y-1">
                      <li>Purpose: "Esto es para ti" (This is for you)</li>
                      <li>Recipient: "Un regalo para María" (A gift for Maria)</li>
                      <li>Deadline: "La tarea es para mañana" (The homework is for tomorrow)</li>
                      <li>Destination: "El avión para Madrid" (The plane to Madrid)</li>
                      <li>Goal: "Estudio para ser doctor" (I study to be a doctor)</li>
                    </ul>
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

export default SpecialUsesContent;
