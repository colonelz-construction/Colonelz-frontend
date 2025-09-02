import React, { useState, useEffect } from 'react'
import { Button, Dialog, Input, Alert, Badge } from '@/components/ui'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import { toast } from '@/components/ui'
import { AuthorityCheck } from '@/components/shared'
import { useAppSelector } from '@/store/hook'
import {
    apiGetDateSheets,
    apiGetSheetData,
    apiUpdateCell,
    apiCreateDateSheet,
    apiDeleteDateSheet,
    DateSheet,
    SheetData,
    formatDateForSheet,
    getTodaySheetDate,
    canEditColumn,
    getUserColumnIndex,
    isValidDateFormat,
    getTimeSlots
} from '@/services/DailyLineUpService'

interface GridRow {
    id: number
    time: string
    [key: string]: any
}

const { Tr, Th, Td, THead, TBody } = Table
const { TabList, TabNav, TabContent } = Tabs

const DailyLineUp: React.FC = () => {
    const [dateSheets, setDateSheets] = useState<DateSheet[]>([])
    const [currentSheet, setCurrentSheet] = useState<string>('')
    const [sheetData, setSheetData] = useState<SheetData | null>(null)
    const [loading, setLoading] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newSheetDate, setNewSheetDate] = useState('')
    const [gridRows, setGridRows] = useState<GridRow[]>([])
    const [editingCell, setEditingCell] = useState<{row: number, column: string} | null>(null)
    const [editValue, setEditValue] = useState('')

    const userAuthority = useAppSelector((state) => state.auth.user.authority)
    const userRole = useAppSelector((state) => state.auth.user.role)
    const userName = useAppSelector((state) => state.auth.user.userName)

    // Load date sheets on component mount
    useEffect(() => {
        loadDateSheets()
    }, [])

    // Load sheet data when current sheet changes
    useEffect(() => {
        if (currentSheet) {
            loadSheetData(currentSheet)
        }
    }, [currentSheet])

    const loadDateSheets = async () => {
        try {
            setLoading(true)
            const response = await apiGetDateSheets()
            if (response.status) {
                setDateSheets(response.data)
                
                // Set current sheet to today's date if it exists, otherwise first sheet
                const todaySheet = getTodaySheetDate()
                const todayExists = response.data.some(sheet => sheet.title === todaySheet)
                setCurrentSheet(todayExists ? todaySheet : response.data[0]?.title || '')
            } else {
                toast.push({
                    type: 'danger',
                    title: 'Error',
                    message: response.message || 'Failed to load date sheets'
                })
            }
        } catch (error) {
            console.error('Error loading date sheets:', error)
            toast.push({
                type: 'danger',
                title: 'Error',
                message: 'Failed to load date sheets'
            })
        } finally {
            setLoading(false)
        }
    }

    const loadSheetData = async (date: string) => {
        try {
            setLoading(true)
            const response = await apiGetSheetData(date)
            if (response.status) {
                setSheetData(response.data)
                setupGridData(response.data)
            } else {
                toast.push({
                    type: 'danger',
                    title: 'Error',
                    message: response.message || 'Failed to load sheet data'
                })
            }
        } catch (error) {
            console.error('Error loading sheet data:', error)
            toast.push({
                type: 'danger',
                title: 'Error',
                message: 'Failed to load sheet data'
            })
        } finally {
            setLoading(false)
        }
    }

    const setupGridData = (data: SheetData) => {
        if (!data.headers || data.headers.length === 0) return

        // Setup rows
        const timeSlots = getTimeSlots()
        const gridRows: GridRow[] = []

        // Add time slot rows
        timeSlots.forEach((timeSlot, rowIndex) => {
            const row: GridRow = {
                id: rowIndex + 1,
                time: timeSlot
            }

            // Add data for each team member column
            data.headers.slice(1).forEach((header, colIndex) => {
                const cellValue = data.data[rowIndex] ? data.data[rowIndex][colIndex + 1] : ''
                row[header] = cellValue || ''
            })

            gridRows.push(row)
        })

        // Add "Tasks For Tomorrow" row
        const tomorrowRowIndex = timeSlots.length
        const tomorrowRow: GridRow = {
            id: tomorrowRowIndex + 1,
            time: 'Tasks For Tomorrow'
        }

        data.headers.slice(1).forEach((header, colIndex) => {
            const cellValue = data.data[tomorrowRowIndex] ? data.data[tomorrowRowIndex][colIndex + 1] : ''
            tomorrowRow[header] = cellValue || ''
        })

        gridRows.push(tomorrowRow)

        setGridRows(gridRows)
    }

    const handleCellClick = (rowId: number, columnName: string, currentValue: string) => {
        // Check if user has permission to edit this column
        if (!canEditColumn(userRole, userName, columnName)) {
            toast.push({
                type: 'danger',
                title: 'Permission Denied',
                message: 'You can only edit your own column'
            })
            return
        }

        setEditingCell({ row: rowId, column: columnName })
        setEditValue(currentValue)
    }

    const handleCellSave = async () => {
        if (!editingCell || !sheetData) return

        try {
            const rowIndex = editingCell.row - 1
            const columnIndex = sheetData.headers.findIndex(header => header === editingCell.column) || 0

            const response = await apiUpdateCell(currentSheet, {
                row: rowIndex + 1, // +1 because sheet has header row
                column: columnIndex,
                value: editValue
            })

            if (response.status) {
                // Update local state
                setGridRows(prev => prev.map(row =>
                    row.id === editingCell.row ? { ...row, [editingCell.column]: editValue } : row
                ))

                toast.push({
                    type: 'success',
                    title: 'Success',
                    message: 'Cell updated successfully'
                })
            } else {
                toast.push({
                    type: 'danger',
                    title: 'Error',
                    message: response.message || 'Failed to update cell'
                })
            }
        } catch (error) {
            console.error('Error updating cell:', error)
            toast.push({
                type: 'danger',
                title: 'Error',
                message: 'Failed to update cell'
            })
        } finally {
            setEditingCell(null)
            setEditValue('')
        }
    }

    const handleCellCancel = () => {
        setEditingCell(null)
        setEditValue('')
    }

    const handleCreateSheet = async () => {
        if (!isValidDateFormat(newSheetDate)) {
            toast.push({
                type: 'danger',
                title: 'Invalid Date',
                message: 'Please enter date in YYYY-MM-DD format'
            })
            return
        }

        try {
            const response = await apiCreateDateSheet({ date: newSheetDate })
            if (response.status) {
                toast.push({
                    type: 'success',
                    title: 'Success',
                    message: 'Date sheet created successfully'
                })
                setCreateDialogOpen(false)
                setNewSheetDate('')
                loadDateSheets()
            } else {
                toast.push({
                    type: 'danger',
                    title: 'Error',
                    message: response.message || 'Failed to create sheet'
                })
            }
        } catch (error) {
            console.error('Error creating sheet:', error)
            toast.push({
                type: 'danger',
                title: 'Error',
                message: 'Failed to create sheet'
            })
        }
    }

    const handleDeleteSheet = async (date: string) => {
        if (!window.confirm(`Are you sure you want to delete the sheet for ${date}?`)) {
            return
        }

        try {
            const response = await apiDeleteDateSheet(date)
            if (response.status) {
                toast.push({
                    type: 'success',
                    title: 'Success',
                    message: 'Date sheet deleted successfully'
                })
                loadDateSheets()
                
                // If deleted sheet was current, switch to first available
                if (currentSheet === date) {
                    const remainingSheets = dateSheets.filter(sheet => sheet.title !== date)
                    setCurrentSheet(remainingSheets[0]?.title || '')
                }
            } else {
                toast.push({
                    type: 'danger',
                    title: 'Error',
                    message: response.message || 'Failed to delete sheet'
                })
            }
        } catch (error) {
            console.error('Error deleting sheet:', error)
            toast.push({
                type: 'danger',
                title: 'Error',
                message: 'Failed to delete sheet'
            })
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Daily LineUp
                    </h1>
                    <p className="text-gray-600">
                        Manage team tasks and schedules in an Excel-like grid format
                    </p>
                </div>

                <AuthorityCheck userAuthority={userAuthority} authority={['SUPERADMIN']}>
                    <Button
                        variant="solid"
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Create New Date Sheet
                    </Button>
                </AuthorityCheck>
            </div>

            {dateSheets.length === 0 ? (
                <Card className="p-8 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No date sheets available
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Create your first date sheet to get started
                    </p>
                    <AuthorityCheck userAuthority={userAuthority} authority={['SUPERADMIN']}>
                        <Button
                            variant="solid"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Date Sheet
                        </Button>
                    </AuthorityCheck>
                </Card>
            ) : (
                <Card>
                    <Tabs value={currentSheet} onChange={setCurrentSheet}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <TabList className="flex-1">
                                {dateSheets.map((sheet) => (
                                    <TabNav key={sheet.title} value={sheet.title}>
                                        <div className="flex items-center gap-2">
                                            {sheet.title}
                                            {sheet.title === getTodaySheetDate() && (
                                                <Badge content="Today" className="bg-blue-500 text-white text-xs px-2 py-1 rounded" />
                                            )}
                                        </div>
                                    </TabNav>
                                ))}
                            </TabList>
                            
                            <AuthorityCheck userAuthority={userAuthority} authority={['SUPERADMIN']}>
                                {currentSheet && (
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleDeleteSheet(currentSheet)}
                                    >
                                        Delete Sheet
                                    </Button>
                                )}
                            </AuthorityCheck>
                        </div>

                        {dateSheets.map((sheet) => (
                            <TabContent key={sheet.title} value={sheet.title}>
                                <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
                                    <Table className="w-full">
                                        <THead className="sticky top-0 bg-gray-50">
                                            <Tr>
                                                <Th className="sticky left-0 bg-gray-100 font-bold min-w-[120px]">
                                                    Time
                                                </Th>
                                                {sheetData?.headers.slice(1).map((header) => (
                                                    <Th key={header} className="min-w-[200px] font-bold">
                                                        {header}
                                                    </Th>
                                                ))}
                                            </Tr>
                                        </THead>
                                        <TBody>
                                            {gridRows.map((row) => (
                                                <Tr key={row.id} className="hover:bg-gray-50">
                                                    <Td className="sticky left-0 bg-gray-50 font-bold border-r">
                                                        {row.time}
                                                    </Td>
                                                    {sheetData?.headers.slice(1).map((header) => (
                                                        <Td key={header} className="border-r">
                                                            {editingCell?.row === row.id && editingCell?.column === header ? (
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleCellSave()
                                                                            if (e.key === 'Escape') handleCellCancel()
                                                                        }}
                                                                        className="text-sm"
                                                                        autoFocus
                                                                    />
                                                                    <Button size="sm" onClick={handleCellSave}>
                                                                        ✓
                                                                    </Button>
                                                                    <Button size="sm" variant="plain" onClick={handleCellCancel}>
                                                                        ✕
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="min-h-[40px] p-2 cursor-pointer hover:bg-gray-100 rounded"
                                                                    onClick={() => handleCellClick(row.id, header, row[header] || '')}
                                                                >
                                                                    {row[header] || ''}
                                                                </div>
                                                            )}
                                                        </Td>
                                                    ))}
                                                </Tr>
                                            ))}
                                        </TBody>
                                    </Table>
                                </div>
                            </TabContent>
                        ))}
                    </Tabs>
                </Card>
            )}

            {/* Create Sheet Dialog */}
            <Dialog
                isOpen={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onRequestClose={() => setCreateDialogOpen(false)}
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Create New Date Sheet</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Date (YYYY-MM-DD)
                            </label>
                            <Input
                                type="date"
                                value={newSheetDate}
                                onChange={(e) => setNewSheetDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Alert className="mt-4">
                            This will create a new sheet with the current team members as columns.
                        </Alert>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button
                            variant="plain"
                            onClick={() => setCreateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleCreateSheet}
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default DailyLineUp
