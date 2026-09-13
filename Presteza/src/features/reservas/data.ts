import type { Mesa, MesaPlano, MesaVisual, Reserva, SeleccionReserva } from './types';
import { mesaOcupada } from './utils';

export const MESAS_SALON: MesaPlano[] = [
  { id: 'T1', capacity: 1, x: 10, y: 24 },
  { id: 'T2', capacity: 1, x: 22, y: 24 },
  { id: 'T3', capacity: 1, x: 34, y: 24 },
  { id: 'T4', capacity: 2, x: 46, y: 24 },
  { id: 'T5', capacity: 2, x: 58, y: 24 },
  { id: 'T6', capacity: 2, x: 70, y: 24 },
  { id: 'T7', capacity: 3, x: 11, y: 40 },
  { id: 'T8', capacity: 3, x: 29, y: 40 },
  { id: 'T9', capacity: 3, x: 47, y: 40 },
  { id: 'T10', capacity: 3, x: 65, y: 40 },
  { id: 'T11', capacity: 3, x: 83, y: 40 },
  { id: 'T12', capacity: 4, x: 10, y: 56 },
  { id: 'T13', capacity: 4, x: 26, y: 56 },
  { id: 'T14', capacity: 4, x: 42, y: 56 },
  { id: 'T15', capacity: 4, x: 58, y: 56 },
  { id: 'T16', capacity: 4, x: 74, y: 56 },
  { id: 'T17', capacity: 4, x: 90, y: 56 },
  { id: 'T18', capacity: 5, x: 14, y: 72 },
  { id: 'T19', capacity: 5, x: 32, y: 72 },
  { id: 'T20', capacity: 5, x: 50, y: 72 },
  { id: 'T21', capacity: 5, x: 68, y: 72 },
  { id: 'T22', capacity: 5, x: 86, y: 72 },
  { id: 'T23', capacity: 6, x: 16, y: 88 },
  { id: 'T24', capacity: 6, x: 34, y: 88 },
  { id: 'T25', capacity: 6, x: 52, y: 88 },
  { id: 'T26', capacity: 6, x: 70, y: 88 },
  { id: 'T27', capacity: 6, x: 88, y: 88 },
];

const HORARIO_SEMANA = { abre: 11 * 60, cierra: 22 * 60, etiqueta: '11:00 a. m. – 10:00 p. m.' };
const HORARIO_FIN = { abre: 12 * 60, cierra: 23 * 60, etiqueta: '12:00 m. – 11:00 p. m.' };

function textoHora(minutos: number) {
  const hora = Math.floor(minutos / 60);
  const mins = String(minutos % 60).padStart(2, '0');
  if (hora === 0) return `12:${mins} a. m.`;
  if (hora === 12) return `12:${mins} ${mins === '00' ? 'm.' : 'p. m.'}`;
  if (hora > 12) return `${hora - 12}:${mins} p. m.`;
  return `${hora}:${mins} a. m.`;
}

export function esFinDeSemana(fecha: string) {
  const partes = fecha.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!partes) return false;
  const dia = new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1])).getDay();
  return dia === 0 || dia === 6;
}

export function horarioDelDia(fecha: string) {
  return esFinDeSemana(fecha) ? HORARIO_FIN : HORARIO_SEMANA;
}

export function horasAbiertas(fecha: string) {
  const { abre, cierra } = horarioDelDia(fecha);
  const horas: string[] = [];
  for (let minuto = abre; minuto <= cierra; minuto += 30) {
    horas.push(textoHora(minuto));
  }
  return horas;
}

export function horaEnHorario(fecha: string, hora: string) {
  if (!hora.trim()) return false;
  return horasAbiertas(fecha).includes(hora.trim());
}

export function mesasDelSalon(mesas: Mesa[], reservas: Reserva[], date: string, time: string): MesaVisual[] {
  return MESAS_SALON.map((mesa) => {
    const api = mesas.find((item) => item.number === mesa.id);
    const inactiva = api?.active === false || api?.status === 'maintenance';
    const ocupada = Boolean(date && time && mesaOcupada(reservas, mesa.id, date, time));

    return {
      ...mesa,
      capacity: api?.capacity || mesa.capacity,
      available: !inactiva && !ocupada,
    };
  });
}

export function tamanoMesa3D(capacity: number) {
  if (capacity <= 2) return { top: 52, squash: 0.55, pata: 18 };
  if (capacity <= 4) return { top: 62, squash: 0.55, pata: 20 };
  if (capacity <= 5) return { top: 72, squash: 0.5, pata: 20 };
  return { top: 80, squash: 0.48, pata: 20 };
}

export function sillasIsometricas(capacity: number, radioX: number, radioY: number) {
  return Array.from({ length: capacity }, (_, index) => {
    const angulo = ((360 / Math.max(capacity, 1)) * index - 90) * (Math.PI / 180);
    const y = Math.sin(angulo) * radioY;
    return {
      x: Math.cos(angulo) * radioX,
      y,
      atras: y < 0,
    };
  });
}

export function numeroMesa(seleccion: SeleccionReserva) {
  if (seleccion?.tipo === 'mesa') return seleccion.mesa.id;
  if (seleccion?.tipo === 'barra') return 'BARRA';
  if (seleccion?.tipo === 'custom') return 'CUSTOM';
  return '';
}

export function textoSeleccion(seleccion: SeleccionReserva, personas: number) {
  if (seleccion?.tipo === 'mesa') {
    return `Mesa ${seleccion.mesa.id} · ${seleccion.mesa.capacity} personas`;
  }
  if (seleccion?.tipo === 'barra') return 'Barra comunal · 1+ personas';
  if (seleccion?.tipo === 'custom') {
    return `Mesa personalizada · ${personas} ${personas === 1 ? 'persona' : 'personas'}`;
  }
  return 'Selecciona una mesa o la barra primero';
}

export function mostrarSelector(seleccion: SeleccionReserva, personas: number) {
  if (seleccion?.tipo === 'custom' || seleccion?.tipo === 'barra') return true;
  return seleccion?.tipo === 'mesa' && personas === 1;
}
