
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface GrammarRulesProps {
  language?: string;
}

const GrammarRules = ({ language = "Spanish" }: GrammarRulesProps) => {
  const [activeTab, setActiveTab] = useState('basics');

  // Grammar content based on language
  const grammarContent: Record<string, Record<string, { title: string; content: React.ReactNode }>> = {
    "Spanish": {
      basics: {
        title: "Basic Spanish Grammar",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Spanish Sentence Structure</h3>
            <p>Spanish generally follows a Subject-Verb-Object (SVO) structure, similar to English.</p>
            <p>Example: <strong>Yo como manzanas.</strong> (I eat apples.)</p>
            
            <h3 className="text-lg font-medium mt-4">Gender and Articles</h3>
            <p>All nouns in Spanish have a gender (masculine or feminine).</p>
            <ul className="list-disc ml-6">
              <li><strong>Masculine articles:</strong> el (the), un (a/an)</li>
              <li><strong>Feminine articles:</strong> la (the), una (a/an)</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Subject Pronouns</h3>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Person</th>
                  <th className="p-2 border">Singular</th>
                  <th className="p-2 border">Plural</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">1st Person</td>
                  <td className="p-2 border">yo (I)</td>
                  <td className="p-2 border">nosotros/nosotras (we)</td>
                </tr>
                <tr>
                  <td className="p-2 border">2nd Person</td>
                  <td className="p-2 border">tú (you)</td>
                  <td className="p-2 border">vosotros/vosotras (you all)</td>
                </tr>
                <tr>
                  <td className="p-2 border">3rd Person</td>
                  <td className="p-2 border">él (he), ella (she), usted (formal you)</td>
                  <td className="p-2 border">ellos (they masc.), ellas (they fem.), ustedes (formal you all)</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      verbs: {
        title: "Spanish Verb Conjugation",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Regular Verb Conjugation</h3>
            <p>Spanish verbs are classified into three groups based on their endings: -ar, -er, and -ir.</p>
            
            <div className="mt-4">
              <h4 className="font-medium">Present Tense: -AR Verbs (example: hablar - to speak)</h4>
              <table className="min-w-full border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Person</th>
                    <th className="p-2 border">Conjugation</th>
                    <th className="p-2 border">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">yo</td>
                    <td className="p-2 border">-o</td>
                    <td className="p-2 border">hablo</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">tú</td>
                    <td className="p-2 border">-as</td>
                    <td className="p-2 border">hablas</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">él/ella/usted</td>
                    <td className="p-2 border">-a</td>
                    <td className="p-2 border">habla</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">nosotros/as</td>
                    <td className="p-2 border">-amos</td>
                    <td className="p-2 border">hablamos</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">vosotros/as</td>
                    <td className="p-2 border">-áis</td>
                    <td className="p-2 border">habláis</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">ellos/ellas/ustedes</td>
                    <td className="p-2 border">-an</td>
                    <td className="p-2 border">hablan</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Present Tense: -ER Verbs (example: comer - to eat)</h4>
              <table className="min-w-full border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Person</th>
                    <th className="p-2 border">Conjugation</th>
                    <th className="p-2 border">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">yo</td>
                    <td className="p-2 border">-o</td>
                    <td className="p-2 border">como</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">tú</td>
                    <td className="p-2 border">-es</td>
                    <td className="p-2 border">comes</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">él/ella/usted</td>
                    <td className="p-2 border">-e</td>
                    <td className="p-2 border">come</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">nosotros/as</td>
                    <td className="p-2 border">-emos</td>
                    <td className="p-2 border">comemos</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">vosotros/as</td>
                    <td className="p-2 border">-éis</td>
                    <td className="p-2 border">coméis</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">ellos/ellas/ustedes</td>
                    <td className="p-2 border">-en</td>
                    <td className="p-2 border">comen</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      tenses: {
        title: "Spanish Tenses",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Major Spanish Tenses</h3>
            <p>Spanish has several tenses that allow speakers to express when actions occur.</p>
            
            <div className="mt-4">
              <h4 className="font-medium">Present Tense (Presente)</h4>
              <p>Used to talk about actions happening now or regularly.</p>
              <p>Example: <strong>Yo hablo</strong> español. (I speak Spanish.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Preterite (Pretérito)</h4>
              <p>Used for completed actions in the past.</p>
              <p>Example: <strong>Yo hablé</strong> con él ayer. (I spoke with him yesterday.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Imperfect (Imperfecto)</h4>
              <p>Used for ongoing or habitual actions in the past.</p>
              <p>Example: <strong>Yo hablaba</strong> español cuando era niño. (I used to speak Spanish when I was a child.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Future (Futuro)</h4>
              <p>Used for actions that will happen.</p>
              <p>Example: <strong>Yo hablaré</strong> con él mañana. (I will speak with him tomorrow.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Conditional (Condicional)</h4>
              <p>Used for hypothetical actions.</p>
              <p>Example: <strong>Yo hablaría</strong> español si viviera en España. (I would speak Spanish if I lived in Spain.)</p>
            </div>
          </div>
        ),
      },
    },
    "French": {
      basics: {
        title: "Basic French Grammar",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">French Sentence Structure</h3>
            <p>French also follows a Subject-Verb-Object (SVO) structure, similar to English.</p>
            <p>Example: <strong>Je mange des pommes.</strong> (I eat apples.)</p>
            
            <h3 className="text-lg font-medium mt-4">Gender and Articles</h3>
            <p>All nouns in French have a gender (masculine or feminine).</p>
            <ul className="list-disc ml-6">
              <li><strong>Masculine articles:</strong> le (the), un (a/an)</li>
              <li><strong>Feminine articles:</strong> la (the), une (a/an)</li>
              <li><strong>Plural article:</strong> les (the), des (some)</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4">Subject Pronouns</h3>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Person</th>
                  <th className="p-2 border">Singular</th>
                  <th className="p-2 border">Plural</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">1st Person</td>
                  <td className="p-2 border">je (I)</td>
                  <td className="p-2 border">nous (we)</td>
                </tr>
                <tr>
                  <td className="p-2 border">2nd Person</td>
                  <td className="p-2 border">tu (you, informal)</td>
                  <td className="p-2 border">vous (you all, or formal you)</td>
                </tr>
                <tr>
                  <td className="p-2 border">3rd Person</td>
                  <td className="p-2 border">il (he), elle (she)</td>
                  <td className="p-2 border">ils (they masc.), elles (they fem.)</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      verbs: {
        title: "French Verb Conjugation",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Regular Verb Conjugation</h3>
            <p>French verbs are classified into three groups based on their endings: -er, -ir, and -re.</p>
            
            <div className="mt-4">
              <h4 className="font-medium">Present Tense: -ER Verbs (example: parler - to speak)</h4>
              <table className="min-w-full border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Person</th>
                    <th className="p-2 border">Conjugation</th>
                    <th className="p-2 border">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">je</td>
                    <td className="p-2 border">-e</td>
                    <td className="p-2 border">parle</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">tu</td>
                    <td className="p-2 border">-es</td>
                    <td className="p-2 border">parles</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">il/elle</td>
                    <td className="p-2 border">-e</td>
                    <td className="p-2 border">parle</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">nous</td>
                    <td className="p-2 border">-ons</td>
                    <td className="p-2 border">parlons</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">vous</td>
                    <td className="p-2 border">-ez</td>
                    <td className="p-2 border">parlez</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">ils/elles</td>
                    <td className="p-2 border">-ent</td>
                    <td className="p-2 border">parlent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
      tenses: {
        title: "French Tenses",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Major French Tenses</h3>
            <p>French has several tenses to express when actions occur.</p>
            
            <div className="mt-4">
              <h4 className="font-medium">Present Tense (Présent)</h4>
              <p>Used to talk about actions happening now or regularly.</p>
              <p>Example: <strong>Je parle</strong> français. (I speak French.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Passé Composé</h4>
              <p>Used for completed actions in the past.</p>
              <p>Example: <strong>J'ai parlé</strong> avec lui hier. (I spoke with him yesterday.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Imparfait (Imperfect)</h4>
              <p>Used for ongoing or habitual actions in the past.</p>
              <p>Example: <strong>Je parlais</strong> français quand j'étais enfant. (I used to speak French when I was a child.)</p>
            </div>
          </div>
        ),
      },
    },
    "German": {
      basics: {
        title: "Basic German Grammar",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">German Sentence Structure</h3>
            <p>German uses a Subject-Verb-Object (SVO) structure in main clauses, but the verb position can change in different clause types.</p>
            <p>Example: <strong>Ich esse Äpfel.</strong> (I eat apples.)</p>
            
            <h3 className="text-lg font-medium mt-4">Gender and Articles</h3>
            <p>All nouns in German have one of three genders: masculine, feminine, or neuter.</p>
            <ul className="list-disc ml-6">
              <li><strong>Masculine articles:</strong> der (the), ein (a/an)</li>
              <li><strong>Feminine articles:</strong> die (the), eine (a/an)</li>
              <li><strong>Neuter articles:</strong> das (the), ein (a/an)</li>
              <li><strong>Plural article:</strong> die (the)</li>
            </ul>
          </div>
        ),
      },
      cases: {
        title: "German Cases",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">The Four Cases in German</h3>
            <p>German has four grammatical cases that affect the form of articles, pronouns, and adjective endings.</p>
            
            <div className="mt-4">
              <h4 className="font-medium">Nominative Case (Nominativ)</h4>
              <p>Used for the subject of a sentence.</p>
              <p>Example: <strong>Der Mann</strong> liest ein Buch. (The man reads a book.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Accusative Case (Akkusativ)</h4>
              <p>Used for the direct object.</p>
              <p>Example: Ich sehe <strong>den Mann</strong>. (I see the man.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Dative Case (Dativ)</h4>
              <p>Used for the indirect object.</p>
              <p>Example: Ich gebe <strong>dem Mann</strong> ein Buch. (I give the man a book.)</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium">Genitive Case (Genitiv)</h4>
              <p>Used to show possession.</p>
              <p>Example: Das Buch <strong>des Mannes</strong>. (The man's book.)</p>
            </div>
          </div>
        ),
      },
    },
    "Italian": {
      basics: {
        title: "Basic Italian Grammar",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Italian Sentence Structure</h3>
            <p>Italian follows a Subject-Verb-Object (SVO) structure, similar to English.</p>
            <p>Example: <strong>Io mangio le mele.</strong> (I eat apples.)</p>
            
            <h3 className="text-lg font-medium mt-4">Gender and Articles</h3>
            <p>All nouns in Italian have a gender (masculine or feminine).</p>
            <ul className="list-disc ml-6">
              <li><strong>Masculine articles:</strong> il, lo, l' (the), un, uno (a/an)</li>
              <li><strong>Feminine articles:</strong> la, l' (the), una, un' (a/an)</li>
              <li><strong>Plural masculine:</strong> i, gli (the)</li>
              <li><strong>Plural feminine:</strong> le (the)</li>
            </ul>
          </div>
        ),
      },
      verbs: {
        title: "Italian Verb Conjugation",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Regular Verb Conjugation</h3>
            <p>Italian verbs are classified into three groups based on their endings: -are, -ere, and -ire.</p>
            
            <div className="mt-4">
              <h4 className="font-medium">Present Tense: -ARE Verbs (example: parlare - to speak)</h4>
              <table className="min-w-full border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Person</th>
                    <th className="p-2 border">Conjugation</th>
                    <th className="p-2 border">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">io</td>
                    <td className="p-2 border">-o</td>
                    <td className="p-2 border">parlo</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">tu</td>
                    <td className="p-2 border">-i</td>
                    <td className="p-2 border">parli</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">lui/lei</td>
                    <td className="p-2 border">-a</td>
                    <td className="p-2 border">parla</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">noi</td>
                    <td className="p-2 border">-iamo</td>
                    <td className="p-2 border">parliamo</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">voi</td>
                    <td className="p-2 border">-ate</td>
                    <td className="p-2 border">parlate</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">loro</td>
                    <td className="p-2 border">-ano</td>
                    <td className="p-2 border">parlano</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
    },
  };
  
  // Generate tabs based on available content for the selected language
  const languageTabs = grammarContent[language] 
    ? Object.keys(grammarContent[language])
    : Object.keys(grammarContent["Spanish"]); // Fallback to Spanish
  
  const currentLanguageContent = grammarContent[language] || grammarContent["Spanish"];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-4">{language} Grammar Rules</h2>
      <Card className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            {languageTabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-sm">
                {currentLanguageContent[tab].title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {languageTabs.map((tab) => (
            <TabsContent key={tab} value={tab} className="p-4 border rounded-md">
              {currentLanguageContent[tab].content}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
};

export default GrammarRules;
