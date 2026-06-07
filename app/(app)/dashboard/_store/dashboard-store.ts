import { create } from 'zustand'

export interface DashboardFilters {
  dateRange: { from: Date | null; to: Date | null }
  techId: string | null
  clientId: string | null
  assetId: string | null
  modelId: string | null
  orderStatus: string | null
  orderType: string | null
  priority: string | null
  zone: string | null
}

interface DashboardState {
  filters: DashboardFilters
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void
  clearFilters: () => void
}

const initialFilters: DashboardFilters = {
  dateRange: { from: null, to: null },
  techId: null,
  clientId: null,
  assetId: null,
  modelId: null,
  orderStatus: null,
  orderType: null,
  priority: null,
  zone: null,
}

export const useDashboardStore = create<DashboardState>((set) => ({
  filters: initialFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () =>
    set({
      filters: initialFilters,
    }),
}))
