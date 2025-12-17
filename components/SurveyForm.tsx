import React, { useState, useEffect } from 'react';
import { Survey, QuestionType, SurveyResult } from '../types';
import { ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface SurveyFormProps {
  survey: Survey;
  userId: string;
  onComplete: (result: SurveyResult) => void;
  onCancel: () => void;
  initialAnswers?: Record<string, string | number>; // For OCR pre-fill
}

const SurveyForm: React.FC<SurveyFormProps> = ({ survey, userId, onComplete, onCancel, initialAnswers }) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (initialAnswers) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  const handleAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateResults = (): SurveyResult => {
    const scores: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let totalScoreSum = 0;
    let totalLikertQuestions = 0;

    survey.questions.forEach(q => {
      if (q.type === QuestionType.LIKERT && answers[q.id]) {
        const val = Number(answers[q.id]);
        
        // Category Aggregation
        if (q.category) {
            scores[q.category] = (scores[q.category] || 0) + val;
            categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
        }
        
        totalScoreSum += val;
        totalLikertQuestions++;
      }
    });

    // Average out category scores
    Object.keys(scores).forEach(cat => {
      scores[cat] = parseFloat((scores[cat] / categoryCounts[cat]).toFixed(1));
    });

    const totalScore = totalLikertQuestions > 0 ? parseFloat((totalScoreSum / totalLikertQuestions).toFixed(1)) : 0;

    return {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      surveyId: survey.id,
      timestamp: new Date().toISOString(),
      answers,
      scores,
      totalScore
    };
  };

  const isLastQuestion = currentStep === survey.questions.length - 1;
  const currentQuestion = survey.questions[currentStep];
  const progress = ((currentStep + 1) / survey.questions.length) * 100;

  const handleNext = () => {
    if (isLastQuestion) {
      const result = calculateResults();
      onComplete(result);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const canProceed = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header with Progress */}
        <div className="bg-slate-900 px-8 py-6 text-white">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold">{survey.title}</h2>
             <span className="text-slate-400 text-sm">{currentStep + 1} de {survey.questions.length}</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
                className="bg-teal-400 h-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="p-8 min-h-[400px] flex flex-col">
          <div className="flex-1">
             <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-4 uppercase tracking-wider">
               {currentQuestion.category || currentQuestion.type.replace('_', ' ')}
             </span>
             <h3 className="text-2xl font-medium text-slate-900 mb-8 leading-snug">
               {currentQuestion.text}
             </h3>

             {/* Dynamic Input based on Type */}
             <div className="mt-6">
                {currentQuestion.type === QuestionType.LIKERT && (
                  <div className="space-y-6">
                    <div className="flex justify-between text-sm text-slate-500 font-medium px-1">
                      <span>Totalmente en Desacuerdo</span>
                      <span>Totalmente de Acuerdo</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleAnswer(currentQuestion.id, val)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 
                            ${answers[currentQuestion.id] === val 
                              ? 'bg-teal-600 text-white shadow-lg scale-110 ring-4 ring-teal-100' 
                              : 'bg-white text-slate-400 border border-slate-200 hover:border-teal-300 hover:text-teal-600'
                            }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    {answers[currentQuestion.id] && (
                        <p className="text-center text-teal-700 font-medium">
                            Valoración: {answers[currentQuestion.id]}/5
                        </p>
                    )}
                  </div>
                )}

                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
                  <div className="grid gap-3">
                    {currentQuestion.options?.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(currentQuestion.id, opt)}
                        className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                          answers[currentQuestion.id] === opt
                            ? 'bg-teal-50 border-teal-500 text-teal-900 font-medium ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === QuestionType.TEXT && (
                  <textarea
                    rows={5}
                    className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none text-slate-700"
                    placeholder="Escribe tu respuesta aquí..."
                    value={answers[currentQuestion.id] as string || ''}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  />
                )}
             </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
            <button 
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center space-x-2 px-8 py-3 rounded-full font-bold text-white transition-all transform ${
                canProceed 
                  ? 'bg-slate-900 hover:bg-slate-800 shadow-lg hover:-translate-y-0.5' 
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <span>{isLastQuestion ? 'Enviar Evaluación' : 'Siguiente'}</span>
              {isLastQuestion ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;