import { Question } from "../types/reading";

export const READING_QUESTIONS: Question[] = [
  // A1 Level
  {
    level: 'A1',
    type: 'multiple-choice',
    text: "María está en la tienda. Ella compra pan y leche. ¿Dónde está María?",
    options: ["En la casa", "En la tienda", "En el parque", "En la escuela"],
    correctAnswer: 1
  },
  {
    level: 'A1',
    type: 'multiple-choice',
    text: "Juan tiene un perro. El perro es negro y pequeño. ¿De qué color es el perro?",
    options: ["Blanco", "Marrón", "Negro", "Gris"],
    correctAnswer: 2
  },
  {
    level: 'A1',
    type: 'true-false',
    text: "El perro de Juan es grande.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // A2 Level
  {
    level: 'A2',
    type: 'multiple-choice',
    text: "Carmen trabaja en un hospital. Ella ayuda a personas enfermas. ¿Qué profesión tiene Carmen?",
    options: ["Maestra", "Doctora", "Cocinera", "Arquitecta"],
    correctAnswer: 1
  },
  {
    level: 'A2',
    type: 'multiple-choice',
    text: "Pedro desayuna café con leche y tostadas todos los días. ¿Qué bebe Pedro?",
    options: ["Té", "Jugo", "Agua", "Café con leche"],
    correctAnswer: 3
  },
  {
    level: 'A2',
    type: 'true-false',
    text: "Pedro desayuna cereales.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // B1 Level
  {
    level: 'B1',
    type: 'multiple-choice',
    text: "Ana estudia mucho porque quiere ser médica. Le interesan las ciencias y ayudar a otros. ¿Por qué estudia Ana?",
    options: [
      "Porque sus padres la obligan",
      "Porque quiere ser médica",
      "Porque es fácil",
      "Porque no tiene trabajo"
    ],
    correctAnswer: 1
  },
  {
    level: 'B1',
    type: 'multiple-choice',
    text: "Durante el verano, Miguel viaja a la playa con su familia. Disfrutan nadando y tomando el sol. ¿Qué actividad realizan?",
    options: ["Esquiar", "Nadar", "Caminar", "Dormir"],
    correctAnswer: 1
  },
  {
    level: 'B1',
    type: 'true-false',
    text: "Miguel y su familia viajan a la montaña en verano.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // B2 Level
  {
    level: 'B2',
    type: 'multiple-choice',
    text: "La contaminación ambiental es un problema grave que afecta a nuestro planeta. Los científicos buscan soluciones para reducir su impacto. ¿Qué buscan los científicos?",
    options: [
      "Aumentar la contaminación",
      "Soluciones para reducir el impacto",
      "Ignorar el problema",
      "Crear más industrias"
    ],
    correctAnswer: 1
  },
  {
    level: 'B2',
    type: 'multiple-choice',
    text: "El desarrollo de la tecnología ha transformado nuestra forma de trabajar y comunicarnos. ¿Qué ha cambiado la tecnología?",
    options: [
      "Solo el trabajo",
      "Solo la comunicación",
      "La forma de trabajar y comunicarnos",
      "Nada ha cambiado"
    ],
    correctAnswer: 2
  },
  {
    level: 'B2',
    type: 'true-false',
    text: "La tecnología solo ha afectado al trabajo.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // C1 Level
  {
    level: 'C1',
    type: 'multiple-choice',
    text: "La globalización ha contribuido significativamente al intercambio cultural entre países, aunque también ha generado debates sobre la pérdida de identidades locales. ¿Cuál es uno de los efectos negativos mencionados de la globalización?",
    options: [
      "El intercambio cultural",
      "La pérdida de identidades locales",
      "El crecimiento económico",
      "La comunicación internacional"
    ],
    correctAnswer: 1
  },
  {
    level: 'C1',
    type: 'multiple-choice',
    text: "Los avances en la investigación científica han permitido desarrollar nuevos tratamientos médicos, aunque el acceso a estos no siempre es equitativo. ¿Cuál es el problema mencionado con los nuevos tratamientos?",
    options: [
      "No son efectivos",
      "Son muy antiguos",
      "El acceso no es equitativo",
      "No hay investigación"
    ],
    correctAnswer: 2
  },
  {
    level: 'C1',
    type: 'true-false',
    text: "Todos tienen acceso equitativo a los nuevos tratamientos médicos.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
  // C2 Level
  {
    level: 'C2',
    type: 'multiple-choice',
    text: "La intersección entre la inteligencia artificial y la ética plantea dilemas filosóficos fundamentales sobre la consciencia y la responsabilidad moral de las máquinas. ¿Qué aspecto se debate principalmente?",
    options: [
      "La velocidad de las máquinas",
      "El costo de la tecnología",
      "La consciencia y responsabilidad moral",
      "El consumo de energía"
    ],
    correctAnswer: 2
  },
  {
    level: 'C2',
    type: 'multiple-choice',
    text: "La preservación de lenguas minoritarias en la era digital representa un desafío significativo para la diversidad lingüística global. ¿Qué se ve amenazado según el texto?",
    options: [
      "La era digital",
      "La diversidad lingüística",
      "El uso de tecnología",
      "El aprendizaje de idiomas"
    ],
    correctAnswer: 1
  },
  {
    level: 'C2',
    type: 'true-false',
    text: "La era digital favorece naturalmente la preservación de lenguas minoritarias.",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1
  },
];
