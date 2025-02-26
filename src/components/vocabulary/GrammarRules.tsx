
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
              <SelectItem value="common-pitfalls">Common Pitfalls</SelectItem>
              <SelectItem value="conversation-patterns">Conversation Patterns</SelectItem>
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
                  <p>Used to describe current actions, states, and habitual activities.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Regular conjugation patterns:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>-ar verbs:</strong> hablo, hablas, habla, hablamos, habláis, hablan</li>
                      <li><strong>-er verbs:</strong> como, comes, come, comemos, coméis, comen</li>
                      <li><strong>-ir verbs:</strong> vivo, vives, vive, vivimos, vivís, viven</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Qué haces?</strong> - What are you doing?</li>
                      <li><strong>Trabajo en una oficina.</strong> - I work in an office.</li>
                      <li><strong>¿Hablas inglés?</strong> - Do you speak English?</li>
                      <li><strong>Sí, hablo un poco.</strong> - Yes, I speak a little.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Past Tense - Preterite (Pretérito)</h3>
                  <p>Used for completed actions in the past with a clear beginning and end.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Regular conjugation patterns:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>-ar verbs:</strong> hablé, hablaste, habló, hablamos, hablasteis, hablaron</li>
                      <li><strong>-er/-ir verbs:</strong> comí/viví, comiste/viviste, comió/vivió, comimos/vivimos, comisteis/vivisteis, comieron/vivieron</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Qué hiciste ayer?</strong> - What did you do yesterday?</li>
                      <li><strong>Fui al cine.</strong> - I went to the movies.</li>
                      <li><strong>¿Comiste ya?</strong> - Did you eat already?</li>
                      <li><strong>Sí, comí hace una hora.</strong> - Yes, I ate an hour ago.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Past Tense - Imperfect (Imperfecto)</h3>
                  <p>Used for ongoing or habitual actions in the past, descriptions, and setting the scene.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Regular conjugation patterns:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>-ar verbs:</strong> hablaba, hablabas, hablaba, hablábamos, hablabais, hablaban</li>
                      <li><strong>-er/-ir verbs:</strong> comía/vivía, comías/vivías, comía/vivía, comíamos/vivíamos, comíais/vivíais, comían/vivían</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">When to use Imperfect vs. Preterite:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Imperfect:</strong> Ongoing/repeated actions, physical/mental states, time expressions, descriptions</li>
                      <li><strong>Preterite:</strong> Completed actions, specific moments, beginnings/endings</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Cuando era niño, jugaba fútbol.</strong> - When I was a child, I used to play soccer.</li>
                      <li><strong>¿Qué hacías cuando te llamé?</strong> - What were you doing when I called you?</li>
                      <li><strong>Estaba cocinando cuando llegó.</strong> - I was cooking when he/she arrived.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Future Tense (Futuro)</h3>
                  <p>Used for actions that will happen in the future.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Conjugation pattern (add endings to the infinitive):</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>All verbs:</strong> -é, -ás, -á, -emos, -éis, -án</li>
                      <li><strong>Example:</strong> hablaré, hablarás, hablará, hablaremos, hablaréis, hablarán</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Alternative future expression:</p>
                    <p className="text-sm">You can also use <strong>ir + a + infinitive</strong> structure for near future:</p>
                    <p className="text-sm"><strong>Example:</strong> Voy a estudiar mañana. (I'm going to study tomorrow.)</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Qué harás mañana?</strong> - What will you do tomorrow?</li>
                      <li><strong>Iré al gimnasio.</strong> - I will go to the gym.</li>
                      <li><strong>¿Vas a venir a la fiesta?</strong> - Are you going to come to the party?</li>
                      <li><strong>Sí, llegaré a las ocho.</strong> - Yes, I'll arrive at eight.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Present Perfect (Pretérito Perfecto)</h3>
                  <p>Used for past actions with a connection to the present or that happened in an unfinished time period.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Formation: present of haber + past participle</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Haber:</strong> he, has, ha, hemos, habéis, han</li>
                      <li><strong>Past participles:</strong> -ar verbs → -ado (hablado), -er/-ir verbs → -ido (comido, vivido)</li>
                      <li><strong>Example:</strong> He hablado, has hablado, ha hablado, etc.</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Has estado en España?</strong> - Have you been to Spain?</li>
                      <li><strong>Sí, he visitado Madrid.</strong> - Yes, I have visited Madrid.</li>
                      <li><strong>No he comido hoy.</strong> - I haven't eaten today.</li>
                      <li><strong>¿Has terminado ya?</strong> - Have you finished already?</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Conditional Tense (Condicional)</h3>
                  <p>Used for hypothetical actions, polite requests, and to express what would happen.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Conjugation pattern (add endings to the infinitive):</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>All verbs:</strong> -ía, -ías, -ía, -íamos, -íais, -ían</li>
                      <li><strong>Example:</strong> hablaría, hablarías, hablaría, hablaríamos, hablaríais, hablarían</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Qué harías en mi situación?</strong> - What would you do in my situation?</li>
                      <li><strong>Yo iría al médico.</strong> - I would go to the doctor.</li>
                      <li><strong>¿Podrías ayudarme?</strong> - Could you help me? (polite)</li>
                      <li><strong>Me gustaría un café, por favor.</strong> - I would like a coffee, please.</li>
                    </ul>
                  </div>
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
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Basic patterns:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Statement:</strong> Yo como manzanas. (I eat apples.)</li>
                      <li><strong>With indirect object:</strong> Yo le doy el libro a María. (I give the book to María.)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Subject pronouns are often omitted:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Como manzanas.</strong> - I eat apples. (Yo is understood)</li>
                      <li><strong>¿Vienes a la fiesta?</strong> - Are you coming to the party? (Tú is understood)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Questions</h3>
                  <p>There are two main types of questions in Spanish:</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Yes/No questions:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Same word order as statements, but with rising intonation and question marks</li>
                      <li><strong>¿Hablas español?</strong> - Do you speak Spanish?</li>
                      <li><strong>¿Tienes hambre?</strong> - Are you hungry?</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Information questions (with question words):</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Qué?</strong> - What?</li>
                      <li><strong>¿Quién/Quiénes?</strong> - Who?</li>
                      <li><strong>¿Dónde?</strong> - Where?</li>
                      <li><strong>¿Cuándo?</strong> - When?</li>
                      <li><strong>¿Cómo?</strong> - How?</li>
                      <li><strong>¿Por qué?</strong> - Why?</li>
                      <li><strong>¿Cuál/Cuáles?</strong> - Which?</li>
                      <li><strong>¿Cuánto/a/os/as?</strong> - How much/many?</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Dónde vives?</strong> - Where do you live?</li>
                      <li><strong>Vivo en Madrid.</strong> - I live in Madrid.</li>
                      <li><strong>¿Qué haces?</strong> - What are you doing?</li>
                      <li><strong>¿Por qué estudias español?</strong> - Why are you studying Spanish?</li>
                      <li><strong>¿Cuánto cuesta esto?</strong> - How much does this cost?</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Negation</h3>
                  <p>To make a sentence negative in Spanish, place 'no' directly before the verb.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Basic negation patterns:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Hablo español.</strong> → <strong>No hablo español.</strong> (I don't speak Spanish.)</li>
                      <li><strong>Tengo hambre.</strong> → <strong>No tengo hambre.</strong> (I'm not hungry.)</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Other negative expressions:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Nunca/Jamás</strong> - Never</li>
                      <li><strong>Nada</strong> - Nothing</li>
                      <li><strong>Nadie</strong> - Nobody</li>
                      <li><strong>Ninguno/a</strong> - None, not any</li>
                      <li><strong>Tampoco</strong> - Neither, not either</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Double negation is normal in Spanish:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>No veo a nadie.</strong> - I don't see anybody. (lit: I don't see nobody)</li>
                      <li><strong>No quiero nada.</strong> - I don't want anything. (lit: I don't want nothing)</li>
                      <li><strong>Nunca he estado allí.</strong> - I have never been there.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Adjective Placement</h3>
                  <p>In Spanish, adjectives typically come after the noun they describe, unlike in English.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>La casa roja</strong> - The red house</li>
                      <li><strong>El coche nuevo</strong> - The new car</li>
                      <li><strong>Una persona interesante</strong> - An interesting person</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Exceptions - adjectives that often come before the noun:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Bueno/a, malo/a</strong> - Good, bad</li>
                      <li><strong>Grande, pequeño/a</strong> - Big, small</li>
                      <li><strong>Viejo/a, nuevo/a</strong> - Old, new</li>
                      <li><strong>Bonito/a, feo/a</strong> - Pretty, ugly</li>
                      <li><strong>Otro/a</strong> - Other</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">When adjectives change meaning based on position:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Un hombre pobre</strong> - A poor man (financially)</li>
                      <li><strong>Un pobre hombre</strong> - A poor man (unfortunate)</li>
                      <li><strong>Mi antiguo coche</strong> - My former car</li>
                      <li><strong>Mi coche antiguo</strong> - My old (antique) car</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Agreement</h3>
                  <p>In Spanish, adjectives must agree with the nouns they describe in gender and number.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Gender agreement:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>El gato negro</strong> - The black cat (masculine)</li>
                      <li><strong>La casa blanca</strong> - The white house (feminine)</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Number agreement:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Los gatos negros</strong> - The black cats (plural)</li>
                      <li><strong>Las casas blancas</strong> - The white houses (plural)</li>
                    </ul>
                  </div>
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
                  <p>These pronouns are used as the subject of a sentence. In Spanish, they are often omitted as the verb endings indicate the subject.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Singular:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>yo</strong> - I</li>
                      <li><strong>tú</strong> - you (informal)</li>
                      <li><strong>él</strong> - he</li>
                      <li><strong>ella</strong> - she</li>
                      <li><strong>usted (Ud.)</strong> - you (formal)</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Plural:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>nosotros/nosotras</strong> - we (masc./fem.)</li>
                      <li><strong>vosotros/vosotras</strong> - you all (informal, used in Spain)</li>
                      <li><strong>ellos</strong> - they (masculine or mixed group)</li>
                      <li><strong>ellas</strong> - they (feminine group)</li>
                      <li><strong>ustedes (Uds.)</strong> - you all (formal, or both formal/informal in Latin America)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Usage notes:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Subject pronouns are often omitted: <strong>Hablo español</strong> (I speak Spanish)</li>
                      <li>Use subject pronouns for emphasis or to avoid ambiguity</li>
                      <li><strong>Usted/Ustedes</strong> use third-person verb forms: <strong>Usted habla</strong> (You speak)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Direct Object Pronouns</h3>
                  <p>Direct object pronouns replace the person or thing directly receiving the action of the verb.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Forms:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>me</strong> - me</li>
                      <li><strong>te</strong> - you (informal)</li>
                      <li><strong>lo</strong> - him, it (masculine)</li>
                      <li><strong>la</strong> - her, it (feminine)</li>
                      <li><strong>nos</strong> - us</li>
                      <li><strong>os</strong> - you all (informal, Spain)</li>
                      <li><strong>los</strong> - them (masculine)</li>
                      <li><strong>las</strong> - them (feminine)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Placement:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Before conjugated verbs: <strong>Lo veo.</strong> (I see it.)</li>
                      <li>Attached to infinitives: <strong>Quiero verlo.</strong> (I want to see it.)</li>
                      <li>Attached to gerunds: <strong>Estoy viéndolo.</strong> (I am seeing it.)</li>
                      <li>Attached to affirmative commands: <strong>¡Hazlo!</strong> (Do it!)</li>
                      <li>Before negative commands: <strong>No lo hagas.</strong> (Don't do it.)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Has visto mi libro? No lo encuentro.</strong> (Have you seen my book? I can't find it.)</li>
                      <li><strong>Te llamé ayer.</strong> (I called you yesterday.)</li>
                      <li><strong>María me invitó a su fiesta.</strong> (Maria invited me to her party.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Indirect Object Pronouns</h3>
                  <p>Indirect object pronouns indicate to whom or for whom the action of the verb is performed.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Forms:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>me</strong> - to/for me</li>
                      <li><strong>te</strong> - to/for you (informal)</li>
                      <li><strong>le</strong> - to/for him/her/you (formal)</li>
                      <li><strong>nos</strong> - to/for us</li>
                      <li><strong>os</strong> - to/for you all (informal, Spain)</li>
                      <li><strong>les</strong> - to/for them/you all (formal)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Using both direct and indirect objects:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Indirect object comes before direct object</li>
                      <li><strong>Te lo doy.</strong> (I give it to you.)</li>
                      <li><strong>Se lo mandé.</strong> (I sent it to him/her/them.)</li>
                      <li>Note: <strong>le/les</strong> change to <strong>se</strong> when used with <strong>lo, la, los, las</strong></li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Me prestas tu bolígrafo?</strong> (Will you lend me your pen?)</li>
                      <li><strong>Le expliqué la situación.</strong> (I explained the situation to him/her.)</li>
                      <li><strong>Les enviaré una invitación.</strong> (I will send them an invitation.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Reflexive Pronouns</h3>
                  <p>Used when the subject and object are the same person - the action reflects back on the subject.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Forms:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>me</strong> - myself</li>
                      <li><strong>te</strong> - yourself (informal)</li>
                      <li><strong>se</strong> - himself/herself/yourself (formal)</li>
                      <li><strong>nos</strong> - ourselves</li>
                      <li><strong>os</strong> - yourselves (informal, Spain)</li>
                      <li><strong>se</strong> - themselves/yourselves (formal)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Common reflexive verbs:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>lavarse</strong> - to wash oneself</li>
                      <li><strong>vestirse</strong> - to get dressed</li>
                      <li><strong>llamarse</strong> - to call oneself/to be named</li>
                      <li><strong>acostarse</strong> - to go to bed</li>
                      <li><strong>despertarse</strong> - to wake up</li>
                      <li><strong>sentarse</strong> - to sit down</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Me lavo las manos.</strong> (I wash my hands.)</li>
                      <li><strong>¿Cómo te llamas?</strong> (What's your name? lit: What do you call yourself?)</li>
                      <li><strong>Me acuesto a las once.</strong> (I go to bed at eleven.)</li>
                      <li><strong>Nos vemos mañana.</strong> (See you tomorrow. lit: We'll see each other tomorrow.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Prepositional Pronouns</h3>
                  <p>Used after prepositions like "con," "para," "sin," etc.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Forms:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>mí</strong> - me</li>
                      <li><strong>ti</strong> - you (informal)</li>
                      <li><strong>él, ella, usted</strong> - him, her, you (formal)</li>
                      <li><strong>nosotros/as</strong> - us</li>
                      <li><strong>vosotros/as</strong> - you all (informal, Spain)</li>
                      <li><strong>ellos, ellas, ustedes</strong> - them, you all (formal)</li>
                      <li><strong>sí</strong> - himself, herself, themselves (used with reflexive meaning)</li>
                    </ul>
                    <p className="text-sm mt-2">Note: with "con," use <strong>conmigo</strong> (with me) and <strong>contigo</strong> (with you)</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Este regalo es para ti.</strong> (This gift is for you.)</li>
                      <li><strong>¿Vienes conmigo?</strong> (Are you coming with me?)</li>
                      <li><strong>Estoy muy orgulloso de vosotros.</strong> (I am very proud of you all.)</li>
                      <li><strong>Hablan de ella.</strong> (They're talking about her.)</li>
                    </ul>
                  </div>
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
                  <p>Both mean "for" in English but are used in different contexts.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Por:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Duration:</strong> <em>Estudié por dos horas.</em> (I studied for two hours.)</li>
                      <li><strong>Exchange/Price:</strong> <em>Pagué €10 por el libro.</em> (I paid €10 for the book.)</li>
                      <li><strong>Means/Mode:</strong> <em>Te envié el mensaje por WhatsApp.</em> (I sent you the message via WhatsApp.)</li>
                      <li><strong>Gratitude/Reason:</strong> <em>Gracias por tu ayuda.</em> (Thanks for your help.)</li>
                      <li><strong>Movement/Through:</strong> <em>Caminamos por el parque.</em> (We walked through the park.)</li>
                      <li><strong>Agent (passive):</strong> <em>La casa fue construida por mi abuelo.</em> (The house was built by my grandfather.)</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Para:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Destination:</strong> <em>Salimos para Madrid mañana.</em> (We leave for Madrid tomorrow.)</li>
                      <li><strong>Recipient:</strong> <em>Este regalo es para ti.</em> (This gift is for you.)</li>
                      <li><strong>Purpose/Goal:</strong> <em>Estudio para aprobar el examen.</em> (I study to pass the exam.)</li>
                      <li><strong>Deadline:</strong> <em>Necesito terminarlo para el lunes.</em> (I need to finish it by Monday.)</li>
                      <li><strong>Comparison:</strong> <em>Para un principiante, hablas muy bien.</em> (For a beginner, you speak very well.)</li>
                      <li><strong>Employment:</strong> <em>Trabajo para una empresa española.</em> (I work for a Spanish company.)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Para qué estudias español?</strong> (For what purpose are you studying Spanish?)</li>
                      <li><strong>Lo hago por ti.</strong> (I'm doing it for you/because of you.)</li>
                      <li><strong>Este libro es para el curso.</strong> (This book is for the course.)</li>
                      <li><strong>Vamos por este camino.</strong> (Let's go through this path.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Ser vs. Estar</h3>
                  <p>Both mean "to be" in English but are used in different situations.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Ser (permanent/intrinsic qualities):</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Identity:</strong> <em>Soy estudiante.</em> (I am a student.)</li>
                      <li><strong>Origin:</strong> <em>Él es de España.</em> (He is from Spain.)</li>
                      <li><strong>Possession:</strong> <em>El libro es mío.</em> (The book is mine.)</li>
                      <li><strong>Material:</strong> <em>La mesa es de madera.</em> (The table is made of wood.)</li>
                      <li><strong>Time/Date:</strong> <em>Son las tres. / Es lunes.</em> (It's three o'clock. / It's Monday.)</li>
                      <li><strong>Essential characteristics:</strong> <em>Ella es alta.</em> (She is tall.)</li>
                      <li><strong>Location of events:</strong> <em>La fiesta es en mi casa.</em> (The party is at my house.)</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Estar (temporary/changeable conditions):</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Location:</strong> <em>Estoy en casa.</em> (I am at home.)</li>
                      <li><strong>Temporary conditions:</strong> <em>Estoy cansado.</em> (I am tired.)</li>
                      <li><strong>Emotions/Feelings:</strong> <em>Está feliz hoy.</em> (She is happy today.)</li>
                      <li><strong>Progressive actions:</strong> <em>Estoy comiendo.</em> (I am eating.)</li>
                      <li><strong>Result of change:</strong> <em>La puerta está abierta.</em> (The door is open.)</li>
                      <li><strong>Health:</strong> <em>Mi abuela está enferma.</em> (My grandmother is sick.)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Adjectives with different meanings:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Ser aburrido</strong> - to be boring (a trait) / <strong>Estar aburrido</strong> - to be bored (a state)</li>
                      <li><strong>Ser listo</strong> - to be clever / <strong>Estar listo</strong> - to be ready</li>
                      <li><strong>Ser rico</strong> - to be rich / <strong>Estar rico</strong> - to be tasty (food)</li>
                      <li><strong>Ser verde</strong> - to be green (color) / <strong>Estar verde</strong> - to be unripe, inexperienced</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Cómo estás hoy?</strong> (How are you today?)</li>
                      <li><strong>Estoy bien, gracias.</strong> (I am well, thank you.)</li>
                      <li><strong>¿De dónde eres?</strong> (Where are you from?)</li>
                      <li><strong>Soy de México, pero ahora estoy viviendo en España.</strong> (I'm from Mexico, but now I'm living in Spain.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Common Idioms & Expressions</h3>
                  <p>These expressions are essential for natural-sounding, everyday conversation.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Tener expressions:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Tener hambre/sed</strong> - To be hungry/thirsty</li>
                      <li><strong>Tener frío/calor</strong> - To be cold/hot</li>
                      <li><strong>Tener miedo</strong> - To be afraid</li>
                      <li><strong>Tener sueño</strong> - To be sleepy</li>
                      <li><strong>Tener prisa</strong> - To be in a hurry</li>
                      <li><strong>Tener razón</strong> - To be right</li>
                      <li><strong>Tener suerte</strong> - To be lucky</li>
                      <li><strong>Tener cuidado</strong> - To be careful</li>
                      <li><strong>Tener X años</strong> - To be X years old</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Other useful expressions:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Acabar de + infinitive</strong> - To have just done something</li>
                      <li><strong>Hacer + time</strong> - Ago/For (time)</li>
                      <li><strong>Llevar + time + gerund</strong> - To have been doing something for a period of time</li>
                      <li><strong>Volver a + infinitive</strong> - To do something again</li>
                      <li><strong>Hay que + infinitive</strong> - One must/It is necessary to</li>
                      <li><strong>Acabo de llegar</strong> - I just arrived</li>
                      <li><strong>Hace dos años</strong> - Two years ago/For two years</li>
                      <li><strong>Llevo tres horas esperando</strong> - I've been waiting for three hours</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Tengo hambre. ¿Vamos a comer algo?</strong> (I'm hungry. Shall we eat something?)</li>
                      <li><strong>Acabo de terminar el trabajo.</strong> (I just finished the work.)</li>
                      <li><strong>Hace mucho tiempo que no te veo.</strong> (It's been a long time since I saw you.)</li>
                      <li><strong>¿Cuántos años tienes?</strong> (How old are you?)</li>
                      <li><strong>Tengo que irme. Tengo prisa.</strong> (I have to go. I'm in a hurry.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">The Personal A</h3>
                  <p>In Spanish, the preposition "a" is used before a direct object when it refers to a specific person or pet.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">When to use:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Before people as direct objects: <em>Veo a Juan.</em> (I see Juan.)</li>
                      <li>Before pets: <em>Amo a mi perro.</em> (I love my dog.)</li>
                      <li>Before personified objects: <em>No veo a la muerte como algo negativo.</em> (I don't see death as something negative.)</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">When NOT to use:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>With inanimate objects: <em>Compré un coche.</em> (I bought a car.)</li>
                      <li>With unspecified people: <em>Necesitamos contratar empleados.</em> (We need to hire employees.)</li>
                      <li>With the verb "tener": <em>Tengo dos hermanos.</em> (I have two brothers.)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Conoces a María?</strong> (Do you know María?)</li>
                      <li><strong>Vimos a tus padres ayer.</strong> (We saw your parents yesterday.)</li>
                      <li><strong>No encontramos a nadie en casa.</strong> (We didn't find anyone at home.)</li>
                      <li><strong>Busco a alguien que hable chino.</strong> (I'm looking for someone who speaks Chinese.)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="common-pitfalls">
            <Card>
              <CardHeader>
                <CardTitle>Common Pitfalls & Mistakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">False Friends</h3>
                  <p>Words that look similar to English words but have different meanings.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Actualmente</strong> - Currently (not "actually," which is "en realidad")</li>
                      <li><strong>Asistir a</strong> - To attend (not "to assist," which is "ayudar")</li>
                      <li><strong>Embarazada</strong> - Pregnant (not "embarrassed," which is "avergonzado/a")</li>
                      <li><strong>Éxito</strong> - Success (not "exit," which is "salida")</li>
                      <li><strong>Librería</strong> - Bookstore (not "library," which is "biblioteca")</li>
                      <li><strong>Realizar</strong> - To carry out, to fulfill (not always "to realize," which is often "darse cuenta")</li>
                      <li><strong>Sensible</strong> - Sensitive (not "sensible," which is "sensato")</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Incorrecto:</strong> Voy a la librería para estudiar. (I'm going to the bookstore to study.)</li>
                      <li><strong>Correcto:</strong> Voy a la biblioteca para estudiar. (I'm going to the library to study.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Common Gender Confusion</h3>
                  <p>Words with unexpected genders or changing genders.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Some common confusions:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>el problema</strong> - Despite ending in "a," this word is masculine</li>
                      <li><strong>el día, el mapa, el planeta</strong> - These words ending in "a" are masculine</li>
                      <li><strong>la mano</strong> - Despite ending in "o," this word is feminine</li>
                      <li><strong>el agua</strong> - Feminine word that uses "el" in singular for phonetic reasons, but "las aguas" in plural</li>
                      <li><strong>la foto, la moto, la radio</strong> - Shortened forms of feminine words (fotografía, motocicleta, radiografía)</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Incorrecto:</strong> La problema es difícil.</li>
                      <li><strong>Correcto:</strong> El problema es difícil. (The problem is difficult.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Verbs with Preposition Changes</h3>
                  <p>Some Spanish verbs require different prepositions than their English equivalents.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Pensar en</strong> - To think about (not "pensar sobre")</li>
                      <li><strong>Soñar con</strong> - To dream about/of (not "soñar de")</li>
                      <li><strong>Depender de</strong> - To depend on (not "depender en")</li>
                      <li><strong>Preocuparse por</strong> - To worry about (not "preocuparse sobre")</li>
                      <li><strong>Casarse con</strong> - To marry/get married to (not "casarse a")</li>
                      <li><strong>Enamorarse de</strong> - To fall in love with (not "enamorarse con")</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Incorrecto:</strong> Pienso sobre mis vacaciones.</li>
                      <li><strong>Correcto:</strong> Pienso en mis vacaciones. (I'm thinking about my vacation.)</li>
                      <li><strong>Incorrecto:</strong> Me preocupo sobre el examen.</li>
                      <li><strong>Correcto:</strong> Me preocupo por el examen. (I'm worried about the exam.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">English Influence Errors</h3>
                  <p>Common mistakes due to directly translating from English.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Incorrect use of subject pronouns:</strong> In Spanish, subject pronouns are often omitted since the verb ending shows who is performing the action.</li>
                      <li><strong>Adjective placement:</strong> Placing all adjectives before nouns instead of after them as is common in Spanish.</li>
                      <li><strong>Using "estar" for permanent traits:</strong> "Soy alto" (I am tall), not "Estoy alto"</li>
                      <li><strong>Direct translation of idioms:</strong> "I'm looking forward to it" is not "Estoy mirando adelante a eso" but "Lo espero con ganas/ilusión"</li>
                      <li><strong>Using infinitives after prepositions:</strong> After prepositions like "por," "para," "sin," use infinitives, not gerunds (e.g., "sin hablar" not "sin hablando")</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Incorrecto:</strong> Yo quiero una grande casa con una roja puerta.</li>
                      <li><strong>Correcto:</strong> Quiero una casa grande con una puerta roja. (I want a big house with a red door.)</li>
                      <li><strong>Incorrecto:</strong> Estoy teniendo un coche.</li>
                      <li><strong>Correcto:</strong> Tengo un coche. (I have a car.)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Problem Tenses and Moods</h3>
                  <p>Tenses and moods that often cause confusion for learners.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Preterite vs. Imperfect:</strong> Choose preterite for completed actions and imperfect for ongoing or habitual past actions.</li>
                      <li><strong>Subjunctive usage:</strong> Use subjunctive for uncertainty, desires, emotions, recommendations, and certain conjunctions (para que, sin que, antes de que).</li>
                      <li><strong>Por vs. Para:</strong> Confusing these prepositions can change the meaning of sentences entirely.</li>
                      <li><strong>Using indefinite article with professions:</strong> "Soy profesor" (I am a teacher) often doesn't use the article "un" unless describing a specific type.</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Conversation examples:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Incorrecto:</strong> Quiero que vas conmigo.</li>
                      <li><strong>Correcto:</strong> Quiero que vayas conmigo. (I want you to go with me.) [Subjunctive]</li>
                      <li><strong>Incorrecto:</strong> Cuando llegué a casa, preparé la cena.</li>
                      <li><strong>Correcto:</strong> Cuando llegué a casa, preparé la cena. (When I arrived home, I prepared dinner.) [Both preterite for sequence]</li>
                      <li><strong>Incorrecto:</strong> Cuando llegué a casa, preparaba la cena.</li>
                      <li><strong>Correcto:</strong> Cuando llegué a casa, estaba preparando la cena. (When I arrived home, I was preparing dinner.) [Preterite + imperfect for interruption]</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversation-patterns">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold">Greetings and Introductions</h3>
                  <p>Essential phrases for starting conversations.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Formal greetings:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Buenos días</strong> - Good morning</li>
                      <li><strong>Buenas tardes</strong> - Good afternoon</li>
                      <li><strong>Buenas noches</strong> - Good evening/night</li>
                      <li><strong>Mucho gusto</strong> - Nice to meet you</li>
                      <li><strong>Encantado/a</strong> - Pleased to meet you</li>
                      <li><strong>¿Cómo está usted?</strong> - How are you? (formal)</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Informal greetings:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¡Hola!</strong> - Hello!</li>
                      <li><strong>¿Qué tal?</strong> - How's it going?</li>
                      <li><strong>¿Cómo estás?</strong> - How are you? (informal)</li>
                      <li><strong>¿Qué pasa?</strong> - What's up?</li>
                      <li><strong>¿Qué onda?</strong> - What's up? (Latin America)</li>
                      <li><strong>¿Qué hay de nuevo?</strong> - What's new?</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Introduction patterns:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Me llamo [nombre].</strong> - My name is [name].</li>
                      <li><strong>Soy [nombre].</strong> - I'm [name].</li>
                      <li><strong>Permítame presentarme,...</strong> - Allow me to introduce myself,...</li>
                      <li><strong>Te/Le presento a [nombre].</strong> - Let me introduce you to [name].</li>
                      <li><strong>Este/a es mi amigo/a [nombre].</strong> - This is my friend [name].</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Asking Questions</h3>
                  <p>Question patterns to keep conversations flowing.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Personal information:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿De dónde eres?</strong> - Where are you from?</li>
                      <li><strong>¿A qué te dedicas?</strong> - What do you do? (occupation)</li>
                      <li><strong>¿Cuánto tiempo llevas estudiando español?</strong> - How long have you been studying Spanish?</li>
                      <li><strong>¿Qué te gusta hacer en tu tiempo libre?</strong> - What do you like to do in your free time?</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Follow-up questions:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Por qué...?</strong> - Why...?</li>
                      <li><strong>¿Desde cuándo...?</strong> - Since when...?</li>
                      <li><strong>¿Y a ti/usted?</strong> - And you? (to return the question)</li>
                      <li><strong>¿Podrías explicar más sobre...?</strong> - Could you explain more about...?</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Ask for clarification:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Cómo?</strong> - Pardon? / What?</li>
                      <li><strong>No entiendo.</strong> - I don't understand.</li>
                      <li><strong>¿Podría repetir, por favor?</strong> - Could you repeat, please?</li>
                      <li><strong>¿Qué significa...?</strong> - What does... mean?</li>
                      <li><strong>¿Podrías hablar más despacio?</strong> - Could you speak more slowly?</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Expressing Opinions</h3>
                  <p>Phrases to express what you think in conversations.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Giving opinions:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Creo que...</strong> - I think/believe that...</li>
                      <li><strong>Pienso que...</strong> - I think that...</li>
                      <li><strong>En mi opinión...</strong> - In my opinion...</li>
                      <li><strong>Me parece que...</strong> - It seems to me that...</li>
                      <li><strong>Desde mi punto de vista...</strong> - From my point of view...</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Agreeing and disagreeing:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Estoy de acuerdo.</strong> - I agree.</li>
                      <li><strong>Tienes razón.</strong> - You're right.</li>
                      <li><strong>Exactamente.</strong> - Exactly.</li>
                      <li><strong>No estoy de acuerdo.</strong> - I disagree.</li>
                      <li><strong>No creo que sea así.</strong> - I don't think that's the case.</li>
                      <li><strong>Entiendo tu punto, pero...</strong> - I understand your point, but...</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Softening disagreements:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Entiendo lo que dices, sin embargo...</strong> - I understand what you're saying, however...</li>
                      <li><strong>Respeto tu opinión, pero...</strong> - I respect your opinion, but...</li>
                      <li><strong>Puede que tengas razón, pero...</strong> - You might be right, but...</li>
                      <li><strong>En parte estoy de acuerdo, pero...</strong> - I partly agree, but...</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Making Plans</h3>
                  <p>How to suggest activities and organize meetings in Spanish.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Invitations:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿Te gustaría...?</strong> - Would you like to...?</li>
                      <li><strong>¿Quieres...?</strong> - Do you want to...?</li>
                      <li><strong>¿Tienes planes para...?</strong> - Do you have plans for...?</li>
                      <li><strong>¿Qué tal si...?</strong> - How about if...?</li>
                      <li><strong>Te invito a...</strong> - I invite you to...</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Accepting:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Me encantaría.</strong> - I'd love to.</li>
                      <li><strong>Claro que sí.</strong> - Of course.</li>
                      <li><strong>Suena bien.</strong> - Sounds good.</li>
                      <li><strong>¡Buena idea!</strong> - Good idea!</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Declining:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Lo siento, no puedo.</strong> - I'm sorry, I can't.</li>
                      <li><strong>Me gustaría, pero tengo otros planes.</strong> - I'd like to, but I have other plans.</li>
                      <li><strong>Quizás la próxima vez.</strong> - Maybe next time.</li>
                      <li><strong>Tengo que + infinitive.</strong> - I have to + infinitive.</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Arranging details:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>¿A qué hora?</strong> - At what time?</li>
                      <li><strong>¿Dónde nos encontramos?</strong> - Where shall we meet?</li>
                      <li><strong>¿Cómo llegamos allí?</strong> - How do we get there?</li>
                      <li><strong>Nos vemos a las...</strong> - See you at... (time)</li>
                      <li><strong>¿Prefieres que te recoja?</strong> - Would you prefer that I pick you up?</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Transition Phrases</h3>
                  <p>Words and phrases to connect ideas smoothly in conversation.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Sequencing ideas:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>En primer lugar,.../ En segundo lugar,...</strong> - First of all,... / Secondly,...</li>
                      <li><strong>Para empezar,...</strong> - To begin with,...</li>
                      <li><strong>Además,...</strong> - Furthermore,... / In addition,...</li>
                      <li><strong>Por último,...</strong> - Lastly,...</li>
                      <li><strong>Finalmente,...</strong> - Finally,...</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Expressing cause and effect:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Por eso</strong> - That's why</li>
                      <li><strong>Así que</strong> - So</li>
                      <li><strong>Como resultado</strong> - As a result</li>
                      <li><strong>Por lo tanto</strong> - Therefore</li>
                      <li><strong>Debido a</strong> - Due to</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Contrasting ideas:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Pero</strong> - But</li>
                      <li><strong>Sin embargo</strong> - However</li>
                      <li><strong>No obstante</strong> - Nevertheless</li>
                      <li><strong>A pesar de</strong> - Despite</li>
                      <li><strong>Por un lado... por otro lado</strong> - On one hand... on the other hand</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Changing topics:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Por cierto,...</strong> - By the way,...</li>
                      <li><strong>Cambiando de tema,...</strong> - Changing the subject,...</li>
                      <li><strong>Hablando de otra cosa,...</strong> - Speaking of something else,...</li>
                      <li><strong>Esto me recuerda que...</strong> - This reminds me that...</li>
                      <li><strong>A propósito,...</strong> - By the way,... / Speaking of which,...</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold">Closing Conversations</h3>
                  <p>Phrases to politely end a conversation.</p>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-semibold mb-1">Signaling the end:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Bueno, tengo que irme.</strong> - Well, I have to go.</li>
                      <li><strong>Ha sido un placer hablar contigo.</strong> - It's been a pleasure talking with you.</li>
                      <li><strong>Tengo que hacer [activity].</strong> - I have to do [activity].</li>
                      <li><strong>Me tengo que ir.</strong> - I have to leave.</li>
                      <li><strong>Se me hace tarde.</strong> - It's getting late for me.</li>
                    </ul>
                    <p className="text-sm font-semibold mt-2 mb-1">Saying goodbye:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Adiós</strong> - Goodbye</li>
                      <li><strong>Hasta luego</strong> - See you later</li>
                      <li><strong>Hasta mañana</strong> - See you tomorrow</li>
                      <li><strong>Que tengas un buen día</strong> - Have a good day</li>
                      <li><strong>Nos vemos</strong> - See you</li>
                      <li><strong>Cuídate</strong> - Take care</li>
                      <li><strong>Hasta pronto</strong> - See you soon</li>
                    </ul>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Future contact:</p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>Hablamos pronto.</strong> - We'll talk soon.</li>
                      <li><strong>Te llamo mañana.</strong> - I'll call you tomorrow.</li>
                      <li><strong>¿Podemos quedar otro día?</strong> - Can we meet another day?</li>
                      <li><strong>Mantengamos el contacto.</strong> - Let's keep in touch.</li>
                      <li><strong>Me gustaría volver a verte.</strong> - I'd like to see you again.</li>
                    </ul>
                  </div>
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
