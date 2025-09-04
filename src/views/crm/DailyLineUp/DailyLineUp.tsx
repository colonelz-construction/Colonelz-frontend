import React, { useState, useEffect, useContext } from 'react'
import { Button, Dialog, Input, Alert, Badge, Notification } from '@/components/ui'
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
import { UserDetailsContext } from '@/views/Context/userdetailsContext'

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

    const userAuthority = useAppSelector((state) => state.auth.user.authority) || []
    const userRole = useAppSelector((state) => state.auth.session.role || localStorage.getItem('role') || '')
    const data = useContext(UserDetailsContext);
    const userName = data?.username || '';



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
                toast.push(
                    <Notification title={'Error'} type="danger" duration={2000}>
                        {response.message || 'Failed to load date sheets'}
                    </Notification>,
                    { placement: 'top-end' }
                )
            }
        } catch (error) {
            console.error('Error loading date sheets:', error)
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to load date sheets
                </Notification>,
                { placement: 'top-end' }
            )
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
                toast.push(
                    <Notification title={'Error'} type="danger" duration={2000}>
                        {response.message || 'Failed to load sheet data'}
                    </Notification>,
                    { placement: 'top-end' }
                )
            }
        } catch (error) {
            console.error('Error loading sheet data:', error)
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to load sheet data
                </Notification>,
                { placement: 'top-end' }
            )
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
                time: (data.data[rowIndex]?.[0] ?? timeSlot) as string
            }

            // Add data for each team member column
            data.headers
                .slice(1)
                .filter(header => (header || '').trim() !== 'Tasks For Tomorrow')
                .forEach((header) => {
                    const originalIndex = data.headers.indexOf(header)
                    const cellValue = data.data[rowIndex] ? data.data[rowIndex][originalIndex] : ''
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

        data.headers
            .slice(1)
            .filter(header => (header || '').trim() !== 'Tasks For Tomorrow')
            .forEach((header) => {
                const originalIndex = data.headers.indexOf(header)
                const cellValue = data.data[tomorrowRowIndex] ? data.data[tomorrowRowIndex][originalIndex] : ''
                tomorrowRow[header] = cellValue || ''
            })

        gridRows.push(tomorrowRow)

        setGridRows(gridRows)
    }

    const handleCellClick = (rowId: number, columnName: string, currentValue: string) => {
        console.log('userRole', userRole, 'userName', userName, 'columnName', columnName)
        // Check if user has permission to edit this column
        if (!canEditColumn(userRole, userName, columnName)) {
            toast.push(
                <Notification title={'Permission Denied'} type="danger" duration={2000}>
                    You can only edit your own column
                </Notification>,
                { placement: 'top-end' }
            )
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
                const isTimeColumn = editingCell.column === (sheetData.headers?.[0] || 'Time')
                setGridRows(prev => prev.map(row => {
                    if (row.id !== editingCell.row) return row
                    if (isTimeColumn) {
                        return { ...row, time: editValue }
                    }
                    return { ...row, [editingCell.column]: editValue }
                }))

                toast.push(
                    <Notification title={'Success'} type="success" duration={1500}>
                        Cell updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                toast.push(
                    <Notification title={'Error'} type="danger" duration={2000}>
                        {response.message || 'Failed to update cell'}
                    </Notification>,
                    { placement: 'top-end' }
                )
            }
        } catch (error) {
            console.error('Error updating cell:', error)
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to update cell
                </Notification>,
                { placement: 'top-end' }
            )
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
            toast.push(
                <Notification title={'Invalid Date'} type="danger" duration={2000}>
                    Please enter date in YYYY-MM-DD format
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        try {
            const response = await apiCreateDateSheet({ date: newSheetDate })
            if (response.status) {
                toast.push(
                    <Notification title={'Success'} type="success" duration={1500}>
                        Date sheet created successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
                setCreateDialogOpen(false)
                setNewSheetDate('')
                loadDateSheets()
            } else {
                toast.push(
                    <Notification title={'Error'} type="danger" duration={2000}>
                        {response.message || 'Failed to create sheet'}
                    </Notification>,
                    { placement: 'top-end' }
                )
            }
        } catch (error) {
            console.error('Error creating sheet:', error)
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to create sheet
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleDeleteSheet = async (date: string) => {
        if (!window.confirm(`Are you sure you want to delete the sheet for ${date}?`)) {
            return
        }

        try {
            const response = await apiDeleteDateSheet(date)
            if (response.status) {
                toast.push(
                    <Notification title={'Success'} type="success" duration={1500}>
                        Date sheet deleted successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
                loadDateSheets()
                
                // If deleted sheet was current, switch to first available
                if (currentSheet === date) {
                    const remainingSheets = dateSheets.filter(sheet => sheet.title !== date)
                    setCurrentSheet(remainingSheets[0]?.title || '')
                }
            } else {
                toast.push(
                    <Notification title={'Error'} type="danger" duration={2000}>
                        {response.message || 'Failed to delete sheet'}
                    </Notification>,
                    { placement: 'top-end' }
                )
            }
        } catch (error) {
            console.error('Error deleting sheet:', error)
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to delete sheet
                </Notification>,
                { placement: 'top-end' }
            )
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
                        <div className="flex justify-between items-center px-3 py-2 border-b">
                            <TabList className="flex-1">
                                {dateSheets.map((sheet) => (
                                    <TabNav key={sheet.title} value={sheet.title}>
                                        <div className="flex items-center gap-2 text-base">
                                            {sheet.title}
                                            {sheet.title === getTodaySheetDate() && (
                                                <Badge content="Today" className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded" />
                                            )}
                                        </div>
                                    </TabNav>
                                ))}
                            </TabList>
                            
                            <AuthorityCheck userAuthority={userAuthority} authority={['SUPERADMIN']}>
                                {currentSheet && (
                                    <Button
                                        variant="plain"
                                        size="xs"
                                        className="text-red-600 hover:bg-red-50 h-7 px-2"
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
                                    <Table className="w-full text-base">
                                        <THead className="sticky top-0 bg-gray-50">
                                            <Tr>
                                                <Th className="sticky left-0 bg-gray-100 font-semibold min-w-[160px] py-3 px-4">
                                                    Time
                                                </Th>
                                                {((sheetData?.headers?.slice(1) ?? []).filter(header => (header || '').trim() !== 'Tasks For Tomorrow')).map((header) => (
                                                    <Th key={header} className="min-w-[200px] font-semibold py-3 px-4">
                                                        {header}
                                                    </Th>
                                                ))}
                                            </Tr>
                                        </THead>
                                        <TBody>
                                            {gridRows.map((row) => (
                                                <Tr key={row.id} className="hover:bg-gray-50">
                                                    <Td className="sticky left-0 bg-gray-50 font-medium border-r py-3 px-4">
                                                        {editingCell?.row === row.id && editingCell?.column === (sheetData?.headers?.[0] || 'Time') ? (
                                                            <Input
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleCellSave()
                                                                    if (e.key === 'Escape') handleCellCancel()
                                                                }}
                                                                className="text-base h-10 px-3"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <div
                                                                className={`min-h-[40px] py-2 px-2 whitespace-pre-wrap break-words ${userRole === 'SUPERADMIN' && row.id <= getTimeSlots().length ? 'cursor-text' : ''}`}
                                                                onClick={() => {
                                                                    if (userRole === 'SUPERADMIN' && row.id <= getTimeSlots().length) {
                                                                        const timeHeader = sheetData?.headers?.[0] || 'Time'
                                                                        handleCellClick(row.id, timeHeader, row.time)
                                                                    }
                                                                }}
                                                                title={row.time as string}
                                                            >
                                                                {row.time}
                                                            </div>
                                                        )}
                                                    </Td>
                                                    {((sheetData?.headers?.slice(1) ?? []).filter(header => (header || '').trim() !== 'Tasks For Tomorrow')).map((header) => (
                                                        <Td key={header} className="border-r py-2 px-2 align-top">
                                                            {editingCell?.row === row.id && editingCell?.column === header ? (
                                                                <Input
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleCellSave()
                                                                        if (e.key === 'Escape') handleCellCancel()
                                                                    }}
                                                                    className="text-base h-10 px-3"
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="min-h-[40px] py-2 px-2 cursor-text whitespace-pre-wrap break-words"
                                                                    onClick={() => handleCellClick(row.id, header, row[header] || '')}
                                                                    title={(row[header] || '') as string}
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
