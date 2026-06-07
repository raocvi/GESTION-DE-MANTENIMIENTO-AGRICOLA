// ─── Auth ────────────────────────────────────────────────────────────────────
export interface SessionUser {
  id: string
  email: string
  name: string
  organizationId: string
  roles: string[]
}

export interface AuthSession {
  user: SessionUser
  expires: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Domain Enums ─────────────────────────────────────────────────────────────
export type Priority =
  | 'low' | 'medium' | 'high' | 'critical' | 'stopped' | 'safety'

export type Criticality = 'low' | 'medium' | 'high' | 'critical'

export type AssetStatus =
  | 'operative' | 'maintenance' | 'out_of_service' | 'warranty'
  | 'pending_parts' | 'diagnosis' | 'retired'

export type WorkOrderStatus =
  | 'new' | 'requested' | 'approved' | 'scheduled' | 'assigned'
  | 'en_route' | 'in_progress' | 'paused' | 'pending_parts'
  | 'pending_approval' | 'pending_client' | 'completed_by_tech'
  | 'in_review' | 'closed' | 'cancelled' | 'reopened'

export type WorkOrderType =
  | 'preventive' | 'corrective' | 'predictive' | 'inspection'
  | 'lubrication' | 'diagnosis' | 'warranty' | 'emergency'
  | 'campaign' | 'predelivery' | 'seasonal_pre' | 'seasonal_post'
  | 'daily_operator'

export type FrequencyType = 'days' | 'hours' | 'months' | 'km' | 'ha'
export type MeasureUnit   = 'hours' | 'kilometers' | 'hectares' | 'cycles' | 'days'

// ─── Organization ────────────────────────────────────────────────────────────
export interface Organization {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  city: string | null
  country: string
  currency: string
  timezone: string
  plan: string
  logoUrl: string | null
  createdAt: Date
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  organizationId: string
  email: string
  name: string
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
}

// ─── Cross-module Summaries ──────────────────────────────────────────────────
// These are lightweight DTOs that modules expose to each other via API.
// Never import full module types across module boundaries.

export interface AssetSummary {
  id: string
  internalCode: string
  name: string
  serialNumber: string | null
  operativeStatus: AssetStatus
  currentHours: number | null
  clientId: string | null
  brandName?: string
  modelName?: string
  categoryName?: string
}

export interface WorkOrderSummary {
  id: string
  number: string
  title: string
  type: WorkOrderType
  status: WorkOrderStatus
  priority: Priority
  assetId: string
  clientId: string | null
  scheduledDate: Date | null
  dueDate: Date | null
  assignedToId: string | null
  createdAt: Date
}

export interface ClientSummary {
  id: string
  code: string
  name: string
  city: string | null
  department: string | null
  contactName: string | null
}

export interface TechnicianSummary {
  id: string
  name: string
  level: string
  specialty: string[]
  phone: string | null
  email: string
}

export interface PartSummary {
  id: string
  internalCode: string
  name: string
  category: string | null
  unit: string
  currentStock: number
  minStock: number
  criticality: Criticality
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface KPIData {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}

// ─── Notifications ────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  href?: string
  read: boolean
  createdAt: Date
}
