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
        description: "في المستوى المتوسط، يمكن للمتحدثين الإبداع باللغة عند التحدث عن موضوعات مألوفة متعلقة بحياتهم اليومية. يمكنهم إعادة تجميع المواد المتعلمة للتعبير عن المعنى الشخصي. يمكن للمتحدثين من المستوى المتوسط طرح أسئلة بسيطة والتعامل مع موقف بقاء مباشر."
      },
      {
        level: "متقدم",
        sublevels: [
          {
            name: "متقدم - منخفض",
            description: "يمكن أداء مهام مستوى متقدم متنوعة، ولكن ليس بشكل متسق. يتسم الكلام عادة بخشونة نحوية معينة، ومفردات غير كافية لمناقشة المواضيع بعمق، وأنماط ملحوظة من الأخطاء."
          },
          {
            name: "متقدم - متوسط",
            description: "يمكن أداء جميع مهام المستوى المتقدم بسهولة لغوية وثقة وكفاءة. يمكن مناقشة المواضيع بشكل ملموس ومجرد، والتعامل مع موقف مع تعقيد، والسرد في جميع الأطر الزمنية بشكل متسق."
          },
          {
            name: "متقدم - عالي",
            description: "يمكن أداء جميع مهام المستوى المتقدم بسهولة وثقة. يمكن مناقشة المواضيع بشكل مجرد وبدقة جيدة. القدرة على التحدث لا تلبي تمامًا معايير مهام المستوى المتفوق، مع نقاط ضعف في منطقة واحدة أو أكثر."
          }
        ],
        description: "في المستوى المتقدم، يمكن للمتحدثين السرد والوصف في جميع الأطر الزمنية الرئيسية عند التحدث عن مواضيع ذات اهتمام عام. يمكنهم التعامل مع موقف مع تعقيد. تتميز لغة المتحدثين من المستوى المتقدم بخطاب جوهري ومترابط."
      },
      {
        level: "متفوق",
        sublevels: [],
        description: "في المستوى المتفوق، يمكن للمتحدثين التواصل بدقة وطلاقة للمشاركة بشكل كامل وفعال في المحادثات حول مجموعة متنوعة من المواضيع في البيئات الرسمية وغير الرسمية. يمكنهم مناقشة اهتماماتهم ومجالات اختصاصهم الخاصة، وشرح المسائل المعقدة، وتقديم روايات طويلة ومتماسكة."
      },
      {
        level: "متميز",
        sublevels: [],
        description: "في المستوى المتميز، يستخدم المتحدثون اللغة بمهارة، وبدقة وكفاءة وفعالية. هم مستخدمون متعلمون وفصيحون للغة. يمكنهم التفكير في مجموعة واسعة من القضايا العالمية والمفاهيم المجردة للغاية بطريقة مناسبة ثقافيًا."
      }
    ],
    mandarin: [
      {
        level: "初学者",
        sublevels: [
          {
            name: "初学者-低级",
            description: "能够使用固定格式和死记硬背的表达、列表和短语进行最低限度的交流。可能会显示自发性和灵活性的初步迹象，但即使是与理解的交谈者也有很大困难。"
          },
          {
            name: "初学者-中级",
            description: "能够使用一些孤立的词汇和记忆的短语进行最低限度的交流。能够回答简单、直接的问题或信息请求。言语可能限于两到三个词的短语。"
          },
          {
            name: "初学者-高级",
            description: "能够在其经验范围内使用固定格式和死记硬背的表达进行交流。能够回答简单、直接的问题或信息请求，但只能提出很少的固定格式问题。言语主要是反应性的。"
          }
        ],
        description: "在初学者水平，说话者能够就直接影响他们的高度可预测的日常话题传达简短信息。他们主要通过使用遇到、记忆和回忆的孤立词汇和短语来做到这一点。"
      },
      {
        level: "中级",
        sublevels: [
          {
            name: "中级-低级",
            description: "能够在简单的社交场合中通过创造性地使用语言成功处理有限数量的非复杂交流任务。能够适当地提问和回答问题。"
          },
          {
            name: "中级-中级",
            description: "能够在简单的社交场合中成功处理各种非复杂的交流任务。能够参与超出最直接需求的话题的对话。"
          },
          {
            name: "中级-高级",
            description: "能够成功处理与工作、学校、娱乐和特定兴趣相关的基本信息交换的非复杂任务和社交场合，尽管可能会出现犹豫。"
          }
        ],
        description: "在中级水平，说话者在谈论与日常生活相关的熟悉话题时能够创造性地使用语言。他们能够重新组合学习的材料以表达个人意义。中级水平的说话者能够提出简单的问题，并能应对简单的生存情况。"
      },
      {
        level: "高级",
        sublevels: [
          {
            name: "高级-低级",
            description: "能够执行各种高级水平任务，但不一致。言语通常带有一定的语法粗糙性，词汇不足以长时间讨论话题，以及明显的错误模式。"
          },
          {
            name: "高级-中级",
            description: "能够以语言上的轻松、自信和能力执行所有高级水平任务。能够具体和抽象地讨论话题，处理有复杂情况的场景，并在所有时间框架内一致地叙述。"
          },
          {
            name: "高级-高级",
            description: "能够轻松自信地执行所有高级水平任务。能够以良好的准确性抽象地讨论话题。说话能力在一个或多个领域有缺陷，不完全符合优秀水平任务的标准。"
          }
        ],
        description: "在高级水平，说话者在谈论一般兴趣话题时能够在所有主要时间框架内叙述和描述。他们能够处理有复杂情况的场景。高级水平说话者的语言特点是实质性、连贯的话语。"
      },
      {
        level: "优秀",
        sublevels: [],
        description: "在优秀水平，说话者能够准确流利地交流，以便在正式和非正式环境中充分有效地参与各种话题的对话。他们能够讨论自己的兴趣和专业领域，解释复杂问题，并提供长篇且连贯的叙述。"
      },
      {
        level: "杰出",
        sublevels: [],
        description: "在杰出水平，说话者能够熟练、准确、高效和有效地使用语言。他们是受过教育且清晰的语言使用者。他们能够以文化上适当的方式反思广泛的全球问题和高度抽象的概念。"
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
            description: "Pode lidar com sucesso com uma variedade de tarefas comunicativas não complicadas em situações sociais simples. Pode participar em conversas sobre tópicos além das necessidades mais imediatas."
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
    ],
    korean: [
      {
        level: "초보자",
        sublevels: [
          {
            name: "초보자 하",
            description: "공식적이고 암기된 발화, 목록 및 구문으로 최소한으로 의사소통할 수 있습니다. 자발성과 유연성의 초기 징후를 보일 수 있지만, 공감적인 대화 상대자들과도 상당한 어려움을 겪습니다."
          },
          {
            name: "초보자 중",
            description: "몇 가지 고립된 단어와 암기된 구문을 사용하여 최소한으로 의사소통할 수 있습니다. 간단하고 직접적인 질문이나 정보 요청에 응답할 수 있습니다. 말은 두세 단어 구문으로 제한될 수 있습니다."
          },
          {
            name: "초보자 상",
            description: "경험의 맥락 내에서 공식적이고 암기된 발화로 의사소통할 수 있습니다. 간단하고 직접적인 질문이나 정보 요청에 응답할 수 있지만, 매우 적은 공식적인 질문만 할 수 있습니다. 말은 주로 반응적입니다."
          }
        ],
        description: "초보자 수준에서 화자는 자신에게 직접적으로 영향을 미치는 매우 예측 가능한 일상적인 주제에 대한 짧은 메시지를 전달할 수 있습니다. 주로 마주치고, 암기하고, 회상한 고립된 단어와 구문을 사용합니다."
      },
      {
        level: "중급",
        sublevels: [
          {
            name: "중급 하",
            description: "간단한 사회적 상황에서 언어를 창의적으로 사용하여 제한된 수의 복잡하지 않은 의사소통 작업을 성공적으로 처리할 수 있습니다. 적절하게 질문하고 답할 수 있습니다."
          },
          {
            name: "중급 중",
            description: "간단한 사회적 상황에서 다양한 복잡하지 않은 의사소통 작업을 성공적으로 처리할 수 있습니다. 가장 직접적인 필요를 넘어선 주제에 대한 대화에 참여할 수 있습니다."
          },
          {
            name: "중급 상",
            description: "작업, 학교, 레크리에이션 및 특정 관심사와 관련된 기본 정보 교환을 요구하는 복잡하지 않은 작업과 사회적 상황을 성공적으로 처리할 수 있지만, 망설임이 발생할 수 있습니다."
          }
        ],
        description: "중급 수준에서 화자는 일상 생활과 관련된 친숙한 주제에 대해 이야기할 때 언어를 창의적으로 사용할 수 있습니다. 개인적 의미를 표현하기 위해 학습한 자료를 재조합할 수 있습니다. 중급 수준의 화자는 간단한 질문을 할 수 있으며 간단한 생존 상황을 처리할 수 있습니다."
      },
      {
        level: "고급",
        sublevels: [
          {
            name: "고급 하",
            description: "다양한 고급 수준 작업을 수행할 수 있지만 일관되지 않습니다. 말은 일반적으로 특정 문법적 거칠기, 주제를 길게 논의하기 위한 부적절한 어휘, 그리고 주목할만한 오류 패턴으로 특징지어집니다."
          },
          {
            name: "고급 중",
            description: "언어적 용이함, 자신감 및 역량으로 모든 고급 수준 작업을 수행할 수 있습니다. 주제에 대해 구체적이고 추상적으로 논의하고, 복잡한 상황을 처리하며, 모든 시제에서 일관되게 이야기할 수 있습니다."
          },
          {
            name: "고급 상",
