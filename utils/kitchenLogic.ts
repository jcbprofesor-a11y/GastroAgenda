import { CalendarEvent } from '../types';

/**
 * EL CEREBRO DE LOGÍSTICA DE COCINA
 * 
 * Reglas de Negocio:
 * 1. El Evento Principal: El día del servicio (ej: 25 de Noviembre).
 * 2. HACER PEDIDO (Auto-generado): Lunes de la semana anterior al servicio.
 * 3. TERMINAR PEDIDO (Auto-generado): Viernes de hace dos semanas (semana anterior a 'Hacer Pedido').
 * 4. CREAR MENÚ (Auto-generado): 24 días antes del servicio.
 */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Helper to format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Helper to get previous Monday (relative to the week of the date)
export const getPreviousMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) - 7;
    d.setDate(diff);
    return d;
};

// Helper to get Friday two weeks before
export const getFridayTwoWeeksBefore = (date: Date): Date => {
    const monday = getPreviousMonday(date);
    const d = new Date(monday);
    d.setDate(d.getDate() - 3); // Monday - 3 days = Friday
    return d;
};

// Helper to get 24 days before
export const get24DaysBefore = (date: Date): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() - 24);
    return d;
};

export const generateLogisticEvents = (serviceEvent: CalendarEvent): CalendarEvent[] => {
    if (!serviceEvent.date) return [];

    const serviceDate = new Date(serviceEvent.date);
    const newEvents: CalendarEvent[] = [];
    const baseId = serviceEvent.id;

    // 1. Tarea: HACER PEDIDO
    const orderDate = getPreviousMonday(serviceDate);

    newEvents.push({
        id: `${baseId}-order`,
        title: 'Realizar Pedido',
        date: formatDate(orderDate),
        type: 'order',
        description: `Pedido para el servicio del ${serviceEvent.date}`,
        linkedEventId: baseId,
        completed: false
    });

    // 2. Tarea: TERMINAR PEDIDO (Cierre de Stock)
    const closeStockDate = getFridayTwoWeeksBefore(serviceDate);

    newEvents.push({
        id: `${baseId}-stock`,
        title: 'Cerrar Stock e Inventario',
        date: formatDate(closeStockDate),
        type: 'order',
        description: `Revisión final de stock para servicio del ${serviceEvent.date}`,
        linkedEventId: baseId,
        completed: false
    });

    // 3. Tarea: CREAR MENÚ
    const menuDate = get24DaysBefore(serviceDate);

    newEvents.push({
        id: `${baseId}-menu`,
        title: 'Diseñar Menú',
        date: formatDate(menuDate),
        type: 'menu',
        description: `Definición gastronómica para el ${serviceEvent.date}`,
        linkedEventId: baseId,
        completed: false
    });

    return newEvents;
};
