/** Starter English/ESL curriculum for grades 6-8 (CEFR A1-B1 / WIDA 1-5). */

export const CAN_DO_STATEMENTS = [
  { framework: "WIDA", skill_or_mode: "Speaking", level: "2", statement: "Introduce myself and give basic personal information using short phrases." },
  { framework: "WIDA", skill_or_mode: "Reading", level: "2", statement: "Identify key details in short, illustrated informational texts about familiar topics." },
  { framework: "WIDA", skill_or_mode: "Listening", level: "3", statement: "Follow a short spoken description of a daily routine and identify the sequence of events." },
  { framework: "CEFR", skill_or_mode: "Spoken production", level: "A1", statement: "I can use simple phrases and sentences to describe where I live and people I know." },
  { framework: "CEFR", skill_or_mode: "Writing", level: "A2", statement: "I can write a series of simple phrases connected with 'and', 'but' and 'because'." },
  { framework: "NCSSFL-ACTFL", skill_or_mode: "Presentational", level: "Novice Mid", statement: "I can present basic information about my school day using memorized phrases." },
];

export interface SeedUnit {
  title: string;
  theme: string;
  can_do_statement: string;
  key_language_use: "Narrate" | "Inform" | "Explain" | "Argue";
  cefr_level: string;
  wida_level: number;
  content_objective: string;
  language_objective: string;
  skills: Array<{
    title: string;
    type: "vocab" | "grammar" | "reading" | "listening" | "speaking" | "writing";
    description: string;
    target_grammar_point: string | null;
    lessons: Array<{ title: string; intro_md: string; vocab: string[]; generate: Array<{ type: string; count: number }> }>;
  }>;
  passage?: { title: string; body: string; skill_type: "reading" | "listening"; topic: string };
}

