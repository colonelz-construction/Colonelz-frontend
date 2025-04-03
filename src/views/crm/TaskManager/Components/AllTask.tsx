import { useMemo, useState, useEffect, useRef } from 'react'
// import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import { Button, Dropdown, Notification, toast, Tooltip } from '@/components/ui'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { Timeout } from 'react-number-format/types/types'
import Pagination from '@/components/ui/Pagination'
import { MdDeleteOutline } from 'react-icons/md'
import {
    apiGetCrmLeadsTaskDelete,
    apiGetCrmOpenTaskDelete,
    apiGetCrmProjectsTaskDelete,
    apiGetUsers,
} from '@/services/CrmService'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table'
import { GoChevronDown } from 'react-icons/go'
import { rankItem } from '@tanstack/match-sorter-utils'
import type {
    ColumnDef,
    FilterFn,
    ColumnFiltersState,
} from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { Select } from '@/components/ui'
import formateDate from '@/store/dateformate'
import { apiGetAllTasksDetails } from '@/services/CrmService'
import { ConfirmDialog } from '@/components/shared'
import { MdOutlineCancel } from 'react-icons/md'
import AddTask from '../../OpenTaskManger/Task/AddTask'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useRoleContext } from '../../Roles/RolesContext'
import MoveToDialog from './AllTasks/MoveToDialog'
import { useProjectContext } from '../../Customers/store/ProjectContext'
import { useLeadContext } from '../../LeadList/store/LeadContext'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import NoData from '@/views/pages/NoData'
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
} from '@mui/material'
import Sorter from '@/components/ui/Table/Sorter'

export type OpenTaskDataItem = {
    task_name: string
    name: string
    task_assignee: string
    task_status: string
    task_priority: string
    task_end_date: string
    task_start_date: string
    type: string
    // files: FolderItem[];
}

export type Tasks = {
    task_id: string
    task_name: string
    task_description: string
    actual_task_start_date: string
    actual_task_end_date: string
    estimated_task_start_date: string
    estimated_task_end_date: string
    task_status: string
    task_priority: string
    task_createdOn: string
    reporter: string
    task_createdBy: string
    number_of_subtasks: number
    user_id: string
    task_assignee: string
    percentage: string
}

interface DebouncedInputProps
    extends Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'onChange' | 'size' | 'prefix'
    > {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
}

// const { Tr, Th, Td, THead, TBody, Sorter } = Table

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: DebouncedInputProps) {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    return (
        <div className="flex justify-between ">
            <div></div>
            <div className="flex items-center mb-4">
                <Input
                    {...props}
                    value={value}
                    size="sm"
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
        </div>
    )
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    let itemValue: any = row.getValue(columnId)

    if (columnId === 'task_start_date') {
        itemValue = formateDate(itemValue)
    }

    if (columnId === 'task_end_date') {
        itemValue = formateDate(itemValue)
    }

    const itemRank = rankItem(itemValue, value)
    addMeta({
        itemRank,
    })

    return itemRank.passed
}
type Option = {
    value: number
    label: string
}

