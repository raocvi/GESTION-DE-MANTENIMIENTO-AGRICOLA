/**
 * @file utils.ts
 * @description Funciones utilitarias compartidas en todo AgroMaint Pro.
 * Incluye formateo de fechas, números, moneda, generación de códigos y helpers de string.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Styling ────────────────────────────────────────────────────────────────

/**
 * Combina clases de Tailwind CSS de forma segura, resolviendo conflictos.
 * Usa clsx para lógica condicional y tailwind-merge para deduplicar clases.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date Formatting ────────────────────────────────────────────────────────

/**
 * Formatea una fecha en formato corto colombiano: `dd/MM/yyyy`.
 * Retorna '—' si la fecha es null o undefined.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatea una fecha con hora en formato `dd/MM/yyyy HH:mm`.
 * Retorna '—' si la fecha es null o undefined.
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

/**
 * Formatea una fecha de forma relativa al momento actual.
 * Ejemplo: "hace 3 días", "en 2 horas".
 * Retorna '—' si la fecha es null o undefined.
 */
export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

// ─── Number Formatting ───────────────────────────────────────────────────────

/**
 * Formatea horas de horómetro con separador de miles (locale es-CO).
 * Ejemplo: formatHours(1248) → "1.248 h"
 * Retorna '—' si el valor es null o undefined.
 */
export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return '—'
  return `${hours.toLocaleString('es-CO')} h`
}

/**
 * Formatea un valor monetario en la moneda especificada (por defecto COP).
 * Ejemplo: formatCurrency(1500000) → "$ 1.500.000"
 * Retorna '—' si el valor es null o undefined.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = 'COP',
): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

// ─── Identifier Generation ───────────────────────────────────────────────────

/**
 * Genera un número de orden único con formato `{PREFIX}-{YYMMDD}-{RAND4}`.
 * Ejemplo: generateOrderNumber('OT') → "OT-260607-4823"
 *
 * El sufijo aleatorio de 4 dígitos reduce colisiones en el mismo día,
 * aunque no garantiza unicidad — validar contra BD si es necesario.
 *
 * @param prefix - Prefijo del número (por defecto 'OT')
 */
export function generateOrderNumber(prefix = 'OT'): string {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `${prefix}-${yy}${mm}${dd}-${rand}`
}

// ─── String Helpers ───────────────────────────────────────────────────────────

/**
 * Convierte un texto a formato slug (URL-safe).
 * Elimina tildes, caracteres especiales y reemplaza espacios con guiones.
 * Ejemplo: slugify("Aceite Motor 15W-40") → "aceite-motor-15w-40"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}

/**
 * Trunca un texto a la longitud máxima especificada, añadiendo '…' al final.
 * Si el texto cabe, lo retorna sin modificar.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

/**
 * Extrae las iniciales de un nombre (máximo 2 letras).
 * Ejemplo: getInitials("Juan Carlos Montoya") → "JC"
 * Usado en avatares y badges de usuario.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}
