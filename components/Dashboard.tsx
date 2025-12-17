import React, { useState } from 'react';
import { SurveyResult, KPIMetric, ChartDataPoint, RadarDataPoint } from '../types';
import { MOCK_BENCHMARKS } from '../services/mockData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, TrendingDown, BrainCircuit, Loader2, 
  AlertTriangle, CheckCircle, Target, Users, Zap
} from 'lucide-react';
import { generatePsychosocialInsight } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Assuming standard text rendering, but using simple div for now

interface DashboardProps {
  results: SurveyResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ results }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in">
        <div className="bg-slate-100 p-8 rounded-full mb-6">
          <BrainCircuit className="text-slate-400" size={64} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Tu viaje de bienestar comienza aquí</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Completa tu primera evaluación para desbloquear métricas de estrés, comparativas organizacionales y prevención de burnout.
        </p>
      </div>
    );
  }

  // --- Data Processing ---
  const sortedResults = [...results].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const latest = sortedResults[sortedResults.length - 1];
  const previous = sortedResults.length > 1 ? sortedResults[sortedResults.length - 2] : null;

  // Calculate Aggregates
  const calculateBurnoutRisk = (scores: Record<string, number>) => {
    // Logic: High workload + Low Autonomy/Recognition = Risk
    const workload = scores['Carga de Trabajo'] || 3;
    const exhaustion = scores['Agotamiento'] || workload; // Fallback if survey 2 not done
    const support = scores['Apoyo'] || scores['Liderazgo'] || 3;
    
    // Risk formula (0-100)
    let risk = ((exhaustion * 1.5) + (6 - support)) / 2.5 * 20; 
    risk = Math.min(100, Math.max(0, risk));
    return risk;
  };

  const burnoutRisk = calculateBurnoutRisk(latest.scores);
  const getRiskLevel = (risk: number) => {
    if (risk < 40) return { label: 'Saludable', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' };
    if (risk < 70) return { label: 'Riesgo Moderado', color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' };
    return { label: 'Riesgo Alto', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
  };
  const riskMeta = getRiskLevel(burnoutRisk);

  // --- Charts Data ---
  const lineData: ChartDataPoint[] = sortedResults.map(r => ({
    date: new Date(r.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    value: r.totalScore
  }));

  const radarData: RadarDataPoint[] = Object.keys(latest.scores).map(key => ({
    subject: key,
    A: latest.scores[key],
    fullMark: 5
  }));

  // Benchmark Data
  const benchmarkData = Object.keys(latest.scores).slice(0, 5).map(key => ({
    name: key,
    Usuario: latest.scores[key],
    Empresa: MOCK_BENCHMARKS[key] || 3.5 // Fallback benchmark
  }));

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const text = await generatePsychosocialInsight(sortedResults, latest);
    setInsight(text);
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-200 pb-6">
        <div>
           <div className="flex items-center space-x-2 text-teal-600 font-semibold mb-1">
             <Target size={20} />
             <span className="uppercase tracking-wider text-xs">Visión 360°</span>
           </div>
           <h2 className="text-3xl font-bold text-slate-800">Panel Ejecutivo de Bienestar</h2>
           <p className="text-slate-500 mt-1">Monitoreo en tiempo real de indicadores psicosociales clave.</p>
        </div>
        <button
          onClick={handleGenerateInsight}
          disabled={loadingInsight}
          className="group flex items-center space-x-2 bg-slate-900 text-white px-5 py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 hover:bg-slate-800"
        >
          {loadingInsight ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} className="text-teal-400" />}
          <span className="font-medium">{insight ? 'Actualizar Análisis' : 'Generar Reporte IA'}</span>
        </button>
      </div>

      {/* AI Insight Section - Styled as a Report */}
      {(insight || loadingInsight) && (
        <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
           <h3 className="text-indigo-900 font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
             <BrainCircuit size={20} /> Informe Estratégico del Agente IA
           </h3>
           {loadingInsight ? (
             <div className="flex flex-col items-center justify-center py-8 space-y-4 text-indigo-400">
               <Loader2 className="animate-spin" size={32} />
               <p className="font-medium">Procesando millones de puntos de datos psicosociales...</p>
             </div>
           ) : (
             <div className="prose prose-indigo max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed relative z-10 text-sm md:text-base">
               {insight}
             </div>
           )}
        </div>
      )}

      {/* Top Cards Row: Burnout Risk & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Burnout Risk Meter (Big Card) */}
        <div className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Nivel de Riesgo de Burnout</h4>
              <p className="text-xs text-slate-500">Basado en carga, autonomía y recuperación.</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${riskMeta.bg} ${riskMeta.text}`}>
              {riskMeta.label}
            </div>
          </div>
          
          <div className="relative pt-6 pb-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Bajo</span>
              <span>Crítico</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${riskMeta.color}`} 
                style={{ width: `${burnoutRisk}%` }}
              ></div>
            </div>
            {/* Needle/Marker simulation */}
            <div 
              className="absolute top-5 w-1 h-6 bg-slate-800 border-2 border-white shadow-md z-10 transition-all duration-1000"
              style={{ left: `${burnoutRisk}%` }}
            ></div>
          </div>

          <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-3">
             <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
             <p className="text-xs text-slate-600">
               {burnoutRisk > 50 
                 ? "Alerta: Tus niveles de carga cognitiva están elevados. Se recomienda una sesión de desconexión estratégica." 
                 : "Tus métricas de resiliencia son estables. Mantén tus rutinas de recuperación."}
             </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wellness Score */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex items-center space-x-3 mb-2">
                 <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                    <Zap size={20} />
                 </div>
                 <span className="text-sm font-semibold text-slate-500">Bienestar General</span>
               </div>
               <div className="flex items-end gap-2">
                 <span className="text-4xl font-bold text-slate-800">{latest.totalScore.toFixed(1)}</span>
                 <span className="text-sm text-slate-400 mb-1">/ 5.0</span>
               </div>
               <div className="mt-2 text-xs font-medium text-green-600 flex items-center">
                 <TrendingUp size={12} className="mr-1" />
                 +5% vs mes anterior
               </div>
            </div>

            {/* eNPS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex items-center space-x-3 mb-2">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Users size={20} />
                 </div>
                 <span className="text-sm font-semibold text-slate-500">eNPS (Lealtad)</span>
               </div>
               <div className="flex items-end gap-2">
                 <span className="text-4xl font-bold text-slate-800">
                   {(latest.scores['eNPS'] ? (latest.scores['eNPS'] * 20 - 10) : 40).toFixed(0)}
                 </span>
                 <span className="text-sm text-slate-400 mb-1">NPS</span>
               </div>
               <div className="mt-2 text-xs font-medium text-slate-500">
                 Promotor Pasivo
               </div>
            </div>
            
            {/* Simulated Action Plan */}
            <div className="sm:col-span-2 bg-indigo-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
                <div>
                   <h4 className="font-bold text-lg mb-1">Plan de Acción Semanal</h4>
                   <p className="text-indigo-200 text-xs">2 de 3 objetivos completados</p>
                </div>
                <div className="flex -space-x-2">
                   {/* Avatars or Checks */}
                   <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-indigo-900 flex items-center justify-center text-indigo-900 font-bold text-xs"><CheckCircle size={16}/></div>
                   <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-indigo-900 flex items-center justify-center text-indigo-900 font-bold text-xs"><CheckCircle size={16}/></div>
                   <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-indigo-900 flex items-center justify-center text-xs">3</div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparative Benchmark Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Comparativa Organizacional</h3>
            <p className="text-sm text-slate-500">Tus resultados vs. Promedio de la Empresa</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} domain={[0, 5]} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Usuario" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={20} name="Tú" />
                <Bar dataKey="Empresa" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} name="Promedio Empresa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimensional Radar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Mapa de Equilibrio</h3>
            <p className="text-sm text-slate-500">Distribución de tu energía psicosocial</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name="Actual"
                  dataKey="A"
                  stroke="#0d9488"
                  fill="#14b8a6"
                  fillOpacity={0.3}
                />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Historical Line Chart (Full Width) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Tendencia de Bienestar</h3>
            <p className="text-sm text-slate-500">Evolución de tus indicadores clave en los últimos 6 meses</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#6366f1' }} 
                  activeDot={{ r: 7, strokeWidth: 0, fill: '#818cf8' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
      </div>

    </div>
  );
};

export default Dashboard;