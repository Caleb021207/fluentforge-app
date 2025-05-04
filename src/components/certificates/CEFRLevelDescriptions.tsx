
import React from "react";
import { getLevelDescription } from "@/components/certifications/utils/scoreUtils";
import { rubricData } from "./CEFRLevelRubric";
import { useLocalization } from "@/context/LocalizationContext";

const CEFRLevelDescriptions = () => {
  const { currentLanguage, t } = useLocalization();
  
  // Function to get level description based on language and level
  const getLocalizedLevelDescription = (level: string) => {
    if (currentLanguage === "portuguese") {
      switch (level) {
        case 'C2':
          return 'Nível de mestria: Leitura - Pode entender praticamente qualquer texto, incluindo documentos abstratos ou complexos. Escrita - Pode produzir textos claros, fluidos e complexos em um estilo apropriado. Fala - Pode se expressar espontaneamente e com fluência com precisão em situações complexas. Escuta - Pode entender qualquer falante nativo, mesmo em temas abstratos e complexos.';
        case 'C1':
          return 'Nível avançado: Leitura - Pode entender textos longos e complexos e reconhecer significados implícitos. Escrita - Pode produzir textos claros e bem estruturados sobre temas complexos. Fala - Pode expressar ideias com fluência e espontaneidade sem busca óbvia de expressões. Escuta - Pode entender discursos extensos mesmo quando não estão claramente estruturados.';
        case 'B2':
          return 'Intermediário alto: Leitura - Pode entender textos complexos e artigos técnicos. Escrita - Pode escrever textos claros e detalhados sobre uma ampla gama de temas. Fala - Pode interagir com fluência e espontaneidade com falantes nativos. Escuta - Pode entender discursos e conferências extensos, seguindo linhas complexas de argumentação.';
        case 'B1':
          return 'Intermediário: Leitura - Pode entender textos sobre assuntos familiares. Escrita - Pode escrever textos simples e conectados sobre temas familiares. Fala - Pode lidar com a maioria das situações que podem surgir em um ambiente onde se fala a língua. Escuta - Pode entender os pontos principais da linguagem padrão clara sobre assuntos familiares.';
        case 'A2':
          return 'Elementar: Leitura - Pode entender textos curtos e simples. Escrita - Pode escrever notas e mensagens breves e simples. Fala - Pode se comunicar em tarefas simples e rotineiras que exigem troca direta de informações. Escuta - Pode reconhecer palavras e frases básicas quando as pessoas falam lentamente.';
        case 'A1':
          return 'Iniciante: Leitura - Pode entender nomes, palavras e frases simples familiares. Escrita - Pode escrever frases curtas e simples e preencher formulários. Fala - Pode interagir de maneira simples com frases e expressões básicas. Escuta - Pode reconhecer palavras e frases básicas quando as pessoas falam lentamente.';
        default:
          return '';
      }
    } else if (currentLanguage === "spanish") {
      return getSpanishLevelDescription(level);
    } else {
      return getLevelDescription(level);
    }
  };
  
  // Function to get level description in Spanish (kept from original)
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
  
  const getLocalizedTitle = () => {
    switch(currentLanguage) {
      case "spanish":
        return "Descripciones de Niveles CEFR";
      case "portuguese":
        return "Descrições de Níveis CEFR";
      default:
        return "CEFR Level Descriptions";
    }
  };
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {getLocalizedTitle()}
      </h3>
      <div className="grid gap-4">
        {rubricData.map((item) => (
          <div key={item.level} className="p-4 bg-white rounded border">
            <h4 className="font-medium mb-2">
              {currentLanguage === "english" ? "Level " : currentLanguage === "spanish" ? "Nivel " : "Nível "}{item.level}
            </h4>
            <p className="text-sm text-gray-600">
              {getLocalizedLevelDescription(item.level)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CEFRLevelDescriptions;