export const SEED_UNITS: SeedUnit[] = [
  {
    title: "Introducing Yourself",
    theme: "Personal identity and background",
    can_do_statement: "I can introduce myself and give basic personal information about my name, age, family and country.",
    key_language_use: "Inform",
    cefr_level: "A1",
    wida_level: 2,
    content_objective: "Students will share basic personal information with a partner.",
    language_objective: "Students will use the verb 'to be' and possessive adjectives in complete sentences.",
    skills: [
      {
        title: "Personal Information Words",
        type: "vocab",
        description: "Core words for names, family, countries and ages.",
        target_grammar_point: null,
        lessons: [
          {
            title: "Who I Am",
            intro_md: "Learn the words you need to tell someone your name, age and where you are from.",
            vocab: ["name", "family", "brother", "sister", "country", "city", "friend", "student", "year", "old"],
            generate: [{ type: "flashcard", count: 4 }, { type: "matching", count: 2 }],
          },
        ],
      },
      {
        title: "The Verb To Be",
        type: "grammar",
        description: "Using am / is / are to give personal information.",
        target_grammar_point: "Present simple of 'to be' with personal information",
        lessons: [
          {
            title: "I am, You are",
            intro_md: "Use **am**, **is** and **are** to talk about yourself and other people.",
            vocab: ["am", "is", "are", "my", "your", "his", "her", "from"],
            generate: [{ type: "cloze", count: 3 }],
          },
        ],
      },
      {
        title: "Meet the Class",
        type: "reading",
        description: "Short introductions from new classmates.",
        target_grammar_point: null,
        lessons: [
          {
            title: "New Classmates",
            intro_md: "Read three short introductions and find the key details.",
            vocab: ["class", "teacher", "school", "new", "live", "speak"],
            generate: [{ type: "cloze", count: 2 }],
          },
        ],
      },
    ],
    passage: {
      title: "Three New Students",
      skill_type: "reading",
      topic: "Personal introductions",
      body:
        "Hello. My name is Ana. I am twelve years old. I am from Peru. I live with my mother and my brother. " +
        "My friend is Yusuf. He is thirteen. He is from Turkey. He has one sister. " +
        "We are new students at Lincoln Middle School. Our teacher is Ms. Diaz. She is very kind.",
    },
  },
  {
    title: "My School Day",
    theme: "Daily routines at school",
    can_do_statement: "I can describe the events of my school day in order using simple time words.",
    key_language_use: "Narrate",
    cefr_level: "A1",
    wida_level: 3,
    content_objective: "Students will sequence the events of a typical school day.",
    language_objective: "Students will use present simple verbs with time expressions such as 'first', 'then' and 'after that'.",
    skills: [
      {
        title: "School Day Words",
        type: "vocab",
        description: "Verbs and nouns for classes, times and school places.",
        target_grammar_point: null,
        lessons: [
          {
            title: "Places and Times",
            intro_md: "Words for where you go and when you go there during the school day.",
            vocab: ["morning", "afternoon", "class", "lunch", "library", "bus", "homework", "start", "finish", "break"],
            generate: [{ type: "flashcard", count: 4 }, { type: "matching", count: 2 }],
          },
        ],
      },
      {
        title: "Telling the Order",
        type: "grammar",
        description: "Present simple plus sequence words.",
        target_grammar_point: "Present simple with sequence adverbs (first, then, after that, finally)",
        lessons: [
          {
            title: "First, Then, After That",
            intro_md: "Put the events of your day in order with sequence words.",
            vocab: ["first", "then", "after", "finally", "before", "go", "eat", "study", "take"],
            generate: [{ type: "cloze", count: 3 }, { type: "ordering", count: 2 }],
          },
        ],
      },
      {
        title: "Listening: A Day at School",
        type: "listening",
        description: "Follow a spoken description of one student's day.",
        target_grammar_point: null,
        lessons: [
          {
            title: "Marco's Day",
            intro_md: "Listen to Marco talk about his school day, then answer the questions.",
            vocab: ["wake", "walk", "arrive", "math", "science", "friend", "home"],
            generate: [{ type: "listening_mc", count: 2 }],
          },
        ],
      },
    ],
    passage: {
      title: "Marco's School Day",
      skill_type: "listening",
      topic: "Daily routine",
      body:
        "First, I wake up at seven o'clock. Then I eat breakfast with my family. After that, I take the bus to school. " +
        "My first class is math. At noon I eat lunch with my friends. In the afternoon I have science class. " +
        "Finally, I go home and do my homework.",
    },
  },
  {
    title: "Giving Reasons",
    theme: "Explaining choices and opinions",
    can_do_statement: "I can explain why I like or choose something using 'because' and simple reasons.",
    key_language_use: "Explain",
    cefr_level: "A2",
    wida_level: 4,
    content_objective: "Students will explain a preference and support it with a reason.",
    language_objective: "Students will connect two clauses with 'because', 'so' and 'but'.",
    skills: [
      {
        title: "Reason Words",
        type: "vocab",
        description: "Connectors and opinion words for explaining choices.",
        target_grammar_point: null,
        lessons: [
          {
            title: "Because and So",
            intro_md: "Words that help you give a reason for your idea.",
            vocab: ["because", "so", "but", "reason", "favorite", "important", "difficult", "easy", "help", "think"],
            generate: [{ type: "flashcard", count: 3 }, { type: "cloze", count: 3 }, { type: "matching", count: 2 }],
          },
        ],
      },
      {
        title: "Reading: Why I Chose It",
        type: "reading",
        description: "Short texts where students explain a choice.",
        target_grammar_point: "Clause linking with because / so",
        lessons: [
          {
            title: "My Favorite Class",
            intro_md: "Read why three students chose their favorite class.",
            vocab: ["choose", "enjoy", "learn", "project", "team", "practice"],
            generate: [{ type: "cloze", count: 2 }],
          },
        ],
      },
    ],
    passage: {
      title: "My Favorite Class",
      skill_type: "reading",
      topic: "Explaining a preference",
      body:
        "My favorite class is science because we do experiments every week. I like art too, but science is more fun for me. " +
        "Leila likes music because she plays the guitar. She practices at home, so she is very good. " +
        "Sam chose physical education because he enjoys team games with his friends.",
    },
  },
];

