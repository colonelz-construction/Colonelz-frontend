
import { useMemo, useState, useEffect } from 'react'
// import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
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
import { rankItem } from '@tanstack/match-sorter-utils'
import type { ColumnDef, FilterFn, ColumnFiltersState } from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import {  apiGetCrmLeadsSubTaskData, apiGetCrmLeadsSubTaskDelete, apiGetCrmProjectsSubTaskData, apiGetCrmProjectsSubTaskDelete, apiGetCrmProjectsTaskData, apiGetCrmProjectsTaskDelete } from '@/services/CrmService'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Notification, Pagination, Select, toast } from '@/components/ui'
import { HiOutlineEye, HiOutlinePencil, HiPlusCircle } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { MdDeleteOutline } from 'react-icons/md'
import SubTaskDetails from './SubTaskDetailsDrawer'
import EditSubTask from './EditSubTask'
import { ConfirmDialog } from '@/components/shared'
import { useRoleContext } from '@/views/crm/Roles/RolesContext'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import Sorter from '@/components/ui/Table/Sorter'
import SubTaskTimer from './SubTaskTimer'


interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix'> {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
}

// const { Tr, Th, Td, THead, TBody, Sorter } = Table

export type SubTaskResponse = {
    code: number;
    data: SubTask[]
}
type SubTask = {
    lead_id: string;
    task_id: string;
    sub_task_id: string;
    sub_task_name: string;
    sub_task_description: string;
    actual_sub_task_start_date: string;
    actual_sub_task_end_date: string;
    // estimated_sub_task_start_date: string;
    estimated_sub_task_end_date: string;
    sub_task_status: string;
    sub_task_priority: string;
    sub_task_createdOn: string;
    sub_task_reporter: string;
    sub_task_createdBy: string;
    sub_task_assignee: string;
    remark:Remarks[]
};
type Remarks={
    remark:string;
    remark_by:string;
    remark_date:string;}
type Data={
    Data:SubTask
  }


const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
    { value: 40, label: '40 / page' },
    { value: 50, label: '50 / page' },
]
const ActionColumn = ({ row,users }: { row: SubTask,users:any}) => {
    const navigate = useNavigate()
    const { textTheme } = useThemeClass()
    const location=useLocation()
    const queryParams = new URLSearchParams(location.search);
    const leadId=queryParams.get('lead_id') || '';
    const org_id = localStorage.getItem('orgId')
    const role :any = localStorage.getItem('role')

    const data={user_id:localStorage.getItem('userId'),
    lead_id:leadId,
    task_id:row.task_id,
    sub_task_id:row.sub_task_id, org_id}

    const { roleData } = useRoleContext();

    const leadTaskUpdateAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.leadtask?.update?.includes(role);
    const leadTaskDeleteAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.leadtask?.create?.includes(role);

    const [dialogIsOpen, setIsOpen] = useState(false)

    const openDialog = () => {
        setIsOpen(true)  
    }
    const onDialogClose = () => {
        setIsOpen(false)
    }
    
    const onDelete = async () => {
        const response = await apiGetCrmLeadsSubTaskDelete(data)
        
        if(response.code===200){
            toast.push(
                <Notification type='success' duration={2000} closable>Subtask Deleted Successfully</Notification>
            )
            window.location.reload()
        }
        else{
            toast.push(
                <Notification type='danger' duration={2000} closable>{response.errorMessage}</Notification>
            )
        
        }
        onDialogClose();
        
       
    }
    return (
        <div className="flex justify-end text-lg">
            <span
                className={`cursor-pointer p-2  hover:${textTheme}`}
                
            >
                {leadTaskUpdateAccess && <EditSubTask Data={row} users={users}/>}
                
            </span>
            <span
                className={`cursor-pointer py-2  hover:${textTheme}`}
                
            >
                {leadTaskDeleteAccess && <MdDeleteOutline onClick={()=>openDialog()}/>}
                
            </span>

            <ConfirmDialog
          isOpen={dialogIsOpen}
          type="danger"
          onClose={onDialogClose}
          confirmButtonColor="red-600"
          onCancel={onDialogClose}
          onConfirm={() => onDelete()}
          title="Delete Subtask"
          onRequestClose={onDialogClose}>
            <p> Are you sure you want to delete this Subtask? </p>            
        </ConfirmDialog>
        </div>
    )
}

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: DebouncedInputProps) {
    const [value, setValue] = useState(initialValue)
    const role=localStorage.getItem('role')

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
        <div className="flex justify-between md:flex-col lg:flex-row">
            <div className="flex items-center mb-4 gap-3">
                <Input
                size='sm'
                    {...props}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                  
            </div>
        </div>
    )
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
        itemRank,
    })
    return itemRank.passed
}


