import React, { useState, useMemo } from 'react';
import { NotebookTask, CalendarEvent } from '../types';
import {
    Plus, Trash2, CheckCircle, Circle, Calendar, Clock,
    AlertCircle, ChevronDown, ChevronUp, Utensils, ShoppingCart,
    FileText, GraduationCap, StickyNote
} from 'lucide-react';

interface NotebookPanelProps {
    tasks: NotebookTask[];
    events: CalendarEvent[];
    onAddTask: (task: Omit<NotebookTask, 'id'>) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    onNavigateToCalendar: () => void;
}

const NotebookPanel: React.FC<NotebookPanelProps> = ({
    tasks,
    events,
    onAddTask,
    onToggleTask,
    onDeleteTask,
    onNavigateToCalendar
}) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Separar tareas pendientes y completadas
    const pendingTasks = useMemo(() => {
        return tasks
            .filter(t => !t.completed)
            .sort((a, b) => {
                // Ordenar por: urgencia → fecha límite → fecha de creación
                const aDate = a.dueDate ? new Date(a.dueDate) : null;
                const bDate = b.dueDate ? new Date(b.dueDate) : null;

                if (aDate && bDate) {
                    return aDate.getTime() - bDate.getTime();
                }
                if (aDate) return -1;
                if (bDate) return 1;
                return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
            });
    }, [tasks]);

    const completedTasks = useMemo(() => {
        return tasks
            .filter(t => t.completed)
            .sort((a, b) => {
                const aDate = a.completedDate || a.createdDate;
                const bDate = b.completedDate || b.createdDate;
                return new Date(bDate).getTime() - new Date(aDate).getTime();
            });
    }, [tasks]);

    // Próximos eventos del calendario
    const upcomingEvents = useMemo(() => {
        return events
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, [events]);

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;

        const newTask: Omit<NotebookTask, 'id'> = {
            title: newTaskTitle.trim(),
            dueDate: newTaskDueDate || undefined,
            completed: false,
            createdDate: new Date().toISOString(),
            priority: 'medium'
        };

        onAddTask(newTask);
        setNewTaskTitle('');
        setNewTaskDueDate('');
        setShowAdvanced(false);
    };

    const getUrgencyClass = (dueDate?: string) => {
        if (!dueDate) return '';
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-red-600 font-bold'; // Vencida
        if (diffDays <= 2) return 'text-red-500'; // Urgente
        if (diffDays <= 7) return 'text-orange-500'; // Próxima
        return 'text-gray-500';
    };

    const getEventIcon = (type?: string) => {
        switch (type) {
            case 'service': return <Utensils size={14} className="text-orange-600" />;
            case 'order': return <ShoppingCart size={14} className="text-blue-600" />;
            case 'menu': return <FileText size={14} className="text-purple-600" />;
            case 'note': return <StickyNote size={14} className="text-green-600" />;
            case 'academic': return <GraduationCap size={14} className="text-indigo-600" />;
            default: return <Calendar size={14} className="text-gray-600" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <header className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                            📔 Cuaderno de Notas
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Gestiona tus tareas pendientes y próximos eventos
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-chef-600">{pendingTasks.length}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Pendientes</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Principal: Tareas */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Input Rápido */}
                    <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-chef-600" />
                            Nueva Tarea
                        </h3>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                                    placeholder="Ej: Comprar tizas, Hablar del viaje de estudios..."
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-chef-500 focus:ring-2 focus:ring-chef-200 outline-none transition-all"
                                />
                                <button
                                    onClick={handleAddTask}
                                    disabled={!newTaskTitle.trim()}
                                    className="px-6 py-3 bg-chef-600 text-white rounded-lg font-bold hover:bg-chef-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Añadir
                                </button>
                            </div>

                            {/* Opciones Avanzadas */}
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-xs font-bold text-gray-500 hover:text-chef-600 flex items-center gap-1 transition-colors"
                            >
                                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {showAdvanced ? 'Ocultar opciones' : 'Añadir fecha límite'}
                            </button>

                            {showAdvanced && (
                                <div className="pt-2 border-t border-gray-100">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Fecha Límite (Opcional)
                                    </label>
                                    <input
                                        type="date"
                                        value={newTaskDueDate}
                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-chef-500 focus:ring-2 focus:ring-chef-200 outline-none text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lista de Tareas Pendientes */}
                    <div className="bg-white p-6 rounded-xl border-2 border-gray-100 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">
                            Tareas Pendientes ({pendingTasks.length})
                        </h3>

                        {pendingTasks.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Circle size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="font-bold">No hay tareas pendientes</p>
                                <p className="text-sm mt-1">¡Buen trabajo! 🎉</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="group flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-chef-200 hover:bg-chef-50/30 transition-all"
                                    >
                                        <button
                                            onClick={() => onToggleTask(task.id)}
                                            className="mt-0.5 text-gray-300 hover:text-chef-600 transition-colors"
                                        >
                                            <Circle size={20} />
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800">{task.title}</p>
                                            {task.description && (
                                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                            )}
                                            {task.dueDate && (
                                                <div className={`flex items-center gap-1 text-xs mt-2 ${getUrgencyClass(task.dueDate)}`}>
                                                    <Clock size={12} />
                                                    {new Date(task.dueDate).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => onDeleteTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tareas Completadas (Colapsable) */}
                    {completedTasks.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <button
                                onClick={() => setShowCompleted(!showCompleted)}
                                className="w-full flex items-center justify-between font-bold text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    Completadas ({completedTasks.length})
                                </span>
                                {showCompleted ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {showCompleted && (
                                <div className="mt-4 space-y-2">
                                    {completedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 opacity-60"
                                        >
                                            <CheckCircle size={18} className="text-green-500 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-gray-600 line-through">{task.title}</p>
                                                {task.completedDate && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Completada el {new Date(task.completedDate).toLocaleDateString('es-ES')}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onDeleteTask(task.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Columna Lateral: Próximos Eventos */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-chef-600 to-chef-800 p-6 rounded-xl shadow-lg text-white">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Calendar size={20} />
                            Próximos Eventos
                        </h3>

                        {upcomingEvents.length === 0 ? (
                            <p className="text-chef-100 text-sm">No hay eventos próximos</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20"
                                    >
                                        <div className="flex items-start gap-2">
                                            {getEventIcon(event.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">
                                                    {event.title || event.description || 'Evento'}
                                                </p>
                                                <p className="text-xs text-chef-100 mt-1">
                                                    {new Date(event.date).toLocaleDateString('es-ES', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={onNavigateToCalendar}
                            className="mt-4 w-full bg-white text-chef-900 py-2 rounded-lg font-bold text-sm hover:bg-chef-50 transition-colors"
                        >
                            Ver Calendario Completo
                        </button>
                    </div>

                    {/* Consejos */}
                    <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-xl">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={18} className="text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-bold text-blue-900 text-sm">Consejo</p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Las tareas completadas se registran automáticamente en el calendario y desaparecen después de 24 horas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotebookPanel;
