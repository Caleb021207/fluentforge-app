
import { Pencil, Play } from 'lucide-react';
import { Unit } from '../lessonUnits';

export const travelUnit: Unit = {
  id: 4,
  title: "Travel and Directions",
  description: "Learn how to navigate and ask for directions in Spanish-speaking countries.",
  cefrLevel: "A2",
  xpPoints: 180,
  vocabulary: [
    "calle - street",
    "avenida - avenue",
    "derecha - right",
    "izquierda - left",
    "cerca - near",
    "lejos - far",
    "hotel - hotel",
    "aeropuerto - airport",
    "estación - station",
    "autobús - bus",
    "tren - train",
    "taxi - taxi"
  ],
  lessons: [
    {
      id: 1,
      title: "Asking for Directions",
      description: "Learn to ask for and understand directions in Spanish",
      xpReward: 60,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'Where is...?' in Spanish?",
          options: ["¿Dónde está...?", "¿Cómo es...?", "¿Cuánto cuesta...?", "¿Qué hora es...?"],
          answer: "¿Dónde está...?",
          points: 5,
          feedback: {
            correct: "¡Correcto! '¿Dónde está...?' means 'Where is...?' in Spanish.",
            incorrect: "Incorrect. '¿Dónde está...?' means 'Where is...?' in Spanish."
          }
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "How do you say 'Turn right at the corner' in Spanish?",
          options: [
            "Gire a la izquierda en la esquina", 
            "Gire a la derecha en la esquina", 
            "Siga todo recto", 
            "Cruce la calle"
          ],
          answer: "Gire a la derecha en la esquina",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Gire a la derecha en la esquina' means 'Turn right at the corner'.",
            incorrect: "Incorrect. 'Gire a la derecha en la esquina' means 'Turn right at the corner'."
          }
        },
        {
          id: 3,
          type: "word-ordering",
          question: "Put the words in the correct order to create a sentence asking where the hospital is.",
          options: ["¿Dónde", "está", "el", "hospital", "?"],
          answer: ["¿Dónde", "está", "el", "hospital", "?"],
          points: 15,
          feedback: {
            correct: "¡Perfecto! '¿Dónde está el hospital?' means 'Where is the hospital?'",
            incorrect: "The correct order is '¿Dónde está el hospital?' which means 'Where is the hospital?'"
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Complete the sentence: El museo está ___ del parque, a la ___.",
          answer: ["cerca", "derecha"],
          points: 10,
          feedback: {
            correct: "¡Perfecto! 'El museo está cerca del parque, a la derecha' means 'The museum is near the park, to the right'.",
            incorrect: "The correct answers are 'cerca' (near) and 'derecha' (right)."
          }
        },
        {
          id: 5,
          type: "word-matching",
          question: "Match these direction words with their meanings",
          pairs: [
            { word: "derecha", match: "right" },
            { word: "izquierda", match: "left" },
            { word: "cerca", match: "near" },
            { word: "lejos", match: "far" }
          ],
          points: 10,
          feedback: {
            correct: "¡Excelente! You matched all direction words correctly.",
            incorrect: "Some matches were incorrect. Please try again."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Public Transportation",
      description: "Learn vocabulary and phrases for using public transportation",
      xpReward: 55,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'train station' in Spanish?",
          options: ["Estación de tren", "Estación de autobús", "Parada de taxi", "Terminal de aeropuerto"],
          answer: "Estación de tren",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Estación de tren' means 'train station'.",
            incorrect: "Incorrect. 'Estación de tren' means 'train station'."
          }
        },
        {
          id: 2,
          type: "image-identification",
          question: "What is shown in the picture?",
          image: "train-station.jpg",
          options: ["Aeropuerto", "Estación de tren", "Estación de autobús", "Taxi"],
          answer: "Estación de tren",
          points: 5,
          feedback: {
            correct: "¡Correcto! This is a 'Estación de tren' (train station).",
            incorrect: "Incorrect. This is a 'Estación de tren' (train station)."
          }
        },
        {
          id: 3,
          type: "sentence-correction",
          question: "Correct this sentence if needed: 'Necesito un boleto para el autobuses.'",
          answer: "Necesito un boleto para el autobús.",
          points: 15,
          feedback: {
            correct: "¡Correcto! The correct sentence is 'Necesito un boleto para el autobús.' (I need a ticket for the bus.)",
            incorrect: "The correct sentence is 'Necesito un boleto para el autobús.' 'Autobuses' is plural, but here we need the singular form."
          }
        },
        {
          id: 4,
          type: "audio-transcription",
          question: "Listen and transcribe what you hear about the train schedule",
          audio: "train-schedule.mp3",
          answer: "El tren sale a las nueve de la mañana",
          points: 20,
          feedback: {
            correct: "¡Excelente! You correctly transcribed 'El tren sale a las nueve de la mañana' (The train leaves at nine in the morning).",
            incorrect: "The correct transcription is 'El tren sale a las nueve de la mañana' (The train leaves at nine in the morning)."
          }
        },
        {
          id: 5,
          type: "fill-in-blanks",
          question: "Complete the sentence: El ___ llega a la ___ a las diez.",
          answer: ["autobús", "estación"],
          points: 10,
          feedback: {
            correct: "¡Perfecto! 'El autobús llega a la estación a las diez' means 'The bus arrives at the station at ten'.",
            incorrect: "The correct answers are 'autobús' (bus) and 'estación' (station)."
          }
        }
      ]
    },
    {
      id: 3,
      title: "At the Hotel",
      description: "Learn vocabulary and phrases for hotel stays",
      xpReward: 50,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you ask for a room with two beds in Spanish?",
          options: [
            "Quisiera una habitación con una cama", 
            "Quisiera una habitación con dos camas", 
            "Quisiera una habitación con baño", 
            "Quisiera una habitación con vista"
          ],
          answer: "Quisiera una habitación con dos camas",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Quisiera una habitación con dos camas' means 'I would like a room with two beds'.",
            incorrect: "Incorrect. 'Quisiera una habitación con dos camas' means 'I would like a room with two beds'."
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "Complete the polite request: 'Quisiera una _____ con vista al _____.'",
          answer: ["habitación", "mar"],
          points: 10,
          feedback: {
            correct: "¡Perfecto! 'Quisiera una habitación con vista al mar' means 'I would like a room with a view of the sea.'",
            incorrect: "The correct phrase is 'Quisiera una habitación con vista al mar' which means 'I would like a room with a view of the sea.'"
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "How would you ask if breakfast is included?",
          options: [
            "¿Dónde está el restaurante?", 
            "¿A qué hora es el desayuno?", 
            "¿Está incluido el desayuno?", 
            "¿Cuánto cuesta el desayuno?"
          ],
          answer: "¿Está incluido el desayuno?",
          points: 5,
          feedback: {
            correct: "¡Correcto! '¿Está incluido el desayuno?' means 'Is breakfast included?'",
            incorrect: "Incorrect. '¿Está incluido el desayuno?' means 'Is breakfast included?'"
          }
        },
        {
          id: 4,
          type: "image-identification",
          question: "What does this sign say?",
          image: "no-smoking.jpg",
          options: ["No fumar", "No entrada", "Silencio por favor", "Solo personal autorizado"],
          answer: "No fumar",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'No fumar' means 'No smoking'.",
            incorrect: "Incorrect. The sign says 'No fumar' which means 'No smoking'."
          }
        },
        {
          id: 5,
          type: "word-matching",
          question: "Match these hotel-related words with their meanings",
          pairs: [
            { word: "habitación", match: "room" },
            { word: "llave", match: "key" },
            { word: "recepción", match: "front desk" },
            { word: "ascensor", match: "elevator" }
          ],
          points: 10,
          feedback: {
            correct: "¡Excelente! You matched all hotel-related words correctly.",
            incorrect: "Some matches were incorrect. Please try again."
          }
        }
      ]
    }
  ]
};
