import { useMemo, useState, useEffect } from 'react'
import Table from '@/components/ui/Table'
import { useData } from '../FileManagerContext/FIleContext'
import { MdDeleteOutline } from 'react-icons/md'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import { RiArrowRightSFill } from "react-icons/ri";
import { RiArrowDownSFill } from "react-icons/ri";
import { HiOutlinePlusCircle, HiOutlineMinusCircle } from 'react-icons/hi'
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { Button, Notification, Pagination, Select, Skeleton, toast } from '@/components/ui'
import { apiGetCrmLeadsTaskData, apiGetCrmLeadsTaskDelete, apiGetCrmProjectsTaskData } from '@/services/CrmService'
import { ActionLink, ConfirmDialog } from '@/components/shared';
import index from './Template/index';
import AddTask from '../../LeadsDetails/Task/AddTask';
import { useLeadContext } from '../../LeadList/store/LeadContext';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useRoleContext } from '../../Roles/RolesContext';
// import AddTask from '../../CustomerDetail/Task/AddTask';

const { Tr, Th, Td, THead, TBody } = Table

function Expanding() {

    const { roleData } = useRoleContext();
    // State for outer table and child table data
    const apiData : any = useLeadContext()
    const role :any = localStorage.getItem('role')
    // const [outerData, setOuterData] = useState<any>(projectData)
    console.log(apiData)
    const [childData, setChildData] = useState<any>({})
    console.log(childData)
    const [expanded, setExpanded] = useState<ExpandedState>({})
    const navigate=useNavigate()

    const org_id = localStorage.getItem('orgId')


    

    const formateDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // const fetchData = async () => {
    //     const response = await apiGetCrmProjectsSingleTaskData(project_id, task_id, org_id);
    //     const list = await apiGetUsersList(project_id)
    //     setLoading(false)
    //     setTaskData(response.data[0]);
    //     setUsers(list.data)
    // }

  const hasLeadTaskDeletePermission = role === 'SUPERADMIN' ? true :  roleData?.data?.leadtask?.delete?.includes(role);
  const hasLeadTaskCreatePermission = role === 'SUPERADMIN' ? true :  roleData?.data?.leadtask?.create?.includes(role);



    const ActionColumn = ({ row, childRow }: { row: any, childRow:any }) => {
        const navigate = useNavigate()
        const { textTheme } = useThemeClass()
        const { roleData } = useRoleContext()
        const org_id = localStorage.getItem('orgId')

        const data = {
            user_id: localStorage.getItem('userId'),
            lead_id: row.lead_id,
            task_id: childRow.task_id, org_id
        }
        const [dialogIsOpen, setIsOpen] = useState(false)

        const openDialog = () => {
            setIsOpen(true)
        }
        const onDialogClose = () => {
            setIsOpen(false)
        }

        const onDelete = async () => {
            try {
                const response = await apiGetCrmLeadsTaskDelete(data)
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
            <div className="flex justify-center text-lg gap-5">
                {/* {editAccess &&
                    <span
                        className={`cursor-pointer p-2  hover:${textTheme}`}>
                        <EditTask Data={row} task={false} />

                    </span>
                } */}
                {hasLeadTaskDeletePermission &&
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

    // Fetch data for child table
    const fetchChildData = async (leadId: string) => {
        if (!childData[leadId]) {

            const taskResponse = await apiGetCrmLeadsTaskData(leadId, org_id);
            // const response = await fetch(`/api/child-data?parentId=${parentId}`)
            // const data = await response.json()
            setChildData((prev:any) => ({ ...prev, [leadId]: taskResponse.data }))
        }
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
                                await fetchChildData(row.original.lead_id) // Fetch child data dynamically
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
            header: 'Lead Name',
            accessorKey: 'name',
            cell: (props) => {
                const row = props.row.original;
                return (
                    <div className='min-w-[100px] truncate font-bold'>
                        {row.name}
                    </div>
                )
              }},
              {
                header: 'Task Count',
                accessorKey: 'count_task',
                cell: (props) => {
                    const row = props.row.original;
                    return (
                        <div className='min-w-[100px] truncate'>
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
                const leadId = row.original.lead_id
                const taskId = row.original.task_id
                return (
                    <span
                        className="cursor-pointer hover:underline"
                        onClick={() => navigate(`/app/crm/Leads/TaskDetails?lead_id=${leadId}&task=${taskId}`)}
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
        data: apiData,
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
                                                {childTableColumns.map((col, idx) => {

                                                    const tempObj :any = {}
                                                    
                                                    return (<Th key={idx}>

                                                        {flexRender(col.header, tempObj)}
                                                    </Th>
                                                )})}
                                            </Tr>
                                        </THead>
                                        <TBody>
                                            {childData[row.original.lead_id]?.map((childRow: any) => {

                                                console.log(childTableColumns)

                                                return(
                                                <Tr key={childRow.lead_id}>
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
                                                                <Td key={idx} className='hover:cursor-pointer' onClick={() => navigate(`/app/crm/Leads/TaskDetails?lead_id=${row.original.lead_id}&task=${childRow.task_id}`)}>
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
                                            
                                            // || 
                                            
                                            // (
                                            //     <Tr>
                                            //         <Td colSpan={childTableColumns.length}>
                                            //             Loading...
                                            //         </Td>
                                            //     </Tr>
                                            // )
                                            
                                            }

                                            { hasLeadTaskCreatePermission &&
                                                <Tr className=''>
                                                    <Td>
                                                        <AddTask leadId={row.original.lead_id} user={[]} addButton={false}/>
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
