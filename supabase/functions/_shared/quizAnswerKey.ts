// AUTO-GENERATED answer key. Server-side source of truth for reading quiz grading.
// Never expose this file to the browser.
export interface AnswerKeyEntry { level: string; correctAnswer: number }

export function normalizeQuestion(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

const RAW: Array<[string, AnswerKeyEntry]> = [
  [
    "John is at the store. He buys bread and milk. Where is John?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "Lisa has a dog. The dog is black and small. What color is the dog?",
    {
      "level": "A1",
      "correctAnswer": 2
    }
  ],
  [
    "Sarah eats a red apple. What does Sarah eat?",
    {
      "level": "A1",
      "correctAnswer": 3
    }
  ],
  [
    "The book is on the table. Where is the book?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "Tom goes to school by bus. How does Tom go to school?",
    {
      "level": "A1",
      "correctAnswer": 2
    }
  ],
  [
    "Mary is a teacher. She works at a school. What is Mary's job?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "It is raining today. What is the weather like?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "The coffee is hot. The ice cream is cold. How is the ice cream?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "I have two brothers and one sister. How many brothers do I have?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "The cat is under the chair. Where is the cat?",
    {
      "level": "A1",
      "correctAnswer": 2
    }
  ],
  [
    "She likes to swim in the summer. What does she like to do?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "I drink coffee in the morning. When do I drink coffee?",
    {
      "level": "A1",
      "correctAnswer": 0
    }
  ],
  [
    "Monday, Tuesday, Wednesday are days of the week. How many days are mentioned?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "The shirt is blue. What color is the shirt?",
    {
      "level": "A1",
      "correctAnswer": 2
    }
  ],
  [
    "He has ten apples. How many apples does he have?",
    {
      "level": "A1",
      "correctAnswer": 2
    }
  ],
  [
    "María está en la tienda. Ella compra pan y leche. ¿Dónde está María?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "Juan tiene un perro. El perro es negro y pequeño. ¿De qué color es el perro?",
    {
      "level": "A1",
      "correctAnswer": 2
    }
  ],
  [
    "Ana come una manzana roja. ¿Qué come Ana?",
    {
      "level": "A1",
      "correctAnswer": 3
    }
  ],
  [
    "El libro está sobre la mesa. ¿Dónde está el libro?",
    {
      "level": "A1",
      "correctAnswer": 1
    }
  ],
  [
    "Pedro va a la escuela en autobús. ¿Cómo va Pedro a la escuela?",
    {
      "level": "A1",
      "correctAnswer": 2
    }
  ],
  [
    "Carmen trabaja en un hospital. Ella ayuda a personas enfermas. ¿Qué profesión tiene Carmen?",
    {
      "level": "A2",
      "correctAnswer": 1
    }
  ],
  [
    "En el restaurante, Juan pide una sopa de verduras. ¿Qué pide Juan?",
    {
      "level": "A2",
      "correctAnswer": 2
    }
  ],
  [
    "María estudia español los lunes y miércoles. ¿Cuándo estudia María español?",
    {
      "level": "A2",
      "correctAnswer": 1
    }
  ],
  [
    "La biblioteca cierra a las 8 de la noche. ¿A qué hora cierra la biblioteca?",
    {
      "level": "A2",
      "correctAnswer": 2
    }
  ],
  [
    "El fin de semana, Ana va al parque con sus amigos. ¿Con quién va Ana al parque?",
    {
      "level": "A2",
      "correctAnswer": 2
    }
  ],
  [
    "Ana estudia mucho porque quiere ser médica. Le interesan las ciencias y ayudar a otros. ¿Por qué estudia Ana?",
    {
      "level": "B1",
      "correctAnswer": 1
    }
  ],
  [
    "El informe meteorológico indica que mañana habrá precipitaciones. ¿Qué tiempo hará mañana?",
    {
      "level": "B1",
      "correctAnswer": 1
    }
  ],
  [
    "Pedro ha decidido cambiar de trabajo porque quiere mejorar su calidad de vida. ¿Por qué cambia de trabajo Pedro?",
    {
      "level": "B1",
      "correctAnswer": 1
    }
  ],
  [
    "La exposición de arte contemporáneo estará abierta hasta el próximo mes. ¿Hasta cuándo estará abierta la exposición?",
    {
      "level": "B1",
      "correctAnswer": 3
    }
  ],
  [
    "María ha comprado un coche híbrido para contaminar menos. ¿Por qué ha comprado María un coche híbrido?",
    {
      "level": "B1",
      "correctAnswer": 2
    }
  ],
  [
    "La contaminación ambiental es un problema grave que afecta a nuestro planeta. Los científicos buscan soluciones para reducir su impacto. ¿Qué buscan los científicos?",
    {
      "level": "B2",
      "correctAnswer": 1
    }
  ],
  [
    "A pesar de los avances en tecnología, algunas comunidades rurales siguen sin tener acceso a internet. ¿Qué problema se menciona?",
    {
      "level": "B2",
      "correctAnswer": 2
    }
  ],
  [
    "El estudio demuestra que el ejercicio regular mejora la salud mental y física. ¿Qué beneficios tiene el ejercicio según el estudio?",
    {
      "level": "B2",
      "correctAnswer": 2
    }
  ],
  [
    "La implementación de energías renovables requiere una inversión inicial significativa, pero es beneficiosa a largo plazo. ¿Qué característica tienen las energías renovables?",
    {
      "level": "B2",
      "correctAnswer": 1
    }
  ],
  [
    "El teletrabajo ha cambiado la forma en que las empresas operan, aunque presenta nuevos desafíos. ¿Qué se dice sobre el teletrabajo?",
    {
      "level": "B2",
      "correctAnswer": 2
    }
  ],
  [
    "La globalización ha contribuido significativamente al intercambio cultural entre países, aunque también ha generado debates sobre la pérdida de identidades locales. ¿Cuál es uno de los efectos negativos mencionados?",
    {
      "level": "C1",
      "correctAnswer": 1
    }
  ],
  [
    "El surgimiento de la inteligencia artificial plantea dilemas éticos sobre el futuro del trabajo humano. ¿Qué preocupación se menciona?",
    {
      "level": "C1",
      "correctAnswer": 2
    }
  ],
  [
    "La investigación sugiere que el bilingüismo puede retrasar la aparición de enfermedades neurodegenerativas. ¿Qué beneficio tiene el bilingüismo según la investigación?",
    {
      "level": "C1",
      "correctAnswer": 1
    }
  ],
  [
    "La sostenibilidad en la agricultura moderna requiere un equilibrio entre productividad y conservación ambiental. ¿Qué se necesita en la agricultura moderna?",
    {
      "level": "C1",
      "correctAnswer": 2
    }
  ],
  [
    "El desarrollo de vacunas mediante ARN mensajero representa un avance significativo en la medicina moderna. ¿Qué representa este desarrollo?",
    {
      "level": "C1",
      "correctAnswer": 1
    }
  ],
  [
    "La intersección entre la inteligencia artificial y la ética plantea dilemas filosóficos fundamentales sobre la consciencia y la responsabilidad moral de las máquinas. ¿Qué aspecto se debate principalmente?",
    {
      "level": "C2",
      "correctAnswer": 1
    }
  ],
  [
    "La preservación de lenguas minoritarias en la era digital representa un desafío significativo para la diversidad lingüística global. ¿Qué se ve amenazado según el texto?",
    {
      "level": "C2",
      "correctAnswer": 1
    }
  ],
  [
    "Los avances en la edición genética suscitan debates sobre los límites éticos de la modificación del genoma humano. ¿Qué genera debate?",
    {
      "level": "C2",
      "correctAnswer": 1
    }
  ],
  [
    "La implementación de políticas de economía circular requiere una transformación fundamental en los patrones de consumo y producción. ¿Qué se necesita según el texto?",
    {
      "level": "C2",
      "correctAnswer": 2
    }
  ],
  [
    "La interacción entre los factores epigenéticos y el comportamiento humano sugiere una compleja relación entre la naturaleza y la crianza. ¿Qué tipo de relación se sugiere?",
    {
      "level": "C2",
      "correctAnswer": 1
    }
  ]
];

export const READING_ANSWER_KEY: Map<string, AnswerKeyEntry> = new Map(
  RAW.map(([text, entry]) => [normalizeQuestion(text), entry]),
);
