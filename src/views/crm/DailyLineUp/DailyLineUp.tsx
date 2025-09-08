import React, { useState, useEffect, useContext } from 'react'
import { Button, Dialog, Input, Alert, Badge, Notification, Dropdown, Spinner } from '@/components/ui'
import Tabs from '@/components/ui/Tabs'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import { toast } from '@/components/ui'
import { AuthorityCheck } from '@/components/shared'
import { useAppSelector } from '@/store/hook'
import { useRoleContext } from '../Roles/RolesContext'
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
import NoData from '@/views/pages/NoData'

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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [sheetToDelete, setSheetToDelete] = useState<string>('')
    const [newSheetDate, setNewSheetDate] = useState('')
    const [gridRows, setGridRows] = useState<GridRow[]>([])
    const [editingCell, setEditingCell] = useState<{ row: number, column: string } | null>(null)
    const [editValue, setEditValue] = useState('')
    const [downloadDropdownOpen, setDownloadDropdownOpen] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [cellUpdateLoading, setCellUpdateLoading] = useState(false)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [showFullScreenControls, setShowFullScreenControls] = useState(true)

    const userAuthority = useAppSelector((state) => state.auth.user.authority) || []
    const userRole = useAppSelector((state) => state.auth.session.role || localStorage.getItem('role') || '')
    const data = useContext(UserDetailsContext);
    const userName = data?.username || '';
    const { roleData } = useRoleContext();

    // Permission checks
    const createAccess = userRole === 'SUPERADMIN' ? true : roleData?.data?.dailyLineUp?.create?.includes(userRole)
    const deleteAccess = userRole === 'SUPERADMIN' ? true : roleData?.data?.dailyLineUp?.delete?.includes(userRole)

    // Full screen functionality
    const enterFullScreen = async () => {
        try {
            const element = document.documentElement
            if (element.requestFullscreen) {
                await element.requestFullscreen()
            } else if ((element as any).webkitRequestFullscreen) {
                await (element as any).webkitRequestFullscreen()
            } else if ((element as any).msRequestFullscreen) {
                await (element as any).msRequestFullscreen()
            }
            setIsFullScreen(true)
            setShowFullScreenControls(true)
            // Hide controls after 3 seconds
            setTimeout(() => setShowFullScreenControls(false), 3000)
        } catch (error) {
            console.error('Failed to enter full screen:', error)
        }
    }

    const exitFullScreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen()
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen()
            }
            setIsFullScreen(false)
            setShowFullScreenControls(true)
        } catch (error) {
            console.error('Failed to exit full screen:', error)
        }
    }

    const toggleFullScreen = () => {
        if (isFullScreen) {
            exitFullScreen()
        } else {
            enterFullScreen()
        }
    }

    const navigateToSheet = (direction: 'prev' | 'next') => {
        const currentIndex = dateSheets.findIndex(sheet => sheet.title === currentSheet)
        let newIndex: number
        
        if (direction === 'prev') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : dateSheets.length - 1
        } else {
            newIndex = currentIndex < dateSheets.length - 1 ? currentIndex + 1 : 0
        }
        
        setCurrentSheet(dateSheets[newIndex]?.title || '')
    }

    const handleMouseMove = () => {
        if (isFullScreen) {
            setShowFullScreenControls(true)
            setTimeout(() => setShowFullScreenControls(false), 3000)
        }
    }



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

    // Keyboard event handler for full screen functionality
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent default behavior if we're handling the key
            if (event.key === 'F5' || (isFullScreen && ['Escape', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(event.key))) {
                event.preventDefault()
            }
            
            switch (event.key) {
                case 'F5':
                    toggleFullScreen()
                    break
                case 'Escape':
                    if (isFullScreen) {
                        exitFullScreen()
                    }
                    break
                case 'ArrowLeft':
                case 'PageUp':
                    if (isFullScreen && dateSheets.length > 1) {
                        navigateToSheet('prev')
                    }
                    break
                case 'ArrowRight':
                case 'PageDown':
                    if (isFullScreen && dateSheets.length > 1) {
                        navigateToSheet('next')
                    }
                    break
            }
        }
        
        const handleFullScreenChange = () => {
            const isCurrentlyFullScreen = !!(document.fullscreenElement || 
                (document as any).webkitFullscreenElement || 
                (document as any).msFullscreenElement)
            setIsFullScreen(isCurrentlyFullScreen)
            if (!isCurrentlyFullScreen) {
                setShowFullScreenControls(true)
            }
        }
        
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('fullscreenchange', handleFullScreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange)
        document.addEventListener('msfullscreenchange', handleFullScreenChange)
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('fullscreenchange', handleFullScreenChange)
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange)
            document.removeEventListener('msfullscreenchange', handleFullScreenChange)
        }
    }, [isFullScreen, dateSheets, currentSheet])

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
            .filter(header => (header || '').trim() !== 'Tasks For Tomorrow' && (header || '').trim() !== 'Remarks')
            .forEach((header) => {
                const originalIndex = data.headers.indexOf(header)
                const cellValue = data.data[tomorrowRowIndex] ? data.data[tomorrowRowIndex][originalIndex] : ''
                tomorrowRow[header] = cellValue || ''
            })

        gridRows.push(tomorrowRow)

        // Add "Remarks" row
        const remarksRowIndex = timeSlots.length + 1
        const remarksRow: GridRow = {
            id: remarksRowIndex + 1,
            time: 'Remarks'
        }

        data.headers
            .slice(1)
            .filter(header => (header || '').trim() !== 'Tasks For Tomorrow' && (header || '').trim() !== 'Remarks')
            .forEach((header) => {
                const originalIndex = data.headers.indexOf(header)
                const cellValue = data.data[remarksRowIndex] ? data.data[remarksRowIndex][originalIndex] : ''
                remarksRow[header] = cellValue || ''
            })

        gridRows.push(remarksRow)

        setGridRows(gridRows)
    }

    const handleCellClick = (rowId: number, columnName: string, currentValue: string) => {
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

        setCellUpdateLoading(true)
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
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to update cell
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setCellUpdateLoading(false)
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

        setCreateLoading(true)
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
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to create sheet
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDeleteSheet = (date: string) => {
        setSheetToDelete(date)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!sheetToDelete) return

        setDeleteLoading(true)
        try {
            const response = await apiDeleteDateSheet(sheetToDelete)
            if (response.status) {
                toast.push(
                    <Notification title={'Success'} type="success" duration={1500}>
                        Date sheet deleted successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
                loadDateSheets()

                // If deleted sheet was current, switch to first available
                if (currentSheet === sheetToDelete) {
                    const remainingSheets = dateSheets.filter(sheet => sheet.title !== sheetToDelete)
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
            toast.push(
                <Notification title={'Error'} type="danger" duration={2000}>
                    Failed to delete sheet
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setDeleteLoading(false)
            setDeleteDialogOpen(false)
            setSheetToDelete('')
        }
    }

    const getVisibleData = () => {
        if (!sheetData || !gridRows.length) return null
        const visibleHeaders = ['Time', ...((sheetData.headers?.slice(1) ?? []).filter(header => (header || '').trim() !== 'Tasks For Tomorrow' && (header || '').trim() !== 'Remarks'))]
        return { headers: visibleHeaders, rows: gridRows }
    }

    const downloadCSV = () => {
        const data = getVisibleData()
        if (!data) return

        const csvContent = [
            data.headers.join(','),
            ...data.rows.map(row => [
                `"${row.time.toString().replace(/"/g, '""')}"`,
                ...data.headers.slice(1).map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`)
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `daily-lineup-${currentSheet}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const downloadExcel = () => {
        const data = getVisibleData()
        if (!data) return

        const worksheet = [
            data.headers,
            ...data.rows.map(row => [
                row.time,
                ...data.headers.slice(1).map(header => row[header] || '')
            ])
        ]

        let xlsContent = '<table>'
        worksheet.forEach((row, i) => {
            xlsContent += '<tr>'
            row.forEach(cell => {
                xlsContent += i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`
            })
            xlsContent += '</tr>'
        })
        xlsContent += '</table>'

        const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `daily-lineup-${currentSheet}.xls`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const downloadPDF = () => {
        const data = getVisibleData()
        if (!data) return

        let htmlContent = `
            <html>
            <head>
                <title>Daily LineUp - ${currentSheet}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>Daily LineUp - ${currentSheet}</h1>
                <table>
                    <thead><tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${data.rows.map(row =>
            `<tr><td>${row.time}</td>${data.headers.slice(1).map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
        ).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `

        const blob = new Blob([htmlContent], { type: 'text/html' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `daily-lineup-${currentSheet}.html`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const handleDownload = (format: string) => {
        if (format === 'csv') downloadCSV()
        else if (format === 'excel') downloadExcel()
        else if (format === 'pdf') downloadPDF()

        setDownloadDropdownOpen(false)
        toast.push(
            <Notification title={'Success'} type="success" duration={1500}>
                Sheet downloaded successfully
            </Notification>,
            { placement: 'top-end' }
        )
    }

    const isToday = (dateString: string) => {
        const today = new Date()
        const sheetDate = new Date(dateString)
        return today.toDateString() === sheetDate.toDateString()
    }

    // Full screen presentation view
    if (isFullScreen) {
        const visibleData = getVisibleData()
        if (!visibleData || !currentSheet) {
            return (
                <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-4">No Data Available</h2>
                        <p className="text-xl mb-8">Please select a sheet with data to present</p>
                        <Button onClick={exitFullScreen} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
                            Exit Full Screen
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div 
                className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-hidden"
                onMouseMove={handleMouseMove}
            >
                {/* Full screen controls overlay */}
                <div className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ${
                    showFullScreenControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}>
                    <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">Daily LineUp</h1>
                            <div className="flex items-center gap-2">
                                <Badge content={`${dateSheets.findIndex(s => s.title === currentSheet) + 1} / ${dateSheets.length}`} 
                                       className="bg-blue-500 text-white px-3 py-1 rounded-full" />
                                <span className="text-lg font-medium">{currentSheet}</span>
                                {isToday(currentSheet) && (
                                    <Badge content="Today" className="bg-green-500 text-white px-2 py-1 rounded-full" />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="plain" 
                                size="sm" 
                                className="text-white hover:bg-white/20 px-3 py-2"
                                onClick={() => navigateToSheet('prev')}
                                disabled={dateSheets.length <= 1}
                                title="Previous Sheet (Left Arrow)"
                            >
                                ← Prev
                            </Button>
                            <Button 
                                variant="plain" 
                                size="sm" 
                                className="text-white hover:bg-white/20 px-3 py-2"
                                onClick={() => navigateToSheet('next')}
                                disabled={dateSheets.length <= 1}
                                title="Next Sheet (Right Arrow)"
                            >
                                Next →
                            </Button>
                            <Button 
                                variant="plain" 
                                size="sm" 
                                className="text-white hover:bg-white/20 px-3 py-2"
                                onClick={exitFullScreen}
                                title="Exit Full Screen (ESC)"
                            >
                                ✕ Exit
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Full screen content */}
                <div className="h-full w-full overflow-auto p-8 pt-20">
                    <div className="max-w-full mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table className="w-full text-lg">
                                    <THead className="bg-gray-100 dark:bg-gray-700">
                                        <Tr>
                                            <Th className="font-bold text-xl py-4 px-6 text-gray-900 dark:text-gray-100 min-w-[200px]">
                                                Time
                                            </Th>
                                            {visibleData.headers.slice(1).map((header) => (
                                                <Th key={header} className="font-bold text-xl py-4 px-6 text-gray-900 dark:text-gray-100 min-w-[250px]">
                                                    {header}
                                                </Th>
                                            ))}
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {visibleData.rows.map((row, index) => (
                                            <Tr key={row.id} className={`${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'} border-b border-gray-200 dark:border-gray-700`}>
                                                <Td className="font-semibold text-lg py-4 px-6 text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600">
                                                    {editingCell?.row === row.id && editingCell?.column === (sheetData?.headers?.[0] || 'Time') ? (
                                                        <div className="relative">
                                                            <Input
                                                                textArea
                                                                rows={3}
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={handleCellSave}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && e.ctrlKey) handleCellSave()
                                                                    if (e.key === 'Escape') handleCellCancel()
                                                                }}
                                                                className="text-lg min-h-[100px] px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 resize-none overflow-hidden transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                autoFocus
                                                                disabled={cellUpdateLoading}
                                                            />
                                                            {cellUpdateLoading && (
                                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                                    <Spinner size="16px" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={`whitespace-pre-wrap break-words min-h-[2.5rem] flex items-start cursor-text ${userRole === 'SUPERADMIN' && row.id <= getTimeSlots().length ? 'cursor-text' : ''}`}
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
                                                {visibleData.headers.slice(1).map((header) => (
                                                    <Td key={header} className="text-lg py-4 px-6 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 align-top">
                                                        {editingCell?.row === row.id && editingCell?.column === header ? (
                                                            <div className="relative">
                                                                <Input
                                                                    textArea
                                                                    rows={3}
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    onBlur={handleCellSave}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && e.ctrlKey) handleCellSave()
                                                                        if (e.key === 'Escape') handleCellCancel()
                                                                    }}
                                                                    className="text-lg min-h-[100px] px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 resize-none overflow-hidden transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    autoFocus
                                                                    disabled={cellUpdateLoading}
                                                                />
                                                                {cellUpdateLoading && (
                                                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                                        <Spinner size="16px" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="whitespace-pre-wrap break-words min-h-[2.5rem] flex items-start cursor-text"
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
                        </div>
                    </div>
                </div>

                {/* Keyboard shortcuts hint */}
                <div className={`absolute bottom-4 right-4 transition-all duration-300 ${
                    showFullScreenControls ? 'opacity-100' : 'opacity-0'
                }`}>
                    <div className="bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg">
                        <div className="text-center">
                            <div>F5: Toggle • ESC: Exit • ←/→: Navigate • Mouse: Show Controls</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Daily LineUp
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage team tasks and schedules in an Excel-like grid format
                    </p>
                </div>

                {createAccess && (
                    <Button
                        variant="solid"
                        onClick={() => {
                            setNewSheetDate(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }))
                            setCreateDialogOpen(true)
                        }}
                    >
                        Create New Date Sheet
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="40px" />
                </div>
            ) : dateSheets.length === 0 ? (
                <Card className="p-8 text-center">
                    {/* <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No date sheets available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first date sheet to get started
                    </p>
                    <AuthorityCheck
                        userAuthority={[`${localStorage.getItem('role')}`]}
                        authority={userRole === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.dailyLineUp?.create ?? []}
                    >
                        <Button
                            variant="solid"
                            onClick={() => {
                                setNewSheetDate(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }))
                                setCreateDialogOpen(true)
                            }}
                        >
                            Create Date Sheet
                        </Button>
                    </AuthorityCheck> */}
                    <NoData text='No Sheets Available'/>
                </Card>
            ) : (
                <Card>
                    <Tabs value={currentSheet} onChange={setCurrentSheet}>
                        <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative flex-1 overflow-hidden">
                                {/* Left Arrow */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-full flex items-center justify-start pointer-events-none">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">◀</span>
                                </div>
                                <TabList className="flex overflow-x-auto whitespace-nowrap no-scrollbar scroll-smooth px-6">
                                    {dateSheets.map((sheet) => (
                                        <TabNav key={sheet.title} value={sheet.title}>
                                            <div className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
                                                {sheet.title}
                                                {isToday(sheet.title) && (
                                                    <Badge content="Today" className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded" />
                                                )}
                                            </div>
                                        </TabNav>
                                    ))}
                                </TabList>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-full flex items-center justify-end pointer-events-none">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">▶</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {currentSheet && (
                                    <Button
                                        variant="solid"
                                        size="xs"
                                        className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-3 rounded-md shadow-sm"
                                        onClick={toggleFullScreen}
                                        title="Enter Full Screen Mode (F5)"
                                    >
                                        🖥️ Present
                                    </Button>
                                )}
                                {currentSheet && (
                                    <Dropdown
                                        placement="bottom-end"
                                        renderTitle={
                                            <Button
                                                variant="solid"
                                                size="xs"
                                                className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 rounded-md shadow-sm"
                                            >
                                                ⬇️ Download
                                            </Button>
                                        }
                                    >
                                        <Dropdown.Item eventKey="csv" onSelect={() => handleDownload('csv')}>
                                            📄 CSV
                                        </Dropdown.Item>
                                        <Dropdown.Item eventKey="excel" onSelect={() => handleDownload('excel')}>
                                            📊 Excel
                                        </Dropdown.Item>
                                        <Dropdown.Item eventKey="pdf" onSelect={() => handleDownload('pdf')}>
                                            📋 PDF
                                        </Dropdown.Item>
                                    </Dropdown>
                                )}
                                {deleteAccess && currentSheet && (
                                    <Button
                                        variant="plain"
                                        size="xs"
                                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md h-7 px-2 transition-all duration-200 hover:border-red-300 dark:hover:border-red-600"
                                        onClick={() => handleDeleteSheet(currentSheet)}
                                    >
                                        🗑️ Delete
                                    </Button>
                                )}
                            </div>
                        </div>

                        {dateSheets.map((sheet) => (
                            <TabContent key={sheet.title} value={sheet.title}>
                                <div className="overflow-y-auto" style={{ maxHeight: '600px', overflowX: 'hidden' }}>
                                    {loading ? (
                                        <div className="flex justify-center items-center py-20">
                                            <Spinner size="40px" />
                                        </div>
                                    ) : (
                                        <Table className="w-full text-base">
                                            <THead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                                <Tr>
                                                    <Th className="sticky left-0 bg-gray-100 dark:bg-gray-700 font-semibold min-w-[160px] py-3 px-4 text-gray-900 dark:text-gray-100">
                                                        Time
                                                    </Th>
                                                    {((sheetData?.headers?.slice(1) ?? []).filter(header => (header || '').trim() !== 'Tasks For Tomorrow' && (header || '').trim() !== 'Remarks')).map((header) => (
                                                        <Th key={header} className="min-w-[200px] font-semibold py-3 px-4 text-gray-900 dark:text-gray-100">
                                                            {header}
                                                        </Th>
                                                    ))}
                                                </Tr>
                                            </THead>
                                            <TBody>
                                                {gridRows.map((row) => (
                                                    <Tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <Td className="sticky left-0 bg-gray-50 dark:bg-gray-800 font-medium border-r border-gray-200 dark:border-gray-700 py-3 px-4">
                                                            {editingCell?.row === row.id && editingCell?.column === (sheetData?.headers?.[0] || 'Time') ? (
                                                                <div className="relative">
                                                                    <Input
                                                                        textArea
                                                                        rows={3}
                                                                        value={editValue}
                                                                        onChange={(e) => setEditValue(e.target.value)}
                                                                        onBlur={handleCellSave}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter' && e.ctrlKey) handleCellSave()
                                                                            if (e.key === 'Escape') handleCellCancel()
                                                                        }}
                                                                        className="text-base min-h-[100px] px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 resize-none overflow-hidden transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        autoFocus
                                                                        disabled={cellUpdateLoading}
                                                                    />
                                                                    {cellUpdateLoading && (
                                                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                                            <Spinner size="16px" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={`min-h-[40px] py-2 px-2 whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100 ${userRole === 'SUPERADMIN' && row.id <= getTimeSlots().length ? 'cursor-text' : ''}`}
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
                                                        {((sheetData?.headers?.slice(1) ?? []).filter(header => (header || '').trim() !== 'Tasks For Tomorrow' && (header || '').trim() !== 'Remarks')).map((header) => (
                                                            <Td key={header} className="border-r border-gray-200 dark:border-gray-700 py-2 px-2 align-top">
                                                                {editingCell?.row === row.id && editingCell?.column === header ? (
                                                                    <div className="relative">
                                                                        <Input
                                                                            textArea
                                                                            rows={3}
                                                                            value={editValue}
                                                                            onChange={(e) => setEditValue(e.target.value)}
                                                                            onBlur={handleCellSave}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' && e.ctrlKey) handleCellSave()
                                                                                if (e.key === 'Escape') handleCellCancel()
                                                                            }}
                                                                            className="text-base min-h-[100px] px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 resize-none overflow-hidden transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            autoFocus
                                                                            disabled={cellUpdateLoading}
                                                                        />
                                                                        {cellUpdateLoading && (
                                                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                                                <Spinner size="16px" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className="min-h-[40px] py-2 px-2 cursor-text whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100"
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
                                    )}
                                </div>
                            </TabContent>
                        ))}
                    </Tabs>
                </Card>
            )}

            {/* Create Sheet Dialog */}
            <Dialog
                isOpen={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false)
                    setNewSheetDate('')
                }}
                onRequestClose={() => {
                    setCreateDialogOpen(false)
                    setNewSheetDate('')
                }}
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
                            onClick={() => {
                                setCreateDialogOpen(false)
                                setNewSheetDate('')
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleCreateSheet}
                            loading={createLoading}
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Sheet Dialog */}
            <Dialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onRequestClose={() => setDeleteDialogOpen(false)}
            >
                <div className="p-6 bg-white dark:bg-gray-800">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">
                        Delete Date Sheet
                    </h3>
                    <div className="space-y-4">
                        <p className="text-gray-700 dark:text-gray-300 text-center">
                            Are you sure you want to delete the sheet for <strong className="text-gray-900 dark:text-gray-100">{sheetToDelete}</strong>?
                        </p>
                        <Alert className="mt-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                            <div className="text-red-800 dark:text-red-200">
                                <strong>Warning:</strong> This action cannot be undone. All data in this sheet will be permanently deleted.
                            </div>
                        </Alert>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="plain"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                            onClick={handleDeleteConfirm}
                            loading={deleteLoading}
                        >
                            Delete Sheet
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default DailyLineUp
