
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
        "Can recognize familiar words": "Puede reconocer palabras familiares",
        "Can read very simple texts": "Puede leer textos muy simples",
        "Understands basic signs": "Entiende señales básicas",
        
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
        "Limited vocabulary range": "Rango de vocabulario limitado",
        "Struggles with longer words": "Dificultades con palabras más largas",
        
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
        "Start with picture books": "Comienza con libros ilustrados",
        "Learn basic vocabulary": "Aprende vocabulario básico",
        "Practice with flashcards": "Practica con tarjetas de memoria",
        
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
        "Can write simple words": "Puede escribir palabras simples",
        "Can fill in basic forms": "Puede completar formularios básicos",
        "Can copy text": "Puede copiar texto",
        
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
        "Limited sentence formation": "Formación de oraciones limitada",
        "Basic grammar needs work": "La gramática básica necesita trabajo",
        
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
        "Practice writing simple words": "Practica escribiendo palabras simples",
        "Copy short texts": "Copia textos cortos",
        "Learn basic sentence patterns": "Aprende patrones básicos de oraciones",
        
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
        "Can understand main points in listening": "Puede entender puntos principales al escuchar", // Updated to make unique
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
        "Struggles with natural speech in listening": "Tiene dificultades con el habla natural al escuchar", // Updated to make unique
        "Limited vocabulary recognition in listening": "Reconocimiento de vocabulario limitado al escuchar", // Updated to make unique
        
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
        "Practice with simple conversations for listening": "Practica con conversaciones simples para escuchar", // Updated to make unique
        "Listen to slow dialogues": "Escucha diálogos lentos",
        "Practice with simple audio": "Practica con audio simple",
        "Work with basic listening exercises": "Trabaja con ejercicios básicos de escucha",
        "Listen to basic dialogues": "Escucha diálogos básicos",
        "Practice with simple songs": "Practica con canciones simples"
      };
      
      // Return translated content if available, otherwise return original
      return content.map(item => translations[item] || item);
    }
    
    if (currentLanguage === "portuguese") {
      // Map of English phrases to Portuguese translations
      const translations: Record<string, string> = {
        // Reading strengths
        "Excellent comprehension of complex academic texts": "Excelente compreensão de textos acadêmicos complexos",
        "Strong ability to understand nuanced meanings": "Grande capacidade de entender significados com nuances",
        "Can process information from multiple sources efficiently": "Pode processar informações de múltiplas fontes eficientemente",
        "Can understand main ideas of complex text": "Pode entender as ideias principais de textos complexos",
        "Good reading speed": "Boa velocidade de leitura",
        "Can scan for specific information": "Pode escanear em busca de informações específicas",
        "Can understand main points": "Pode entender os pontos principais",
        "Good comprehension of simple texts": "Boa compreensão de textos simples",
        "Can find specific information": "Pode encontrar informações específicas",
        "Can understand short texts": "Pode entender textos curtos",
        "Good comprehension of basic information": "Boa compreensão de informações básicas",
        "Can read simple messages": "Pode ler mensagens simples",
        "Can understand complex texts": "Pode entender textos complexos",
        "Good understanding of implicit meaning": "Boa compreensão de significados implícitos",
        "Strong vocabulary knowledge": "Forte conhecimento de vocabulário",
        "Can recognize familiar words": "Pode reconhecer palavras familiares",
        "Can read very simple texts": "Pode ler textos muito simples",
        "Understands basic signs": "Entende sinais básicos",
        
        // Reading weaknesses
        "May still encounter specialized technical vocabulary in specific fields": "Pode ainda encontrar vocabulário técnico especializado em campos específicos",
        "Could improve speed reading techniques": "Poderia melhorar técnicas de leitura rápida",
        "May struggle with academic texts": "Pode ter dificuldades com textos acadêmicos",
        "Could improve vocabulary range": "Poderia melhorar a variedade de vocabulário",
        "May struggle with complex texts": "Pode ter dificuldades com textos complexos",
        "Could improve reading speed": "Poderia melhorar a velocidade de leitura",
        "May struggle with longer texts": "Pode ter dificuldades com textos mais longos",
        "Could improve vocabulary": "Poderia melhorar o vocabulário",
        "May struggle with highly technical texts": "Pode ter dificuldades com textos altamente técnicos",
        "Limited vocabulary range": "Variedade de vocabulário limitada",
        "Struggles with longer words": "Dificuldades com palavras mais longas",
        
        // Reading recommendations
        "Read academic journals and research papers": "Leia revistas acadêmicas e trabalhos de pesquisa",
        "Practice speed reading techniques": "Pratique técnicas de leitura rápida",
        "Focus on specialized technical vocabulary in your field": "Concentre-se em vocabulário técnico especializado em seu campo",
        "Read newspaper articles": "Leia artigos de jornais",
        "Practice with academic texts": "Pratique com textos acadêmicos",
        "Build vocabulary through reading": "Desenvolva vocabulário através da leitura",
        "Read graded readers": "Leia livros graduados",
        "Practice with authentic materials": "Pratique com materiais autênticos",
        "Build vocabulary systematically": "Desenvolva vocabulário sistematicamente",
        "Read short stories": "Leia contos curtos",
        "Practice with simple texts": "Pratique com textos simples",
        "Build basic vocabulary": "Desenvolva vocabulário básico",
        "Read professional publications": "Leia publicações profissionais",
        "Practice skimming and scanning": "Pratique leitura diagonal e busca específica",
        "Focus on academic vocabulary": "Concentre-se em vocabulário acadêmico",
        "Start with picture books": "Comece com livros ilustrados",
        "Learn basic vocabulary": "Aprenda vocabulário básico",
        "Practice with flashcards": "Pratique com cartões de memória",
        
        // Writing strengths
        "Can produce clear, well-structured complex texts": "Pode produzir textos complexos claros e bem estruturados",
        "Excellent command of writing styles and tone": "Excelente domínio de estilos de escrita e tom",
        "Strong argumentative writing skills": "Fortes habilidades de escrita argumentativa",
        "Can write clear detailed texts": "Pode escrever textos detalhados e claros",
        "Good organization of ideas": "Boa organização de ideias",
        "Strong argumentative writing": "Escrita argumentativa forte",
        "Can write clear detailed text": "Pode escrever texto detalhado e claro",
        "Good paragraph organization": "Boa organização de parágrafos",
        "Can express opinions": "Pode expressar opiniões",
        "Can write simple connected text": "Pode escrever texto conectado simples",
        "Good basic vocabulary": "Bom vocabulário básico",
        "Can describe experiences": "Pode descrever experiências",
        "Can write short messages": "Pode escrever mensagens curtas",
        "Good basic sentences": "Boas frases básicas",
        "Can fill out forms": "Pode preencher formulários",
        "Can write simple words": "Pode escrever palavras simples",
        "Can fill in basic forms": "Pode preencher formulários básicos",
        "Can copy text": "Pode copiar texto",
        
        // Writing weaknesses
        "May need to refine specific genre writing": "Pode precisar refinar a escrita de gêneros específicos",
        "Could improve creative writing techniques": "Poderia melhorar técnicas de escrita criativa",
        "May need work on academic writing": "Pode precisar trabalhar na escrita acadêmica",
        "Could improve formal style": "Poderia melhorar o estilo formal",
        "May need work on coherence": "Pode precisar trabalhar na coerência",
        "Could improve formal writing": "Poderia melhorar a escrita formal",
        "May need work on structure": "Pode precisar trabalhar na estrutura",
        "Could improve grammar accuracy": "Poderia melhorar a precisão gramatical",
        "May need work on sentence structure": "Pode precisar trabalhar na estrutura de frases",
        "Could improve grammar basics": "Poderia melhorar os fundamentos gramaticais",
        "Limited sentence formation": "Formação de frases limitada",
        "Basic grammar needs work": "A gramática básica precisa de trabalho",
        
        // Writing recommendations
        "Practice writing in different genres": "Pratique a escrita em diferentes gêneros",
        "Experiment with creative writing": "Experimente com escrita criativa",
        "Focus on stylistic refinement": "Concentre-se no refinamento estilístico",
        "Practice academic writing": "Pratique escrita acadêmica",
        "Work on formal email writing": "Trabalhe na escrita formal de e-mails",
        "Study advanced grammar structures": "Estude estruturas gramaticais avançadas",
        "Practice writing essays": "Pratique escrevendo ensaios",
        "Work on linking words": "Trabalhe em palavras de ligação",
        "Study formal writing styles": "Estude estilos de escrita formal",
        "Practice writing descriptions": "Pratique escrevendo descrições",
        "Work on connecting sentences": "Trabalhe em conectar frases",
        "Study basic paragraph structure": "Estude a estrutura básica de parágrafos",
        "Practice writing notes": "Pratique escrevendo notas",
        "Work on simple sentences": "Trabalhe em frases simples",
        "Study basic grammar": "Estude gramática básica",
        "Practice writing simple words": "Pratique escrevendo palavras simples",
        "Copy short texts": "Copie textos curtos",
        "Learn basic sentence patterns": "Aprenda padrões básicos de frases",
        
        // Speaking strengths
        "Natural and fluent expression": "Expressão natural e fluente",
        "Excellent command of idiomatic expressions": "Excelente domínio de expressões idiomáticas",
        "Can handle complex discussions effectively": "Pode lidar com discussões complexas efetivamente",
        "Fluent expression on complex topics": "Expressão fluente em tópicos complexos",
        "Good use of connectors": "Bom uso de conectores",
        "Clear pronunciation": "Pronúncia clara",
        "Can interact with fluency": "Pode interagir com fluência",
        "Good range of vocabulary": "Boa variedade de vocabulário",
        "Can express opinions clearly": "Pode expressar opiniões claramente",
        "Can communicate on familiar topics": "Pode comunicar-se sobre tópicos familiares",
        "Good basic fluency": "Boa fluência básica",
        "Can handle simple exchanges": "Pode lidar com trocas simples",
        "Good basic phrases": "Boas frases básicas",
        "Can ask simple questions": "Pode fazer perguntas simples",
        "Can use basic phrases": "Pode usar frases básicas",
        "Can introduce self": "Pode apresentar-se",
        
        // Speaking weaknesses
        "May need to refine accent for specific contexts": "Pode precisar refinar o sotaque para contextos específicos",
        "Could improve public speaking skills": "Poderia melhorar habilidades de falar em público",
        "May need work on presentation skills": "Pode precisar trabalhar em habilidades de apresentação",
        "Could improve idiom usage": "Poderia melhorar o uso de expressões idiomáticas",
        "May need work on pronunciation": "Pode precisar trabalhar na pronúncia",
        "Could improve fluency": "Poderia melhorar a fluência",
        "May need work on basic pronunciation": "Pode precisar trabalhar na pronúncia básica",
        "Could improve basic vocabulary": "Poderia melhorar o vocabulário básico",
        "Limited vocabulary": "Vocabulário limitado",
        "Basic pronunciation needs work": "A pronúncia básica precisa de trabalho",
        
        // Speaking recommendations
        "Practice public speaking": "Pratique falar em público",
        "Join advanced debate clubs": "Junte-se a clubes de debate avançados",
        "Work on pronunciation of specific sounds": "Trabalhe na pronúncia de sons específicos",
        "Give presentations regularly": "Faça apresentações regularmente",
        "Practice using idioms": "Pratique o uso de expressões idiomáticas",
        "Join conversation groups": "Junte-se a grupos de conversação",
        "Practice pronunciation exercises": "Pratique exercícios de pronúncia",
        "Join speaking clubs": "Junte-se a clubes de conversação",
        "Record yourself speaking": "Grave-se falando",
        "Practice common conversations": "Pratique conversas comuns",
        "Work on pronunciation": "Trabalhe na pronúncia",
        "Build everyday vocabulary": "Desenvolva vocabulário cotidiano",
        "Practice basic conversations": "Pratique conversas básicas",
        "Learn common phrases": "Aprenda frases comuns",
        "Work on pronunciation basics": "Trabalhe nos fundamentos de pronúncia",
        "Learn basic greetings": "Aprenda saudações básicas",
        "Practice numbers and colors": "Pratique números e cores",
        "Repeat common phrases": "Repita frases comuns",
        
        // Listening strengths
        "Can understand complex academic lectures": "Pode entender palestras acadêmicas complexas",
        "Excellent comprehension of native speakers": "Excelente compreensão de falantes nativos",
        "Strong ability to understand different accents": "Forte habilidade para entender diferentes sotaques",
        "Can follow complex arguments": "Pode seguir argumentos complexos",
        "Good understanding of native speakers": "Boa compreensão de falantes nativos",
        "Can follow abstract discussions": "Pode seguir discussões abstratas",
        "Can understand main ideas": "Pode entender ideias principais",
        "Good comprehension of standard speech": "Boa compreensão de fala padrão",
        "Can follow detailed instructions": "Pode seguir instruções detalhadas",
        "Can understand main points in listening": "Pode entender pontos principais ao ouvir",
        "Good comprehension of clear speech": "Boa compreensão de fala clara",
        "Can follow simple instructions": "Pode seguir instruções simples",
        "Can understand basic phrases": "Pode entender frases básicas",
        "Good comprehension of slow speech": "Boa compreensão de fala lenta",
        "Can follow simple directions": "Pode seguir direções simples",
        "Can understand basic greetings": "Pode entender saudações básicas",
        "Recognizes familiar words": "Reconhece palavras familiares",
        "Can follow very simple instructions": "Pode seguir instruções muito simples",
        
        // Listening weaknesses
        "May struggle with very specific regional dialects": "Pode ter dificuldades com dialetos regionais muito específicos",
        "Could improve note-taking skills": "Poderia melhorar habilidades de tomar notas",
        "May struggle with fast speech": "Pode ter dificuldades com fala rápida",
        "Could improve understanding of humor": "Poderia melhorar a compreensão de humor",
        "May struggle with native speaker speed": "Pode ter dificuldades com a velocidade de falantes nativos",
        "Could improve understanding of accents": "Poderia melhorar a compreensão de sotaques",
        "May struggle with native speech": "Pode ter dificuldades com fala nativa",
        "Could improve comprehension speed": "Poderia melhorar a velocidade de compreensão",
        "May struggle with natural speech": "Pode ter dificuldades com fala natural",
        "Could improve listening speed": "Poderia melhorar a velocidade de escuta",
        "Struggles with natural speech in listening": "Tem dificuldades com fala natural ao ouvir",
        "Limited vocabulary recognition in listening": "Reconhecimento de vocabulário limitado ao ouvir",
        
        // Listening recommendations
        "Listen to various regional accents": "Escute vários sotaques regionais",
        "Practice taking notes during lectures": "Pratique tomar notas durante palestras",
        "Watch academic presentations": "Assista apresentações acadêmicas",
        "Watch news and documentaries": "Assista notícias e documentários",
        "Listen to podcasts": "Escute podcasts",
        "Practice with native speaker conversations": "Pratique com conversas de falantes nativos",
        "Watch movies without subtitles": "Assista filmes sem legendas",
        "Practice with different accents": "Pratique com diferentes sotaques",
        "Watch videos with subtitles": "Assista vídeos com legendas",
        "Listen to slow news": "Escute notícias lentas",
        "Practice with simple conversations for listening": "Pratique com conversas simples para escutar",
        "Listen to slow dialogues": "Escute diálogos lentos",
        "Practice with simple audio": "Pratique com áudio simples",
        "Work with basic listening exercises": "Trabalhe com exercícios básicos de escuta",
        "Listen to basic dialogues": "Escute diálogos básicos",
        "Practice with simple songs": "Pratique com canções simples"
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
