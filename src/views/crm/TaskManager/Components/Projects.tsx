import { useMemo, useState, useEffect, useRef } from 'react'
import Table from '@/components/ui/Table'
import { Button, Notification, Pagination, Select, Skeleton, toast } from '@/components/ui'
import { Timeout } from 'react-number-format/types/types'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { MdDeleteOutline } from 'react-icons/md'
import { useRoleContext } from '../../Roles/RolesContext'

import { RiArrowRightSFill } from "react-icons/ri";
import { RiArrowDownSFill } from "react-icons/ri";
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { apiGetCrmProjectsTaskData, apiGetCrmProjectsTaskDelete } from '@/services/CrmService'
import { ConfirmDialog } from '@/components/shared';
import AddTask from '../../CustomerDetail/Task/AddTask';
import { useProjectContext } from '../../Customers/store/ProjectContext'

const { Tr, Th, Td, THead, TBody } = Table

function Expanding() {
    // State for outer table and child table data
    const { roleData } = useRoleContext()
    const {projects,apiData,loading}=useProjectContext();
    const role = localStorage.getItem('role')
    // const [outerData, setOuterData] = useState<any>(projectData)
    // console.log(outerData)
    const [childData, setChildData] = useState<any>({})
    console.log(childData)
    const [expanded, setExpanded] = useState<ExpandedState>({})
    const navigate=useNavigate()

    const org_id = localStorage.getItem('orgId')

    const createAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.task?.create?.includes(`${localStorage.getItem('role')}`)


    

    const formateDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Fetch data for child table
    const fetchChildData = async (projectId: string) => {
        if (!childData[projectId]) {
            const taskResponse = await apiGetCrmProjectsTaskData(projectId, org_id);
            setChildData((prev:any) => ({ ...prev, [projectId]: taskResponse.data }))
        }
    }



    const ActionColumn = ({ row, childRow }: { row: any, childRow:any }) => {
        const navigate = useNavigate()
        const { textTheme } = useThemeClass()
        
        const org_id = localStorage.getItem('orgId')

        const data = {
            user_id: localStorage.getItem('userId'),
            project_id: row.project_id,
            task_id: childRow.task_id, org_id
        }
        const editAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.task?.update?.includes(`${localStorage.getItem('role')}`)
        const deleteAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.task?.delete?.includes(`${localStorage.getItem('role')}`)
        const [dialogIsOpen, setIsOpen] = useState(false)

        const openDialog = () => {
            setIsOpen(true)
        }
        const onDialogClose = () => {
            setIsOpen(false)
        }

        const onDelete = async () => {
            try {
                const response = await apiGetCrmProjectsTaskDelete(data)
                if (response.code === 200) {
                    toast.push(
                        <Notification type='success' duration={2000} closable>Task Deleted Successfully</Notification>
                    )
                    window.location.reload()
                }
                else {
                    toast.push(
                        <Notification type='danger' duration={2000} closable>{response.errorMessage}</Notification>
                    )

                }
            }
            catch (e) {
                toast.push(
                    <Notification type='danger' duration={2000} closable>Internal Server Error</Notification>
                )
            }
        }

        return (
            <div className="flex text-lg gap-5">
                {/* {editAccess &&
                    <span
                        className={`cursor-pointer p-2  hover:${textTheme}`}>
                        <EditTask Data={row} task={false} />

                    </span>
                } */}
                {deleteAccess &&
                    <span className={`cursor-pointer py-2  hover:${textTheme}`}>
                        <MdDeleteOutline onClick={() => openDialog()} />
                    </span>
                }
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

    // Columns for outer table
    const outerTableColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: 'expander',
            header: ({ table }) => (
                <button
                    className="text-xl"
                    {...{ onClick: table.getToggleAllRowsExpandedHandler() }}
                >
                    {table.getIsAllRowsExpanded() ? (
                        <RiArrowDownSFill />
                    ) : (
                        <RiArrowRightSFill />
                    )}
                </button>
            ),
            cell: ({ row }) =>{

                // console.log(row.original)
                if(true) { 
                    return (
                   <button
                        className="text-xl"
                        {...{
                            onClick: async () => {
                                row.toggleExpanded()
                                await fetchChildData(row.original.project_id) // Fetch child data dynamically
                            },
                        }}
                    >
                        {row.getIsExpanded() ? (
                            <RiArrowDownSFill />
                        ) : (
                            <RiArrowRightSFill />
                        )}
                    </button>
                )} else {
                    return null
                }
            }
        },
        {
            header: 'Project Name ',
            accessorKey: 'project_name',
            cell: (props) => {
                const row = props.row.original;
                const [isHovered, setIsHovered] = useState(false);
                const hoverTimeout = useRef<Timeout | null>(null);

                const handleMouseEnter = () => {
                    if (hoverTimeout.current) {
                        clearTimeout(hoverTimeout.current);
                    }
                    setIsHovered(true);
                };

                const handleMouseLeave = () => {
                    hoverTimeout.current = setTimeout(() => {
                        setIsHovered(false);
                    }, 200); 
                };
                return (
                    <div
                        className='relative inline-block min-w-[100px] font-bold'
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className='whitespace-wrap'>{row.project_name.length > 13 
                                        ? `${row.project_name.slice(0, 10)}...` 
                                        : row.project_name}</span>
                        {isHovered && (
                            <div className='absolute bottom-0 left-[30%] ml-2 bg-white border border-gray-300 p-2 shadow-lg z-9999 whitespace-nowrap transition-opacity duration-200 font-normal'>
                                <p>{row.project_name}</p>
                            </div>
                        )}
                    </div>
                );
              }},
              {
                header: 'Task Count',
                accessorKey: 'count_task',
                cell: (props) => {
                    const row = props.row.original;
                    console.log(row)
                    return (
                        <div className='min-w-[100px]'>
                               {row.count_task}
                           
                        </div>
                    )
                  }},
    ], [])

    // Columns for child table
    const childTableColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            header: 'Name',
            accessorKey: 'task_name',
            cell: ({ row }) => {
                const navigate = useNavigate();
                const projectId = row.original.project_id
                const taskId = row.original.task_id
                return (
                    <span
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate(`/app/crm/Projects/TaskDetails?project_id=${projectId}&task=${taskId}`)}
                    >
                        {row.original.task_name}
                    </span>
                );
            }
        },
        {
            header: 'Priority',
            accessorKey: 'task_priority',
        },
        {
            header: 'Status',
            accessorKey: 'task_status'
        },
        {
            header: 'Start Date',
            accessorKey: 'estimated_task_start_date',
            cell: ({ row }) => {
                return <span>{formateDate(row.original.estimated_task_start_date)}</span>
            }
        },
        {
            header: 'End Date',
            accessorKey: 'estimated_task_end_date',
            cell: ({ row }) => {
                return <span>{formateDate(row.original.estimated_task_end_date)}</span>
            }
        },
        {
            header: 'Action',
            id: 'action',
            accessorKey: 'action',
            cell: ({ row }) => <span></span>,
        }
    ], [])

    const table = useReactTable({
        data: projects,
        columns: outerTableColumns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })



   

    return (
        <Table className='table-auto text-left'>
            <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Tr key={headerGroup.id} className='flex w-full'>
                    {headerGroup.headers.map((header) => {
                        console.log(headerGroup)
                       return (header.id !== 'expander' ? <Th key={header.id} colSpan={header.colSpan}>
                            {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </Th> : <><Th>{}</Th></>)
                    })}
                </Tr>
                ))}
            </THead>
            <TBody>
                {table.getRowModel().rows.map((row) => (
                    <>
                        <Tr key={row.id} className='flex w-full'>
                            {row.getVisibleCells().map((cell) => (
                                <Td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </Td>
                            ))}
                        </Tr>
                        {row.getIsExpanded() && (
                            <Tr>
                                <Td colSpan={row.getVisibleCells().length}>
                                    <Table>
                                        <THead>
                                            <Tr>
                                                {childTableColumns.map((col, idx) => 
                                                 {
                                                    const tempObj :any = {}
                                                    return (<Th key={idx}>
                                                        {flexRender(col.header, tempObj)}
                                                    </Th>
                                                )})}
                                            </Tr>
                                        </THead>
                                        <TBody>
                                            {childData[row.original.project_id]?.map((childRow: any) => {

                                                console.log(childTableColumns)

                                                return(
                                                <Tr key={childRow.project_id}>
                                                    {childTableColumns.map((col:any, idx) => {
                                                        console.log(col)

                                                        if(col.accessorKey === 'estimated_task_end_date' ||  col.accessorKey === 'estimated_task_start_date') {

                                                            const formattedDate = formateDate(childRow[col.accessorKey])

                                                            return(
                                                                <Td key={idx}>
                                                                    {formattedDate}
                                                                </Td>)
                                                            

                                                        } else if(col.accessorKey === 'task_name') {
                                                            return (
                                                                <Td key={idx} className='hover:cursor-pointer' onClick={() => navigate(`/app/crm/Projects/TaskDetails?project_id=${row.original.project_id}&task=${childRow.task_id}`)}>
                                                                        {childRow[col.accessorKey]}
                                                                </Td>

                                                            )

                                                        } else if (col.accessorKey === 'action') {

                                                            return (
                                                                <Td key={idx}>
                                                                    <ActionColumn row={row.original} childRow={childRow}/>
                                                                </Td>)
                                                        }
                                                         else {
                                                            return (
                                                                <Td key={idx}>
                                                                    {childRow[col.accessorKey]}
                                                                </Td>)
                                                        }
                                                        
                                                        
                                                    })}

                                                </Tr>
                                            )})                                          
                                            }

                                            { createAccess &&
                                                <Tr className=''>
                                                    <Td>
                                                        <AddTask project={row.original.project_id} user={[]} addButton={false}/>
                                                    </Td>
                                                    <Td>
                                                    </Td>
                                                    <Td>
                                                    </Td>
                                                    <Td>
                                                    </Td>
                                                    <Td>
                                                    </Td>
                                                    <Td>
                                                    </Td>
                                                </Tr>
                                                
                                            }
                                            
                                        </TBody>
                                    </Table>
                                </Td>
                            </Tr>
                        )}
                    </>
                ))}
            </TBody>
        </Table>
    )
}

export default Expanding