/** Frequency-ranked A1/A2 word list with L1 (Spanish) glosses. */
export const SEED_VOCAB: Array<{
  lemma: string; translation_l1: string; part_of_speech: string; frequency_rank: number;
  cefr_level: string; example_sentence: string; ipa: string;
}> = [
  { lemma: "name", translation_l1: "nombre", part_of_speech: "noun", frequency_rank: 120, cefr_level: "A1", example_sentence: "My name is Ana.", ipa: "neɪm" },
  { lemma: "family", translation_l1: "familia", part_of_speech: "noun", frequency_rank: 210, cefr_level: "A1", example_sentence: "I live with my family.", ipa: "ˈfæməli" },
  { lemma: "brother", translation_l1: "hermano", part_of_speech: "noun", frequency_rank: 640, cefr_level: "A1", example_sentence: "My brother is ten years old.", ipa: "ˈbrʌðər" },
  { lemma: "sister", translation_l1: "hermana", part_of_speech: "noun", frequency_rank: 655, cefr_level: "A1", example_sentence: "I have one sister.", ipa: "ˈsɪstər" },
  { lemma: "country", translation_l1: "país", part_of_speech: "noun", frequency_rank: 300, cefr_level: "A1", example_sentence: "What country are you from?", ipa: "ˈkʌntri" },
  { lemma: "city", translation_l1: "ciudad", part_of_speech: "noun", frequency_rank: 330, cefr_level: "A1", example_sentence: "I live in a big city.", ipa: "ˈsɪti" },
  { lemma: "friend", translation_l1: "amigo", part_of_speech: "noun", frequency_rank: 280, cefr_level: "A1", example_sentence: "He is my friend.", ipa: "frend" },
  { lemma: "student", translation_l1: "estudiante", part_of_speech: "noun", frequency_rank: 410, cefr_level: "A1", example_sentence: "She is a new student.", ipa: "ˈstuːdnt" },
  { lemma: "year", translation_l1: "año", part_of_speech: "noun", frequency_rank: 60, cefr_level: "A1", example_sentence: "I am twelve years old.", ipa: "jɪr" },
  { lemma: "old", translation_l1: "viejo / de edad", part_of_speech: "adjective", frequency_rank: 190, cefr_level: "A1", example_sentence: "How old are you?", ipa: "oʊld" },
  { lemma: "school", translation_l1: "escuela", part_of_speech: "noun", frequency_rank: 150, cefr_level: "A1", example_sentence: "Our school starts at eight.", ipa: "skuːl" },
  { lemma: "teacher", translation_l1: "maestro", part_of_speech: "noun", frequency_rank: 430, cefr_level: "A1", example_sentence: "My teacher is Ms. Diaz.", ipa: "ˈtiːtʃər" },
  { lemma: "class", translation_l1: "clase", part_of_speech: "noun", frequency_rank: 320, cefr_level: "A1", example_sentence: "My first class is math.", ipa: "klæs" },
  { lemma: "live", translation_l1: "vivir", part_of_speech: "verb", frequency_rank: 230, cefr_level: "A1", example_sentence: "I live with my mother.", ipa: "lɪv" },
  { lemma: "speak", translation_l1: "hablar", part_of_speech: "verb", frequency_rank: 260, cefr_level: "A1", example_sentence: "I speak two languages.", ipa: "spiːk" },
  { lemma: "morning", translation_l1: "mañana", part_of_speech: "noun", frequency_rank: 470, cefr_level: "A1", example_sentence: "I wake up in the morning.", ipa: "ˈmɔːrnɪŋ" },
  { lemma: "afternoon", translation_l1: "tarde", part_of_speech: "noun", frequency_rank: 900, cefr_level: "A1", example_sentence: "We have science in the afternoon.", ipa: "ˌæftərˈnuːn" },
  { lemma: "lunch", translation_l1: "almuerzo", part_of_speech: "noun", frequency_rank: 950, cefr_level: "A1", example_sentence: "I eat lunch at noon.", ipa: "lʌntʃ" },
  { lemma: "library", translation_l1: "biblioteca", part_of_speech: "noun", frequency_rank: 1100, cefr_level: "A2", example_sentence: "We read books in the library.", ipa: "ˈlaɪbreri" },
  { lemma: "bus", translation_l1: "autobús", part_of_speech: "noun", frequency_rank: 880, cefr_level: "A1", example_sentence: "I take the bus to school.", ipa: "bʌs" },
  { lemma: "homework", translation_l1: "tarea", part_of_speech: "noun", frequency_rank: 1400, cefr_level: "A1", example_sentence: "I do my homework after school.", ipa: "ˈhoʊmwɜːrk" },
  { lemma: "start", translation_l1: "empezar", part_of_speech: "verb", frequency_rank: 270, cefr_level: "A1", example_sentence: "Class starts at nine.", ipa: "stɑːrt" },
  { lemma: "finish", translation_l1: "terminar", part_of_speech: "verb", frequency_rank: 520, cefr_level: "A1", example_sentence: "School finishes at three.", ipa: "ˈfɪnɪʃ" },
  { lemma: "break", translation_l1: "descanso", part_of_speech: "noun", frequency_rank: 610, cefr_level: "A2", example_sentence: "We have a short break after math.", ipa: "breɪk" },
  { lemma: "first", translation_l1: "primero", part_of_speech: "adverb", frequency_rank: 90, cefr_level: "A1", example_sentence: "First, I eat breakfast.", ipa: "fɜːrst" },
  { lemma: "then", translation_l1: "luego", part_of_speech: "adverb", frequency_rank: 100, cefr_level: "A1", example_sentence: "Then I take the bus.", ipa: "ðen" },
  { lemma: "after", translation_l1: "después", part_of_speech: "preposition", frequency_rank: 110, cefr_level: "A1", example_sentence: "After that, I go home.", ipa: "ˈæftər" },
  { lemma: "finally", translation_l1: "finalmente", part_of_speech: "adverb", frequency_rank: 700, cefr_level: "A2", example_sentence: "Finally, I do my homework.", ipa: "ˈfaɪnəli" },
  { lemma: "before", translation_l1: "antes", part_of_speech: "preposition", frequency_rank: 130, cefr_level: "A1", example_sentence: "I eat before class.", ipa: "bɪˈfɔːr" },
  { lemma: "eat", translation_l1: "comer", part_of_speech: "verb", frequency_rank: 340, cefr_level: "A1", example_sentence: "We eat lunch together.", ipa: "iːt" },
  { lemma: "study", translation_l1: "estudiar", part_of_speech: "verb", frequency_rank: 380, cefr_level: "A1", example_sentence: "I study English every day.", ipa: "ˈstʌdi" },
  { lemma: "because", translation_l1: "porque", part_of_speech: "conjunction", frequency_rank: 70, cefr_level: "A1", example_sentence: "I like science because it is fun.", ipa: "bɪˈkɔːz" },
  { lemma: "so", translation_l1: "así que", part_of_speech: "conjunction", frequency_rank: 40, cefr_level: "A1", example_sentence: "She practices a lot, so she is good.", ipa: "soʊ" },
  { lemma: "but", translation_l1: "pero", part_of_speech: "conjunction", frequency_rank: 30, cefr_level: "A1", example_sentence: "I like art, but I prefer music.", ipa: "bʌt" },
  { lemma: "favorite", translation_l1: "favorito", part_of_speech: "adjective", frequency_rank: 890, cefr_level: "A2", example_sentence: "Science is my favorite class.", ipa: "ˈfeɪvərɪt" },
  { lemma: "important", translation_l1: "importante", part_of_speech: "adjective", frequency_rank: 220, cefr_level: "A2", example_sentence: "Homework is important.", ipa: "ɪmˈpɔːrtnt" },
  { lemma: "difficult", translation_l1: "difícil", part_of_speech: "adjective", frequency_rank: 420, cefr_level: "A2", example_sentence: "Math is difficult for me.", ipa: "ˈdɪfɪkəlt" },
  { lemma: "easy", translation_l1: "fácil", part_of_speech: "adjective", frequency_rank: 400, cefr_level: "A1", example_sentence: "This exercise is easy.", ipa: "ˈiːzi" },
  { lemma: "think", translation_l1: "pensar", part_of_speech: "verb", frequency_rank: 80, cefr_level: "A1", example_sentence: "I think science is fun.", ipa: "θɪŋk" },
  { lemma: "learn", translation_l1: "aprender", part_of_speech: "verb", frequency_rank: 290, cefr_level: "A1", example_sentence: "We learn new words every week.", ipa: "lɜːrn" },
];
