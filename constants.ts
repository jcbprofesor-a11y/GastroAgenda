
import { Course, UnitStatus, Evaluation, CalendarEvent, ClassLog, LegendItem, ScheduleSlot } from './types';

// Configuración de Cursos basada en la imagen del horario:
export const COURSES_DATA: Course[] = [
  {
    id: 'mod-prod-culinarios', // 2HCA, 2HCAL
    name: 'Productos Culinarios',
    cycle: 'GM Cocina y Gastronomía',
    grade: '2º Curso',
    weeklyHours: 11,
    annualHours: 350,
    color: '#ea580c', // Orange-600
    units: [
      { id: 'm1-u1', title: 'UD1: Organización de la Producción', description: 'Planificación y Mise en Place', hoursPlannedTheory: 10, hoursPlannedPractice: 20, hoursRealized: 30, status: UnitStatus.COMPLETED, trimestres: [1] },
      { id: 'm1-u2', title: 'UD2: Técnicas Culinarias Básicas', description: 'Cocción, asado, fritura', hoursPlannedTheory: 15, hoursPlannedPractice: 35, hoursRealized: 45, status: UnitStatus.IN_PROGRESS, trimestres: [1, 2] },
      { id: 'm1-u3', title: 'UD3: Fondos y Salsas', description: 'Elaboraciones base', hoursPlannedTheory: 10, hoursPlannedPractice: 30, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [2] },
      { id: 'm1-u4', title: 'UD4: Guarniciones y Elementos Decorativos', description: 'Acompañamientos', hoursPlannedTheory: 5, hoursPlannedPractice: 25, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [2] },
      { id: 'm1-u5', title: 'UD5: Pescados y Mariscos', description: 'Tratamiento de productos del mar', hoursPlannedTheory: 15, hoursPlannedPractice: 45, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [3] },
      { id: 'm1-u6', title: 'UD6: Carnes y Aves', description: 'Tratamiento de productos cárnicos', hoursPlannedTheory: 15, hoursPlannedPractice: 45, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [3] },
    ],
    learningResults: [
      {
        id: 'ra1',
        codigo: 'RA1',
        descripcion: 'Organiza los procesos de producción culinaria, analizando la ficha técnica.',
        ponderacion: 15,
        criterios: [
          {
            id: 'ce1a',
            codigo: '1.a',
            descripcion: 'Se han caracterizado los distintos modelos de producción.',
            ponderacion: 40,
            raId: 'ra1',
            asociaciones: [
              { id: 'asoc-1', utId: 'm1-u1', instruments: ['Examen Teórico'] }
            ]
          },
          {
            id: 'ce1b',
            codigo: '1.b',
            descripcion: 'Se han determinado las fases de la producción.',
            ponderacion: 60,
            raId: 'ra1',
            asociaciones: [
              { id: 'asoc-2', utId: 'm1-u1', instruments: ['Práctica de Taller', 'Lista de Cotejo'] }
            ]
          }
        ]
      },
      {
        id: 'ra2',
        codigo: 'RA2',
        descripcion: 'Aplica técnicas culinarias básicas para elaboraciones elementales.',
        ponderacion: 25,
        criterios: [
          {
            id: 'ce2a',
            codigo: '2.a',
            descripcion: 'Se han seleccionado los útiles y herramientas.',
            ponderacion: 30,
            raId: 'ra2',
            asociaciones: [
              { id: 'asoc-3', utId: 'm1-u2', instruments: ['Observación Directa'] }
            ]
          },
          {
            id: 'ce2b',
            codigo: '2.b',
            descripcion: 'Se han ejecutado las operaciones de cocción según ficha técnica.',
            ponderacion: 70,
            raId: 'ra2',
            asociaciones: [
              { id: 'asoc-4', utId: 'm1-u2', instruments: ['Práctica de Taller', 'Degustación'] },
              { id: 'asoc-5', utId: 'm1-u3', instruments: ['Práctica de Taller'] } // Este criterio TAMBIÉN se ve en la UD3 (Fondos)
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'mod-sostenible', // 2HCA (Miércoles)
    name: 'Cocina Sostenible',
    cycle: 'GM Cocina y Gastronomía',
    grade: '2º Curso',
    weeklyHours: 2,
    annualHours: 63,
    color: '#16a34a', // Green-600
    units: [
      { id: 'm2-u1', title: 'UD1: Huella de Carbono', description: 'Impacto ambiental', hoursPlannedTheory: 10, hoursPlannedPractice: 5, hoursRealized: 10, status: UnitStatus.IN_PROGRESS, trimestres: [1] },
      { id: 'm2-u2', title: 'UD2: Gestión de Residuos', description: 'Zero Waste', hoursPlannedTheory: 10, hoursPlannedPractice: 10, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [2] },
      { id: 'm2-u3', title: 'UD3: Producto de Km 0', description: 'Proveedores locales', hoursPlannedTheory: 10, hoursPlannedPractice: 5, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [3] },
    ],
    learningResults: []
  },
  {
    id: 'mod-proyecto', // Viernes 3ª hora (Proyecto Intermodular)
    name: 'Proyecto Intermodular',
    cycle: 'GM Cocina y Gastronomía',
    grade: '2º Curso',
    weeklyHours: 1,
    annualHours: 33,
    color: '#4f46e5', // Indigo-600
    units: [
      { id: 'm3-u1', title: 'UD1: Definición del Proyecto', description: 'Ideación', hoursPlannedTheory: 5, hoursPlannedPractice: 0, hoursRealized: 5, status: UnitStatus.COMPLETED, trimestres: [1] },
      { id: 'm3-u2', title: 'UD2: Planificación', description: 'Cronograma', hoursPlannedTheory: 5, hoursPlannedPractice: 5, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [2] },
      { id: 'm3-u3', title: 'UD3: Ejecución y Venta', description: 'Puesta en marcha', hoursPlannedTheory: 0, hoursPlannedPractice: 15, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [3] },
    ],
    learningResults: []
  },
  {
    id: 'mod-pasteleria',
    name: 'Procesos Básicos de Pastelería',
    cycle: 'GM Cocina y Gastronomía',
    grade: '1º Curso',
    weeklyHours: 3,
    annualHours: 96,
    color: '#db2777', // Pink-600
    units: [
      { id: 'm4-u1', title: 'UD1: Masas bases', description: 'Masas quebradas y batidas', hoursPlannedTheory: 5, hoursPlannedPractice: 15, hoursRealized: 0, status: UnitStatus.PENDING, trimestres: [1] },
    ],
    learningResults: []
  }
];

// --- HORARIO DEL PROFESOR (Digitalizado de la imagen) ---
// 1 = Lunes, 5 = Viernes
export const TEACHER_SCHEDULE: ScheduleSlot[] = [
  // Lunes: 1HCB (Pastelería) de 11:30 a 14:15
  { dayOfWeek: 1, startTime: '11:30', endTime: '14:15', courseId: 'mod-pasteleria', defaultHours: 3, label: 'Bloque Pastelería' },

  // Martes: Prod. Culinarios todo el día (con recreo)
  { dayOfWeek: 2, startTime: '08:15', endTime: '11:00', courseId: 'mod-prod-culinarios', defaultHours: 3, label: 'Bloque Mañana' },
  { dayOfWeek: 2, startTime: '11:30', endTime: '12:25', courseId: 'mod-prod-culinarios', defaultHours: 1, label: 'Sesión Post-Recreo' },

  // Miércoles: Cocina Sostenible
  { dayOfWeek: 3, startTime: '08:15', endTime: '10:05', courseId: 'mod-sostenible', defaultHours: 2, label: 'Bloque Sostenible' },

  // Jueves: Prod. Culinarios (Intensivo)
  { dayOfWeek: 4, startTime: '09:10', endTime: '11:00', courseId: 'mod-prod-culinarios', defaultHours: 2, label: 'Mañana' },
  { dayOfWeek: 4, startTime: '11:30', endTime: '13:20', courseId: 'mod-prod-culinarios', defaultHours: 2, label: 'Mediodía' },
  { dayOfWeek: 4, startTime: '13:20', endTime: '15:25', courseId: 'mod-prod-culinarios', defaultHours: 2, label: 'Tarde' },

  // Viernes: Prod. Culinarios (1h) y Proyecto (1h)
  { dayOfWeek: 5, startTime: '08:15', endTime: '09:10', courseId: 'mod-prod-culinarios', defaultHours: 1, label: '1ª Hora' },
  { dayOfWeek: 5, startTime: '10:05', endTime: '11:00', courseId: 'mod-proyecto', defaultHours: 1, label: 'Proyecto Intermodular' }
];

export const INITIAL_LOGS: ClassLog[] = [
  {
    id: 'log-1',
    date: new Date().toISOString().split('T')[0],
    courseId: 'mod-prod-culinarios',
    unitId: 'm1-u2',
    hours: 3,
    type: 'Práctica',
    status: 'Impartida',
    notes: 'Realización de fondos oscuros. El alumnado ha respondido bien a los tiempos de cocción.'
  }
];

export const EVALUATIONS_DATA: Evaluation[] = [
  { id: 'e1', title: '1ª Evaluación Parcial', date: '2025-12-17', type: 'Parcial', completed: false },
  { id: 'e3', title: '2ª Evaluación Parcial', date: '2026-03-18', type: 'Parcial', completed: false },
  { id: 'e4', title: 'Evaluación Final 1ª Ord.', date: '2026-06-01', type: 'Final', completed: false },
  { id: 'e5', title: 'Evaluación Final 2ª Ord.', date: '2026-06-19', type: 'Extraordinaria', completed: false },
];

export const INITIAL_LEGEND_ITEMS: LegendItem[] = [
  { id: 'leg-1', label: 'Inicio y fin de actividades lectivas FP', color: '#DC2626' },
  { id: 'leg-2', label: '1ª Evaluación Parcial', color: '#FBBF24' },
  { id: 'leg-3', label: '2ª Ev. Parcial (Modelo Concentrado)', color: '#FBCFE8' },
  { id: 'leg-4', label: '2ª Ev. Parcial (Modelo Estandar)', color: '#A3E635' },
  { id: 'leg-5', label: 'Ex. Recup. y Perdida Eval. Continua', color: '#F472B6' },
  { id: 'leg-6', label: 'Evaluación Final 1ª Conv. Ordinaria', color: '#9333EA' },
  { id: 'leg-7', label: 'Exámenes Recuperación (2ª ordinaria)', color: '#22D3EE' },
  { id: 'leg-8', label: 'Evaluación Final 2ª Conv. Ordinaria', color: '#F3E5AB' },
  { id: 'leg-9', label: 'FCT (Inicio/Fin)', color: '#94A3B8' },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', date: '2025-09-15', legendItemId: 'leg-1', type: 'academic', title: 'Inicio de Curso' },
  { id: 'evt-2', date: '2025-12-17', legendItemId: 'leg-2', type: 'academic', title: '1ª Evaluación' },
  { id: 'evt-3', date: '2025-12-18', legendItemId: 'leg-2', type: 'academic', title: 'Sesiones Evaluación' },
  { id: 'evt-4', date: '2025-12-19', legendItemId: 'leg-2', type: 'academic', title: 'Entrega de Notas' },

  // --- SAMPLE KITCHEN LOGISTICS EVENTS ---
  {
    id: 'srv-1',
    date: '2025-11-25',
    type: 'service',
    title: 'Servicio Restaurante: Menú Degustación',
    description: 'Servicio de mediodía con grupos de 2º GM.',
    completed: false
  },
  // Auto-generated (Mocked for visualization)
  {
    id: 'srv-1-order',
    date: '2025-11-17',
    type: 'order',
    title: 'HACER PEDIDO: Servicio 25/Nov',
    description: 'Realizar pedido a proveedores principales (Frutas, Carnes, Pescados).',
    linkedEventId: 'srv-1',
    completed: true
  },
  {
    id: 'srv-1-stock',
    date: '2025-11-14',
    type: 'order',
    title: 'CERRAR STOCK: Previo Pedido',
    description: 'Inventario final de cámaras.',
    linkedEventId: 'srv-1',
    completed: true
  },
  {
    id: 'srv-1-menu',
    date: '2025-11-01',
    type: 'menu',
    title: 'DISEÑO MENÚ: Servicio 25/Nov',
    description: 'Definición de platos y fichas técnicas.',
    linkedEventId: 'srv-1',
    completed: true
  },

  // Next Future Events (Relative to a hypothetical "today" or generally upcoming)
  {
    id: 'srv-2',
    date: '2026-02-28',
    type: 'service',
    title: 'Jornadas Gastronómicas',
    description: 'Servicio especial con invitados.',
    completed: false
  },
  {
    id: 'srv-2-order',
    date: '2026-02-16',
    type: 'order',
    title: 'HACER PEDIDO: Jornadas',
    description: 'Pedido especial mariscos.',
    linkedEventId: 'srv-2',
    completed: false
  },

  { id: 'evt-5', date: '2026-02-20', legendItemId: 'leg-5', type: 'academic', title: 'Ex. Recuperación' },
  { id: 'evt-6', date: '2026-02-23', legendItemId: 'leg-5', type: 'academic', title: 'Ex. Recuperación' },
  { id: 'evt-7', date: '2026-03-18', legendItemId: 'leg-4', type: 'academic', title: '2ª Evaluación' },
  { id: 'evt-8', date: '2026-03-20', legendItemId: 'leg-4', type: 'academic', title: 'Entrega Notas 2ª Ev' },
  { id: 'evt-9', date: '2026-06-01', legendItemId: 'leg-6', type: 'academic', title: 'Evaluación Final' },
  { id: 'evt-10', date: '2026-06-02', legendItemId: 'leg-6', type: 'academic', title: 'Juntas Evaluación' },
  { id: 'evt-11', date: '2026-06-03', legendItemId: 'leg-6', type: 'academic', title: 'Reclamaciones' },
  { id: 'evt-12', date: '2026-06-10', legendItemId: 'leg-6', type: 'academic', title: 'Actas Finales' },
  { id: 'evt-13', date: '2026-06-11', legendItemId: 'leg-6', type: 'academic', title: 'Graduación' },
  { id: 'evt-14', date: '2026-06-12', legendItemId: 'leg-6', type: 'academic', title: 'Fin Actividades' },
  { id: 'evt-15', date: '2026-06-16', legendItemId: 'leg-7', type: 'academic', title: 'Ex. Extraordinaria' },
  { id: 'evt-16', date: '2026-06-17', legendItemId: 'leg-7', type: 'academic', title: 'Ex. Extraordinaria' },
  { id: 'evt-17', date: '2026-06-18', legendItemId: 'leg-7', type: 'academic', title: 'Sesiones Extraordinaria' },
  { id: 'evt-18', date: '2026-06-18', legendItemId: 'leg-1', type: 'academic', title: 'Claustro Final' },
  { id: 'evt-19', date: '2026-06-19', legendItemId: 'leg-8', type: 'academic', title: 'Entrega Notas Extra' },
  { id: 'evt-20', date: '2026-06-22', legendItemId: 'leg-8', type: 'academic', title: 'Cierre Curso' },
];
