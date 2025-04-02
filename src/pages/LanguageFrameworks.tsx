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
        level: "A1",
        name: "مبتدئ",
        description: "يمكن فهم واستخدام التعبيرات اليومية المألوفة والعبارات الأساسية جدًا الموجهة لتلبية احتياجات من نوع ملموس. يمكنه تقديم نفسه والآخرين ويمكنه طرح والإجابة على أسئلة حول التفاصيل الشخصية مثل مكان سكنه والأشخاص الذين يعرفهم والأشياء التي يمتلكها."
      },
      {
        level: "A2",
        name: "أساسي",
        description: "يمكن فهم الجمل والتعبيرات المستخدمة بشكل متكرر والمتعلقة بالمجالات ذات الأهمية المباشرة (مثل المعلومات الشخصية والعائلية الأساسية جدًا، والتسوق، والجغرافيا المحلية، والتوظيف). يمكنه التواصل في المهام البسيطة والروتينية التي تتطلب تبادلًا بسيطًا ومباشرًا للمعلومات حول الأمور المألوفة والروتينية."
      },
      {
        level: "B1",
        name: "متوسط",
        description: "يمكن فهم النقاط الرئيسية للإدخال القياسي الواضح حول الأمور المألوفة التي يتم مواجهتها بانتظام في العمل والمدرسة والترفيه وما إلى ذلك. يمكنه التعامل مع معظم المواقف المحتمل أن تنشأ أثناء السفر في منطقة يتم فيها التحدث باللغة. يمكنه إنتاج نص متصل بسيط حول مواضيع مألوفة أو ذات اهتمام شخصي."
      },
      {
        level: "B2",
        name: "متوسط متقدم",
        description: "يمكن فهم الأفكار الرئيسية للنص المعقد حول كل من الموضوعات الملموسة والمجردة، بما في ذلك المناقشات التقنية في مجال تخصصهم. يمكنه التفاعل بدرجة من الطلاقة والعفوية التي تجعل التفاعل المنتظم مع المتحدثين الأصليين ممكنًا تمامًا دون إجهاد لأي من الطرفين."
      },
      {
        level: "C1",
        name: "متقدم",
        description: "يمكن فهم مجموعة واسعة من النصوص الطويلة والمتطلبة، والتعرف على المعنى الضمني. يمكنه التعبير عن نفسه بطلاقة وعفوية دون البحث الواضح عن التعبيرات. يمكنه استخدام اللغة بمرونة وفعالية للأغراض الاجتماعية والأكاديمية والمهنية."
      },
      {
        level: "C2",
        name: "إتقان",
        description: "يمكن فهم كل ما يسمعه أو يقرأه تقريبًا بسهولة. يمكنه تلخيص المعلومات من مصادر مختلفة مكتوبة وشفهية، وإعادة بناء الحجج والروايات في عرض متماسك. يمكنه التعبير عن نفسه بشكل عفوي وبطلاقة ودقة كبيرة، مميزًا الفروق الدقيقة في المعنى حتى في المواقف الأكثر تعقيدًا."
      }
    ],
    mandarin: [
      {
        level: "A1",
        name: "初级",
        description: "能够理解和使用日常表达和非常基本的短语，满足具体类型的需求。能够介绍自己和他人，能够询问和回答有关个人详细信息的问题，例如住在哪里、认识的人和拥有的物品。"
      },
      {
        level: "A2",
        name: "初级",
        description: "能够理解与最直接相关领域（如非常基本的个人和家庭信息、购物、当地地理、就业）相关的句子和常用表达。能够在需要简单和直接交换有关熟悉和日常事务信息的简单和例行任务中进行交流。"
      },
      {
        level: "B1",
        name: "中级",
        description: "能够理解在工作、学校、休闲等环境中经常遇到的熟悉事物的清晰标准输入的要点。能够处理在使用该语言的地区旅行时可能出现的大多数情况。能够就熟悉或感兴趣的话题制作简单的连贯文本。"
      },
      {
        level: "B2",
        name: "中高级",
        description: "能够理解具体和抽象主题的复杂文本的主要思想，包括其专业领域的技术讨论。能够以一定程度的流利和自然互动，使与母语使用者
