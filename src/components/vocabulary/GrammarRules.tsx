
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const GrammarRules = () => {
  const [selectedSection, setSelectedSection] = useState("verb-tenses");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Spanish Grammar Reference</CardTitle>
        <CardDescription>
          Choose a grammar topic from the dropdown menu below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grammar topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verb-tenses">Verb Tenses</SelectItem>
              <SelectItem value="sentence-structure">Sentence Structure</SelectItem>
              <SelectItem value="pronouns">Pronouns</SelectItem>
              <SelectItem value="special-uses">Special Uses & Idioms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={selectedSection} className="w-full">
          <TabsContent value="verb-tenses">
            <Card>
              <CardHeader>
                <CardTitle>Spanish Verb Tenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">Present Tense (Presente)</h3>
                  <p>Used to describe current actions or states.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Yo hablo español. (I speak Spanish.)</p>
                </div>

                <div>
                  <h3 className="font-bold">Past Tense - Preterite (Pretérito)</h3>
                  <p>Used for completed actions in the past.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Yo hablé español ayer. (I spoke Spanish yesterday.)</p>
                </div>

                <div>
                  <h3 className="font-bold">Past Tense - Imperfect (Imperfecto)</h3>
                  <p>Used for ongoing or habitual actions in the past.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Yo hablaba español cuando era niño. (I used to speak Spanish when I was a child.)</p>
                </div>

                <div>
                  <h3 className="font-bold">Future Tense (Futuro)</h3>
                  <p>Used for actions that will happen in the future.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Yo hablaré español mañana. (I will speak Spanish tomorrow.)</p>
                </div>

                <div>
                  <h3 className="font-bold">Conditional Tense (Condicional)</h3>
                  <p>Used for hypothetical actions or polite requests.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Yo hablaría español si pudiera. (I would speak Spanish if I could.)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentence-structure">
            <Card>
              <CardHeader>
                <CardTitle>Spanish Sentence Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">Basic Word Order</h3>
                  <p>Spanish generally follows Subject-Verb-Object (SVO) order, like English.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Yo como manzanas. (I eat apples.)</p>
                </div>

                <div>
                  <h3 className="font-bold">Questions</h3>
                  <p>Questions in Spanish can be formed by:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Changing intonation: ¿Tú hablas español? (Do you speak Spanish?)</li>
                    <li>Using question words: ¿Quién? (Who?), ¿Qué? (What?), ¿Dónde? (Where?)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">Negation</h3>
                  <p>Place 'no' before the verb to make a sentence negative.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> No hablo español. (I don't speak Spanish.)</p>
                </div>

                <div>
                  <h3 className="font-bold">Adjective Placement</h3>
                  <p>Adjectives usually come after the noun they describe.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> La casa roja (The red house)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pronouns">
            <Card>
              <CardHeader>
                <CardTitle>Spanish Pronouns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">Subject Pronouns</h3>
                  <p>These pronouns are used as the subject of a sentence.</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>yo (I)</li>
                    <li>tú (you, informal)</li>
                    <li>él, ella, usted (he, she, you formal)</li>
                    <li>nosotros/nosotras (we)</li>
                    <li>vosotros/vosotras (you all, informal, used in Spain)</li>
                    <li>ellos, ellas, ustedes (they, you all formal)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">Object Pronouns</h3>
                  <p>Direct and indirect objects can be replaced by pronouns in Spanish.</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>me (me)</li>
                    <li>te (you)</li>
                    <li>lo, la, le (him, her, it, you formal)</li>
                    <li>nos (us)</li>
                    <li>os (you all, informal)</li>
                    <li>los, las, les (them, you all formal)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">Reflexive Pronouns</h3>
                  <p>Used when the subject and object are the same.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Me lavo las manos. (I wash my hands.)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="special-uses">
            <Card>
              <CardHeader>
                <CardTitle>Special Uses & Idioms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">Por vs. Para</h3>
                  <p>Both mean "for" but are used in different contexts:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Por</strong>: duration, exchange, means, gratitude</li>
                    <li><strong>Para</strong>: destination, deadline, purpose, recipient</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">Ser vs. Estar</h3>
                  <p>Both mean "to be" but differ in usage:</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Ser</strong>: permanent traits, identity, origin, occupation</li>
                    <li><strong>Estar</strong>: temporary states, location, ongoing actions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">Common Idioms</h3>
                  <ul className="list-disc pl-5 text-sm">
                    <li><strong>Tener hambre</strong>: To be hungry (lit. "to have hunger")</li>
                    <li><strong>Tener sed</strong>: To be thirsty (lit. "to have thirst")</li>
                    <li><strong>Tener frío</strong>: To be cold (lit. "to have cold")</li>
                    <li><strong>Tener calor</strong>: To be hot (lit. "to have heat")</li>
                    <li><strong>Tener miedo</strong>: To be afraid (lit. "to have fear")</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">The Personal A</h3>
                  <p>In Spanish, the preposition "a" is used before a direct object when it refers to a specific person or pet.</p>
                  <p className="text-sm"><span className="font-bold">Example:</span> Veo a Juan. (I see Juan.)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GrammarRules;
