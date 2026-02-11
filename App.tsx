
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  MessageSquare,
  Menu,
  X,
  GraduationCap,
  NotebookPen,
  Settings,
  School,
  UserCircle,
  Clock,
  FileText,
  Database
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import UnitsTracker from './components/UnitsTracker';
import AIAssistant from './components/AIAssistant';
import DailyJournal from './components/DailyJournal';
import CourseConfigurator from './components/CourseConfigurator';
import ScheduleConfigurator from './components/ScheduleConfigurator';
import SettingsPanel from './components/SettingsPanel';
import ReportsCenter from './components/ReportsCenter';
import BackupManager from './components/BackupManager';
import NotebookPanel from './components/NotebookPanel';
import LandingPage from './components/LandingPage';

import { COURSES_DATA, EVALUATIONS_DATA, CALENDAR_EVENTS, TEACHER_SCHEDULE, INITIAL_LOGS } from './constants';
import { Course, ScheduleSlot, ClassLog, SchoolInfo, TeacherInfo, BackupData, CalendarEvent, Exam, NotebookTask } from './types';

type View = 'landing' | 'dashboard' | 'calendar' | 'units' | 'journal' | 'ai' | 'config' | 'schedule' | 'settings' | 'reports' | 'backup' | 'notebook';

const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>(() => loadState('gastro_courses', COURSES_DATA));
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(() => loadState('gastro_schedule', TEACHER_SCHEDULE));
  const [logs, setLogs] = useState<ClassLog[]>(() => loadState('gastro_logs', INITIAL_LOGS));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => loadState('gastro_events', CALENDAR_EVENTS));
  const [exams, setExams] = useState<Exam[]>(() => loadState('gastro_exams', []));

  const [isCalendarLocked, setIsCalendarLocked] = useState<boolean>(() => loadState('gastro_calendar_locked', false));
  const [journalDate, setJournalDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => loadState('gastro_schoolInfo', {
    name: "IES La Flota",
    logoUrl: "",
    academicYear: "2025-2026",
    department: "Dpto. Hostelería y Turismo"
  }));

  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>(() => loadState('gastro_teacherInfo', {
    name: "Juan Codina",
    role: "Profesor Técnico FP",
    avatarUrl: ""
  }));

  const [notebookTasks, setNotebookTasks] = useState<NotebookTask[]>(() => loadState('gastro_notebook_tasks', []));

  useEffect(() => { localStorage.setItem('gastro_courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem('gastro_schedule', JSON.stringify(schedule)); }, [schedule]);
  useEffect(() => { localStorage.setItem('gastro_logs', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('gastro_events', JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => { localStorage.setItem('gastro_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('gastro_schoolInfo', JSON.stringify(schoolInfo)); }, [schoolInfo]);
  useEffect(() => { localStorage.setItem('gastro_teacherInfo', JSON.stringify(teacherInfo)); }, [teacherInfo]);
  useEffect(() => { localStorage.setItem('gastro_calendar_locked', JSON.stringify(isCalendarLocked)); }, [isCalendarLocked]);
  useEffect(() => { localStorage.setItem('gastro_notebook_tasks', JSON.stringify(notebookTasks)); }, [notebookTasks]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavigateToJournal = (date: string) => {
    setJournalDate(date);
    setCurrentView('journal');
  };

  const handleImportData = (data: BackupData) => {
    if (data.courses) setCourses(data.courses);
    if (data.schedule) setSchedule(data.schedule);
    if (data.logs) setLogs(data.logs);
    if (data.schoolInfo) setSchoolInfo(data.schoolInfo);
    if (data.teacherInfo) setTeacherInfo(data.teacherInfo);
    if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
    if (data.exams) setExams(data.exams);
    if (data.notebookTasks) setNotebookTasks(data.notebookTasks);
  };

  // --- DATA SYNCHRONIZATION: Logs -> Course Units ---
  useEffect(() => {
    // We only want to run this if logs change (and potentially courses initially)
    // to avoid infinite loops, we need to be careful.
    // Strategy: Calculate expected state, if different from current course state, update.

    let hasChanges = false;
    const newCourses = courses.map(course => {
      let courseChanged = false;
      const newUnits = course.units.map(unit => {
        const unitLogs = logs.filter(l => l.courseId === course.id && l.unitId === unit.id);
        const theoryHours = unitLogs.filter(l => l.type === 'Teórica').reduce((acc, l) => acc + l.hours, 0);
        const practiceHours = unitLogs.filter(l => l.type === 'Práctica').reduce((acc, l) => acc + l.hours, 0);
        const totalRealized = theoryHours + practiceHours;

        // Check Status
        // Simple logic: Completed if realized >= planned
        // Delayed if realized < planned (and maybe some date logic, but for now simple)
        const totalPlanned = unit.hoursPlannedTheory + unit.hoursPlannedPractice;
        let newStatus = unit.status;

        if (totalRealized >= totalPlanned && totalPlanned > 0) {
          newStatus = 'Completado';
        } else if (totalRealized > 0) {
          newStatus = 'En Progreso';
        } else {
          newStatus = 'Pendiente';
        }

        // Manual override or check if we need to update
        if (unit.hoursRealized !== totalRealized || unit.status !== newStatus) {
          courseChanged = true;
          return { ...unit, hoursRealized: totalRealized, status: newStatus as any };
        }
        return unit;
      });

      if (courseChanged) {
        hasChanges = true;
        return { ...course, units: newUnits };
      }
      return course;
    });

    if (hasChanges) {
      setCourses(newCourses);
      // Note: setCourses will trigger the localStorage useEffect
    }
  }, [logs]); // Only trigger when logs change. Warning: logic depends on courses too but we don't want circular dependency. 
  // Ideally, this runs when logs change, using the current state of courses.

  const handleResetApp = () => {
    localStorage.clear();
    setCourses(COURSES_DATA);
    setSchedule(TEACHER_SCHEDULE);
    setLogs([]);
    setCalendarEvents(CALENDAR_EVENTS);
    setExams([]);
    setIsCalendarLocked(false);
    setNotebookTasks([]);
    setCurrentView('dashboard');
  };

  // --- NOTEBOOK TASK HANDLERS ---
  const handleAddTask = (task: Omit<NotebookTask, 'id'>) => {
    const newTask: NotebookTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setNotebookTasks(prev => [...prev, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    setNotebookTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const now = new Date().toISOString();
        const isCompleting = !task.completed;

        // Si se está completando, crear evento en el calendario
        if (isCompleting) {
          const completionEvent: CalendarEvent = {
            id: `task-completed-${taskId}`,
            date: now.split('T')[0],
            type: 'note',
            title: `✓ ${task.title}`,
            description: task.description || 'Tarea completada',
            completed: true
          };
          setCalendarEvents(prevEvents => [...prevEvents, completionEvent]);
        }

        return {
          ...task,
          completed: isCompleting,
          completedDate: isCompleting ? now : undefined
        };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setNotebookTasks(prev => prev.filter(task => task.id !== taskId));
  };

  if (currentView === 'landing') {
    return <LandingPage onEnter={() => setCurrentView('dashboard')} creatorName="Juan Codina" />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard courses={courses} evaluations={EVALUATIONS_DATA} logs={logs} exams={exams} onNavigate={setCurrentView} />;
      case 'calendar':
        return <CalendarView events={calendarEvents} logs={logs} exams={exams} schedule={schedule} courses={courses} schoolInfo={schoolInfo} onNavigateToJournal={handleNavigateToJournal} isLocked={isCalendarLocked} onToggleLock={setIsCalendarLocked} />;
      case 'journal':
        return <DailyJournal courses={courses} schedule={schedule} logs={logs} setLogs={setLogs} exams={exams} setExams={setExams} date={journalDate} setDate={setJournalDate} />;
      case 'units':
        return <UnitsTracker courses={courses} />;
      case 'config':
        return <CourseConfigurator courses={courses} onUpdateCourses={setCourses} />;
      case 'schedule':
        return <ScheduleConfigurator courses={courses} schedule={schedule} onUpdateSchedule={setSchedule} />;
      case 'reports':
        return <ReportsCenter courses={courses} logs={logs} exams={exams} schoolInfo={schoolInfo} teacherInfo={teacherInfo} />;
      case 'backup':
        return <BackupManager courses={courses} schedule={schedule} logs={logs} events={calendarEvents} exams={exams} schoolInfo={schoolInfo} teacherInfo={teacherInfo} tasks={notebookTasks} onImportData={handleImportData} onResetData={handleResetApp} />;
      case 'settings':
        return <SettingsPanel schoolInfo={schoolInfo} setSchoolInfo={setSchoolInfo} teacherInfo={teacherInfo} setTeacherInfo={setTeacherInfo} />;
      case 'ai':
        return <AIAssistant />;
      case 'notebook':
        return <NotebookPanel tasks={notebookTasks} events={calendarEvents} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} onNavigateToCalendar={() => setCurrentView('calendar')} />;
      default:
        return <Dashboard courses={courses} evaluations={EVALUATIONS_DATA} logs={logs} exams={exams} onNavigate={setCurrentView} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all border-2 ${currentView === view
        ? 'bg-chef-100 text-chef-900 border-chef-200 font-extrabold shadow-sm'
        : 'text-gray-600 border-transparent hover:bg-gray-100 hover:border-gray-200 font-bold'
        }`}
    >
      <Icon size={22} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-slate-900 antialiased">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r-2 border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col shadow-xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b-2 border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white overflow-hidden shadow-md border-2 border-blue-800">
              {schoolInfo.logoUrl ? <img src={schoolInfo.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <School size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-gray-900 text-sm truncate leading-tight tracking-tight">{schoolInfo.name}</h1>
              <p className="text-xs font-bold text-gray-500 bg-gray-200 inline-block px-2 py-0.5 rounded mt-1">{schoolInfo.academicYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-chef-300 hover:shadow-md transition group" onClick={() => setCurrentView('settings')}>
            <div className="w-10 h-10 rounded-full bg-chef-100 flex items-center justify-center text-chef-700 overflow-hidden border-2 border-chef-200">
              {teacherInfo.avatarUrl ? <img src={teacherInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <UserCircle size={28} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-gray-800 truncate">{teacherInfo.name}</p>
              <p className="text-[10px] font-bold text-gray-500 truncate uppercase tracking-wide">{teacherInfo.role}</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Panel General" />
          <NavItem view="notebook" icon={NotebookPen} label="Cuaderno de Notas" />
          <NavItem view="journal" icon={Clock} label="Diario de Clase" />
          <NavItem view="calendar" icon={CalendarDays} label="Calendario" />
          <NavItem view="units" icon={BookOpen} label="Programación" />
          <NavItem view="reports" icon={FileText} label="Informes" />
          <div className="pt-6 mt-6 border-t-2 border-gray-100">
            <div className="px-4 mb-3 text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Gestión
            </div>
            <NavItem view="schedule" icon={Clock} label="Mi Horario" />
            <NavItem view="config" icon={Settings} label="Datos Módulos" />
            <NavItem view="backup" icon={Database} label="Copias Seguridad" />
            <NavItem view="settings" icon={UserCircle} label="Identidad" />
          </div>
          <div className="pt-6 mt-6 border-t-2 border-gray-100 pb-4">
            <div className="px-4 mb-3 text-xs font-black text-chef-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-chef-600"></span> Inteligencia
            </div>
            <NavItem view="ai" icon={MessageSquare} label="Asistente IA" />
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100/50">
        <header className="bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between lg:hidden shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chef-700 rounded-xl flex items-center justify-center text-white">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <span className="font-black text-gray-900 text-lg tracking-tight">GastroAcademia</span>
          </div>
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg text-gray-700 border-2 border-transparent hover:border-gray-200 transition">
            {isSidebarOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="bg-white/50 rounded-3xl min-h-full">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
