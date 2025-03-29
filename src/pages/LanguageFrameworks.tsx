import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, GraduationCap } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const LanguageFrameworks = () => {
  const { currentLanguage, t } = useLocalization();
  const [activeTab, setActiveTab] = useState("cefr");

  // CEFR level descriptions
  const cefrLevels = {
    english: [
      {
        level: "A1",
        name: "Beginner",
        description: "Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type. Can introduce themselves and others and can ask and answer questions about personal details such as where they live, people they know and things they have."
      },
      {
        level: "A2",
        name: "Elementary",
        description: "Can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g. very basic personal and family information, shopping, local geography, employment). Can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters."
      },
      {
        level: "B1",
        name: "Intermediate",
        description: "Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc. Can deal with most situations likely to arise while traveling in an area where the language is spoken. Can produce simple connected text on topics that are familiar or of personal interest."
      },
      {
        level: "B2",
        name: "Upper Intermediate",
        description: "Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialization. Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party."
      },
      {
        level: "C1",
        name: "Advanced",
        description: "Can understand a wide range of demanding, longer texts, and recognize implicit meaning. Can express themselves fluently and spontaneously without much obvious searching for expressions. Can use language flexibly and effectively for social, academic and professional purposes."
      },
      {
        level: "C2",
        name: "Proficiency",
        description: "Can understand with ease virtually everything heard or read. Can summarize information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation. Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning even in more complex situations."
      }
    ],
    spanish: [
      {
        level: "A1",
        name: "Principiante",
        description: "Puede comprender y utilizar expresiones cotidianas y frases muy básicas orientadas a la satisfacción de necesidades concretas. Puede presentarse a sí mismo y a otros, y puede hacer y responder preguntas sobre detalles personales como dónde vive, personas que conoce y cosas que tiene."
      },
      {
        level: "A2",
        name: "Elemental",
        description: "Puede comprender oraciones y expresiones utilizadas frecuentemente relacionadas con áreas de relevancia inmediata (por ejemplo, información personal y familiar muy básica, compras, geografía local, empleo). Puede comunicarse en tareas simples y rutinarias que requieren un intercambio simple y directo de información sobre asuntos familiares y rutinarios."
      },
      {
        level: "B1",
        name: "Intermedio",
        description: "Puede comprender los puntos principales de textos claros y en lengua estándar si tratan sobre cuestiones que le son conocidas, ya sea en situaciones de trabajo, de estudio o de ocio. Puede desenvolverse en la mayor parte de las situaciones que pueden surgir durante un viaje por zonas donde se utiliza la lengua. Puede producir textos sencillos y coherentes sobre temas que le son familiares o en los que tiene un interés personal."
      },
      {
        level: "B2",
        name: "Intermedio Alto",
        description: "Puede entender las ideas principales de textos complejos que traten de temas tanto concretos como abstractos, incluso si son de carácter técnico, siempre que estén dentro de su campo de especialización. Puede relacionarse con hablantes nativos con un grado suficiente de fluidez y naturalidad, de modo que la comunicación se realice sin esfuerzo por parte de los interlocutores."
      },
      {
        level: "C1",
        name: "Avanzado",
        description: "Puede comprender una amplia variedad de textos extensos y con cierto nivel de exigencia, así como reconocer en ellos sentidos implícitos. Puede expresarse de forma fluida y espontánea sin muestras muy evidentes de esfuerzo para encontrar la expresión adecuada. Puede hacer un uso flexible y efectivo del idioma para fines sociales, académicos y profesionales."
      },
      {
        level: "C2",
        name: "Dominio",
        description: "Puede comprender con facilidad prácticamente todo lo que oye o lee. Puede reconstruir la información y los argumentos procedentes de diversas fuentes, ya sean en lengua hablada o escrita, y presentarlos de manera coherente y resumida. Puede expresarse espontáneamente, con gran fluidez y con un grado de precisión que le permite diferenciar pequeños matices de significado incluso en situaciones de mayor complejidad."
      }
    ],
    portuguese: [
      {
        level: "A1",
        name: "Iniciante",
        description: "Pode compreender e usar expressões familiares do dia a dia e frases muito básicas para satisfazer necessidades concretas. Pode apresentar-se e apresentar outros, e pode fazer e responder perguntas sobre detalhes pessoais, como onde mora, pessoas que conhece e coisas que tem."
      },
      {
        level: "A2",
        name: "Elementar",
        description: "Pode compreender frases e expressões frequentemente usadas relacionadas com áreas de relevância imediata (por exemplo, informações pessoais e familiares muito básicas, compras, geografia local, emprego). Pode comunicar-se em tarefas simples e rotineiras que exijam uma troca simples e direta de informações sobre assuntos familiares e rotineiros."
      },
      {
        level: "B1",
        name: "Intermediário",
        description: "Pode compreender os pontos principais de textos claros e em linguagem padrão se eles tratarem de questões que lhe são familiares, seja em situações de trabalho, estudo ou lazer. Pode lidar com a maioria das situações encontradas na região onde se fala a língua-alvo. Pode produzir um discurso simples e coerente sobre assuntos que lhe são familiares ou de interesse pessoal."
      },
      {
        level: "B2",
        name: "Intermediário Superior",
        description: "Pode compreender as ideias principais em textos complexos sobre assuntos concretos e abstratos, incluindo discussões técnicas na sua área de especialidade. Pode interagir com um grau de fluência e espontaneidade que torna possível a interação regular com falantes nativos sem que haja tensão de parte a parte."
      },
      {
        level: "C1",
        name: "Avançado",
        description: "Pode compreender uma ampla gama de textos longos e exigentes, reconhecendo os significados implícitos. Pode expressar-se fluentemente e espontaneamente sem precisar procurar muito as palavras. Pode usar a língua de modo flexível e eficaz para fins sociais, acadêmicos e profissionais."
      },
      {
        level: "C2",
        name: "Proficiência",
        description: "Pode compreender, sem esforço, praticamente tudo que ouve ou lê. Pode resumir informações de diferentes fontes, orais e escritas, reconstruindo argumentos e fatos em uma apresentação coerente. Pode expressar-se espontaneamente, com grande fluência e precisão, diferenciando finas nuances de significado mesmo em situações mais complexas."
      }
    ]
  };

  // ACTFL level descriptions with detailed breakdowns
  const actflLevels = {
    english: [
      {
        level: "Novice",
        sublevels: [
          {
            name: "Novice Low",
            description: "Can communicate minimally with formulaic and rote utterances, lists, and phrases. May show emerging signs of spontaneity and flexibility, but has significant difficulty even with sympathetic interlocutors."
          },
          {
            name: "Novice Mid",
            description: "Can communicate minimally by using a number of isolated words and memorized phrases. Can respond to simple, direct questions or requests for information. Speech may be restricted to two or three-word phrases."
          },
          {
            name: "Novice High",
            description: "Can communicate with formulaic and rote utterances within the context of their experience. Can respond to simple, direct questions or requests for information but can only ask a very few formulaic questions. Speech is primarily reactive."
          }
        ],
        description: "At the Novice level, speakers can communicate short messages on highly predictable, everyday topics that affect them directly. They do so primarily through the use of isolated words and phrases that have been encountered, memorized, and recalled."
      },
      {
        level: "Intermediate",
        sublevels: [
          {
            name: "Intermediate Low",
            description: "Can handle successfully a limited number of uncomplicated communicative tasks by creating with the language in straightforward social situations. Can ask and answer questions appropriately."
          },
          {
            name: "Intermediate Mid",
            description: "Can handle successfully a variety of uncomplicated communicative tasks in straightforward social situations. Can participate in conversations on topics beyond the most immediate needs."
          },
          {
            name: "Intermediate High",
            description: "Can handle successfully uncomplicated tasks and social situations requiring an exchange of basic information related to work, school, recreation, and particular interests, though hesitation may occur."
          }
        ],
        description: "At the Intermediate level, speakers can create with the language when talking about familiar topics related to their daily life. They are able to recombine learned material in order to express personal meaning. Intermediate-level speakers can ask simple questions and can handle a straightforward survival situation."
      },
      {
        level: "Advanced",
        sublevels: [
          {
            name: "Advanced Low",
            description: "Can perform various Advanced-level tasks, but not consistently. Speech is typically marked by a certain grammatical roughness, inadequate vocabulary for discussing topics at length, and notable patterns of error."
          },
          {
            name: "Advanced Mid",
            description: "Can perform all Advanced-level tasks with linguistic ease, confidence, and competence. Can discuss topics concretely and abstractly, handle a situation with a complication, and narrate in all time frames consistently."
          },
          {
            name: "Advanced High",
            description: "Can perform all Advanced-level tasks with ease and confidence. Can discuss topics abstractly and with good accuracy. Speaking ability does not fully meet the criteria for Superior level tasks, with weaknesses in one or more areas."
          }
        ],
        description: "At the Advanced level, speakers can narrate and describe in all major time frames when talking about topics of general interest. They can handle a situation with a complication. The language of Advanced-level speakers is characterized by substantial, connected discourse."
      },
      {
        level: "Superior",
        sublevels: [],
        description: "At the Superior level, speakers can communicate with accuracy and fluency in order to participate fully and effectively in conversations on a variety of topics in formal and informal settings. They can discuss their interests and special fields of competence, explain complex matters, and provide lengthy and coherent narrations."
      },
      {
        level: "Distinguished",
        sublevels: [],
        description: "At the Distinguished level, speakers use language skillfully, and with accuracy, efficiency, and effectiveness. They are educated and articulate users of the language. They can reflect on a wide range of global issues and highly abstract concepts in a culturally appropriate manner."
      }
    ],
    spanish: [
      {
        level: "Novato",
        sublevels: [
          {
            name: "Novato Bajo",
            description: "Puede comunicarse mínimamente con expresiones formulaicas y de memoria, listas y frases. Puede mostrar signos emergentes de espontaneidad y flexibilidad, pero tiene dificultades significativas incluso con interlocutores comprensivos."
          },
          {
            name: "Novato Medio",
            description: "Puede comunicarse mínimamente usando una serie de palabras aisladas y frases memorizadas. Puede responder a preguntas simples y directas o solicitudes de información. El habla puede restringirse a frases de dos o tres palabras."
          },
          {
            name: "Novato Alto",
            description: "Puede comunicarse con expresiones formulaicas y de memoria dentro del contexto de su experiencia. Puede responder a preguntas simples y directas o solicitudes de información, pero solo puede hacer muy pocas preguntas formulaicas. El habla es principalmente reactiva."
          }
        ],
        description: "En el nivel Novato, los hablantes pueden comunicar mensajes cortos sobre temas cotidianos altamente predecibles que les afectan directamente. Lo hacen principalmente a través del uso de palabras y frases aisladas que han encontrado, memorizado y recordado."
      },
      {
        level: "Intermedio",
        sublevels: [
          {
            name: "Intermedio Bajo",
            description: "Puede manejar con éxito un número limitado de tareas comunicativas no complicadas creando con el lenguaje en situaciones sociales sencillas. Puede hacer y responder preguntas adecuadamente."
          },
          {
            name: "Intermedio Medio",
            description: "Puede manejar con éxito una variedad de tareas comunicativas no complicadas en situaciones sociales sencillas. Puede participar en conversaciones sobre temas más allá de las necesidades más inmediatas."
          },
          {
            name: "Intermedio Alto",
            description: "Puede manejar con éxito tareas no complicadas y situaciones sociales que requieren un intercambio de información básica relacionada con el trabajo, la escuela, la recreación y los intereses particulares, aunque puede ocurrir cierta vacilación."
          }
        ],
        description: "En el nivel Intermedio, los hablantes pueden crear con el idioma cuando hablan de temas familiares relacionados con su vida diaria. Son capaces de recombinar material aprendido para expresar un significado personal. Los hablantes de nivel Intermedio pueden hacer preguntas simples y pueden manejar una situación de supervivencia sencilla."
      },
      {
        level: "Avanzado",
        sublevels: [
          {
            name: "Avanzado Bajo",
            description: "Puede realizar varias tareas de nivel Avanzado, pero no de manera consistente. El habla típicamente está marcada por cierta rusticidad gramatical, vocabulario inadecuado para discutir temas en profundidad y patrones notables de error."
          },
          {
            name: "Avanzado Medio",
            description: "Puede realizar todas las tareas de nivel Avanzado con facilidad lingüística, confianza y competencia. Puede discutir temas de manera concreta y abstracta, manejar una situación con una complicación y narrar en todos los marcos temporales de manera consistente."
          },
          {
            name: "Avanzado Alto",
            description: "Puede realizar todas las tareas de nivel Avanzado con facilidad y confianza. Puede discutir temas de manera abstracta y con buena precisión. La capacidad de hablar no cumple completamente con los criterios para las tareas de nivel Superior, con debilidades en una o más áreas."
          }
        ],
        description: "En el nivel Avanzado, los hablantes pueden narrar y describir en todos los marcos temporales principales cuando hablan de temas de interés general. Pueden manejar una situación con una complicación. El lenguaje de los hablantes de nivel Avanzado se caracteriza por un discurso sustancial y conectado."
      },
      {
        level: "Superior",
        sublevels: [],
        description: "En el nivel Superior, los hablantes pueden comunicarse con precisión y fluidez para participar plena y efectivamente en conversaciones sobre una variedad de temas en entornos formales e informales. Pueden discutir sus intereses y campos especiales de competencia, explicar asuntos complejos y proporcionar narraciones largas y coherentes."
      },
      {
        level: "Distinguido",
        sublevels: [],
        description: "En el nivel Distinguido, los hablantes pueden usar el idioma con habilidad y con precisión, eficiencia y efectividad. Son usuarios educados y articulados del idioma. Pueden reflexionar sobre una ampla gama de temas globales y conceptos altamente abstractos de una manera culturalmente apropiada."
      }
    ],
    portuguese: [
      {
        level: "Novato",
        sublevels: [
          {
            name: "Novato Baixo",
            description: "Pode se comunicar minimamente com expressões formulaicas e memorizadas, listas e frases. Pode mostrar sinais emergentes de espontaneidade e flexibilidade, mas tem dificuldades significativas mesmo com interlocutores compreensivos."
          },
          {
            name: "Novato Médio",
            description: "Pode se comunicar minimamente usando uma série de palavras isoladas e frases memorizadas. Pode responder a perguntas simples e diretas ou pedidos de informação. A fala pode se restringir a frases de duas ou três palavras."
          },
          {
            name: "Novato Alto",
            description: "Pode se comunicar com expressões formulaicas e memorizadas dentro do contexto de sua experiência. Pode responder a perguntas simples e diretas ou pedidos de informação, mas só pode fazer algumas poucas perguntas formulaicas. A fala é principalmente reativa."
          }
        ],
        description: "No nível Novato, os falantes podem comunicar mensagens curtas sobre tópicos cotidianos altamente previsíveis que os afetam diretamente. Fazem isso principalmente através do uso de palavras e frases isoladas que foram encontradas, memorizadas e relembradas."
      },
      {
        level: "Intermediário",
        sublevels: [
          {
            name: "Intermediário Baixo",
            description: "Pode lidar com sucesso com um número limitado de tarefas comunicativas não complicadas criando com a linguagem em situações sociais simples. Pode fazer e responder perguntas adequadamente."
          },
          {
            name: "Intermediário Médio",
            description: "Pode lidar com sucesso com uma variedade de tarefas comunicativas não complicadas em situações sociais simples. Pode participar de conversas sobre tópicos além das necessidades mais imediatas."
          },
          {
            name: "Intermediário Alto",
            description: "Pode lidar com sucesso com tarefas não complicadas e situações sociais que exigem uma troca de informações básicas relacionadas ao trabalho, escola, recreação e interesses particulares, embora possa ocorrer alguma hesitação."
          }
        ],
        description: "No nível Intermediário, os falantes podem criar com a língua quando falam sobre tópicos familiares relacionados à sua vida diária. São capazes de recombinar material aprendido para expressar significado pessoal. Falantes de nível Intermediário podem fazer perguntas simples e podem lidar com uma situação de sobrevivência direta."
      },
      {
        level: "Avançado",
        sublevels: [
          {
            name: "Avançado Baixo",
            description: "Pode realizar várias tarefas de nível Avançado, mas não de forma consistente. A fala é tipicamente marcada por certa rusticidade gramatical, vocabulário inadequado para discutir tópicos com profundidade e padrões notáveis de erro."
          },
          {
            name: "Avançado Médio",
            description: "Pode realizar todas as tarefas de nível Avançado com facilidade linguística, confiança e competência. Pode discutir tópicos de forma concreta e abstrata, lidar com uma situação com uma complicação e narrar em todos os quadros temporais de maneira consistente."
          },
          {
            name: "Avançado Alto",
            description: "Pode realizar todas as tarefas de nível Avançado com facilidade e confiança. Pode discutir tópicos de forma abstrata e com boa precisão. A capacidade de falar não atende completamente aos critérios para tarefas de nível Superior, com fraquezas em uma ou mais áreas."
          }
        ],
        description: "No nível Avançado, os falantes podem narrar e descrever em todos os principais quadros temporais quando falam sobre tópicos de interesse geral. Podem lidar com uma situação com uma complicação. A linguagem dos falantes de nível Avançado é caracterizada por um discurso substancial e conectado."
      },
      {
        level: "Superior",
        sublevels: [],
        description: "No nível Superior, os falantes podem se comunicar com precisão e fluência para participar de forma plena e eficaz em conversas sobre uma variedade de tópicos em ambientes formais e informais. Podem discutir seus interesses e campos especiais de competência, explicar assuntos complexos e fornecer narrações longas e coerentes."
      },
      {
        level: "Distinto",
        sublevels: [],
        description: "No nível Distinto, os falantes podem usar a língua com habilidade e com precisão, eficiência e eficácia. São usuários educados e articulados da língua. Podem refletir sobre uma ampla gama de questões globais e conceitos altamente abstratos de uma maneira culturalmente apropriada."
      }
    ]
  };

  // CEFR to ACTFL conversion explanation
  const conversionExplanation = {
    english: "The CEFR (Common European Framework of Reference) and ACTFL (American Council on the Teaching of Foreign Languages) are two widely recognized frameworks for describing language proficiency. While they use different scales and terminology, there are approximate correlations between the two systems:\n\nCEFR A1 ≈ ACTFL Novice Low to Mid\nCEFR A2 ≈ ACTFL Novice High to Intermediate Low\nCEFR B1 ≈ ACTFL Intermediate Mid to High\nCEFR B2 ≈ ACTFL Advanced Low to Mid\nCEFR C1 ≈ ACTFL Advanced High to Superior\nCEFR C2 ≈ ACTFL Distinguished",
    spanish: "El MCER (Marco Común Europeo de Referencia) y ACTFL (Consejo Americano para la Enseñanza de Lenguas Extranjeras) son dos marcos ampliamente reconocidos para describir la competencia lingüística. Aunque utilizan escalas y terminología diferentes, existen correlaciones aproximadas entre los dos sistemas:\n\nMCER A1 ≈ ACTFL Novato Bajo a Medio\nMCER A2 ≈ ACTFL Novato Alto a Intermedio Bajo\nMCER B1 ≈ ACTFL Intermedio Medio a Alto\nMCER B2 ≈ ACTFL Avanzado Bajo a Medio\nMCER C1 ≈ ACTFL Avanzado Alto a Superior\nMCER C2 ≈ ACTFL Distinguido",
    portuguese: "O QECR (Quadro Europeu Comum de Referência) e o ACTFL (Conselho Americano para o Ensino de Línguas Estrangeiras) são dois quadros amplamente reconhecidos para descrever a proficiência linguística. Embora utilizem escalas e terminologia diferentes, existem correlações aproximadas entre os dois sistemas:\n\nQECR A1 ≈ ACTFL Novato Baixo a Médio\nQECR A2 ≈ ACTFL Novato Alto a Intermediário Baixo\nQECR B1 ≈ ACTFL Intermediário Médio a Alto\nQECR B2 ≈ ACTFL Avançado Baixo a Médio\nQECR C1 ≈ ACTFL Avançado Alto a Superior\nQECR C2 ≈ ACTFL Distinto"
  };

  // Get the appropriate levels based on the user's language
  const getLocalizedContent = (content: any) => {
    return content[currentLanguage as keyof typeof content] || content.english;
  };

  const levels = getLocalizedContent(cefrLevels);
  const actfl = getLocalizedContent(actflLevels);
  const conversion = getLocalizedContent(conversionExplanation);

  // Get page title based on language
  const getPageTitle = () => {
    switch (currentLanguage) {
      case "spanish":
        return "Marcos de Referencia de Idiomas";
      case "portuguese":
        return "Estruturas de Referência de Idiomas";
      default:
        return "Language Reference Frameworks";
    }
  };

  // Get CEFR title based on language
  const getCefrTitle = () => {
    switch (currentLanguage) {
      case "spanish":
        return "Marco Común Europeo de Referencia (MCER)";
      case "portuguese":
        return "Quadro Europeu Comum de Referência (QECR)";
      default:
        return "Common European Framework of Reference (CEFR)";
    }
  };

  // Get ACTFL title based on language
  const getActflTitle = () => {
    switch (currentLanguage) {
      case "spanish":
        return "Consejo Americano para la Enseñanza de Lenguas Extranjeras (ACTFL)";
      case "portuguese":
        return "Conselho Americano para o Ensino de Línguas Estrangeiras (ACTFL)";
      default:
        return "American Council on the Teaching of Foreign Languages (ACTFL)";
    }
  };

  // Get Comparison title based on language
  const getComparisonTitle = () => {
    switch (currentLanguage) {
      case "spanish":
        return "Comparación MCER y ACTFL";
      case "portuguese":
        return "Comparação QECR e ACTFL";
      default:
        return "CEFR and ACTFL Comparison";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-2">{getPageTitle()}</h1>
        <p className="text-gray-600">
          {currentLanguage === "spanish" 
            ? "Comprenda los diferentes niveles y marcos para la evaluación del dominio del idioma"
            : currentLanguage === "portuguese"
              ? "Entenda os diferentes níveis e estruturas para avaliação de proficiência em idiomas"
              : "Understand the different levels and frameworks for language proficiency assessment"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="w-full mb-8">
          <TabsTrigger value="cefr" className="flex-1">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>
              {currentLanguage === "spanish" ? "MCER" : currentLanguage === "portuguese" ? "QECR" : "CEFR"}
            </span>
          </TabsTrigger>
          <TabsTrigger value="actfl" className="flex-1">
            <GraduationCap className="h-4 w-4 mr-2" />
            <span>ACTFL</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex-1">
            <Award className="h-4 w-4 mr-2" />
            <span>
              {currentLanguage === "spanish" 
                ? "Comparación" 
                : currentLanguage === "portuguese" 
                  ? "Comparação" 
                  : "Comparison"}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cefr">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">{getCefrTitle()}</h2>
              <p className="mb-6">
                {currentLanguage === "spanish" 
                  ? "El Marco Común Europeo de Referencia para las lenguas (MCER) es un estándar internacional para describir la capacidad lingüística. Define los niveles de dominio desde A1 (principiante) hasta C2 (dominio)."
                  : currentLanguage === "portuguese"
                    ? "O Quadro Europeu Comum de Referência para Línguas (QECR) é um padrão internacional para descrever a capacidade linguística. Define os níveis de proficiência desde A1 (iniciante) até C2 (proficiência)."
                    : "The Common European Framework of Reference for Languages (CEFR) is an international standard for describing language ability. It defines proficiency levels from A1 (beginner) to C2 (mastery)."}
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                {levels.map((level) => (
                  <Card key={level.level} className="overflow-hidden">
                    <CardHeader className={`bg-lingua-primary text-white`}>
                      <CardTitle className="flex items-center">
                        <span className="text-xl font-bold mr-2">{level.level}</span>
                        <span className="text-sm opacity-90">({level.name})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p>{level.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="actfl">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">{getActflTitle()}</h2>
              <p className="mb-6">
                {currentLanguage === "spanish" 
                  ? "Las Pautas de Competencia de ACTFL describen lo que las personas pueden hacer con el lenguaje en términos de habilidades para hablar, escribir, escuchar y leer en situaciones de la vida real de forma espontánea y no ensayada."
                  : currentLanguage === "portuguese"
                    ? "As Diretrizes de Proficiência do ACTFL descrevem o que as pessoas podem fazer com a linguagem em termos de habilidades de falar, escrever, ouvir e ler em situações da vida real de forma espontânea e não ensaiada."
                    : "The ACTFL Proficiency Guidelines describe what individuals can do with language in terms of speaking, writing, listening, and reading in real-world situations in a spontaneous and non-rehearsed context."}
              </p>
              
              <div className="space-y-6">
                {actfl.map((level) => (
                  <Card key={level.level} className="overflow-hidden">
                    <CardHeader className="bg-lingua-secondary text-white">
                      <CardTitle>{level.level}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="mb-4">{level.description}</p>
                      
                      {level.sublevels && level.sublevels.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-lg font-medium mb-2">
                            {currentLanguage === "spanish" 
                              ? "Subniveles" 
                              : currentLanguage === "portuguese" 
                                ? "Subníveis" 
                                : "Sublevels"}
                          </h4>
                          <div className="space-y-3">
                            {level.sublevels.map((sublevel) => (
                              <div key={sublevel.name} className="border-l-4 border-lingua-secondary/70 pl-3 py-2">
                                <h5 className="font-medium">{sublevel.name}</h5>
                                <p className="text-sm text-gray-700 mt-1">{sublevel.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4">{getComparisonTitle()}</h2>
              <p className="mb-4 whitespace-pre-line">{conversion}</p>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  {currentLanguage === "spanish" 
                    ? "Tabla de Comparación" 
                    : currentLanguage === "portuguese" 
                      ? "Tabela de Comparação" 
                      : "Comparison Table"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-lingua-primary text-white">
                        <th className="px-4 py-2 text-left">
                          {currentLanguage === "spanish" 
                            ? "MCER" 
                            : currentLanguage === "portuguese" 
                              ? "QECR" 
                              : "CEFR"}
                        </th>
                        <th className="px-4 py-2 text-left">ACTFL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-2 font-medium">A1</td>
                        <td className="px-4 py-2">Novice Low to Mid</td>
                      </tr>
                      <tr className="border-b bg-gray-50">
                        <td className="px-4 py-2 font-medium">A2</td>
                        <td className="px-4 py-2">Novice High to Intermediate Low</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2 font-medium">B1</td>
                        <td className="px-4 py-2">Intermediate Mid to High</td>
                      </tr>
                      <tr className="border-b bg-gray-50">
                        <td className="px-4 py-2 font-medium">B2</td>
                        <td className="px-4 py-2">Advanced Low to Mid</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2 font-medium">C1</td>
                        <td className="px-4 py-2">Advanced High to Superior</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-medium">C2</td>
                        <td className="px-4 py-2">Distinguished</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LanguageFrameworks;
