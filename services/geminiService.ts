import { GoogleGenAI, Type } from "@google/genai";
import { SurveyResult, Question } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generatePsychosocialInsight = async (
  results: SurveyResult[],
  latestResult: SurveyResult
): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "Insights de IA no disponibles. Configura tu API_KEY.";

  const prompt = `
    Eres un consultor de Recursos Humanos y Psicólogo Organizacional Senior (Agente IA).
    Analiza los datos del usuario.
    
    Puntajes actuales (1-5): ${JSON.stringify(latestResult.scores)}
    Tendencia (Total histórico): ${results.map(r => r.totalScore).join(' -> ')}

    Genera una respuesta en formato JSON (pero devuélvela como texto plano, yo la parsearé mentalmente o úsala para estructurar tu texto) que contenga 3 secciones claras en ESPAÑOL y formateadas en Markdown simple:

    1. **Análisis Personal:** Breve estado del bienestar del empleado (tono empático).
    2. **Riesgos Latentes:** ¿Hay peligro de burnout o rotación basado en los datos?
    3. **Recomendación Estratégica:** Un consejo accionable para que el empleado mejore su situación hoy mismo.

    Mantén el texto total bajo 150 palabras. Sé directo y profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "El Agente de IA está analizando patrones complejos... Intenta nuevamente.";
  }
};

export const processSurveyImageOCR = async (
  base64Image: string,
  questions: Question[]
): Promise<Record<string, string | number> | null> => {
  const ai = initGenAI();
  if (!ai) return null;

  const questionList = questions.map(q => `ID: ${q.id}, Pregunta: "${q.text}", Tipo: ${q.type}, Opciones: ${q.options?.join(', ')}`).join('\n');

  const prompt = `
    Analiza esta imagen de encuesta. Extrae las respuestas.
    Contexto de preguntas:
    ${questionList}
    
    Devuelve JSON puro: {"q1": 5, "q2": "Opción A"}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;

  } catch (error) {
    console.error("Error OCR Gemini:", error);
    return null;
  }
};