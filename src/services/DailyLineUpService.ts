import appConfig from '@/configs/app.config'
import ApiService from './ApiService'

const { apiPrefix } = appConfig

// Types for Daily LineUp
export interface DateSheet {
    title: string
    sheetId: number
}

export interface SheetData {
    headers: string[]
    data: string[][]
}

export interface CellUpdate {
    row: number
    column: number
    value: string
}

export interface BatchUpdateRequest {
    updates: CellUpdate[]
}

export interface CreateSheetRequest {
    date: string
}

export interface ApiResponse<T> {
    data: T
    code: number
    status: boolean
    message: string
}

// API Functions

/**
 * Get all available date sheets
 */
export async function apiGetDateSheets(): Promise<ApiResponse<DateSheet[]>> {
    return ApiService.fetchData<ApiResponse<DateSheet[]>>({
        url: `${apiPrefix}/admin/daily-lineup/sheets`,
        method: 'get',
    }).then((response) => response.data)
}

/**
 * Get data for a specific date sheet
 */
export async function apiGetSheetData(date: string): Promise<ApiResponse<SheetData>> {
    return ApiService.fetchData<ApiResponse<SheetData>>({
        url: `${apiPrefix}/admin/daily-lineup/sheet/${date}`,
        method: 'get',
    }).then((response) => response.data)
}

/**
 * Update a specific cell in the sheet
 */
export async function apiUpdateCell(
    date: string,
    cellUpdate: CellUpdate
): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return ApiService.fetchData<ApiResponse<{ success: boolean; message: string }>>({
        url: `${apiPrefix}/admin/daily-lineup/sheet/${date}/cell`,
        method: 'put',
        data: cellUpdate,
    }).then((response) => response.data)
}

/**
 * Batch update multiple cells
 */
export async function apiBatchUpdateCells(
    date: string,
    batchUpdate: BatchUpdateRequest
): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return ApiService.fetchData<ApiResponse<{ success: boolean; message: string }>>({
        url: `${apiPrefix}/admin/daily-lineup/sheet/${date}/batch`,
        method: 'put',
        data: batchUpdate,
    }).then((response) => response.data)
}

/**
 * Create a new date sheet (SUPERADMIN only)
 */
export async function apiCreateDateSheet(
    createRequest: CreateSheetRequest
): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return ApiService.fetchData<ApiResponse<{ success: boolean; message: string }>>({
        url: `${apiPrefix}/admin/daily-lineup/sheet`,
        method: 'post',
        data: createRequest,
    }).then((response) => response.data)
}

/**
 * Delete a date sheet (SUPERADMIN only)
 */
export async function apiDeleteDateSheet(
    date: string
): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return ApiService.fetchData<ApiResponse<{ success: boolean; message: string }>>({
        url: `${apiPrefix}/admin/daily-lineup/sheet/${date}`,
        method: 'delete',
    }).then((response) => response.data)
}

/**
 * Get team members for the current organization
 */
export async function apiGetTeamMembers(): Promise<ApiResponse<string[]>> {
    return ApiService.fetchData<ApiResponse<string[]>>({
        url: `${apiPrefix}/admin/daily-lineup/team-members`,
        method: 'get',
    }).then((response) => response.data)
}

// Utility functions for frontend

/**
 * Format date to YYYY-MM-DD format
 */
export function formatDateForSheet(date: Date): string {
    return date.toISOString().split('T')[0]
}

/**
 * Parse date from sheet title
 */
export function parseDateFromSheet(sheetTitle: string): Date {
    return new Date(sheetTitle)
}

/**
 * Get today's date in sheet format
 */
export function getTodaySheetDate(): string {
    return formatDateForSheet(new Date())
}

/**
 * Check if user can edit a specific column
 */
export function canEditColumn(userRole: string, userName: string, columnHeader: string): boolean {
    // Superadmins can edit all columns
    if (userRole === 'SUPERADMIN') {
        return true
    }
    
    // Other users can only edit their own column
    return columnHeader === userName
}

/**
 * Get column index for a specific user
 */
export function getUserColumnIndex(headers: string[], userName: string): number {
    return headers.findIndex(header => header === userName)
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    return dateRegex.test(date)
}

/**
 * Get time slots for the sheet
 */
export function getTimeSlots(): string[] {
    return ['10:00 AM', '2:15 PM', '6:45 PM']
}

/**
 * Get row index for "Tasks For Tomorrow"
 */
export function getTasksForTomorrowRowIndex(): number {
    return getTimeSlots().length + 1 // After all time slots
}

/**
 * Check if a row is a time slot row
 */
export function isTimeSlotRow(rowIndex: number): boolean {
    return rowIndex > 0 && rowIndex <= getTimeSlots().length
}

/**
 * Check if a row is the "Tasks For Tomorrow" row
 */
export function isTasksForTomorrowRow(rowIndex: number): boolean {
    return rowIndex === getTasksForTomorrowRowIndex()
}

/**
 * Get display name for row
 */
export function getRowDisplayName(rowIndex: number): string {
    if (rowIndex === 0) return 'Header'
    if (isTimeSlotRow(rowIndex)) {
        return getTimeSlots()[rowIndex - 1]
    }
    if (isTasksForTomorrowRow(rowIndex)) {
        return 'Tasks For Tomorrow'
    }
    return `Row ${rowIndex}`
}
