
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const GrammarRules = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Spanish Grammar Rules</h2>
        <p className="text-muted-foreground mb-4">
          Master the essential grammar rules for Spanish at all levels. Select a category below to explore different grammar concepts.
        </p>
      </div>

      <Tabs defaultValue="verb-tenses" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="verb-tenses">Verb Tenses</TabsTrigger>
          <TabsTrigger value="sentence-structure">Sentence Structure</TabsTrigger>
          <TabsTrigger value="pronouns">Pronouns</TabsTrigger>
          <TabsTrigger value="special-uses">Special Uses</TabsTrigger>
        </TabsList>

        <TabsContent value="verb-tenses" className="mt-4">
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
                
                <AccordionItem value="past-tense">
                  <AccordionTrigger>Past Tenses (Pretérito & Imperfecto)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Preterite (Pretérito)</h4>
                        <p>Used for completed actions in the past with a clear beginning and end.</p>
                        
                        <div className="bg-slate-50 p-3 rounded-md mt-2">
                          <h5 className="font-medium text-sm mb-2">Example: hablar (to speak)</h5>
                          <ul className="space-y-1 text-sm">
                            <li><span className="font-medium">yo</span> hablé</li>
                            <li><span className="font-medium">tú</span> hablaste</li>
                            <li><span className="font-medium">él/ella/usted</span> habló</li>
                            <li><span className="font-medium">nosotros</span> hablamos</li>
                            <li><span className="font-medium">vosotros</span> hablasteis</li>
                            <li><span className="font-medium">ellos/ellas/ustedes</span> hablaron</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mt-3">Imperfect (Imperfecto)</h4>
                        <p>Used for ongoing or habitual actions in the past, or for setting the scene.</p>
                        
                        <div className="bg-slate-50 p-3 rounded-md mt-2">
                          <h5 className="font-medium text-sm mb-2">Example: hablar (to speak)</h5>
                          <ul className="space-y-1 text-sm">
                            <li><span className="font-medium">yo</span> hablaba</li>
                            <li><span className="font-medium">tú</span> hablabas</li>
                            <li><span className="font-medium">él/ella/usted</span> hablaba</li>
                            <li><span className="font-medium">nosotros</span> hablábamos</li>
                            <li><span className="font-medium">vosotros</span> hablabais</li>
                            <li><span className="font-medium">ellos/ellas/ustedes</span> hablaban</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md mt-3">
                        <h4 className="font-medium">When to Use Each Tense</h4>
                        <p className="text-sm mt-1"><span className="font-medium">Preterite:</span> "Ayer <span className="underline">comí</span> en un restaurante" (Yesterday I ate at a restaurant)</p>
                        <p className="text-sm mt-1"><span className="font-medium">Imperfect:</span> "Cuando era niño, <span className="underline">comía</span> muchos dulces" (When I was a child, I used to eat a lot of sweets)</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="future-tense">
                  <AccordionTrigger>Future Tense (Futuro)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Used to talk about actions that will happen in the future.</p>
                      
                      <div className="bg-slate-50 p-3 rounded-md">
                        <h5 className="font-medium text-sm mb-2">Example: hablar (to speak)</h5>
                        <ul className="space-y-1 text-sm">
                          <li><span className="font-medium">yo</span> hablaré</li>
                          <li><span className="font-medium">tú</span> hablarás</li>
                          <li><span className="font-medium">él/ella/usted</span> hablará</li>
                          <li><span className="font-medium">nosotros</span> hablaremos</li>
                          <li><span className="font-medium">vosotros</span> hablaréis</li>
                          <li><span className="font-medium">ellos/ellas/ustedes</span> hablarán</li>
                        </ul>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-medium">Near Future (Futuro Próximo)</h4>
                        <p>Formed with "ir a" + infinitive</p>
                        
                        <div className="bg-slate-50 p-3 rounded-md mt-2">
                          <p className="text-sm"><span className="font-medium">Example:</span> "Voy a estudiar mañana" (I am going to study tomorrow)</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="conditional">
                  <AccordionTrigger>Conditional (Condicional)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Used to express hypothetical situations or what would happen.</p>
                      
                      <div className="bg-slate-50 p-3 rounded-md">
                        <h5 className="font-medium text-sm mb-2">Example: hablar (to speak)</h5>
                        <ul className="space-y-1 text-sm">
                          <li><span className="font-medium">yo</span> hablaría</li>
                          <li><span className="font-medium">tú</span> hablarías</li>
                          <li><span className="font-medium">él/ella/usted</span> hablaría</li>
                          <li><span className="font-medium">nosotros</span> hablaríamos</li>
                          <li><span className="font-medium">vosotros</span> hablaríais</li>
                          <li><span className="font-medium">ellos/ellas/ustedes</span> hablarían</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md mt-2">
                        <p className="text-sm"><span className="font-medium">Example:</span> "Si tuviera dinero, <span className="underline">compraría</span> una casa nueva" (If I had money, I would buy a new house)</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="subjunctive">
                  <AccordionTrigger>Subjunctive Mood (Subjuntivo)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>Used to express wishes, hopes, possibilities, and doubts.</p>
                      
                      <div className="bg-slate-50 p-3 rounded-md">
                        <h5 className="font-medium text-sm mb-2">Present Subjunctive: hablar (to speak)</h5>
                        <ul className="space-y-1 text-sm">
                          <li><span className="font-medium">yo</span> hable</li>
                          <li><span className="font-medium">tú</span> hables</li>
                          <li><span className="font-medium">él/ella/usted</span> hable</li>
                          <li><span className="font-medium">nosotros</span> hablemos</li>
                          <li><span className="font-medium">vosotros</span> habléis</li>
                          <li><span className="font-medium">ellos/ellas/ustedes</span> hablen</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md mt-2">
                        <h4 className="font-medium text-sm">Common Triggers for Subjunctive</h4>
                        <ul className="list-disc ml-4 mt-1 text-sm space-y-1">
                          <li>Wishes: "Espero que <span className="underline">vengas</span>" (I hope that you come)</li>
                          <li>Doubts: "No creo que <span className="underline">sea</span> verdad" (I don't think it's true)</li>
                          <li>Emotions: "Me alegro de que <span className="underline">estés</span> aquí" (I'm glad that you're here)</li>
                          <li>Recommendations: "Te sugiero que <span className="underline">estudies</span>" (I suggest that you study)</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentence-structure" className="mt-4">
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
        </TabsContent>

        <TabsContent value="pronouns" className="mt-4">
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
                        
                        <div className="bg-blue-50 p-3 rounded-md mt-3">
                          <p className="text-sm"><span className="font-medium">Example:</span> "Compro el libro" → "Lo compro" (I buy the book → I buy it)</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium">Indirect Object Pronouns</h4>
                        <p className="text-sm mt-1">Indirect object pronouns tell to whom or for whom an action is done.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div className="bg-slate-50 p-3 rounded-md">
                            <h5 className="font-medium text-sm mb-1">Singular</h5>
                            <ul className="space-y-1 text-sm">
                              <li><span className="font-medium">me</span> - to/for me</li>
                              <li><span className="font-medium">te</span> - to/for you</li>
                              <li><span className="font-medium">le</span> - to/for him/her/it</li>
                            </ul>
                          </div>
                          
                          <div className="bg-slate-50 p-3 rounded-md">
                            <h5 className="font-medium text-sm mb-1">Plural</h5>
                            <ul className="space-y-1 text-sm">
                              <li><span className="font-medium">nos</span> - to/for us</li>
                              <li><span className="font-medium">os</span> - to/for you all</li>
                              <li><span className="font-medium">les</span> - to/for them</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md mt-3">
                          <p className="text-sm"><span className="font-medium">Example:</span> "Doy el libro a Juan" → "Le doy el libro" (I give the book to Juan → I give him the book)</p>
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
                      
                      <div className="bg-blue-50 p-3 rounded-md mt-2">
                        <h4 className="font-medium text-sm">Common Reflexive Verbs</h4>
                        <ul className="mt-1 space-y-1 text-sm">
                          <li><span className="font-medium">lavarse</span> - to wash oneself</li>
                          <li><span className="font-medium">vestirse</span> - to dress oneself</li>
                          <li><span className="font-medium">peinarse</span> - to comb one's hair</li>
                        </ul>
                        
                        <p className="mt-2 text-sm"><span className="font-medium">Example:</span> "Me lavo las manos" (I wash my hands)</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special-uses" className="mt-4">
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
                            <li>Purpose/goal: "Estudio para el examen" (I study for the exam)</li>
                            <li>Recipient: "Este regalo es para ti" (This gift is for you)</li>
                            <li>Destination: "Salgo para Madrid" (I'm leaving for Madrid)</li>
                            <li>Deadline: "Lo necesito para el lunes" (I need it for Monday)</li>
                            <li>Perspective: "Para mí, es difícil" (For me, it's difficult)</li>
                            <li>Comparison: "Para ser principiante, lo haces bien" (For a beginner, you do it well)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="gustar">
                  <AccordionTrigger>Gustar & Similar Verbs</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <p>The verb "gustar" (to like) works differently in Spanish than in English. In Spanish, the thing being liked is the subject of the verb.</p>
                      
                      <div className="bg-slate-50 p-3 rounded-md">
                        <h4 className="font-medium">Construction</h4>
                        <p className="text-sm mt-1">Indirect object pronoun + gustar + subject</p>
                        
                        <h5 className="font-medium text-sm mt-3">Examples:</h5>
                        <ul className="mt-1 space-y-1 text-sm">
                          <li>"Me gusta el libro" (I like the book)</li>
                          <li><span className="italic">Literal translation: "The book is pleasing to me"</span></li>
                        </ul>
                        
                        <ul className="mt-3 space-y-1 text-sm">
                          <li>"Te gustan las películas" (You like the movies)</li>
                          <li><span className="italic">Literal translation: "The movies are pleasing to you"</span></li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md mt-3">
                        <h4 className="font-medium">Similar Verbs</h4>
                        <p className="text-sm mt-1">These verbs follow the same pattern as gustar:</p>
                        <ul className="mt-2 space-y-1 text-sm">
                          <li><span className="font-medium">encantar</span> - to love/really like</li>
                          <li><span className="font-medium">interesar</span> - to interest</li>
                          <li><span className="font-medium">importar</span> - to matter/be important</li>
                          <li><span className="font-medium">faltar</span> - to lack/be missing</li>
                          <li><span className="font-medium">doler</span> - to hurt/be painful</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrammarRules;
