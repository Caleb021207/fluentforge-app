import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create course
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .insert({
        name: 'English Fundamentals',
        description: 'Core English language skills from beginner to intermediate',
        cefr_min: 'A1',
        cefr_max: 'B2'
      })
      .select()
      .single();

    if (courseError) throw courseError;

    // Create Unit 1
    const { data: unit1, error: unit1Error } = await supabaseClient
      .from('units')
      .insert({
        course_id: course.id,
        idx: 0,
        title: 'Getting Started',
        description: 'Essential vocabulary and grammar for everyday communication',
        cefr_target: 'A1'
      })
      .select()
      .single();

    if (unit1Error) throw unit1Error;

    // Create skills for Unit 1
    const skills = [
      {
        unit_id: unit1.id,
        idx: 0,
        title: 'Daily Routines',
        description: 'Talk about your daily activities',
        grammar_point: 'Present Simple',
        vocab_theme: 'daily activities',
        cefr_target: 'A1'
      },
      {
        unit_id: unit1.id,
        idx: 1,
        title: 'Food & Drink',
        description: 'Order food and talk about meals',
        grammar_point: 'I like/I want',
        vocab_theme: 'food & drink',
        cefr_target: 'A1'
      },
      {
        unit_id: unit1.id,
        idx: 2,
        title: 'Family & Friends',
        description: 'Describe your family and relationships',
        grammar_point: 'Possessives',
        vocab_theme: 'family',
        cefr_target: 'A1'
      },
      {
        unit_id: unit1.id,
        idx: 3,
        title: 'Places & Directions',
        description: 'Navigate and describe locations',
        grammar_point: 'Prepositions of place',
        vocab_theme: 'places',
        cefr_target: 'A1'
      }
    ];

    const { data: createdSkills, error: skillsError } = await supabaseClient
      .from('skills')
      .insert(skills)
      .select();

    if (skillsError) throw skillsError;

    // Create lessons and exercises for each skill
    for (const skill of createdSkills) {
      const { data: lesson, error: lessonError } = await supabaseClient
        .from('lessons')
        .insert({
          skill_id: skill.id,
          idx: 0,
          title: `${skill.title} - Lesson 1`,
          exercise_count: 8,
          estimated_minutes: 15
        })
        .select()
        .single();

      if (lessonError) throw lessonError;

      // Generate exercises based on skill theme
      const exercises = generateExercises(skill, lesson.id);
      
      const { error: exercisesError } = await supabaseClient
        .from('exercises')
        .insert(exercises);

      if (exercisesError) throw exercisesError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Course data seeded successfully',
        course_id: course.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateExercises(skill: any, lessonId: string) {
  const exercises = [];
  
  // Flashcard exercise
  exercises.push({
    lesson_id: lessonId,
    idx: 0,
    type: 'flashcard',
    cefr_tag: skill.cefr_target,
    topic: skill.vocab_theme,
    grammar_point: skill.grammar_point,
    payload: generateFlashcardPayload(skill.vocab_theme)
  });

  // Cloze exercises
  exercises.push({
    lesson_id: lessonId,
    idx: 1,
    type: 'cloze',
    cefr_tag: skill.cefr_target,
    topic: skill.vocab_theme,
    payload: generateClozePayload(skill.vocab_theme)
  });

  exercises.push({
    lesson_id: lessonId,
    idx: 2,
    type: 'cloze',
    cefr_tag: skill.cefr_target,
    topic: skill.vocab_theme,
    payload: generateClozePayload(skill.vocab_theme)
  });

  // Reorder exercise
  exercises.push({
    lesson_id: lessonId,
    idx: 3,
    type: 'reorder',
    cefr_tag: skill.cefr_target,
    topic: skill.vocab_theme,
    payload: generateReorderPayload(skill.vocab_theme)
  });

  // Transform exercise
  exercises.push({
    lesson_id: lessonId,
    idx: 4,
    type: 'transform',
    cefr_tag: skill.cefr_target,
    grammar_point: skill.grammar_point,
    payload: generateTransformPayload()
  });

  // More flashcards
  exercises.push({
    lesson_id: lessonId,
    idx: 5,
    type: 'flashcard',
    cefr_tag: skill.cefr_target,
    topic: skill.vocab_theme,
    payload: generateFlashcardPayload(skill.vocab_theme)
  });

  // Guided conversation
  exercises.push({
    lesson_id: lessonId,
    idx: 6,
    type: 'guided_convo_text',
    cefr_tag: skill.cefr_target,
    topic: skill.vocab_theme,
    payload: generateGuidedConvoPayload(skill.vocab_theme, skill.cefr_target)
  });

  // Final flashcard quiz
  exercises.push({
    lesson_id: lessonId,
    idx: 7,
    type: 'flashcard',
    cefr_tag: skill.cefr_target,
    topic: skill.vocab_theme,
    payload: generateFlashcardPayload(skill.vocab_theme)
  });

  return exercises;
}

function generateFlashcardPayload(theme: string) {
  const vocab: Record<string, any[]> = {
    'daily activities': [
      { lemma: 'wake', display: 'wake up', ipa: 'weɪk ʌp', translation: 'despertarse', example: { en: 'I wake up at 7 AM every day.', trans: 'Me despierto a las 7 AM todos los días.' }},
      { lemma: 'eat', display: 'eat', ipa: 'iːt', translation: 'comer', example: { en: 'We eat breakfast together.', trans: 'Comemos el desayuno juntos.' }},
      { lemma: 'work', display: 'work', ipa: 'wɜːrk', translation: 'trabajar', example: { en: 'She works at a hospital.', trans: 'Ella trabaja en un hospital.' }}
    ],
    'food & drink': [
      { lemma: 'coffee', display: 'coffee', ipa: 'ˈkɒfi', translation: 'café', example: { en: 'I drink coffee every morning.', trans: 'Tomo café todas las mañanas.' }},
      { lemma: 'sandwich', display: 'sandwich', ipa: 'ˈsændwɪtʃ', translation: 'sándwich', example: { en: 'I want a sandwich for lunch.', trans: 'Quiero un sándwich para el almuerzo.' }},
      { lemma: 'water', display: 'water', ipa: 'ˈwɔːtər', translation: 'agua', example: { en: 'Can I have some water, please?', trans: '¿Puedo tener agua, por favor?' }}
    ],
    'family': [
      { lemma: 'mother', display: 'mother', ipa: 'ˈmʌðər', translation: 'madre', example: { en: 'My mother is a teacher.', trans: 'Mi madre es maestra.' }},
      { lemma: 'father', display: 'father', ipa: 'ˈfɑːðər', translation: 'padre', example: { en: 'His father works in an office.', trans: 'Su padre trabaja en una oficina.' }},
      { lemma: 'sister', display: 'sister', ipa: 'ˈsɪstər', translation: 'hermana', example: { en: 'I have one sister.', trans: 'Tengo una hermana.' }}
    ],
    'places': [
      { lemma: 'school', display: 'school', ipa: 'skuːl', translation: 'escuela', example: { en: 'The school is near my house.', trans: 'La escuela está cerca de mi casa.' }},
      { lemma: 'hospital', display: 'hospital', ipa: 'ˈhɒspɪtl', translation: 'hospital', example: { en: 'The hospital is on Main Street.', trans: 'El hospital está en la Calle Principal.' }},
      { lemma: 'park', display: 'park', ipa: 'pɑːrk', translation: 'parque', example: { en: 'We go to the park on Sundays.', trans: 'Vamos al parque los domingos.' }}
    ]
  };

  return {
    type: 'flashcard',
    cards: vocab[theme] || vocab['daily activities']
  };
}

function generateClozePayload(theme: string) {
  const sentences: Record<string, any> = {
    'daily activities': { prompt: 'I ___ breakfast at 8 AM.', answer: ['eat', 'have'], hint: 'What do you do with food?' },
    'food & drink': { prompt: 'I like to drink ___ in the morning.', answer: ['coffee', 'tea'], hint: 'A hot drink' },
    'family': { prompt: 'My ___ name is Maria.', answer: ['mother', "mother's"], hint: 'Female parent' },
    'places': { prompt: 'The library is ___ to the school.', answer: ['next', 'close'], hint: 'Near' }
  };

  return sentences[theme] || sentences['daily activities'];
}

function generateReorderPayload(theme: string) {
  return {
    type: 'reorder',
    tokens: ['I', 'every', 'day', 'breakfast', 'eat'],
    solution: ['I', 'eat', 'breakfast', 'every', 'day']
  };
}

function generateTransformPayload() {
  return {
    type: 'transform',
    input: 'I eat breakfast.',
    instruction: 'question',
    solutions: ['Do I eat breakfast?', 'Do you eat breakfast?']
  };
}

function generateGuidedConvoPayload(theme: string, cefr: string) {
  return {
    type: 'guided_convo_text',
    topic: theme,
    cefr,
    steps: [
      {
        kind: 'choice',
        prompt: 'How are you today?',
        options: ['I am fine, thank you!', 'I am tired.', 'I am happy!'],
        answer: 0
      },
      {
        kind: 'cloze',
        prompt: 'What do you like to ___?',
        answers: ['eat', 'do', 'drink']
      },
      {
        kind: 'short',
        prompt: 'Tell me about your day.',
        rubric: 'Describe at least 2 activities'
      }
    ]
  };
}
