import { Survey, QuestionType, SurveyResult } from "../types";

export const MOCK_SURVEYS: Survey[] = [
  {
    id: 's1',
    title: 'Estrés Laboral y Clima (General)',
    description: 'Evaluación mensual estándar para medir los niveles de estrés y la percepción del clima organizacional.',
    questions: [
      { id: 'q1', text: 'Me siento abrumado por mi carga de trabajo actual.', type: QuestionType.LIKERT, category: 'Carga de Trabajo' },
      { id: 'q2', text: 'Tengo autonomía para decidir cómo realizar mi trabajo.', type: QuestionType.LIKERT, category: 'Autonomía' },
      { id: 'q3', text: 'Mi supervisor directo demuestra interés por mi bienestar.', type: QuestionType.LIKERT, category: 'Liderazgo' },
      { id: 'q4', text: 'Siento que mi trabajo es valorado y reconocido.', type: QuestionType.LIKERT, category: 'Reconocimiento' },
      { id: 'q5', text: 'El ambiente entre compañeros es de colaboración y confianza.', type: QuestionType.LIKERT, category: 'Clima Social' },
      { id: 'q6', text: '¿Recomendarías esta empresa como un buen lugar para trabajar?', type: QuestionType.LIKERT, category: 'eNPS' },
      { id: 'q7', text: 'Comentarios abiertos sobre el clima laboral:', type: QuestionType.TEXT }
    ]
  },
  {
    id: 's2',
    title: 'Inventario de Riesgo de Burnout',
    description: 'Detección temprana de agotamiento emocional, despersonalización y falta de realización personal.',
    questions: [
      { id: 'b1', text: 'Me siento emocionalmente agotado por mi trabajo.', type: QuestionType.LIKERT, category: 'Agotamiento' },
      { id: 'b2', text: 'Me siento cansado cuando me levanto por la mañana y tengo que ir a trabajar.', type: QuestionType.LIKERT, category: 'Agotamiento' },
      { id: 'b3', text: 'Siento que me estoy volviendo más cínico respecto a la utilidad de mi trabajo.', type: QuestionType.LIKERT, category: 'Cinismo' },
      { id: 'b4', text: 'Siento que estoy logrando muchas cosas valiosas en este trabajo.', type: QuestionType.LIKERT, category: 'Realización' },
      { id: 'b5', text: 'Siento que tengo demasiadas cosas que hacer y poco tiempo.', type: QuestionType.LIKERT, category: 'Presión Temporal' },
      { id: 'b6', text: '¿Has experimentado síntomas físicos (dolor de cabeza, insomnio) por el trabajo?', type: QuestionType.MULTIPLE_CHOICE, options: ['Nunca', 'A veces', 'Frecuentemente', 'Siempre'] }
    ]
  },
  {
    id: 's3',
    title: 'Bienestar en Trabajo Remoto/Híbrido',
    description: 'Evaluación de ergonomía, desconexión digital y aislamiento en modalidades de teletrabajo.',
    questions: [
      { id: 'r1', text: 'Tengo un espacio físico adecuado y ergonómico para trabajar en casa.', type: QuestionType.LIKERT, category: 'Ergonomía' },
      { id: 'r2', text: 'Logro desconectarme digitalmente al terminar mi jornada laboral.', type: QuestionType.LIKERT, category: 'Desconexión' },
      { id: 'r3', text: 'Me siento aislado o desconectado de mi equipo.', type: QuestionType.LIKERT, category: 'Aislamiento' },
      { id: 'r4', text: 'Las herramientas digitales que usamos facilitan mi trabajo en lugar de entorpecerlo.', type: QuestionType.LIKERT, category: 'Herramientas' },
      { id: 'r5', text: 'Siento que mi carrera profesional avanza igual que si estuviera en la oficina.', type: QuestionType.LIKERT, category: 'Desarrollo' }
    ]
  }
];

// Helper to generate fake historical data
const generateHistory = (): SurveyResult[] => {
  const history: SurveyResult[] = [];
  const baseDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() - i);
    
    // Random fluctuation simulation
    // Trend: improving slightly then dipping implies actionable insight needed
    const factor = i > 2 ? 0.5 : -0.2; 
    
    const workload = Math.min(5, Math.max(1, 3 + Math.random() + factor));
    const autonomy = Math.min(5, Math.max(1, 3.5 + Math.random()));
    const leadership = Math.min(5, Math.max(1, 4 + Math.random() * 0.5));
    const recognition = Math.min(5, Math.max(1, 2.5 + Math.random()));
    const climate = Math.min(5, Math.max(1, 4 + Math.random()));
    const enps = Math.min(5, Math.max(1, 3 + Math.random()));

    const total = (workload + autonomy + leadership + recognition + climate + enps) / 6;

    history.push({
      id: `hist_${i}`,
      surveyId: 's1',
      userId: 'user_1',
      timestamp: date.toISOString().split('T')[0],
      answers: {},
      scores: {
        'Carga de Trabajo': parseFloat(workload.toFixed(1)),
        'Autonomía': parseFloat(autonomy.toFixed(1)),
        'Liderazgo': parseFloat(leadership.toFixed(1)),
        'Reconocimiento': parseFloat(recognition.toFixed(1)),
        'Clima Social': parseFloat(climate.toFixed(1)),
        'eNPS': parseFloat(enps.toFixed(1)),
      },
      totalScore: parseFloat(total.toFixed(1))
    });
  }
  return history;
};

export const MOCK_HISTORY = generateHistory();

// Mock Benchmark Data (Company Averages)
export const MOCK_BENCHMARKS: Record<string, number> = {
  'Carga de Trabajo': 3.2,
  'Autonomía': 3.8,
  'Liderazgo': 3.5,
  'Reconocimiento': 3.0,
  'Clima Social': 4.2,
  'eNPS': 3.9,
  'Agotamiento': 2.5,
  'Cinismo': 2.0,
  'Realización': 4.0
};