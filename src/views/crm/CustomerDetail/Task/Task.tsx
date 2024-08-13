
import { useMemo, useState, useEffect } from 'react'
import Table from '@/components/ui/Table'
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
import { apiGetCrmLeads, apiGetCrmProjectsTaskData, apiGetCrmProjectsTaskDelete, apiGetUsersList } from '@/services/CrmService'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Notification, Pagination, Select, Skeleton, toast } from '@/components/ui'
import { HiOutlineEye, HiOutlinePencil, HiPlusCircle } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { MdDeleteOutline } from 'react-icons/md'
import TaskDetails from './TaskDetailsDrawer'
import AddTask from './AddTask'
import { AuthorityCheck, ConfirmDialog } from '@/components/shared'
import EditTask from './EditTask'
import NoData from '@/views/pages/NoData'
import { useRoleContext } from '../../Roles/RolesContext'
import formateDate from '@/store/dateformate'

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix'> {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
}

const { Tr, Th, Td, THead, TBody, Sorter } = Table
type Task = {
    project_id: string;
    task_id: string;
    task_name: string;
    task_description: string;
    actual_task_start_date: string;
    actual_task_end_date: string;
    estimated_task_start_date: string;
    estimated_task_end_date: string;
    task_status: string;
    task_priority: string;
    task_createdOn: string;
    reporter: string;
    task_createdBy: string;
    number_of_subtasks: number;
    user_id: string;
    task_assignee: string;
    percentage:string;
};


const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
    { value: 40, label: '40 / page' },
    { value: 50, label: '50 / page' },
]
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
        <div className="flex justify-between md:flex-col lg:flex-row">
            <h3></h3>
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
    let itemValue:any = row.getValue(columnId);

    
    if (columnId === 'estimated_task_start_date') {
        itemValue = formateDate(itemValue);
    }
    if (columnId === 'estimated_task_end_date') {
        itemValue = formateDate(itemValue);
    }
   
    

    const itemRank = rankItem(itemValue, value);
    addMeta({
        itemRank,
    });

    return itemRank.passed;
};
const statusColors: { [key: string]: string } = {
    'Follow Up': 'bg-green-200 text-green-700',
    'Interested': 'bg-blue-200 text-blue-700',
    'No Response': 'bg-red-200 text-red-700',
    'Not Interested': 'bg-red-200 text-red-700',
};

const Filtering = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const location=useLocation()
    const queryParams = new URLSearchParams(location.search);
    const projectId=queryParams.get('project_id') || '';
    const [taskData,setTaskData]=useState<any>(null)
    const [loading,setLoading]=useState(true)
    const [userData,setUserData]=useState<any>(null)

    const role=localStorage.getItem('role')
    const {roleData}=useRoleContext()

    useEffect(() => {
        const TaskData=async()=>{
            const response = await apiGetCrmProjectsTaskData(projectId);
            setLoading(false)
            setTaskData(response.data)
        }
        TaskData();
    }, [projectId])
    useEffect(() => {
        const UserData=async()=>{
            const response = await apiGetUsersList();
            setUserData(response.data)
        }
        UserData();

    },[projectId])


   



    const ActionColumn = ({ row }: { row: Task}) => {
        const navigate = useNavigate()
        const { textTheme } = useThemeClass()
        const { roleData } = useRoleContext()
        const data={user_id:localStorage.getItem('userId'),
        project_id:row.project_id,
        task_id:row.task_id}
        const [dialogIsOpen, setIsOpen] = useState(false)
    
        const openDialog = () => {
            setIsOpen(true)  
        }
        const onDialogClose = () => {
            setIsOpen(false)
        }
        
        const onDelete = async () => {
            try{
            const response = await apiGetCrmProjectsTaskDelete(data)
            if(response.code===200){
                toast.push(
                    <Notification type='success' duration={2000} closable>Task Deleted Successfully</Notification>
                )
                window.location.reload()
            }
            else{
                toast.push(
                    <Notification type='danger' duration={2000} closable>{response.errorMessage}</Notification>
                )
            
            }
            }
            catch(e){
                toast.push(
                    <Notification type='danger' duration={2000} closable>Internal Server Error</Notification>
                )
            }
        }
        console.log(userData);
        
        return (
            <div className="flex justify-end text-lg">
                <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.task?.update??[]}
                    >
                <span
                    className={`cursor-pointer p-2  hover:${textTheme}`}>
                    <EditTask Data={row} task={false}/>
                    
                </span>
                </AuthorityCheck>
                <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.task?.delete??[]}
                    >
                <span className={`cursor-pointer py-2  hover:${textTheme}`}>
                    <MdDeleteOutline onClick={()=>openDialog()}/>   
                </span>
                </AuthorityCheck>
    
                <ConfirmDialog
              isOpen={dialogIsOpen}
              type="danger"
              onClose={onDialogClose}
              confirmButtonColor="red-600"
              onCancel={onDialogClose}
              onConfirm={() => onDelete()}
              title="Delete Task"
              onRequestClose={onDialogClose}>
                <p> Are you sure you want to delete this task? </p>            
            </ConfirmDialog>
            </div>
        )
    }

  
    

    const formateDate = (dateString:string) => {
        const date = new Date(dateString);
        const day=date.getDate().toString().padStart(2, '0');
        const month=(date.getMonth() + 1).toString().padStart(2, '0');
        const year=date.getFullYear();
        return `${day}-${month}-${year}`;
        }

    const columns = useMemo<ColumnDef<Task>[]>(
        () => [
         {
            header:'Name',
            accessorKey:'task_name',
           cell:({row})=>{

            return <TaskDetails data={row.original}/>
           }
         },
         {
            header:'Task Priority',
            accessorKey:'task_priority',
         },
         {
            header:'Task Status',
            accessorKey:'task_status'
         },
            {
                header:'Task Start Date',
                accessorKey:'estimated_task_start_date',
                cell:({row})=>{
                    return <span>{formateDate(row.original.estimated_task_start_date)}</span>
                }
            },
            {
                header:'Task End Date',
                accessorKey:'estimated_task_end_date',
                cell:({row})=>{
                    return <span>{formateDate(row.original.estimated_task_end_date)}</span>
                }
            },
            {
                header:'Action',
                id: 'action',
                accessorKey:'action',
                cell: ({row}) => <ActionColumn row={row.original}/>,
            }
           
        ],
        []
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
        <div className='flex gap-3 justify-end'>
            <DebouncedInput
                value={globalFilter ?? ''}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search..."
                onChange={(value) => setGlobalFilter(String(value))}
            />
             <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.task?.create??[]}
                    >
                    <AddTask project={projectId} userData={userData}/>
                    </AuthorityCheck>
                    </div>
            {!loading ? taskData.length===0?(<NoData/>):(
                <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
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
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Tr key={row.id} className=''>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
                ):(<Skeleton height={300}/>)}
            
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

export default Filtering

