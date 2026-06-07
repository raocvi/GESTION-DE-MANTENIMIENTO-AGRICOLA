'use client'
import React from 'react'
import { cn } from '@core/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  className?: string
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading,
  emptyMessage = 'Sin datos',
  emptyDescription = 'No hay registros para mostrar.',
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center" role="status" aria-label="Cargando">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-slate-700">{emptyMessage}</p>
        <p className="text-xs text-slate-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-slate-200', className)}>
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-left',
                  col.align === 'center' && 'text-center',
                  col.align === 'right'  && 'text-right',
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-slate-50',
              )}
            >
              {columns.map((col) => {
                const value =
                  typeof col.key === 'string'
                    ? getNestedValue(row, col.key)
                    : (row as Record<keyof T, unknown>)[col.key]
                return (
                  <td
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-slate-700',
                      col.align === 'center' && 'text-center',
                      col.align === 'right'  && 'text-right',
                    )}
                  >
                    {col.render
                      ? col.render(value, row, rowIndex)
                      : String(value ?? '—')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
