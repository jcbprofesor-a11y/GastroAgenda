
import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  ComposedChart, Line
} from 'recharts';
import { Course, UnitStatus, Evaluation, ClassLog, Exam } from '../types';
import {
  Calendar, AlertTriangle, CheckCircle, BookOpen, Clock,
  ClipboardCheck, TrendingUp, ChefHat, GraduationCap,
  Zap, ArrowRight, Layers, ShoppingCart, Utensils, FileText, Bell, Plus
} from 'lucide-react';
import { CALENDAR_EVENTS } from '../constants';
import { useMemo, useState, useEffect } from 'react';

interface DashboardProps {
  courses: Course[];
  evaluations: Evaluation[];
  logs: ClassLog[];

  exams: Exam[];
  onNavigate: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, evaluations, logs, exams, onNavigate }) => {

  // --- STATE FOR EVENTS (Ideally passed as prop, but reading from localStorage for now to pick up changes) ---
  // In a real app, this should come from App.tsx state. 
  // We'll try to read from localStorage if available to show the new constants events we just added.
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gastro_events');
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      // Fallback to the constants which we just updated
      setEvents(CALENDAR_EVENTS);
    }
  }, []);

  // --- DATA CALCULATIONS ---

  const allUnits = useMemo(() => courses.flatMap(c => c.units), [courses]);
  const stats = useMemo(() => {
    return {
      totalUnits: allUnits.length,
      completed: allUnits.filter(u => u.status === UnitStatus.COMPLETED).length,
      inProgress: allUnits.filter(u => u.status === UnitStatus.IN_PROGRESS).length,
      delayed: allUnits.filter(u => u.status === UnitStatus.DELAYED).length,
      pending: allUnits.filter(u => u.status === UnitStatus.PENDING).length,
      totalHoursPlanned: courses.reduce((acc, c) => acc + c.annualHours, 0),
      totalHoursLogged: logs.reduce((acc, l) => acc + l.hours, 0) + exams.reduce((acc, ex) => acc + (ex.duration || 0), 0),
      examsCount: exams.length,
    };
  }, [allUnits, courses, logs, exams]);

  // Activity by Day (Last 7 Days)
  const last7DaysActivity = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hours = logs.filter(l => l.date === dateStr).reduce((acc, l) => acc + l.hours, 0) +
        exams.filter(e => e.date === dateStr).reduce((acc, ex) => acc + (ex.duration || 0), 0);
      data.push({
        date: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        horas: hours,
      });
    }
    return data;
  }, [logs, exams]);

  // Data for Global Progress Pie
  const dataPieStatus = [
    { name: 'Completado', value: stats.completed, color: '#22c55e' },
    { name: 'En Progreso', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Pendiente', value: stats.pending, color: '#94a3b8' },
    { name: 'Retrasado', value: stats.delayed, color: '#ef4444' },
  ];

  // Data for Radar-like Bar Chart (Distribution of effort)
  const dataModuleEffort = courses.map(c => {
    const modLogs = logs.filter(l => l.courseId === c.id);
    const modExams = exams.filter(e => e.courseId === c.id);
    return {
      name: c.name.split(' ')[0],
      teoria: modLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0),
      practica: modLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0),
      examenes: modExams.reduce((acc, e) => acc + (e.duration || 0), 0),
      total: modLogs.reduce((acc, l) => acc + l.hours, 0) + modExams.reduce((acc, e) => acc + (e.duration || 0), 0),
      color: c.color || '#8a6a5c'
    };
  });

  const nextEvaluation = evaluations
    .filter(e => !e.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // --- NEW: KITCHEN LOGISTICS INTELLIGENCE ---

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    return events
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5); // Take top 5
  }, [events]);

  const priorityEvent = upcomingEvents[0]; // The immediate next thing

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'service': return <Utensils size={20} />;
      case 'order': return <ShoppingCart size={20} />;
      case 'menu': return <FileText size={20} />;
      case 'academic': return <GraduationCap size={20} />;
      default: return <Calendar size={20} />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'order': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'menu': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* HEADER SECTION WITH PRIORITY BUBBLE */}
      <header className="flex flex-col xl:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Zap className="text-yellow-500 fill-yellow-500" /> Dashboard
          </h2>
          <p className="text-gray-500 font-bold text-lg mt-1 ml-10 uppercase tracking-widest flex items-center gap-2">
            Gestión Académica y Logística <span className="w-12 h-1 bg-chef-300 rounded-full"></span>
          </p>
        </div>

        <div className="flex gap-3 w-full xl:w-auto">
          <button
            onClick={() => onNavigate('units')}
            className="flex-1 xl:flex-none px-6 py-3 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-black text-sm uppercase tracking-wider hover:border-chef-200 hover:text-chef-600 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <BookOpen size={18} /> Diario
          </button>
          <button
            onClick={() => onNavigate('calendar')}
            className="flex-1 xl:flex-none px-6 py-3 bg-chef-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-chef-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={18} /> Nuevo Evento
          </button>
        </div>

        {/* PRIORITY BUBBLE (Kitchen Assistant Style) */}
        {priorityEvent && (
          <div className={`flex-1 w-full xl:w-auto bg-white border-l-8 rounded-r-xl border-t border-b border-r border-gray-100 shadow-md p-4 flex items-center gap-4 animate-scale-in relative overflow-hidden group 
                ${priorityEvent.type === 'order' ? 'border-l-blue-500' :
              priorityEvent.type === 'service' ? 'border-l-orange-500' :
                priorityEvent.type === 'menu' ? 'border-l-purple-500' : 'border-l-gray-500'}
            `}>
            <div className={`absolute top-0 right-0 p-1 px-2 text-[10px] font-black uppercase tracking-widest text-white
                    ${priorityEvent.type === 'order' ? 'bg-blue-500' :
                priorityEvent.type === 'service' ? 'bg-orange-500' :
                  priorityEvent.type === 'menu' ? 'bg-purple-500' : 'bg-gray-500'}
                `}>
              Siguiente Prioridad
            </div>

            <div className={`p-3 rounded-full ${priorityEvent.type === 'order' ? 'bg-blue-100 text-blue-600' :
              priorityEvent.type === 'service' ? 'bg-orange-100 text-orange-600' :
                priorityEvent.type === 'menu' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
              }`}>
              {getEventIcon(priorityEvent.type || 'other')}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-gray-800 text-lg truncate leading-tight">
                {priorityEvent.title || priorityEvent.description || 'Evento sin título'}
              </h3>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-500 mt-1">
                <span className="flex items-center gap-1"><Clock size={14} /> {new Date(priorityEvent.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                {priorityEvent.description && <span className="hidden md:inline-flex items-center gap-1">• {priorityEvent.description}</span>}
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1">
              <button className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">
                Completar
              </button>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {Math.ceil((new Date(priorityEvent.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días restantes
              </span>
            </div>
          </div>
        )}
      </header>

      {/* TIMELINE & LOGISTICS ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Smart Timeline */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Clock size={22} className="text-chef-600" /> Cronograma de Actividades
            </h3>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-black text-chef-600 uppercase tracking-widest hover:underline"
            >
              Ver Calendario Completo
            </button>
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100"></div>

            <div className="space-y-6">
              {upcomingEvents.slice(0, 4).map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-4 group">
                  <div className={`relative z-10 font-bold text-xs w-12 text-center py-1 rounded-lg border bg-white mt-1
                                 ${new Date(event.date).getDate() === new Date().getDate() ? 'border-red-500 text-red-500' : 'border-gray-200 text-gray-500'}
                             `}>
                    <span className="block text-lg leading-none">{new Date(event.date).getDate()}</span>
                    <span className="uppercase text-[10px]">{new Date(event.date).toLocaleDateString('es-ES', { month: 'short' }).slice(0, 3)}</span>
                  </div>

                  <div className={`flex-1 p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer flex justify-between items-center group-hover:border-chef-200 bg-white
                                 ${event.id === priorityEvent.id ? 'border-l-4 border-l-chef-500 border-y-gray-100 border-r-gray-100' : 'border-gray-100'}
                             `}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getEventColor(event.type || 'other')}`}>
                        {getEventIcon(event.type || 'other')}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{event.title || 'Evento'}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{event.description || (event.legendItemId ? 'Evento Académico' : '')}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-chef-500 transition-colors" />
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="text-center py-8 text-gray-400 font-medium">
                  No hay eventos próximos programados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Mini Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-chef-600 to-chef-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('journal')}>
            <div className="relative z-10">
              <h3 className="font-black text-2xl mb-1">Diario de Clase</h3>
              <p className="text-chef-100 font-medium text-sm mb-4">Registrar la sesión de hoy</p>
              <button className="bg-white text-chef-900 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                Entrar al Diario
              </button>
            </div>
            <BookOpen className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('calendar')}>
            <div className="relative z-10">
              <h3 className="font-black text-2xl mb-1">Nueva Actividad</h3>
              <p className="text-orange-100 font-medium text-sm mb-4">Servicios, Pedidos y Master Class</p>
              <button className="bg-white text-orange-900 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                Abrir Agenda
              </button>
            </div>
            <Utensils className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">Stock de Alertas</h4>
            <div className="space-y-3">
              {stats.delayed > 0 ? (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                  <AlertTriangle className="text-red-500" size={20} />
                  <div>
                    <p className="font-bold text-red-700 text-sm">{stats.delayed} Unidades Retrasadas</p>
                    <p className="text-red-500 text-xs">Revisar programación</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <CheckCircle className="text-green-500" size={20} />
                  <div>
                    <p className="font-bold text-green-700 text-sm">Al día</p>
                    <p className="text-green-500 text-xs">Sin retrasos en programación</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PRIMARY KPI GRID */}
      <div className="grid grid-cols-1 md:flex-row lg:grid-cols-4 gap-6 text-center md:text-left">
        <KpiCard
          icon={<Layers className="text-blue-600" />}
          title="Unidades de Trabajo"
          value={stats.totalUnits}
          subtitle={`${stats.completed} completadas`}
          color="blue"
        />
        <KpiCard
          icon={<Clock className="text-chef-600" />}
          title="Horas Totales"
          value={`${stats.totalHoursLogged}h`}
          subtitle={`${Math.round((stats.totalHoursLogged / Math.max(1, stats.totalHoursPlanned)) * 100)}% de la programación`}
          color="chef"
        />
        <KpiCard
          icon={<ClipboardCheck className="text-purple-600" />}
          title="Pruebas Realizadas"
          value={stats.examsCount}
          subtitle="Exámenes teóricos/prácticos"
          color="purple"
        />
        <KpiCard
          icon={<AlertTriangle className="text-red-600" />}
          title="Alertas de Retraso"
          value={stats.delayed}
          subtitle="Unidades fuera de plazo"
          color="red"
          isAlert={stats.delayed > 0}
        />
      </div>

      {/* TOP ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Trend - Activity over time */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <TrendingUp size={22} className="text-green-500" /> Actividad Reciente (Horas/Día)
            </h3>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Última Semana Lectiva</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7DaysActivity}>
                <defs>
                  <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a18072" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a18072" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="horas" stroke="#8a6a5c" strokeWidth={4} fillOpacity={1} fill="url(#colorHoras)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Distribution Pie */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle size={22} className="text-blue-500" /> Estado Global
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPieStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dataPieStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dataPieStatus.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-black text-gray-500 uppercase">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULE-SPECIFIC DEEP DIVE SECTION */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
            <ChefHat size={28} className="text-chef-600" /> Análisis por Módulo
          </h3>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {courses.map(course => (
            <ModuleIntelligenceCard key={course.id} course={course} logs={logs} exams={exams} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* EFFORT DISTRIBUTION (Radar Replacement with Composed Chart) */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Layers size={22} className="text-purple-500" /> Distribución de Horas por Contenido
          </h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataModuleEffort} barGap={12}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 800 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', paddingTop: '20px' }} />
              <Bar dataKey="teoria" name="H. Teóricas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="practica" name="H. Prácticas" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="examenes" name="H. Evaluación" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const KpiCard = ({ icon, title, value, subtitle, color, isAlert }: any) => {
  const colorMap: any = {
    blue: "bg-blue-50 border-blue-100",
    chef: "bg-chef-50 border-chef-100",
    purple: "bg-purple-50 border-purple-100",
    red: "bg-red-50 border-red-100",
  };

  return (
    <div className={`p-6 rounded-3xl border-2 shadow-sm transition-transform hover:scale-[1.02] ${colorMap[color] || 'bg-white border-gray-100'} ${isAlert ? 'ring-2 ring-red-500 ring-offset-2 animate-shake' : ''}`}>
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{title}</p>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-900 tracking-tighter">{value}</span>
        <span className="text-[10px] font-bold text-gray-500 mt-1 flex items-center gap-1">
          {subtitle}
        </span>
      </div>
    </div>
  );
};

// Fixed Error: "Property 'key' does not exist on type '{ course: Course; logs: ClassLog[]; exams: Exam[]; }'"
// Explicitly using React.FC ensures the component signature allows React-reserved props like 'key' from .map calls.
const ModuleIntelligenceCard: React.FC<{ course: Course; logs: ClassLog[]; exams: Exam[]; onNavigate: (view: any) => void }> = ({ course, logs, exams, onNavigate }) => {
  const modLogs = logs.filter(l => l.courseId === course.id);
  const modExams = exams.filter(e => e.courseId === course.id);

  const theoryHours = modLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0);
  const practiceHours = modLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0);
  const examHours = modExams.reduce((acc, e) => acc + (e.duration || 0), 0);

  const totalRealHours = theoryHours + practiceHours + examHours;
  const progressPercent = Math.min(100, Math.round((totalRealHours / Math.max(1, course.annualHours)) * 100));

  const dataUnits = [
    { name: 'Completado', value: course.units.filter(u => u.status === UnitStatus.COMPLETED).length },
    { name: 'Resto', value: course.units.filter(u => u.status !== UnitStatus.COMPLETED).length }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-md flex flex-col md:flex-row gap-6 hover:shadow-xl transition-shadow group">
      {/* Left: Progress Circle */}
      <div className="flex flex-col items-center justify-center w-full md:w-32">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Progreso', value: progressPercent },
                  { name: 'Pendiente', value: 100 - progressPercent }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={45}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={course.color || '#8a6a5c'} />
                <Cell fill="#f1f5f9" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-gray-800 leading-none">{progressPercent}%</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase">Impartido</span>
          </div>
        </div>
      </div>

      {/* Right: Info & Stats */}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-black text-gray-800 text-lg group-hover:text-chef-600 transition-colors">{course.name}</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{course.cycle} • {course.grade}</p>
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 text-[10px] font-black text-gray-500 uppercase">
            {course.weeklyHours}h/sem
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-blue-50 rounded-xl text-center border border-blue-100">
            <span className="block text-[8px] font-black text-blue-500 uppercase mb-0.5">Teoría</span>
            <span className="text-sm font-black text-blue-800">{theoryHours}h</span>
          </div>
          <div className="p-2 bg-orange-50 rounded-xl text-center border border-orange-100">
            <span className="block text-[8px] font-black text-orange-500 uppercase mb-0.5">Práctica</span>
            <span className="text-sm font-black text-orange-800">{practiceHours}h</span>
          </div>
          <div className="p-2 bg-purple-50 rounded-xl text-center border border-purple-100">
            <span className="block text-[8px] font-black text-purple-500 uppercase mb-0.5">Eval.</span>
            <span className="text-sm font-black text-purple-800">{examHours}h</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-chef-500" />
            <span className="text-xs font-bold text-gray-600">
              {course.units.filter(u => u.status === UnitStatus.COMPLETED).length} / {course.units.length} UD Finalizadas
            </span>
          </div>
          <button
            onClick={() => onNavigate('units')}
            className="text-[10px] font-black text-chef-600 hover:text-chef-800 uppercase flex items-center gap-1 group/btn"
          >
            Ver Detalles <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
