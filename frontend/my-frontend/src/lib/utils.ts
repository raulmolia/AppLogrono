import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como moneda en formato español (€).
 * @param value El número a formatear.
 * @returns El número formateado como string (e.g., "1.234,56 €").
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "0,00 €";
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }).format(value);
};

/**
 * Formatea una fecha (string ISO o Date) a DD/MM/YYYY.
 * @param date La fecha a formatear.
 * @returns La fecha formateada como string o string vacío si es inválida.
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Fecha inválida';
  }
};