const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
    { value: 40, label: '40 / page' },
    { value: 50, label: '50 / page' },
]
const AllTask = ({ users }: any) => {
    const { projects, loading } = useProjectContext()
    const apiData = useLeadContext()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [skloading, setLoading] = useState<any>(true)
    const role = localStorage.getItem('role')
    const navigate = useNavigate()
    const [data, setData] = useState<any>([])

    const tempFilterBox = [
        {
            name: 'priority',
            stage: false,
        },
        {
            name: 'status',
            stage: false,
        },
        {
            name: 'assignee',
            stage: false,
        },
    ]
    const [filterBox, setFilterBox] = useState<any>(tempFilterBox)

    const filterTaskObj = {
        task_priority: '',
        task_status: '',
        task_assignee: '',
    }
    const filterCheckObj = {
        priority: false,
        status: false,
        assignee: false,
    }
    const [filterTask, setFilterTask] = useState<any>(filterTaskObj)
    const [filterCheck, setFilterCheck] = useState<any>(filterCheckObj)
    // console.log(filterTask)

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiGetAllTasksDetails(filterTask)

            setData(response.data)
            setLoading(false)
        }
        fetchData()
    }, [filterTask])

    const formateDate = (dateString: string) => {
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
    }

    const { roleData } = useRoleContext()

    const deleteAccessProject =
        role === 'SUPERADMIN'
            ? true
            : roleData?.data?.task?.delete?.includes(
                  `${localStorage.getItem('role')}`,
              )
    const deleteAccessLead =
        role === 'SUPERADMIN'
            ? true
            : roleData?.data?.leadtask?.delete?.includes(
                  `${localStorage.getItem('role')}`,
              )
    const moveAccess =
        role === 'SUPERADMIN'
            ? true
            : roleData?.data?.opentask?.move?.includes(
                  `${localStorage.getItem('role')}`,
              )
    const createAccessOpen =
        role === 'SUPERADMIN'
            ? true
            : roleData?.data?.opentask?.create?.includes(
                  `${localStorage.getItem('role')}`,
              )
    const deleteAccessOpen =
        role === 'SUPERADMIN'
            ? true
            : roleData?.data?.opentask?.delete?.includes(
                  `${localStorage.getItem('role')}`,
              )

    const ActionColumn = ({ row, users }: { row: any; users: any }) => {
        const navigate = useNavigate()
        const { textTheme } = useThemeClass()

        const org_id = localStorage.getItem('orgId')

        const [dialogIsOpen, setIsOpen] = useState(false)

        const openDialog = () => {
            setIsOpen(true)
        }
        const onDialogClose = () => {
            setIsOpen(false)
        }

        let deleteAccess
        if (row?.lead_id) {
            deleteAccess = deleteAccessLead
        } else if (row?.project_id) {
            deleteAccess = deleteAccessProject
        } else {
            deleteAccess = deleteAccessOpen
        }
        const onDelete = async () => {
            try {
                let response

                if (row?.lead_id) {
                    const leadData = {
                        user_id: localStorage.getItem('userId'),
                        task_id: row.task_id,
                        org_id,
                        lead_id: row.lead_id,
                    }
                    response = await apiGetCrmLeadsTaskDelete(leadData)
                } else if (row?.project_id) {
                    deleteAccess = deleteAccessProject

                    const projectData = {
                        user_id: localStorage.getItem('userId'),
                        task_id: row.task_id,
                        org_id,
                        project_id: row.project_id,
                    }
                    response = await apiGetCrmProjectsTaskDelete(projectData)
                } else {
                    const openData = {
                        user_id: localStorage.getItem('userId'),
                        task_id: row.task_id,
                        org_id,
                    }
                    response = await apiGetCrmOpenTaskDelete(openData)
                }
                if (response.code === 200) {
                    toast.push(
                        <Notification type="success" duration={2000} closable>
                            Task Deleted Successfully
                        </Notification>,
                    )
                    window.location.reload()
                } else {
                    toast.push(
                        <Notification type="danger" duration={2000} closable>
                            {response.errorMessage}
                        </Notification>,
                    )
                }
            } catch (e) {
                toast.push(
                    <Notification type="danger" duration={2000} closable>
                        Internal Server Error
                    </Notification>,
                )
            }
        }

        return (
            <div className={`flex justify-between text-lg gap-5`}>
                {deleteAccess && (
                    <Tooltip title="Delete">
                        <span
                            className={`cursor-pointer py-2  hover:${textTheme}`}
                        >
                            <MdDeleteOutline onClick={() => openDialog()} />
                        </span>
                    </Tooltip>
                )}
                {moveAccess && row?.type == 'open' && (
                    <Tooltip title="Move">
                        <span
                            className={`cursor-pointer py-2  hover:${textTheme}`}
                        >
                            <MoveToDialog
                                users={users}
                                projectData={projects}
                                leadData={apiData}
                                task_id={row.task_id}
                            />
                        </span>
                    </Tooltip>
                )}
                <ConfirmDialog
                    isOpen={dialogIsOpen}
                    type="danger"
                    onClose={onDialogClose}
                    confirmButtonColor="red-600"
                    onCancel={onDialogClose}
                    onConfirm={() => onDelete()}
                    title="Delete Task"
                    onRequestClose={onDialogClose}
                >
                    <p> Are you sure you want to delete this task? </p>
                </ConfirmDialog>
            </div>
        )
    }

    const columns = useMemo<ColumnDef<OpenTaskDataItem>[]>(
        () => [
            {
                header: 'Name',
                accessorKey: 'task_name',
                cell: (props) => {
                    const row = props.row.original
                    const [isHovered, setIsHovered] = useState(false)
                    const hoverTimeout = useRef<Timeout | null>(null)

                    const handleMouseEnter = () => {
                        if (hoverTimeout.current) {
                            clearTimeout(hoverTimeout.current)
                        }
                        setIsHovered(true)
                    }

                    const handleMouseLeave = () => {
                        hoverTimeout.current = setTimeout(() => {
                            setIsHovered(false)
                        }, 200)
                    }

                    return (
                        <div
                            className="relative inline-block min-w-[100px] cursor-pointer"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className="whitespace-wrap">
                                {row.task_name.length > 13
                                    ? `${row.task_name.slice(0, 10)}...`
                                    : row.task_name}
                            </span>
                            {isHovered && (
                                <div className="absolute bottom-0 left-[30%] ml-2 bg-white border border-gray-300 p-2 shadow-lg z-9999 whitespace-nowrap transition-opacity duration-200 font-normal">
                                    <p>{row.task_name}</p>
                                </div>
                            )}
                        </div>
                    )
                },
            },
            {
                header: 'Priority',
                accessorKey: 'task_priority',
                cell: (props) => {
                    const row = props.row.original
                    return <div>{row?.task_priority}</div>
                },
            },
            {
                header: 'Status',
                accessorKey: 'task_status',
                cell: (props) => {
                    const row = props.row.original
                    return (
                        <div>
                            {row?.task_status === 'Pending'
                                ? 'Pending/Todo'
                                : row?.task_status}
                        </div>
                    )
                },
            },
            {
                header: 'Assignee',
                accessorKey: 'task_assignee',
                cell: (props) => {
                    const row = props.row.original
                    if (row?.task_assignee) {
                        return <div>{row?.task_assignee}</div>
                    } else {
                        return <div>{'Unassigned'}</div>
                    }
                },
            },
            {
                header: 'Type',
                accessorKey: 'type',
                cell: (props) => {
                    const row = props.row.original

                    return <div>{row?.type}</div>
                },
            },
            {
                header: 'Lead / Project Name',
                accessorKey: 'name',
                cell: (props) => {
                    const row = props.row.original
                    return <div>{row?.name}</div>
                },
            },
            {
                header: 'Start Date',
                accessorKey: 'task_start_date',
                cell: (props) => {
                    const row = props.row.original
                    return formateDate(row?.task_start_date)
                },
            },
            {
                header: 'End Date',
                accessorKey: 'task_end_date',
                cell: (props) => {
                    const row = props.row.original
                    return formateDate(row?.task_end_date)
                },
            },

            {
                header: '',
                id: 'action',
                accessorKey: 'action',
                cell: ({ row }) => {
                    return <ActionColumn row={row.original} users={users} />
                },
            },
        ],
        [],
    )

    const table = useReactTable({
        data: data.reverse(),
        columns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
        debugHeaders: true,
        debugColumns: false,
    })

    const onPaginationChange = (page: number) => {
        table.setPageIndex(page - 1)
    }

    const onSelectChange = (value = 0) => {
        table.setPageSize(Number(value))
    }

    const Toggle = (
        <Button
            variant="solid"
            size="sm"
            className="flex justify-center items-center gap-2"
        >
            <span>Filter</span>
            <span>
                <GoChevronDown />
            </span>
        </Button>
    )

    let noneUser = [{ label: 'None', value: 'None' }]

    let userOptions = users
        ?.filter((user: any) => user.role !== 'SUPERADMIN')
        .map((user: any) => ({
            label: 'assignee',
            value: user.username,
        }))

    userOptions = [...noneUser, ...(userOptions || [])]

    // console.log(users)
    // console.log(userOptions)

    // const UserOptions = [{ label: "None", value: "None" }, ...userOptions]
    // console.log(UserOptions)

    const statusOptions = [
        { label: 'None', value: 'None' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
    ]
    const priorityOptions = [
        { label: 'None', value: 'None' },
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
    ]

    const FilterBoxComponent = ({ name }: any) => {
        const keyMapping: Record<string, string> = {
            priority: 'task_priority',
            status: 'task_status',
            assignee: 'task_assignee',
        }

        const handleStageFalse = (name: string) => {
            const key = keyMapping[name] // Map name to the corresponding key in filterTaskObj
            if (key) {
                setFilterTask((prev: any) => ({
                    ...prev,
                    [key]: '', // Update the corresponding key's value
                }))
            }
            setFilterBox((prevState: any) =>
                prevState.map((item: any) =>
                    item.name === name ? { ...item, stage: false } : item,
                ),
            )
            setFilterCheck({ ...filterCheck, [name]: false })
        }

        const ToggleFilter = (
            <span className="flex justify-center items-center gap-2 border px-2 py-1 rounded-lg cursor-pointer">
                <MdOutlineCancel
                    className=""
                    onClick={() => {
                        handleStageFalse(name)
                    }}
                />

                <span className="flex  items-center gap-1 p-1">
                    <span className="capitalize">{name}</span>
                    <span className="font-semibold capitalize">
                        {filterTask[keyMapping[name]]}
                    </span>
                    <span>
                        <GoChevronDown />
                    </span>
                </span>
            </span>
        )

        let temp: any = []

        if (name === 'priority') {
            temp = priorityOptions
        } else if (name === 'status') {
            temp = statusOptions
        } else if (name === 'assignee') {
            temp = userOptions
        }

        const handleSelect = async (value: string) => {
            const key = keyMapping[name] // Map name to the corresponding key in filterTaskObj
            if (key) {
                if (value === 'None') {
                    setFilterTask((prev: any) => ({
                        ...prev,
                        [key]: '', // Update the corresponding key's value
                    }))
                } else {
                    setFilterTask((prev: any) => ({
                        ...prev,
                        [key]: value, // Update the corresponding key's value
                    }))
                }
            }
        }
        return (
            <div className="mb-2">
                <Dropdown renderTitle={ToggleFilter}>
                    {temp?.map((item: any) => {
                        return (
                            <Dropdown.Item
                                onClick={() => handleSelect(item?.value)}
                            >
                                <div>{item?.value}</div>
                            </Dropdown.Item>
                        )
                    })}
                </Dropdown>
            </div>
        )
    }

    const handleStageTrue = (name: any) => {
        setFilterBox((prevState: any) =>
            prevState.map((item: any) => {
                setFilterCheck({ ...filterCheck, [name]: true })

                return item.name === name ? { ...item, stage: true } : item
            }),
        )
    }

    return (
        <>
            <div className="flex justify-end gap-2">
                <div>
                    <Dropdown renderTitle={Toggle} placement="middle-end-top">
                        <Dropdown.Item
                            eventKey="c"
                            className="flex justify-between items-center"
                            onClick={() => {
                                handleStageTrue('status')
                            }}
                        >
                            <span>Status</span>
                            <span>
                                {filterCheck.status && <IoIosCheckmarkCircle />}
                            </span>
                        </Dropdown.Item>
                        <Dropdown.Item
                            eventKey="a"
                            className="flex justify-between items-center"
                            onClick={() => {
                                handleStageTrue('priority')
                            }}
                        >
                            <span>Priority</span>
                            <span>
                                {filterCheck.priority && (
                                    <IoIosCheckmarkCircle />
                                )}
                            </span>
                        </Dropdown.Item>
                        <Dropdown.Item
                            eventKey="b"
                            className="flex justify-between items-center"
                            onClick={() => {
                                handleStageTrue('assignee')
                            }}
                        >
                            <span>Assignee</span>
                            <span>
                                {filterCheck.assignee && (
                                    <IoIosCheckmarkCircle />
                                )}
                            </span>
                        </Dropdown.Item>
                    </Dropdown>
                </div>

                {createAccessOpen && <AddTask users={users} addButton={true} />}

                <DebouncedInput
                    value={globalFilter ?? ''}
                    className="p-2 font-lg shadow border border-block"
                    placeholder="Search ..."
                    onChange={(value) => setGlobalFilter(String(value))}
                />
            </div>

            <div className="flex gap-2">
                {filterBox
                    ?.filter((item: any) => item.stage)
                    ?.map((item: any, index: number) => (
                        <FilterBoxComponent name={item.name} />
                    ))}
            </div>

            <TableContainer
                className="max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{ boxShadow: 'none' }}
            >
                <Table
                    stickyHeader
                    className="shadow-none border-none"
                    sx={{
                        textAlign: 'center',
                        color: '#6B7280',
                        border: '0.09rem',
                    }}
                >
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className="font-bold uppercase"
                                        sx={{
                                            textAlign: 'center',
                                            backgroundColor: '#f9fafb',
                                            color: '#6B7280',
                                            fontWeight: '600',
                                        }}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div
                                                {...{
                                                    className:
                                                        header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : 'pointer-events-none',
                                                    onClick:
                                                        header.column.id !==
                                                        'action'
                                                            ? header.column.getToggleSortingHandler()
                                                            : undefined,
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                                {header.column.getCanSort() &&
                                                    header.column.id !==
                                                        'action' && (
                                                        <Sorter
                                                            sort={header.column.getIsSorted()}
                                                        />
                                                    )}
                                            </div>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>

                    {skloading ? (
                        <TableRowSkeleton
                            avatarInColumns={[0]}
                            columns={columns.length}
                            avatarProps={{ width: 14, height: 14 }}
                        />
                    ) : data.length === 0 ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <NoData />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : (
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="capitalize"
                                    sx={{
                                        textAlign: 'center',
                                        color: '#6B7280',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: '#dfedfe',
                                        },
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const taskType = row.original.type
                                        console.log(taskType)
                                        if (taskType === 'project') {
                                            if (
                                                cell.column.id === 'task_name'
                                            ) {
                                                return (
                                                    <TableCell
                                                        sx={{
                                                            textAlign: 'center',
                                                            color: '#6B7280',
                                                        }}
                                                        key={cell.id}
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/crm/Projects/TaskDetails?project_id=${row.original.project_id}&task=${row.original.task_id}`,
                                                            )
                                                        }
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            } else {
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        sx={{
                                                            textAlign: 'center',
                                                            color: '#6B7280',
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            }
                                        } else if (taskType === 'lead') {
                                            if (
                                                cell.column.id === 'task_name'
                                            ) {
                                                return (
                                                    <TableCell
                                                        sx={{
                                                            textAlign: 'center',
                                                            color: '#6B7280',
                                                        }}
                                                        key={cell.id}
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/crm/Leads/TaskDetails?lead_id=${row.original.lead_id}&task=${row.original.task_id}`,
                                                            )
                                                        }
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            } else {
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        sx={{
                                                            textAlign: 'center',
                                                            color: '#6B7280',
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            }
                                        } else {
                                            if (
                                                cell.column.id === 'task_name'
                                            ) {
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        onClick={() =>
                                                            navigate(
                                                                `/app/crm/Tasks/OpenTaskDetails?task=${row.original.task_id}`,
                                                            )
                                                        }
                                                        sx={{
                                                            textAlign: 'center',
                                                            color: '#6B7280',
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            } else {
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        sx={{
                                                            textAlign: 'center',
                                                            color: '#6B7280',
                                                        }}
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            }
                                        }
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
            </TableContainer>

            <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={table.getFilteredRowModel().rows.length}
                    onChange={onPaginationChange}
                />
                <div style={{ minWidth: 130 }}>
                    <Select<Option>
                        size="sm"
                        isSearchable={false}
                        value={pageSizeOption.filter(
                            (option) =>
                                option.value ===
                                table.getState().pagination.pageSize,
                        )}
                        options={pageSizeOption}
                        onChange={(option) => onSelectChange(option?.value)}
                    />
                </div>
            </div>
        </>
    )
}

export default AllTask