const Subtasks = ({task,users}:any) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const navigate = useNavigate()
    const org_id = localStorage.getItem('orgId')



    const location=useLocation()
    const queryParams = new URLSearchParams(location.search);
    const leadId=queryParams.get('lead_id') || '';
    const [taskData,setTaskData]=useState<SubTask[]>([])
    
  
    useEffect(() => {
        const TaskData=async()=>{
            const response = await apiGetCrmLeadsSubTaskData(leadId,task, org_id);

            setTaskData(response.data)
        }
        TaskData();
  
    }, [])
    const formateDate = (dateString:string) => {
        const date = new Date(dateString);
        const day=date.getDate().toString().padStart(2, '0');
        const month=(date.getMonth() + 1).toString().padStart(2, '0');
        const year=date.getFullYear();
        return `${day}-${month}-${year}`;
        }

    const columns = useMemo<ColumnDef<SubTask>[]>(
        () => [
         {
            header:'Subtask',
            accessorKey:'sub_task_name',
           cell:({row})=>{
            return <SubTaskDetails isShow={true} data={row.original} users={users}/>
           }
         },
         {
            header:'Priority',
            accessorKey:'sub_task_priority',
         },
         {
            header:'Status',
            accessorKey:'sub_task_status',
            cell:({row})=>{

                const status = row.original.sub_task_status
                return <div>{status === "Pending"  ? "Pending/Todo" : status}</div>
            }
         },
            // {
            //     header:'Start Date',
            //     accessorKey:'estimated_sub_task_start_date',
            //     cell:({row})=>{
            //         return <div>{formateDate(row.original.estimated_sub_task_start_date)}</div>
            //     }
            // },
            {
                header:'Due Date',
                accessorKey:'estimated_sub_task_end_date',
                cell:({row})=>{
                    return <div>{formateDate(row.original.estimated_sub_task_end_date)}</div>
                }
            },
            {
                header:'Watch',
                accessorKey:'',
                cell:({row})=>{
                    return (row.original && <SubTaskTimer isShow={false} users={users} data={row.original}/>)
                }
            },
            {
                header:'Action',
                id: 'action',
                accessorKey:'action',
                cell: ({row}) => <ActionColumn row={row.original} users={users} />,
            }
           
        ],
        [users]
    )


    const table = useReactTable({
        data:taskData?taskData:[],
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
    return (
        <>
        <TableContainer className='max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' style={{ boxShadow: 'none'}}>
            <Table stickyHeader>
                <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className='uppercase'>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableCell
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        sx={{fontWeight:"600"}}
                                    >
                                        {header.isPlaceholder || header.id==='action' ? null : (
                                            <div
                                                {...{
                                                    className:
                                                        header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                    onClick:
                                                        header.column.getToggleSortingHandler(),
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )}
                                                {
                                                    <Sorter
                                                        sort={header.column.getIsSorted()}
                                                    />
                                                }
                                            </div>
                                        )}
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <TableRow key={row.id} className='' sx={{'&:hover': { backgroundColor: '#dfedfe' }}}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

        </TableContainer>
            <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={taskData?taskData.length:0}
                    onChange={onPaginationChange}
                />
                <div style={{ minWidth: 130 }}>
                    <Select
                        size="sm"
                        isSearchable={false}
                        value={pageSizeOption.filter(
                            (option) =>
                                option.value ===
                                table.getState().pagination.pageSize
                        )}
                        options={pageSizeOption}
                        onChange={(option) => onSelectChange(option?.value)}
                    />
                </div>
            </div>
        </>
    )
}

export default Subtasks

