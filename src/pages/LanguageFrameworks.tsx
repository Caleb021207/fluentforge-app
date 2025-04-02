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
      },
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
            description: "可以使用由孤立单词和记忆短语组成的学习材料，在处理可预测的日常话题和情况时进行最低限度的交流。"
          },
          {
            name: "Novice Mid",
            description: "可以使用由孤立单词和记忆短语组成的学习材料，在处理可预测的日常话题和情况时进行最低限度的交流。"
          },
          {
            name: "Novice High",
            description: "可以使用由孤立单词和记忆短语组成的学习材料，在处理可预测的日常话题和情况时进行最低限度的交流。"
          }
        ],
        description: "在初学者水平，说话者可以传达关于直接影响他们的高度可预测的日常话题的简短信息。他们主要通过使用已遇到、记忆和回忆的孤立单词和记忆短语来做到这一点。"
      },
      {
        level: "Intermediate",
        sublevels: [
          {
            name: "Intermediate Low",
            description: "可以通过在简单的社交场合中创造性地使用语言，成功处理有限数量的非复杂交流任务。对话通常限于目标文化中生存所必需的可预测和具体交流。"
          },
          {
            name: "Intermediate Mid",
            description: "可以在简单的社交场合中成功处理各种非复杂交流任务。可以提问和回答问题，参与超出最基本需求的简单对话。"
          },
          {
            name: "Intermediate High",
            description: "可以成功处理与工作、学校、娱乐、特定兴趣和能力领域相关的基本信息交换所需的非复杂任务和社交场合，尽管可能会有明显的犹豫和不连贯。"
          }
        ],
        description: "在中级水平，说话者在谈论与日常生活相关的熟悉话题时可以创造性地使用语言。他们可以重新组合学习过的材料来表达个人意义。中级说话者可以提出简单问题，并能处理直接的生存情况。"
      },
      {
        level: "Advanced",
        sublevels: [
          {
            name: "Advanced Low",
            description: "能够成功处理各种交流任务，尽管有些迟疑和社交场合。通常可以在过去、现在和未来的主要时间框架中叙述和描述一些细节。"
          },
          {
            name: "Advanced Mid",
            description: "能够成功处理各种交流任务，尽管有些迟疑和社交场合。通常可以在过去、现在和未来的主要时间框架中叙述和描述相当多的细节。"
          },
          {
            name: "Advanced High",
            description: "能够成功处理各种交流任务，尽管有些迟疑和社交场合。可以在所有主要时间框架（过去、现在和未来）中叙述和描述，具有良好的方面控制。"
          }
        ],
        description: "在高级水平，说话者可以在过去、现在和未来的主要时间框架中叙述和描述。这些说话者可以以一般的轻松和流畅处理交流任务和社交场合。高级水平的说话者通常能够通过自信使用交流策略来弥补词汇和语法控制上的差距。"
      },
      {
        level: "Superior",
        description: "高级水平的说话者可以在几乎所有与专业需求或特定兴趣领域相关的正式和非正式话题上以准确和流利的方式用语言交流。他们展示出高度的语法和词汇控制能力，并可以轻松调整语言以适应受众、目的和环境。高级水平的说话者的特点是能够产生高度复杂、延伸的话语。"
      }
    ]
  };

  const getLevelDescription = (levelData: any) => {
    if (Array.isArray(levelData.sublevels)) {
      return (
        <ul>
          {levelData.sublevels.map((sublevel: any, index: number) => (
            <li key={index}>
              <strong>{sublevel.name}:</strong> {sublevel.description}
            </li>
          ))}
        </ul>
      );
    } else {
      return <p>{levelData.description}</p>;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t("languageReferenceFrameworks")}</CardTitle>
          <CardDescription>{t("understandLevelsFrameworks")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cefr" className="w-full">
            <TabsList>
              <TabsTrigger value="cefr" onClick={() => setActiveTab("cefr")}>
                <BookOpen className="mr-2 h-4 w-4" />
                {t("commonEuropeanFramework")}
              </TabsTrigger>
              <TabsTrigger value="actfl" onClick={() => setActiveTab("actfl")}>
                <Award className="mr-2 h-4 w-4" />
                {t("americanCouncil")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cefr">
              <h2 className="text-2xl font-semibold mt-4 mb-2">{t("commonEuropeanFramework")}</h2>
              <p>{t("cefrDescription")}</p>
              {cefrLevels[currentLanguage] ? (
                cefrLevels[currentLanguage].map((levelData, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader>
                      <CardTitle>
                        {t(levelData.name as string)} ({levelData.level})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{levelData.description}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>
                  {t("studyMaterialsComingSoon", {
                    nativeLanguage: "English",
                    targetLanguage: currentLanguage,
                  })}
                </p>
              )}
            </TabsContent>
            <TabsContent value="actfl">
              <h2 className="text-2xl font-semibold mt-4 mb-2">{t("americanCouncil")}</h2>
              <p>{t("actflDescription")}</p>
              {actflLevels[currentLanguage] ? (
                actflLevels[currentLanguage].map((levelData, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader>
                      <CardTitle>{levelData.level}</CardTitle>
                    </CardHeader>
                    <CardContent>{getLevelDescription(levelData)}</CardContent>
                  </Card>
                ))
              ) : (
                <p>
                  {t("studyMaterialsComingSoon", {
                    nativeLanguage: "English",
                    targetLanguage: currentLanguage,
                  })}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageFrameworks;
