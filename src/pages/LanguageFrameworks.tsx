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
    ],
    korean: [
      {
        level: "A1",
        name: "초급자",
        description: "구체적인 유형의 요구를 만족시키기 위한 친숙한 일상적 표현과 매우 기본적인 문구를 이해하고 사용할 수 있습니다. 자신과 다른 사람을 소개하고, A씨가 사는 곳, 아는 사람 및 소유물에 관한 개인 정보에 대해 질문하고 답할 수 있습니다."
      },
      {
        level: "A2",
        name: "초등",
        description: "지극히 개인적인 정보(예: 매우 기본적인 개인 및 가족 정보, 쇼핑, 지역 지리, 고용)와 관련된 영역에 대해 가장 관련성이 높은 문장과 자주 사용되는 표현을 이해할 수 있습니다. 친숙하고 일상적인 사항에 대한 단순하고 직접적인 정보 교환을 요구하는 간단하고 일상적인 작업에서 의사소통할 수 있습니다."
      },
      {
        level: "B1",
        name: "중급",
        description: "직장, 학교, 여가 등에서 정기적으로 접하는 친숙한 문제에 대한 명확한 표준 입력의 요점을 이해할 수 있습니다. 해당 언어가 사용되는 지역을 여행하는 동안 발생할 가능성이 있는 대부분의 상황을 처리할 수 있습니다. 친숙하거나 개인적 관심사가 있는 주제에 대해 간단한 연결 텍스트를 작성할 수 있습니다."
      },
      {
        level: "B2",
        name: "중상급",
        description: "자신의 전문 분야의 기술적 토론을 포함하여 구체적이고 추상적인 주제에 대한 복잡한 텍스트의 주요 아이디어를 이해할 수 있습니다. 원어민과 정기적인 상호 작용이 가능한 정도의 유창성과 자발성을 가지고 상호 작용할 수 있으며, 어느 쪽도 긴장하지 않습니다."
      },
      {
        level: "C1",
        name: "고급",
        description: "요구가 많은 더 긴 텍스트를 이해하고 암시적 의미를 인식할 수 있습니다. 표현을 찾기 위해 많이 고민하지 않고 유창하고 자발적으로 자신을 표현할 수 있습니다. 사회적, 학문적, 직업적 목적을 위해 언어를 유연하고 효과적으로 사용할 수 있습니다."
      },
      {
        level: "C2",
        name: "능숙함",
        description: "듣거나 읽은 거의 모든 것을 쉽게 이해할 수 있습니다. 다양한 구두 및 서면 출처의 정보를 요약하고, 일관된 프레젠테이션에서 논쟁과 설명을 재구성할 수 있습니다. 자발적으로, 매우 유창하게, 정확하게 자신을 표현할 수 있으며, 복잡한 상황에서도 의미의 미세한 차이를 구별할 수 있습니다."
      }
    ],
    arabic: [
      {
        level: "初级",
        name: "初级",
        description: "能够理解和使用日常表达和非常基本的短语，满足具体类型的需求。能够介绍自己和他人，能够询问和回答有关个人详细信息的问题，例如住在哪里、认识的人和拥有的物品。"
      },
      {
        level: "初级",
        name: "初级",
        description: "能够理解与最直接相关领域（如非常基本的个人和家庭信息、购物、当地地理、就业）相关的句子和常用表达。能够在需要简单和直接交换有关熟悉和日常事务信息的简单和例行任务中进行交流。"
      },
      {
        level: "中级",
        name: "中级",
        description: "能够理解在工作、学校、休闲等环境中经常遇到的熟悉事物的清晰标准输入的要点。能够处理在使用该语言的地区旅行时可能出现的大多数情况。能够就熟悉或感兴趣的话题制作简单的连贯文本。"
      },
      {
        level: "中高级",
        name: "中高级",
        description: "能够理解具体和抽象主题的复杂文本的主要思想，包括其专业领域的技术讨论。能够以一定程度的流利和自然互动，使与母语使用者"
      },
      {
        level: "高级",
        name: "高级",
        description: "能够理解各种要求较高的较长文本，并能识别隐含意义。能够流利、自发地表达自己，而不会过多地寻找表达方式。能够灵活有效地使用语言达到社交、学术和专业目的。"
      },
      {
        level: "精通",
        name: "精通",
        description: "能够毫不费力地理解几乎所有听到或读到的内容。能够总结来自不同口头和书面来源的信息，并在连贯的演示中重建论点和叙述。能够自发、非常流利和精确地表达自己，即使在更复杂的情况下也能区分细微的意义差别。"
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
            description: "Can communicate minimally with learned material comprised of isolated words and memorized phrases when dealing with predictable, everyday topics and situations. "
          },
          {
            name: "Novice Mid",
            description: "Can communicate minimally with learned material comprised of isolated words and memorized phrases when dealing with predictable, everyday topics and situations. "
          },
          {
            name: "Novice High",
            description: "Can communicate minimally with learned material comprised of isolated words and memorized phrases when dealing with predictable, everyday topics and situations. "
          }
        ],
        description: "In the Novice level, speakers can communicate short messages on highly predictable, everyday topics that affect them directly. They do so primarily through the use of isolated words and memorized phrases that have been encountered, memorized, and recalled."
      },
      {
        level: "Intermediate",
        sublevels: [
          {
            name: "Intermediate Low",
            description: "Can handle successfully a limited number of uncomplicated communicative tasks by creating with the language in straightforward social situations. Conversation is generally limited to those predictable and concrete exchanges necessary for survival in the target culture"
          },
          {
            name: "Intermediate Mid",
            description: "Can handle successfully a variety of uncomplicated communicative tasks in straightforward social situations. Can ask and answer questions and participate in simple conversations on topics beyond the most immediate needs."
          },
          {
            name: "Intermediate High",
            description: "Can handle successfully uncomplicated tasks and social situations requiring an exchange of basic information related to work, school, recreation, particular interests, and areas of competence, though hesitation and choppiness may be evident."
          }
        ],
        description: "At the Intermediate level, speakers can create with the language when talking about familiar topics related to their daily life. They can recombine learned material to express personal meaning. Intermediate-level speakers can ask simple questions and can handle a straightforward survival situation."
      },
      {
        level: "Advanced",
        sublevels: [
          {
            name: "Advanced Low",
            description: "Can handle successfully a variety of communicative tasks, although somewhat haltingly, and social situations. Can narrate and describe with some detail, usually in the major time frames of past, present, and future."
          },
          {
            name: "Advanced Mid",
            description: "Can handle successfully a variety of communicative tasks, although somewhat haltingly, and social situations. Can narrate and describe with considerable detail, usually in the major time frames of past, present, and future."
          },
          {
            name: "Advanced High",
            description: "Can handle successfully a variety of communicative tasks, although somewhat haltingly, and social situations. Can narrate and describe in all major time frames (past, present, and future) with good control of aspect."
          }
        ],
        description: "At the Advanced level, speakers can narrate and describe in the major time frames of past, present, and future. These speakers can handle communicative tasks and social situations with a general ease and fluidity. Advanced-level speakers are often able to compensate for gaps in their vocabulary and control of grammar with confident use of communicative strategies."
      },
      {
        level: "Superior",
        description: "Speakers at the Superior level can communicate in the language with accuracy and fluency in nearly all formal and informal topics pertinent to professional needs or areas of special interest. They demonstrate a high degree of control of grammar and vocabulary and readily adjust their language to fit the audience, purpose, and setting. A Superior-level speaker is characterized by the ability to produce highly complex, extended discourse."
      }
    ],
    spanish: [
      {
        level: "Novice",
        sublevels: [
          {
            name: "Novice Low",
            description: "Puede comunicarse mínimamente con material aprendido que consta de palabras aisladas y frases memorizadas cuando se trata de temas y situaciones cotidianas predecibles."
          },
          {
            name: "Novice Mid",
            description: "Puede comunicarse mínimamente con material aprendido que consta de palabras aisladas y frases memorizadas cuando se trata de temas y situaciones cotidianas predecibles."
          },
          {
            name: "Novice High",
            description: "Puede comunicarse mínimamente con material aprendido que consta de palabras aisladas y frases memorizadas cuando se trata de temas y situaciones cotidianas predecibles."
          }
        ],
        description: "En el nivel Novice, los hablantes pueden comunicar mensajes cortos sobre temas cotidianos altamente predecibles que les afectan directamente. Lo hacen principalmente mediante el uso de palabras aisladas y frases memorizadas que han sido encontradas, memorizadas y recordadas."
      },
      {
        level: "Intermediate",
        sublevels: [
          {
            name: "Intermediate Low",
            description: "Puede manejar con éxito un número limitado de tareas comunicativas no complicadas creando con el idioma en situaciones sociales sencillas. La conversación generalmente se limita a aquellos intercambios predecibles y concretos necesarios para la supervivencia en la cultura objetivo."
          },
          {
            name: "Intermediate Mid",
            description: "Puede manejar con éxito una variedad de tareas comunicativas no complicadas en situaciones sociales sencillas. Puede hacer y responder preguntas y participar en conversaciones sencillas sobre temas que van más allá de las necesidades más inmediatas."
          },
          {
            name: "Intermediate High",
            description: "Puede manejar con éxito tareas no complicadas y situaciones sociales que requieren un intercambio de información básica relacionada con el trabajo, la escuela, la recreación, intereses particulares y áreas de competencia, aunque puede ser evidente cierta vacilación e irregularidad."
          }
        ],
        description: "En el nivel Intermedio, los hablantes pueden crear con el idioma cuando hablan de temas familiares relacionados con su vida diaria. Pueden recombinar material aprendido para expresar un significado personal. Los hablantes de nivel intermedio pueden hacer preguntas sencillas y pueden manejar una situación de supervivencia sencilla."
      },
      {
        level: "Advanced",
        sublevels: [
          {
            name: "Advanced Low",
            description: "Puede manejar con éxito una variedad de tareas comunicativas, aunque de forma algo vacilante, y situaciones sociales. Puede narrar y describir con cierto detalle, generalmente en los principales marcos temporales de pasado, presente y futuro."
          },
          {
            name: "Advanced Mid",
            description: "Puede manejar con éxito una variedad de tareas comunicativas, aunque de forma algo vacilante, y situaciones sociales. Puede narrar y describir con considerable detalle, generalmente en los principales marcos temporales de pasado, presente y futuro."
          },
          {
            name: "Advanced High",
            description: "Puede manejar con éxito una variedad de tareas comunicativas, aunque de forma algo vacilante, y situaciones sociales. Puede narrar y describir en todos los marcos temporales principales (pasado, presente y futuro) con un buen control del aspecto."
          }
        ],
        description: "En el nivel Avanzado, los hablantes pueden narrar y describir en los principales marcos temporales de pasado, presente y futuro. Estos hablantes pueden manejar tareas comunicativas y situaciones sociales con una facilidad y fluidez generales. Los hablantes de nivel avanzado a menudo pueden compensar las lagunas en su vocabulario y control de la gramática con un uso seguro de estrategias comunicativas."
      },
      {
        level: "Superior",
        description: "Los hablantes en el nivel Superior pueden comunicarse en el idioma con precisión y fluidez en casi todos los temas formales e informales pertinentes a las necesidades profesionales o áreas de interés especial. Demuestran un alto grado de control de la gramática y el vocabulario y ajustan fácilmente su lenguaje para adaptarse a la audiencia, el propósito y el entorno. Un hablante de nivel Superior se caracteriza por la capacidad de producir un discurso muy complejo y extenso."
      }
    ],
    portuguese: [
      {
        level: "Novice",
        sublevels: [
          {
            name: "Novice Low",
            description: "Pode comunicar-se minimamente com material aprendido composto de palavras isoladas e frases memorizadas ao lidar com tópicos e situações cotidianas previsíveis."
          },
          {
            name: "Novice Mid",
            description: "Pode comunicar-se minimamente com material aprendido composto de palavras isoladas e frases memorizadas ao lidar com tópicos e situações cotidianas previsíveis."
          },
          {
            name: "Novice High",
            description: "Pode comunicar-se minimamente com material aprendido composto de palavras isoladas e frases memorizadas ao lidar com tópicos e situações cotidianas previsíveis."
          }
        ],
        description: "No nível Novice, os falantes podem comunicar mensagens curtas sobre tópicos cotidianos altamente previsíveis que os afetam diretamente. Eles fazem isso principalmente através do uso de palavras isoladas e frases memorizadas que foram encontradas, memorizadas e recordadas."
      },
      {
        level: "Intermediate",
        sublevels: [
          {
            name: "Intermediate Low",
            description: "Pode lidar com sucesso com um número limitado de tarefas comunicativas não complicadas, criando com o idioma em situações sociais diretas. A conversa geralmente se limita àqueles intercâmbios previsíveis e concretos necessários para a sobrevivência na cultura-alvo."
          },
          {
            name: "Intermediate Mid",
            description: "Pode lidar com sucesso com uma variedade de tarefas comunicativas não complicadas em situações sociais diretas. Pode fazer e responder perguntas e participar de conversas simples sobre tópicos além das necessidades mais imediatas."
          },
          {
            name: "Intermediate High",
            description: "Pode lidar com sucesso com tarefas não complicadas e situações sociais que exigem uma troca de informações básicas relacionadas ao trabalho, escola, recreação, interesses particulares e áreas de competência, embora hesitação e instabilidade possam ser evidentes."
          }
        ],
        description: "No nível Intermediário, os falantes podem criar com o idioma ao falar sobre tópicos familiares relacionados à sua vida diária. Eles podem recombinar material aprendido para expressar um significado pessoal. Os falantes de nível intermediário podem fazer perguntas simples e podem lidar com uma situação de sobrevivência direta."
      },
      {
        level: "Advanced",
        sublevels: [
          {
            name: "Advanced Low",
            description: "Pode lidar com sucesso com uma variedade de tarefas comunicativas, embora de forma um tanto hesitante, e situações sociais. Pode narrar e descrever com alguns detalhes, geralmente nos principais períodos de tempo de passado, presente e futuro."
          },
          {
            name: "Advanced Mid",
            description: "Pode lidar com sucesso com uma variedade de tarefas comunicativas, embora de forma um tanto hesitante, e situações sociais. Pode narrar e descrever com detalhes consideráveis, geralmente nos principais períodos de tempo de passado, presente e futuro."
          },
          {
            name: "Advanced High",
            description: "Pode lidar com sucesso com uma variedade de tarefas comunicativas, embora de forma um tanto hesitante, e situações sociais. Pode narrar e descrever em todos os principais períodos de tempo (passado, presente e futuro) com bom controle do aspecto."
          }
        ],
        description: "No nível Avançado, os falantes podem narrar e descrever nos principais períodos de tempo de passado, presente e futuro. Esses falantes podem lidar com tarefas comunicativas e situações sociais com uma facilidade e fluidez gerais. Os falantes de nível avançado geralmente conseguem compensar as lacunas em seu vocabulário e controle da gramática com o uso confiante de estratégias comunicativas."
      },
      {
        level: "Superior",
        description: "Os falantes no nível Superior podem se comunicar no idioma com precisão e fluência em quase todos os tópicos formais e informais pertinentes às necessidades profissionais ou áreas de interesse especial. Eles demonstram um alto grau de controle da gramática e do vocabulário e ajustam prontamente sua linguagem para se adequar ao público, propósito e ambiente. Um falante de nível Superior é caracterizado pela capacidade de produzir um discurso altamente complexo e extenso."
      }
    ],
    korean: [
      {
        level: "Novice",
        sublevels: [
          {
            name: "Novice Low",
            description: "예측 가능한 일상적인 주제와 상황을 다룰 때 고립된 단어와 암기된 구절로 구성된 학습된 자료로 최소한으로 의사 소통할 수 있습니다."
          },
          {
            name: "Novice Mid",
            description: "예측 가능한 일상적인 주제와 상황을 다룰 때 고립된 단어와 암기된 구절로 구성된 학습된 자료로 최소한으로 의사 소통할 수 있습니다."
          },
          {
            name: "Novice High",
            description: "예측 가능한 일상적인 주제와 상황을 다룰 때 고립된 단어와 암기된 구절로 구성된 학습된 자료로 최소한으로 의사 소통할 수 있습니다."
          }
        ],
        description: "초급 수준에서는 화자가 자신에게 직접적인 영향을 미치는 예측 가능한 일상적인 주제에 대한 짧은 메시지를 전달할 수 있습니다. 그들은 주로 발견, 암기 및 회상된 고립된 단어와 암기된 구문을 사용하여 그렇게 합니다."
      },
      {
        level: "Intermediate",
        sublevels: [
          {
            name: "Intermediate Low",
            description: "간단한 사회적 상황에서 언어를 창조함으로써 제한된 수의 복잡하지 않은 의사 소통 작업을 성공적으로 처리할 수 있습니다. 대화는 일반적으로 대상 문화에서 생존하는 데 필요한 예측 가능하고 구체적인 교환으로 제한됩니다."
          },
          {
            name: "Intermediate Mid",
            description: "간단한 사회적 상황에서 다양한 복잡하지 않은 의사 소통 작업을 성공적으로 처리할 수 있습니다. 가장 즉각적인 요구 사항을 넘어서는 주제에 대해 질문하고 답변하고 간단한 대화에 참여할 수 있습니다."
          },
          {
            name: "Intermediate High",
            description: "주저함과 고르지 못함이 분명할 수 있지만 작업, 학교, 레크리에이션, 특정 관심사 및 역량 영역과 관련된 기본 정보 교환이 필요한 복잡하지 않은 작업 및 사회적 상황을 성공적으로 처리할 수 있습니다."
          }
        ],
        description: "중급 수준에서는 화자가 자신의 일상 생활과 관련된 친숙한 주제에 대해 이야기할 때 언어를 창조할 수 있습니다. 그들은 개인적인 의미를 표현하기 위해 학습된 자료를 재조합할 수 있습니다. 중급 수준의 화자는 간단한 질문을 할 수 있고 간단한 생존 상황을 처리할 수 있습니다."
      },
      {
        level: "Advanced",
        sublevels: [
          {
            name: "Advanced Low",
            description: "다소 망설이기는 하지만 다양한 의사 소통 작업과 사회적 상황을 성공적으로 처리할 수 있습니다. 일반적으로 과거, 현재 및 미래의 주요 시간 프레임에서 어느 정도 자세하게 설명하고 설명할 수 있습니다."
          },
          {
            name: "Advanced Mid",
            description: "다소 망설이기는 하지만 다양한 의사 소통 작업과 사회적 상황을 성공적으로 처리할 수 있습니다. 일반적으로 과거, 현재 및 미래의 주요 시간 프레임에서 상당한 세부 사항으로 설명하고 설명할 수 있습니다."
          },
          {
            name: "Advanced High",
            description: "다소 망설이기는 하지만 다양한 의사 소통 작업과 사회적 상황을 성공적으로 처리할 수 있습니다. 모든 주요 시간 프레임(과거, 현재 및 미래)에서 양상에 대한 훌륭한 통제력으로 설명하고 설명할 수 있습니다."
          }
        ],
        description: "고급 수준에서는 화자가 과거, 현재 및 미래의 주요 시간 프레임에서 설명하고 설명할 수 있습니다. 이러한 화자는 일반적인 용이성과 유창성으로 의사 소통 작업과 사회적 상황을 처리할 수 있습니다. 고급 수준의 화자는 의사 소통 전략을 자신 있게 사용하여 어휘 및 문법 통제력의 격차를 보완할 수 있는 경우가 많습니다."
      },
      {
        level: "Superior",
        description: "Superior 수준의 화자는 전문적인 요구 사항 또는 특별한 관심 분야와 관련된 거의 모든 공식 및 비공식 주제에서 정확하고 유창하게 언어로 의사 소통할 수 있습니다. 그들은 문법과 어휘에 대한 높은 수준의 통제력을 보여주고 청중, 목적 및 설정에 맞게 언어를 쉽게 조정합니다. Superior 수준의 화자는 매우 복잡하고 확장된 담론을 생성하는 능력이 특징입니다."
      }
    ],
    arabic: [
      {
        level: "مبتدئ",
        sublevels: [
          {
            name: "مبتدئ - منخفض",
            description: "يمكن التواصل بشكل ضئيل مع عبارات جاهزة وتعبيرات محفوظة وقوائم وجمل. قد يظهر علامات ناشئة من التلقائية والمرونة، ولكنه يواجه صعوبات كبيرة حتى مع محاورين متعاطفين."
          },
          {
            name: "مبتدئ - متوسط",
            description: "يمكن التواصل بشكل ضئيل باستخدام عدد من الكلمات المعزولة والعبارات المحفوظة. يمكن الرد على أسئلة بسيطة ومباشرة أو طلبات للحصول على معلومات. قد يقتصر الكلام على عبارات من كلمتين أو ثلاث."
          },
          {
            name: "مبتدئ - متقدم",
            description: "يمكن التواصل بعبارات جاهزة ومحفوظة ضمن سياق تجربتهم. يمكن الرد على أسئلة بسيطة ومباشرة أو طلبات للحصول على معلومات ولكن يمكنه فقط طرح عدد قليل جدًا من الأسئلة الجاهزة. الكلام في الغالب تفاعلي."
          }
        ],
        description: "في المستوى المبتدئ، يمكن للمتحدثين التواصل برسائل قصيرة حول مواضيع يومية متوقعة للغاية تؤثر عليهم بشكل مباشر. يفعلون ذلك بشكل أساسي من خلال استخدام كلمات وعبارات معزولة تم مصادفتها وحفظها واستدعاؤها."
      },
      {
        level: "متوسط",
        sublevels: [
          {
            name: "متوسط - منخفض",
            description: "يمكن التعامل بنجاح مع عدد محدود من المهام التواصلية غير المعقدة من خلال الإبداع باللغة في المواقف الاجتماعية المباشرة. يمكن طرح الأسئلة والإجابة عليها بشكل مناسب."
          },
          {
            name: "متوسط - متوسط",
            description: "يمكن التعامل بنجاح مع مجموعة متنوعة من المهام التواصلية غير المعقدة في المواقف الاجتماعية المباشرة. يمكن المشاركة في محادثات حول مواضيع تتجاوز الاحتياجات الأكثر إلحاحًا."
          },
          {
            name: "متوسط - متقدم",
            description: "يمكن التعامل بنجاح مع المهام غير المعقدة والمواقف الاجتماعية التي تتطلب تبادل المعلومات الأساسية المتعلقة بالعمل والمدرسة والترفيه والاهتمامات الخاصة، على الرغم من أنه قد يحدث بعض التردد."
          }
        ],
        description: "في المستوى المتوسط، يمكن للمتحدثين الإبداع باللغة عند التحدث عن موضوعات مألوفة متعلقة بحياتهم اليومية. يمكنهم إعادة تجميع المواد المتعلمة للتعبير عن المعنى الشخصي. يمكن للمتحدثين من المستوى المتوسط طرح أسئلة بسيطة ويمكنهم التعامل مع موقف بقاء مباشر."
      },
      {
        level: "متقدم",
        sublevels: [
          {
            name: "متقدم - منخفض",
            description: "يمكنه التعامل بنجاح مع مجموعة متنوعة من المهام التواصلية، على الرغم من أنه قد يكون متقطعًا بعض الشيء، والمواقف الاجتماعية. يمكنه سرد ووصف ببعض التفاصيل، عادةً في الأطر الزمنية الرئيسية للماضي والحاضر والمستقبل."
          },
          {
            name: "متقدم - متوسط",
            description: "يمكنه التعامل بنجاح مع مجموعة متنوعة من المهام التواصلية، على الرغم من أنه قد يكون متقطعًا بعض الشيء، والمواقف الاجتماعية. يمكنه سرد ووصف بتفاصيل كبيرة، عادةً في الأطر الزمنية الرئيسية للماضي والحاضر والمستقبل."
          },
          {
            name: "متقدم - مرتفع",
            description: "يمكنه التعامل بنجاح مع مجموعة متنوعة من المهام التواصلية، على الرغم من أنه قد يكون متقطعًا بعض الشيء، والمواقف الاجتماعية. يمكنه سرد ووصف في جميع الأطر الزمنية الرئيسية (الماضي والحاضر والمستقبل) مع تحكم جيد في الجوانب."
          }
        ],
        description: "في المستوى المتقدم، يمكن للمتحدثين السرد والوصف في الأطر الزمنية الرئيسية للماضي والحاضر والمستقبل. يمكن لهؤلاء المتحدثين التعامل مع المهام التواصلية والمواقف الاجتماعية بسهولة وطلاقة عامة. غالبًا ما يكون المتحدثون من المستوى المتقدم قادرين على تعويض الفجوات في مفرداتهم والتحكم في القواعد النحوية باستخدام استراتيجيات تواصل واثقة."
      },
      {
        level: "ممتاز",
        description: "المتحدثون في المستوى الممتاز يمكنهم التواصل باللغة بدقة وطلاقة في جميع المواضيع الرسمية وغير الرسمية تقريبًا المتعلقة بالاحتياجات المهنية أو مجالات الاهتمام الخاص. يظهرون درجة عالية من التحكم في القواعد النحوية والمفردات ويعدلون لغتهم بسهولة لتناسب الجمهور والغرض والإعداد. يتميز المتحدث بمستوى ممتاز بالقدرة على إنتاج خطاب معقد وممتد للغاية."
      }
    ],
    mandarin: [
      {
        level: "Novice",
        sublevels: [
          {
            name: "Novice Low",
            description: "예측 가능한 일상적인 주제와 상황을 다룰 때 고립된 단어와 암기된 구절로 구성된 학습된 자료로 최소한으로 의사 소통할 수 있습니다."
          },
          {
            name: "Novice Mid",
            description: "예측 가능한 일상적인 주제와 상황을 다룰 때 고립된 단어와 암기된 구절로 구성된 학습된 자료로 최소한으로 의사 소통할 수 있습니다."
          },
          {
            name: "Novice High",
            description: "예측 가능한 일상적인 주제와 상황을 다룰 때 고립된 단어와 암기된 구절로 구성된 학습된 자료로 최소한으로 의사 소통할 수 있습니다."
          }
        ],
        description: "초급 수준에서는 화자가 자신에게 직접적인 영향을 미치는 예측 가능한 일상적인 주제에 대한 짧은 메시지를 전달할 수 있습니다. 그들은 주로 발견, 암기 및 회상된 고립된 단어와 암기된 구문을 사용하여 그렇게 합니다."
      },
      {
        level: "Intermediate",
        sublevels: [
          {
            name: "Intermediate Low",
            description: "간단한 사회적 상황에서 언어를 창조함으로써 제한된 수의 복잡하지 않은 의사 소통 작업을 성공적으로 처리할 수 있습니다. 대화는 일반적으로 대상 문화에서 생존하는 데 필요한 예측 가능하고 구체적인 교환으로 제한됩니다."
          },
          {
            name: "Intermediate Mid",
            description: "간단한 사회적 상황에서 다양한 복잡하지 않은 의사 소통 작업을 성공적으로 처리할 수 있습니다. 가장 즉각적인 요구 사항을 넘어서
