
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface RecommendationProps {
  rec: {
    skill: string;
    currentLevel: string;
    lastScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

const RecommendationCard = ({ rec }: RecommendationProps) => {
  const { t, currentLanguage } = useLocalization();
  
  // Function to translate skill names
  const translateSkill = (skill: string) => {
    switch(skill.toLowerCase()) {
      case "reading": return t("reading");
      case "writing": return t("writing");
      case "speaking": return t("speaking");
      case "listening": return t("listening");
      default: return skill;
    }
  };

  // Function to translate content based on the language
  const translateContent = (content: string[]): string[] => {
    // This is a simplified approach - in a real app you'd have proper translations for each item
    if (currentLanguage === "spanish") {
      // Map of English phrases to Spanish translations
      const translations: Record<string, string> = {
        // Reading strengths
        "Excellent comprehension of complex academic texts": "Excelente comprensión de textos académicos complejos",
        "Strong ability to understand nuanced meanings": "Gran capacidad para entender significados con matices",
        "Can process information from multiple sources efficiently": "Puede procesar información de múltiples fuentes eficientemente",
        "Can understand main ideas of complex text": "Puede entender las ideas principales de textos complejos",
        "Good reading speed": "Buena velocidad de lectura",
        "Can scan for specific information": "Puede escanear en busca de información específica",
        "Can understand main points": "Puede entender los puntos principales",
        "Good comprehension of simple texts": "Buena comprensión de textos simples",
        "Can find specific information": "Puede encontrar información específica",
        "Can understand short texts": "Puede entender textos cortos",
        "Good comprehension of basic information": "Buena comprensión de información básica",
        "Can read simple messages": "Puede leer mensajes simples",
        "Can understand complex texts": "Puede entender textos complejos",
        "Good understanding of implicit meaning": "Buena comprensión de significados implícitos",
        "Strong vocabulary knowledge": "Fuerte conocimiento de vocabulario",
        
        // Reading weaknesses
        "May still encounter specialized technical vocabulary in specific fields": "Puede encontrar vocabulario técnico especializado en campos específicos",
        "Could improve speed reading techniques": "Podría mejorar técnicas de lectura rápida",
        "May struggle with academic texts": "Puede tener dificultades con textos académicos",
        "Could improve vocabulary range": "Podría mejorar el rango de vocabulario",
        "May struggle with complex texts": "Puede tener dificultades con textos complejos",
        "Could improve reading speed": "Podría mejorar la velocidad de lectura",
        "May struggle with longer texts": "Puede tener dificultades con textos más largos",
        "Could improve vocabulary": "Podría mejorar el vocabulario",
        "May struggle with highly technical texts": "Puede tener dificultades con textos altamente técnicos",
        
        // Reading recommendations
        "Read academic journals and research papers": "Lee revistas académicas y trabajos de investigación",
        "Practice speed reading techniques": "Practica técnicas de lectura rápida",
        "Focus on specialized technical vocabulary in your field": "Enfócate en vocabulario técnico especializado en tu campo",
        "Read newspaper articles": "Lee artículos de periódicos",
        "Practice with academic texts": "Practica con textos académicos",
        "Build vocabulary through reading": "Desarrolla vocabulario a través de la lectura",
        "Read graded readers": "Lee lecturas graduadas",
        "Practice with authentic materials": "Practica con materiales auténticos",
        "Build vocabulary systematically": "Desarrolla vocabulario sistemáticamente",
        "Read short stories": "Lee cuentos cortos",
        "Practice with simple texts": "Practica con textos simples",
        "Build basic vocabulary": "Desarrolla vocabulario básico",
        "Read professional publications": "Lee publicaciones profesionales",
        "Practice skimming and scanning": "Practica la lectura rápida y el escaneo",
        "Focus on academic vocabulary": "Enfócate en vocabulario académico",
        
        // Writing strengths
        "Can produce clear, well-structured complex texts": "Puede producir textos complejos claros y bien estructurados",
        "Excellent command of writing styles and tone": "Excelente dominio de estilos de escritura y tono",
        "Strong argumentative writing skills": "Fuertes habilidades de escritura argumentativa",
        "Can write clear detailed texts": "Puede escribir textos detallados y claros",
        "Good organization of ideas": "Buena organización de ideas",
        "Strong argumentative writing": "Fuerte escritura argumentativa",
        "Can write clear detailed text": "Puede escribir texto detallado y claro",
        "Good paragraph organization": "Buena organización de párrafos",
        "Can express opinions": "Puede expresar opiniones",
        "Can write simple connected text": "Puede escribir texto conectado simple",
        "Good basic vocabulary": "Buen vocabulario básico",
        "Can describe experiences": "Puede describir experiencias",
        "Can write short messages": "Puede escribir mensajes cortos",
        "Good basic sentences": "Buenas oraciones básicas",
        "Can fill out forms": "Puede llenar formularios",
        
        // Writing weaknesses
        "May need to refine specific genre writing": "Puede necesitar refinar la escritura de géneros específicos",
        "Could improve creative writing techniques": "Podría mejorar técnicas de escritura creativa",
        "May need work on academic writing": "Puede necesitar trabajar en la escritura académica",
        "Could improve formal style": "Podría mejorar el estilo formal",
        "May need work on coherence": "Puede necesitar trabajar en coherencia",
        "Could improve formal writing": "Podría mejorar la escritura formal",
        "May need work on structure": "Puede necesitar trabajar en estructura",
        "Could improve grammar accuracy": "Podría mejorar la precisión gramatical",
        "May need work on sentence structure": "Puede necesitar trabajar en estructura de oraciones",
        "Could improve grammar basics": "Podría mejorar los fundamentos gramaticales",
        
        // Writing recommendations
        "Practice writing in different genres": "Practica la escritura en diferentes géneros",
        "Experiment with creative writing": "Experimenta con la escritura creativa",
        "Focus on stylistic refinement": "Enfócate en el refinamiento estilístico",
        "Practice academic writing": "Practica la escritura académica",
        "Work on formal email writing": "Trabaja en la escritura formal de correos electrónicos",
        "Study advanced grammar structures": "Estudia estructuras gramaticales avanzadas",
        "Practice writing essays": "Practica escribiendo ensayos",
        "Work on linking words": "Trabaja en palabras de enlace",
        "Study formal writing styles": "Estudia estilos de escritura formal",
        "Practice writing descriptions": "Practica escribiendo descripciones",
        "Work on connecting sentences": "Trabaja en conectar oraciones",
        "Study basic paragraph structure": "Estudia la estructura básica de párrafos",
        "Practice writing notes": "Practica escribiendo notas",
        "Work on simple sentences": "Trabaja en oraciones simples",
        "Study basic grammar": "Estudia gramática básica",
        
        // Speaking strengths
        "Natural and fluent expression": "Expresión natural y fluida",
        "Excellent command of idiomatic expressions": "Excelente dominio de expresiones idiomáticas",
        "Can handle complex discussions effectively": "Puede manejar discusiones complejas de manera efectiva",
        "Fluent expression on complex topics": "Expresión fluida en temas complejos",
        "Good use of connectors": "Buen uso de conectores",
        "Clear pronunciation": "Pronunciación clara",
        "Can interact with fluency": "Puede interactuar con fluidez",
        "Good range of vocabulary": "Buen rango de vocabulario",
        "Can express opinions clearly": "Puede expresar opiniones claramente",
        "Can communicate on familiar topics": "Puede comunicarse sobre temas familiares",
        "Good basic fluency": "Buena fluidez básica",
        "Can handle simple exchanges": "Puede manejar intercambios simples",
        "Good basic phrases": "Buenas frases básicas",
        "Can ask simple questions": "Puede hacer preguntas simples",
        "Can use basic phrases": "Puede usar frases básicas",
        "Can introduce self": "Puede presentarse a sí mismo",
        
        // Speaking weaknesses
        "May need to refine accent for specific contexts": "Puede necesitar refinar el acento para contextos específicos",
        "Could improve public speaking skills": "Podría mejorar habilidades de hablar en público",
        "May need work on presentation skills": "Puede necesitar trabajar en habilidades de presentación",
        "Could improve idiom usage": "Podría mejorar el uso de modismos",
        "May need work on pronunciation": "Puede necesitar trabajar en pronunciación",
        "Could improve fluency": "Podría mejorar la fluidez",
        "May need work on basic pronunciation": "Puede necesitar trabajar en pronunciación básica",
        "Could improve basic vocabulary": "Podría mejorar el vocabulario básico",
        "Limited vocabulary": "Vocabulario limitado",
        "Basic pronunciation needs work": "La pronunciación básica necesita trabajo",
        
        // Speaking recommendations
        "Practice public speaking": "Practica hablar en público",
        "Join advanced debate clubs": "Únete a clubes de debate avanzados",
        "Work on pronunciation of specific sounds": "Trabaja en la pronunciación de sonidos específicos",
        "Give presentations regularly": "Da presentaciones regularmente",
        "Practice using idioms": "Practica usando modismos",
        "Join conversation groups": "Únete a grupos de conversación",
        "Practice pronunciation exercises": "Practica ejercicios de pronunciación",
        "Join speaking clubs": "Únete a clubes de conversación",
        "Record yourself speaking": "Grábate hablando",
        "Practice common conversations": "Practica conversaciones comunes",
        "Work on pronunciation": "Trabaja en la pronunciación",
        "Build everyday vocabulary": "Desarrolla vocabulario cotidiano",
        "Practice basic conversations": "Practica conversaciones básicas",
        "Learn common phrases": "Aprende frases comunes",
        "Work on pronunciation basics": "Trabaja en fundamentos de pronunciación",
        "Learn basic greetings": "Aprende saludos básicos",
        "Practice numbers and colors": "Practica números y colores",
        "Repeat common phrases": "Repite frases comunes",
        
        // Listening strengths
        "Can understand complex academic lectures": "Puede entender conferencias académicas complejas",
        "Excellent comprehension of native speakers": "Excelente comprensión de hablantes nativos",
        "Strong ability to understand different accents": "Gran capacidad para entender diferentes acentos",
        "Can follow complex arguments": "Puede seguir argumentos complejos",
        "Good understanding of native speakers": "Buena comprensión de hablantes nativos",
        "Can follow abstract discussions": "Puede seguir discusiones abstractas",
        "Can understand main ideas": "Puede entender ideas principales",
        "Good comprehension of standard speech": "Buena comprensión del habla estándar",
        "Can follow detailed instructions": "Puede seguir instrucciones detalladas",
        "Can understand main points": "Puede entender puntos principales",
        "Good comprehension of clear speech": "Buena comprensión del habla clara",
        "Can follow simple instructions": "Puede seguir instrucciones simples",
        "Can understand basic phrases": "Puede entender frases básicas",
        "Good comprehension of slow speech": "Buena comprensión del habla lenta",
        "Can follow simple directions": "Puede seguir direcciones simples",
        "Can understand basic greetings": "Puede entender saludos básicos",
        "Recognizes familiar words": "Reconoce palabras familiares",
        "Can follow very simple instructions": "Puede seguir instrucciones muy simples",
        
        // Listening weaknesses
        "May struggle with very specific regional dialects": "Puede tener dificultades con dialectos regionales muy específicos",
        "Could improve note-taking skills": "Podría mejorar habilidades de toma de notas",
        "May struggle with fast speech": "Puede tener dificultades con el habla rápida",
        "Could improve understanding of humor": "Podría mejorar la comprensión del humor",
        "May struggle with native speaker speed": "Puede tener dificultades con la velocidad de hablantes nativos",
        "Could improve understanding of accents": "Podría mejorar la comprensión de acentos",
        "May struggle with native speech": "Puede tener dificultades con el habla nativa",
        "Could improve comprehension speed": "Podría mejorar la velocidad de comprensión",
        "May struggle with natural speech": "Puede tener dificultades con el habla natural",
        "Could improve listening speed": "Podría mejorar la velocidad de escucha",
        "Struggles with natural speech": "Tiene dificultades con el habla natural",
        "Limited vocabulary recognition": "Reconocimiento de vocabulario limitado",
        
        // Listening recommendations
        "Listen to various regional accents": "Escucha varios acentos regionales",
        "Practice taking notes during lectures": "Practica tomando notas durante conferencias",
        "Watch academic presentations": "Mira presentaciones académicas",
        "Watch news and documentaries": "Mira noticias y documentales",
        "Listen to podcasts": "Escucha podcasts",
        "Practice with native speaker conversations": "Practica con conversaciones de hablantes nativos",
        "Watch movies without subtitles": "Mira películas sin subtítulos",
        "Practice with different accents": "Practica con diferentes acentos",
        "Watch videos with subtitles": "Mira videos con subtítulos",
        "Listen to slow news": "Escucha noticias lentas",
        "Practice with simple conversations": "Practica con conversaciones simples",
        "Listen to slow dialogues": "Escucha diálogos lentos",
        "Practice with simple audio": "Practica con audio simple",
        "Work with basic listening exercises": "Trabaja con ejercicios básicos de escucha",
        "Listen to basic dialogues": "Escucha diálogos básicos",
        "Practice with simple songs": "Practica con canciones simples"
      };
      
      // Return translated content if available, otherwise return original
      return content.map(item => translations[item] || item);
    }
    
    // Return original content for other languages
    return content;
  };

  return (
    <Card key={rec.skill} className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{translateSkill(rec.skill)}</span>
          <div className="flex flex-col items-end">
            <span className="text-sm font-normal">{t("level")}: {rec.currentLevel}</span>
            <span className="text-sm text-gray-500">{t("score")}: {rec.lastScore}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-green-600">
              {t("strengths")}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {translateContent(rec.strengths).map((strength: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">{strength}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-yellow-600">
              {t("areasForImprovement")}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {translateContent(rec.weaknesses).map((weakness: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">{weakness}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-blue-600">
              {t("recommendations")}
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {translateContent(rec.recommendations).map((recommendation: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600">{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
