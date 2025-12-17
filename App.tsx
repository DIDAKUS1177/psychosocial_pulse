import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SurveyForm from './components/SurveyForm';
import { User, SurveyResult, Survey } from './types';
import { MOCK_HISTORY, MOCK_SURVEYS } from './services/mockData';
import { processSurveyImageOCR } from './services/geminiService';
import { ClipboardList, PlayCircle, ShieldCheck, HeartHandshake, Camera, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // State for "Routing"
  const [currentView, setCurrentView] = useState('login'); // login, register, dashboard, surveys, taking_survey
  
  // State for Data
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [ocrAnswers, setOcrAnswers] = useState<Record<string, string | number> | undefined>(undefined);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSurveyForOCR, setSelectedSurveyForOCR] = useState<Survey | null>(null);
  
  // Auth Form State
  const [email, setEmail] = useState('demo@user.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('John Doe');

  // Load initial mock data
  useEffect(() => {
    // In a real app, we'd fetch from Firestore here
    setResults(MOCK_HISTORY);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate Firebase Auth
    if (email && password) {
      setUser({
        id: 'user_1',
        email,
        name: name || 'Demo User',
        registeredAt: new Date().toISOString()
      });
      setCurrentView('dashboard');
    }
  };

  const handleSurveyComplete = (result: SurveyResult) => {
    setResults(prev => [...prev, result]);
    setCurrentView('dashboard');
    setActiveSurvey(null);
    setOcrAnswers(undefined);
  };

  const startSurvey = (survey: Survey) => {
    setActiveSurvey(survey);
    setOcrAnswers(undefined);
    setCurrentView('taking_survey');
  };

  const triggerOCR = (survey: Survey) => {
    setSelectedSurveyForOCR(survey);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedSurveyForOCR) {
      setIsProcessingOcr(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Strip the data:image/jpeg;base64, part for Gemini if needed, but the service handles it usually via inlineData logic
        // For inlineData we need pure base64
        const base64Data = base64String.split(',')[1];
        
        const extractedAnswers = await processSurveyImageOCR(base64Data, selectedSurveyForOCR.questions);
        
        setIsProcessingOcr(false);
        if (extractedAnswers) {
          setOcrAnswers(extractedAnswers);
          setActiveSurvey(selectedSurveyForOCR);
          setCurrentView('taking_survey');
        } else {
          alert("No se pudieron detectar respuestas en la imagen. Intenta con una foto más clara.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Render Login/Register
  if (!user || currentView === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col md:flex-row max-w-4xl">
           {/* Left/Top Branding */}
           <div className="bg-teal-600 p-8 md:w-1/2 flex flex-col justify-center text-white">
              <div className="mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-bold mb-2">PsychoSocial Pulse</h1>
                <p className="text-teal-100">Analítica de bienestar segura y profesional para la fuerza laboral moderna.</p>
              </div>
              <ul className="space-y-3 text-sm text-teal-50">
                <li className="flex items-center"><span className="w-2 h-2 bg-white rounded-full mr-2"/>Rastrea tendencias de estrés</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-white rounded-full mr-2"/>Insights emocionales con IA</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-white rounded-full mr-2"/>Datos anónimos y seguros</li>
              </ul>
              
              <div className="mt-8 pt-6 border-t border-teal-500/50 flex items-center space-x-2 text-xs text-teal-200">
                <HeartHandshake size={14} />
                <span>By Katerine Guañarita & Diego Hernandez</span>
              </div>
           </div>

           {/* Form */}
           <div className="p-8 md:w-1/2">
             <h2 className="text-xl font-bold text-slate-800 mb-6">Iniciar Sesión</h2>
             <form onSubmit={handleLogin} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                 <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="name@company.com"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                 <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="••••••••"
                 />
               </div>
               <button 
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors"
               >
                 Acceder al Panel
               </button>
             </form>
             <div className="mt-6 text-center text-xs text-slate-400">
               Modo Demo: Usa cualquier email
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={() => { setUser(null); setCurrentView('login'); }}
      currentView={currentView}
      onChangeView={setCurrentView}
    >
      {/* Hidden File Input for OCR */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* OCR Loading Overlay */}
      {isProcessingOcr && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
           <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
             <Loader2 size={40} className="text-teal-600 animate-spin mb-4" />
             <h3 className="text-lg font-bold text-slate-800">Analizando Imagen...</h3>
             <p className="text-sm text-slate-500">Detectando respuestas con IA Vision</p>
           </div>
        </div>
      )}

      {currentView === 'dashboard' && <Dashboard results={results} />}
      
      {currentView === 'surveys' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Evaluaciones Disponibles</h2>
            <p className="text-slate-500">Selecciona una evaluación para actualizar tu perfil psicosocial.</p>
          </div>
          <div className="grid gap-6">
            {MOCK_SURVEYS.map(survey => (
              <div key={survey.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center group gap-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-teal-50 p-3 rounded-lg text-teal-600 group-hover:bg-teal-100 transition-colors">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{survey.title}</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-md">{survey.description}</p>
                    <div className="mt-3 flex items-center space-x-4 text-xs font-medium text-slate-400">
                      <span>{survey.questions.length} Preguntas</span>
                      <span>~5 Minutos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                   {/* OCR Button */}
                   <button
                    onClick={() => triggerOCR(survey)}
                    className="flex-1 md:flex-none border border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    title="Escanear encuesta en papel"
                  >
                    <Camera size={18} />
                    <span className="md:hidden lg:inline">Escanear Foto (OCR)</span>
                  </button>

                  <button
                    onClick={() => startSurvey(survey)}
                    className="flex-1 md:flex-none bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors"
                  >
                    <PlayCircle size={18} />
                    <span>Iniciar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'taking_survey' && activeSurvey && (
        <SurveyForm 
          survey={activeSurvey} 
          userId={user.id}
          onComplete={handleSurveyComplete}
          onCancel={() => { setActiveSurvey(null); setCurrentView('surveys'); setOcrAnswers(undefined); }}
          initialAnswers={ocrAnswers}
        />
      )}
    </Layout>
  );
};

export default App;