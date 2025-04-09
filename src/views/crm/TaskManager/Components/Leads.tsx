import React, { useMemo, useState, useEffect, useRef } from 'react'
// import Table from '@/components/ui/Table'
import { useData } from '../FileManagerContext/FIleContext'
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdDeleteOutline } from 'react-icons/md'
import {
    useReactTable,
    getCoreRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import { RiArrowRightSFill } from "react-icons/ri";
import { RiArrowDownSFill } from "react-icons/ri";
import { Timeout } from 'react-number-format/types/types'
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { Button, Notification, Pagination, Select, Skeleton, toast, Tooltip } from '@/components/ui'
import { apiGetCrmLeadsTaskData, apiGetCrmLeadsTaskDelete, apiGetCrmProjectsTaskData } from '@/services/CrmService'
import { ActionLink, AuthorityCheck, ConfirmDialog } from '@/components/shared';
import index from './Template/index';
import AddTask from '../../LeadsDetails/Task/AddTask';
import { useLeadContext } from '../../LeadList/store/LeadContext';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useRoleContext } from '../../Roles/RolesContext';
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import NoData from '@/views/pages/NoData'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

// const { Tr, Th, Td, THead, TBody } = Table

function Expanding() {

    const { roleData } = useRoleContext();
    // State for outer table and child table data
    const apiData: any = useLeadContext()
    const role: any = localStorage.getItem('role')
    // const [outerData, setOuterData] = useState<any>(projectData)
    // console.log(apiData)
    const [childData, setChildData] = useState<any>({})
    // console.log(childData)
    const [expanded, setExpanded] = useState<ExpandedState>({})
    const navigate = useNavigate()

    const [loadingChildData, setLoadingChildData] = useState<any>({});

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

    const hasLeadTaskDeletePermission = role === 'SUPERADMIN' ? true : roleData?.data?.leadtask?.delete?.includes(role);
    const hasLeadTaskCreatePermission = role === 'SUPERADMIN' ? true : roleData?.data?.leadtask?.create?.includes(role);

    const outerActionColumn = () => {

    }


    const ActionColumn = ({ row, childRow }: { row: any, childRow: any }) => {
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
                    <Tooltip title='Delete'>
                        <span className={`cursor-pointer py-2  hover:${textTheme}`}>
                            <MdDeleteOutline onClick={() => openDialog()} />
                        </span>
                    </Tooltip>
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

    const [expandedRowIds, setExpandedRowIds] = useState<any>([]);

    const handleRowClick = async (rowId: any) => {

        try {

            setExpandedRowIds((prevExpandedRowIds: any) => {
                if (prevExpandedRowIds.includes(rowId)) {
                    return prevExpandedRowIds.filter((id: any) => id !== rowId);
                } else {
                    return [...prevExpandedRowIds, rowId];
                }
            });

        } catch (error: any) {
            console.log(error)

            throw new Error(error)

        }


    };

    // Fetch data for child table
    const fetchChildData = async (leadId: string) => {
        handleRowClick(leadId)
        
        if (!childData[leadId] && !loadingChildData[leadId]) {
            // Set loading for this lead's child data
            setLoadingChildData((prev: any) => ({ ...prev, [leadId]: true }));

            try {
                const taskResponse = await apiGetCrmLeadsTaskData(leadId, org_id);
                setChildData((prev: any) => ({ ...prev, [leadId]: taskResponse.data }));
            } catch (error) {
                toast.push(
                    <Notification type="danger" duration={2000} closable>
                        Error fetching tasks
                    </Notification>
                );
            } 
        }
        setLoadingChildData((prev: any) => ({ ...prev, [leadId]: false }));
    };

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
            cell: ({ row }) => {

                // console.log(row.original)
                if (true) {
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
                    )
                } else {
                    return null
                }
            }
        },
        {
            header: 'Lead Name',
            accessorKey: 'name',
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

                return (<div
                    className='relative inline-block min-w-[100px] font-bold text-[#6B7280] capitalize'
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <span className='whitespace-wrap'>{row?.name?.length > 13
                        ? `${row.name.slice(0, 10)}...`
                        : row.name}</span>
                    {isHovered && (
                        <div className='capitalize absolute bottom-0 left-[30%] ml-2 bg-white border border-gray-300 p-2 shadow-lg z-50 whitespace-nowrap transition-opacity duration-200 font-normal'>
                            <p>{row.name}</p>
                        </div>
                    )}
                </div>)
            }
        },
        {
            header: 'Task Count',
            accessorKey: 'count_task',
            cell: (props) => {
                const row = props.row.original;
                return (
                    <div className='min-w-[100px] truncate text-[#6B7280]'>
                        {row.count_task}
                    </div>
                )
            }
        },
        {
            header: '',
            accessorKey: 'action',
            cell: (props) => {
                const row = props.row.original;
                return (


                    hasLeadTaskCreatePermission && <Tooltip title="Add Task">
                        <AuthorityCheck
                            userAuthority={[
                                `${localStorage.getItem(
                                    'role',
                                )}`,
                            ]}
                            authority={
                                role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.leadtask?.create ?? []
                            }
                        >
                            <AddTask leadId={row.lead_id} user={[]} addButton={false} />



                        </AuthorityCheck>
                    </Tooltip>


                )
            }
        },
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
            header: 'End Date',
            accessorKey: 'estimated_task_end_date',
            cell: ({ row }) => {
                return <span>{formateDate(row.original.estimated_task_end_date)}</span>
            }
        },
        {
            header: '',
            id: 'action',
            accessorKey: 'action',
            cell: ({ row }) => <span></span>,
        }
    ], [])

    const table = useReactTable({
        data: apiData || [],
        columns: outerTableColumns,
        state: {
            expanded,
        },
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return (
        <TableContainer className="max-h-[400px]" style={{ boxShadow: 'none' }}>
            <Table stickyHeader className="table-auto text-left">
                <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="flex w-full">
                            {headerGroup.headers.map((header) =>
                                header.id !== 'expander' ? (
                                    <TableCell
                                        className="uppercase"
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        sx={{
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#6B7280',
                                        }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ) : (
                                    <TableCell key={header.id}></TableCell>
                                )
                            )}
                        </TableRow>
                    ))}
                </TableHead>
                {apiData && apiData.length > 0 ? (
                    <TableBody>
                        {table.getRowModel().rows.map((row: any) => {
                            const isExpanded = expandedRowIds.includes(row.original.lead_id); // Check if the row is expanded

                            return (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        className="flex w-full"
                                        sx={{
                                            backgroundColor: isExpanded ? '#f0f8ff' : 'inherit', // Change color if expanded
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell: any) => (
                                            <TableCell key={cell.id} sx={{ textAlign: 'center' }}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {isExpanded && (
                                        <TableRow>
                                            <TableCell colSpan={row.getVisibleCells().length}>
                                                <TableContainer
                                                    className="max-h-[400px]  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                                                    sx={{
                                                        boxShadow: 'none',
                                                        '&:hover': { backgroundColor: '#dfedfe' },
                                                    }}
                                                >
                                                    <Table stickyHeader>
                                                        <TableHead>
                                                            <TableRow>
                                                                {childTableColumns.map((col: any, idx: any) => {

                                                                    const obj: any = {};

                                                                    return (
                                                                        <TableCell
                                                                            className="uppercase"
                                                                            key={idx}
                                                                            sx={{
                                                                                color: '#6B7280',
                                                                                fontWeight: '600',
                                                                            }}
                                                                        >
                                                                            {flexRender(col.header, obj)}
                                                                        </TableCell>
                                                                    )
                                                                }
                                                                )}
                                                            </TableRow>
                                                        </TableHead>
                                                        {loadingChildData[row.original.lead_id] ? (
                                                            <TableRowSkeleton
                                                                rows={5}
                                                                avatarInColumns={[0]}
                                                                columns={6}
                                                                avatarProps={{ width: 14, height: 14 }}
                                                            />
                                                        ) : (
                                                            <TableBody>
                                                                {childData[row.original.lead_id]?.map((childRow: any) => (
                                                                    <TableRow key={childRow.lead_id}>
                                                                        {childTableColumns.map((col: any, idx: any) => {
                                                                            if (
                                                                                col.accessorKey === 'estimated_task_end_date' ||
                                                                                col.accessorKey === 'estimated_task_start_date'
                                                                            ) {
                                                                                const formattedDate = formateDate(childRow[col.accessorKey]);
                                                                                return (
                                                                                    <TableCell key={idx} sx={{ color: '#6B7280' }}>
                                                                                        {formattedDate}
                                                                                    </TableCell>
                                                                                );
                                                                            } else if (col.accessorKey === 'task_name') {
                                                                                return (
                                                                                    <TableCell
                                                                                        sx={{ color: '#6B7280' }}
                                                                                        key={idx}
                                                                                        className="hover:cursor-pointer capitalize"
                                                                                        onClick={() =>
                                                                                            navigate(
                                                                                                `/app/crm/Leads/TaskDetails?lead_id=${row.original.lead_id}&task=${childRow.task_id}`
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {childRow[col.accessorKey]}
                                                                                    </TableCell>
                                                                                );
                                                                            } else if (col.accessorKey === 'action') {
                                                                                return (
                                                                                    <TableCell key={idx} sx={{ color: '#6B7280' }}>
                                                                                        <ActionColumn row={row.original} childRow={childRow} />
                                                                                    </TableCell>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <TableCell key={idx} sx={{ color: '#6B7280' }}>
                                                                                        {childRow[col.accessorKey]}
                                                                                    </TableCell>
                                                                                );
                                                                            }
                                                                        })}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        )}
                                                    </Table>
                                                </TableContainer>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                ) : (
                    <TableRow>
                        <TableCell>
                            <NoData />
                        </TableCell>
                    </TableRow>
                )}
            </Table>
        </TableContainer>
    )
}

export default Expanding