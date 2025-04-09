import React, { useMemo, useState, useEffect, useRef } from 'react'
// import Table from '@/components/ui/Table'
import { Button, Notification, Pagination, Select, Skeleton, toast, Tooltip } from '@/components/ui'
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
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
} from "@mui/material";
import Sorter from '@/components/ui/Table/Sorter';

import { RiArrowRightSFill } from "react-icons/ri";
import { RiArrowDownSFill } from "react-icons/ri";
import type { ColumnDef, ExpandedState } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { apiGetCrmProjectsTaskData, apiGetCrmProjectsTaskDelete } from '@/services/CrmService'
import { AuthorityCheck, ConfirmDialog } from '@/components/shared';
import AddTask from '../../CustomerDetail/Task/AddTask';
import { useProjectContext } from '../../Customers/store/ProjectContext'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import NoData from '@/views/pages/NoData'

// const { Tr, Th, Td, THead, TBody } = Table

function Expanding() {
    // State for outer table and child table data
    const { roleData } = useRoleContext()
    const { projects, apiData, loading } = useProjectContext();
    const role = localStorage.getItem('role')
    // const [outerData, setOuterData] = useState<any>(projectData)
    // console.log(outerData)
    const [childData, setChildData] = useState<any>({})
    // console.log(childData)
    const [expanded, setExpanded] = useState<ExpandedState>({})
    const navigate = useNavigate()

    const [projectData, setProjectData] = useState<any>([]);

    const [data, setData] = useState<any>(() => projects || []);


    // console.log(projects)

    const fetchChildData = async (projectId: string) => {
        handleRowClick(projectId)

        if (!childData[projectId] && !loadingChildData[projectId]) {
            // Set loading for this lead's child data
            setLoadingChildData((prev: any) => ({ ...prev, [projectId]: true }));

            try {
                const taskResponse = await apiGetCrmProjectsTaskData(projectId, org_id);
                setChildData((prev: any) => ({ ...prev, [projectId]: taskResponse.data }));
            } catch (error) {
                toast.push(
                    <Notification type="danger" duration={2000} closable>
                        Error fetching tasks
                    </Notification>
                );
            }
        }
        setLoadingChildData((prev: any) => ({ ...prev, [projectId]: false }));
    };

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


    const org_id = localStorage.getItem('orgId')
    const [loadingChildData, setLoadingChildData] = useState<any>({});

    const createAccess = role === 'SUPERADMIN' ? true : roleData?.data?.task?.create?.includes(`${localStorage.getItem('role')}`)

    useEffect(() => {

        if (projects) setProjectData(projects)

    }, [])




    const formateDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }





    const ActionColumn = ({ row, childRow }: { row: any, childRow: any }) => {
        const navigate = useNavigate()
        const { textTheme } = useThemeClass()

        const org_id = localStorage.getItem('orgId')

        const data = {
            user_id: localStorage.getItem('userId'),
            project_id: row.project_id,
            task_id: childRow.task_id, org_id
        }
        const editAccess = role === 'SUPERADMIN' ? true : roleData?.data?.task?.update?.includes(`${localStorage.getItem('role')}`)
        const deleteAccess = role === 'SUPERADMIN' ? true : roleData?.data?.task?.delete?.includes(`${localStorage.getItem('role')}`)
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

    // Columns for outer table
    const outerTableColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: 'expander',
            header: ({ table }) => {



                return (
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
                )
            },
            cell: ({ row }) => {

                const isExpanded = expandedRowIds.includes(row.original.project_id);

                // console.log("is", isExpanded)
                // console.log('get', row.getIsExpanded())
                if (true) {
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
                    )
                } else {
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
                        className='relative inline-block min-w-[100px] font-bold capitalize text-[#6B7280]'
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className='whitespace-wrap'>{row.project_name?.length > 13
                            ? `${row.project_name.slice(0, 10)}...`
                            : row.project_name}</span>
                        {isHovered && (
                            <div className='capitalize  absolute bottom-0 left-[30%] ml-2 bg-white border border-gray-300 p-2 shadow-lg z-9999 whitespace-nowrap transition-opacity duration-200 font-normal'>
                                <p>{row.project_name}</p>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Task Count',
            accessorKey: 'count_task',
            cell: (props) => {
                const row = props.row.original;
                return (
                    <div className='min-w-[100px] text-[#6B7280]'>
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
                    createAccess && <Tooltip title="Add Task">
                        <AuthorityCheck
                            userAuthority={[
                                `${localStorage.getItem(
                                    'role',
                                )}`,
                            ]}
                            authority={
                                role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.task?.create ?? []
                            }
                        >
                            <AddTask project={row.project_id} user={[]} addButton={false} />
                        </AuthorityCheck>
                    </Tooltip>
                )
            }
        },
    ], [])

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
        },
        {
            header: '',
            id: 'sdf',
            accessorKey: 'ds',
            cell: ({ row }) => <span></span>,
        },
    ], [])

    const table = useReactTable({
        data: data || [],
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
            <Table stickyHeader className="table-auto text-left" sx={{ textAlign: 'center', color: "#6B7280", border: "0.09rem" }}>
                <TableHead className="flex">
                    {table?.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="flex w-full">
                            {headerGroup.headers.map((header) => {
                                return header.id !== 'expander' ? (
                                    <TableCell
                                        className="uppercase"
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        sx={{
                                            textAlign: 'center',
                                            color: "#6B7280",
                                            fontWeight: "600",
                                            zIndex: 10,
                                        }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableCell>
                                ) : (
                                    <TableCell key={header.id} sx={{ zIndex: 10 }} />
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHead>
                {data && data.length > 0 ? (
                    <TableBody>
                        {table?.getRowModel()?.rows?.map((row: any) => {
                            const isExpanded = expandedRowIds.includes(row.original.project_id); // Check if the row is expanded

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
                                                <TableContainer className="max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" sx={{ boxShadow: 'none', '&:hover': { backgroundColor: '#dfedfe' } }}>
                                                    <Table stickyHeader>
                                                        <TableHead>
                                                            <TableRow>
                                                                {childTableColumns.map((col, idx) => {

                                                                    const obj: any = {};

                                                                    return (
                                                                        <TableCell
                                                                            className="uppercase"
                                                                            key={idx}
                                                                            sx={{ color: "#6B7280", fontWeight: "600" }}
                                                                        >
                                                                            {flexRender(col.header, obj)}
                                                                        </TableCell>
                                                                    )
                                                                }

                                                                )}
                                                            </TableRow>
                                                        </TableHead>
                                                        {loadingChildData[row.original.project_id] ? (
                                                            <TableRowSkeleton
                                                                rows={5}
                                                                avatarInColumns={[0]}
                                                                columns={6}
                                                                avatarProps={{ width: 14, height: 14 }}
                                                            />
                                                        ) : (
                                                            <TableBody>
                                                                {childData[row.original.project_id]?.map((childRow: any) => (
                                                                    <TableRow key={childRow.project_id}>
                                                                        {childTableColumns.map((col: any, idx: any) => {
                                                                            if (col.accessorKey === 'estimated_task_end_date' || col.accessorKey === 'estimated_task_start_date') {
                                                                                const formattedDate = formateDate(childRow[col.accessorKey]);
                                                                                return <TableCell key={idx} sx={{ color: "#6B7280" }}>{formattedDate}</TableCell>;
                                                                            } else if (col.accessorKey === 'task_name') {
                                                                                return (
                                                                                    <TableCell
                                                                                        sx={{ color: "#6B7280" }}
                                                                                        key={idx}
                                                                                        className="hover:cursor-pointer capitalize"
                                                                                        onClick={() =>
                                                                                            navigate(
                                                                                                `/app/crm/Projects/TaskDetails?project_id=${row.original.project_id}&task=${childRow.task_id}`
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        {childRow[col.accessorKey]}
                                                                                    </TableCell>
                                                                                );
                                                                            } else if (col.accessorKey === 'action') {
                                                                                return (
                                                                                    <TableCell key={idx} sx={{ color: "#6B7280" }}>
                                                                                        <ActionColumn row={row.original} childRow={childRow} />
                                                                                    </TableCell>
                                                                                );
                                                                            } else {
                                                                                return <TableCell key={idx} sx={{ color: "#6B7280" }}>{childRow[col.accessorKey]}</TableCell>;
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
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={3}>
                                <NoData />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                )}
            </Table>
        </TableContainer>
    )
}

export default Expanding