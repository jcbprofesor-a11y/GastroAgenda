
import { GoogleGenAI } from "@google/genai";
import { COURSES_DATA, EVALUATIONS_DATA } from "../constants";

let client: GoogleGenAI | null = null;

const getClient = () => {
  // Use the API key exclusively from environment variable process.env.API_KEY.
  const apiKey = process.env.API_KEY;

  if (!client && apiKey) {
    client = new GoogleGenAI({ apiKey: apiKey });
  }
  return client;
};

export const generateAcademicResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<string> => {
  const genAI = getClient();
  if (!genAI) {
    console.warn("API Key no configurada o cliente no inicializado.");
    return "El asistente virtual no está conectado (Falta API Key). Por favor, consulta la información manualmente.";
  }

  const contextData = JSON.stringify({ courses: COURSES_DATA, evaluations: EVALUATIONS_DATA });

  const systemInstruction = `
    Eres un asistente académico experto para una Escuela de Hostelería.
    Tu objetivo es ayudar a docentes y alumnos con la planificación del curso 2025-2026.
    Tienes acceso a los siguientes datos estructurados del curso en formato JSON:
    ${contextData}

    Reglas:
    1. Responde preguntas sobre fechas de exámenes, contenido de unidades y estado del curso.
    2. Si preguntan por "Productos Culinarios", refiere a los datos del módulo.
    3. Si preguntan por sostenibilidad, refiere a la optativa.
    4. Sé profesional, conciso y motivador.
    5. Si detectas una unidad retrasada (status: 'Retrasado'), sugiere estrategias para recuperar tiempo.
    6. Formatea las respuestas usando Markdown para listas o negritas.
  `;

  try {
    // Changed model to 'gemini-3-flash-preview' for basic academic reasoning tasks.
    // Passed the full history + new message to ensure context continuity.
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    return response.text || "Lo siento, no pude generar una respuesta.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al conectar con el asistente virtual. Verifica tu clave API.";
  }
};
