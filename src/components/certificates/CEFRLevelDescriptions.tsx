
import React from "react";
import { getLevelDescription } from "@/components/certifications/utils/scoreUtils";
import { rubricData } from "./CEFRLevelRubric";
import { useLocalization } from "@/context/LocalizationContext";

const CEFRLevelDescriptions = () => {
  const { currentLanguage, t } = useLocalization();
  
  // Function to get level description in Spanish
  const getSpanishLevelDescription = (level: string) => {
    switch (level) {
      case 'C2':
        return 'Nivel de maestría: Lectura - Puede entender prácticamente cualquier texto en inglés, incluyendo documentos abstractos o complejos. Escritura - Puede producir textos claros, fluidos y complejos en un estilo apropiado. Habla - Puede expresarse espontáneamente y con fluidez con precisión en situaciones complejas. Escucha - Puede entender a cualquier hablante nativo de inglés, incluso en temas abstractos y complejos.';
      case 'C1':
        return 'Nivel avanzado: Lectura - Puede entender textos en inglés largos y complejos y reconocer significados implícitos. Escritura - Puede producir textos claros y bien estructurados sobre temas complejos. Habla - Puede expresar ideas con fluidez y espontaneidad sin búsqueda obvia de expresiones. Escucha - Puede entender discursos extensos en inglés incluso cuando no están claramente estructurados.';
      case 'B2':
        return 'Intermedio alto: Lectura - Puede entender textos complejos en inglés y artículos técnicos. Escritura - Puede escribir textos claros y detallados sobre una amplia gama de temas. Habla - Puede interactuar con fluidez y espontaneidad con hablantes nativos de inglés. Escucha - Puede entender discursos y conferencias extensos, siguiendo líneas complejas de argumentación.';
      case 'B1':
        return 'Intermedio: Lectura - Puede entender textos en inglés sobre asuntos familiares. Escritura - Puede escribir textos sencillos y conectados sobre temas familiares. Habla - Puede manejar la mayoría de las situaciones que pueden surgir en un entorno de habla inglesa. Escucha - Puede entender los puntos principales del inglés estándar claro sobre asuntos familiares.';
      case 'A2':
        return 'Elemental: Lectura - Puede entender textos en inglés cortos y sencillos. Escritura - Puede escribir notas y mensajes breves y sencillos. Habla - Puede comunicarse en tareas simples y rutinarias que requieren un intercambio directo de información. Escucha - Puede reconocer palabras y frases básicas cuando las personas hablan lentamente.';
      case 'A1':
        return 'Principiante: Lectura - Puede entender nombres, palabras y oraciones simples en inglés familiares. Escritura - Puede escribir frases cortas y sencillas y completar formularios. Habla - Puede interactuar de manera simple con frases y expresiones básicas. Escucha - Puede reconocer palabras y frases básicas cuando las personas hablan lentamente.';
      default:
        return '';
    }
  };
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {currentLanguage === "spanish" ? "Descripciones de Niveles CEFR" : "CEFR Level Descriptions"}
      </h3>
      <div className="grid gap-4">
        {rubricData.map((item) => (
          <div key={item.level} className="p-4 bg-white rounded border">
            <h4 className="font-medium mb-2">
              {currentLanguage === "spanish" ? "Nivel " : "Level "}{item.level}
            </h4>
            <p className="text-sm text-gray-600">
              {currentLanguage === "spanish" 
                ? getSpanishLevelDescription(item.level) 
                : getLevelDescription(item.level)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CEFRLevelDescriptions;
