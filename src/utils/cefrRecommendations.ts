
interface CEFRRecommendation {
  level: string;
  skill: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const cefrLevelRecommendations: Record<string, Record<string, CEFRRecommendation>> = {
  'C2': {
    reading: {
      level: 'C2',
      skill: 'Reading',
      strengths: [
        'Excellent comprehension of complex academic texts',
        'Strong ability to understand nuanced meanings',
        'Can process information from multiple sources efficiently'
      ],
      weaknesses: [
        'May still encounter specialized technical vocabulary in specific fields',
        'Could improve speed reading techniques'
      ],
      recommendations: [
        'Read academic journals and research papers',
        'Practice speed reading techniques',
        'Focus on specialized technical vocabulary in your field'
      ]
    },
    writing: {
      level: 'C2',
      skill: 'Writing',
      strengths: [
        'Can produce clear, well-structured complex texts',
        'Excellent command of writing styles and tone',
        'Strong argumentative writing skills'
      ],
      weaknesses: [
        'May need to refine specific genre writing',
        'Could improve creative writing techniques'
      ],
      recommendations: [
        'Practice writing in different genres',
        'Experiment with creative writing',
        'Focus on stylistic refinement'
      ]
    },
    speaking: {
      level: 'C2',
      skill: 'Speaking',
      strengths: [
        'Natural and fluent expression',
        'Excellent command of idiomatic expressions',
        'Can handle complex discussions effectively'
      ],
      weaknesses: [
        'May need to refine accent for specific contexts',
        'Could improve public speaking skills'
      ],
      recommendations: [
        'Practice public speaking',
        'Join advanced debate clubs',
        'Work on pronunciation of specific sounds'
      ]
    },
    listening: {
      level: 'C2',
      skill: 'Listening',
      strengths: [
        'Can understand complex academic lectures',
        'Excellent comprehension of native speakers',
        'Strong ability to understand different accents'
      ],
      weaknesses: [
        'May struggle with very specific regional dialects',
        'Could improve note-taking skills'
      ],
      recommendations: [
        'Listen to various regional accents',
        'Practice taking notes during lectures',
        'Watch academic presentations'
      ]
    }
  },
  'C1': {
    reading: {
      level: 'C1',
      skill: 'Reading',
      strengths: [
        'Can understand complex texts',
        'Good understanding of implicit meaning',
        'Strong vocabulary knowledge'
      ],
      weaknesses: [
        'May struggle with highly technical texts',
        'Could improve reading speed'
      ],
      recommendations: [
        'Read professional publications',
        'Practice skimming and scanning',
        'Focus on academic vocabulary'
      ]
    },
    writing: {
      level: 'C1',
      skill: 'Writing',
      strengths: [
        'Can write clear detailed texts',
        'Good organization of ideas',
        'Strong argumentative writing'
      ],
      weaknesses: [
        'May need work on academic writing',
        'Could improve formal style'
      ],
      recommendations: [
        'Practice academic writing',
        'Work on formal email writing',
        'Study advanced grammar structures'
      ]
    },
    speaking: {
      level: 'C1',
      skill: 'Speaking',
      strengths: [
        'Fluent expression on complex topics',
        'Good use of connectors',
        'Clear pronunciation'
      ],
      weaknesses: [
        'May need work on presentation skills',
        'Could improve idiom usage'
      ],
      recommendations: [
        'Give presentations regularly',
        'Practice using idioms',
        'Join conversation groups'
      ]
    },
    listening: {
      level: 'C1',
      skill: 'Listening',
      strengths: [
        'Can follow complex arguments',
        'Good understanding of native speakers',
        'Can follow abstract discussions'
      ],
      weaknesses: [
        'May struggle with fast speech',
        'Could improve understanding of humor'
      ],
      recommendations: [
        'Watch news and documentaries',
        'Listen to podcasts',
        'Practice with native speaker conversations'
      ]
    }
  },
  'B2': {
    reading: {
      level: 'B2',
      skill: 'Reading',
      strengths: [
        'Can understand main ideas of complex text',
        'Good reading speed',
        'Can scan for specific information'
      ],
      weaknesses: [
        'May struggle with academic texts',
        'Could improve vocabulary range'
      ],
      recommendations: [
        'Read newspaper articles',
        'Practice with academic texts',
        'Build vocabulary through reading'
      ]
    },
    writing: {
      level: 'B2',
      skill: 'Writing',
      strengths: [
        'Can write clear detailed text',
        'Good paragraph organization',
        'Can express opinions'
      ],
      weaknesses: [
        'May need work on coherence',
        'Could improve formal writing'
      ],
      recommendations: [
        'Practice writing essays',
        'Work on linking words',
        'Study formal writing styles'
      ]
    },
    speaking: {
      level: 'B2',
      skill: 'Speaking',
      strengths: [
        'Can interact with fluency',
        'Good range of vocabulary',
        'Can express opinions clearly'
      ],
      weaknesses: [
        'May need work on pronunciation',
        'Could improve fluency'
      ],
      recommendations: [
        'Practice pronunciation exercises',
        'Join speaking clubs',
        'Record yourself speaking'
      ]
    },
    listening: {
      level: 'B2',
      skill: 'Listening',
      strengths: [
        'Can understand main ideas',
        'Good comprehension of standard speech',
        'Can follow detailed instructions'
      ],
      weaknesses: [
        'May struggle with native speaker speed',
        'Could improve understanding of accents'
      ],
      recommendations: [
        'Watch movies without subtitles',
        'Listen to podcasts',
        'Practice with different accents'
      ]
    }
  },
  'B1': {
    reading: {
      level: 'B1',
      skill: 'Reading',
      strengths: [
        'Can understand main points',
        'Good comprehension of simple texts',
        'Can find specific information'
      ],
      weaknesses: [
        'May struggle with complex texts',
        'Could improve reading speed'
      ],
      recommendations: [
        'Read graded readers',
        'Practice with authentic materials',
        'Build vocabulary systematically'
      ]
    },
    writing: {
      level: 'B1',
      skill: 'Writing',
      strengths: [
        'Can write simple connected text',
        'Good basic vocabulary',
        'Can describe experiences'
      ],
      weaknesses: [
        'May need work on structure',
        'Could improve grammar accuracy'
      ],
      recommendations: [
        'Practice writing descriptions',
        'Work on connecting sentences',
        'Study basic paragraph structure'
      ]
    },
    speaking: {
      level: 'B1',
      skill: 'Speaking',
      strengths: [
        'Can communicate on familiar topics',
        'Good basic fluency',
        'Can describe experiences'
      ],
      weaknesses: [
        'May need work on pronunciation',
        'Could improve vocabulary range'
      ],
      recommendations: [
        'Practice common conversations',
        'Work on pronunciation',
        'Build everyday vocabulary'
      ]
    },
    listening: {
      level: 'B1',
      skill: 'Listening',
      strengths: [
        'Can understand main points',
        'Good comprehension of clear speech',
        'Can follow simple instructions'
      ],
      weaknesses: [
        'May struggle with native speech',
        'Could improve comprehension speed'
      ],
      recommendations: [
        'Watch videos with subtitles',
        'Listen to slow news',
        'Practice with simple conversations'
      ]
    }
  },
  'A2': {
    reading: {
      level: 'A2',
      skill: 'Reading',
      strengths: [
        'Can understand short texts',
        'Good comprehension of basic information',
        'Can read simple messages'
      ],
      weaknesses: [
        'May struggle with longer texts',
        'Could improve vocabulary'
      ],
      recommendations: [
        'Read short stories',
        'Practice with simple texts',
        'Build basic vocabulary'
      ]
    },
    writing: {
      level: 'A2',
      skill: 'Writing',
      strengths: [
        'Can write short messages',
        'Good basic sentences',
        'Can fill out forms'
      ],
      weaknesses: [
        'May need work on sentence structure',
        'Could improve grammar basics'
      ],
      recommendations: [
        'Practice writing notes',
        'Work on simple sentences',
        'Study basic grammar'
      ]
    },
    speaking: {
      level: 'A2',
      skill: 'Speaking',
      strengths: [
        'Can handle simple exchanges',
        'Good basic phrases',
        'Can ask simple questions'
      ],
      weaknesses: [
        'May need work on basic pronunciation',
        'Could improve basic vocabulary'
      ],
      recommendations: [
        'Practice basic conversations',
        'Learn common phrases',
        'Work on pronunciation basics'
      ]
    },
    listening: {
      level: 'A2',
      skill: 'Listening',
      strengths: [
        'Can understand basic phrases',
        'Good comprehension of slow speech',
        'Can follow simple directions'
      ],
      weaknesses: [
        'May struggle with natural speech',
        'Could improve listening speed'
      ],
      recommendations: [
        'Listen to slow dialogues',
        'Practice with simple audio',
        'Work with basic listening exercises'
      ]
    }
  },
  'A1': {
    reading: {
      level: 'A1',
      skill: 'Reading',
      strengths: [
        'Can recognize familiar words',
        'Can read very simple texts',
        'Understands basic signs'
      ],
      weaknesses: [
        'Limited vocabulary range',
        'Struggles with longer words'
      ],
      recommendations: [
        'Start with picture books',
        'Learn basic vocabulary',
        'Practice with flashcards'
      ]
    },
    writing: {
      level: 'A1',
      skill: 'Writing',
      strengths: [
        'Can write simple words',
        'Can fill in basic forms',
        'Can copy text'
      ],
      weaknesses: [
        'Limited sentence formation',
        'Basic grammar needs work'
      ],
      recommendations: [
        'Practice writing simple words',
        'Copy short texts',
        'Learn basic sentence patterns'
      ]
    },
    speaking: {
      level: 'A1',
      skill: 'Speaking',
      strengths: [
        'Can use basic phrases',
        'Can introduce self',
        'Can ask simple questions'
      ],
      weaknesses: [
        'Limited vocabulary',
        'Basic pronunciation needs work'
      ],
      recommendations: [
        'Learn basic greetings',
        'Practice numbers and colors',
        'Repeat common phrases'
      ]
    },
    listening: {
      level: 'A1',
      skill: 'Listening',
      strengths: [
        'Can understand basic greetings',
        'Recognizes familiar words',
        'Can follow very simple instructions'
      ],
      weaknesses: [
        'Struggles with natural speech',
        'Limited vocabulary recognition'
      ],
      recommendations: [
        'Listen to basic dialogues',
        'Practice with simple songs',
        'Work with basic listening exercises'
      ]
    }
  }
};

export const getRecommendationsForLevel = (
  skill: string,
  level: string
): CEFRRecommendation | null => {
  const normalizedLevel = level.toUpperCase();
  const normalizedSkill = skill.toLowerCase();
  
  return cefrLevelRecommendations[normalizedLevel]?.[normalizedSkill] || null;
};

