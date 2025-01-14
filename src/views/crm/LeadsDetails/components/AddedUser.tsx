import React, { useEffect, useMemo, useState } from 'react'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HiOutlineUserRemove } from "react-icons/hi";
import {
    Button,
    Checkbox,
    Dialog,
    FormItem,
    Input,
    Notification,
    Pagination,
    ScrollBar,
    Segment,
    Select,
    Skeleton,
    Tooltip,
    Upload,
    toast,
} from '@/components/ui'

import {
    apiGetAllUsersList,
    apiGetCrmFileManagerProjects,
    apiGetCrmUsersAssociatedToLead,
    apiLeadsRemoveUser,

} from '@/services/CrmService'
import NoData from '@/views/pages/NoData'
// import Table from '@/components/ui/Table'
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
import type { ColumnDef, FilterFn, ColumnFiltersState, PaginationState } from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import { MdDeleteOutline } from 'react-icons/md';
import { useRoleContext } from '@/views/crm/Roles/RolesContext'
import formateDate from '@/store/dateformate'
import { ConfirmDialog } from '@/components/shared'
import { useAppSelector } from '@/store'
import Assignee from '../../CustomerDetail/Project Progress/Assignee';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Sorter from '@/components/ui/Table/Sorter';

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix'> {
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
        <div className="flex justify-end">
            <div className="flex items-center mb-4">
                <Input
                    {...props}
                    size='sm'
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
        </div>
    )
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    let itemValue: any = row.getValue(columnId);


    if (columnId === 'date') {
        itemValue = formateDate(itemValue)
    }

    const itemRank = rankItem(itemValue, value);
    addMeta({
        itemRank,
    });

    return itemRank.passed;
};

const AddedUser = ({leadData, openDialog3}:any) => {
    const { roleData } = useRoleContext()
    // const [leadData, setLeadData] = useState<any>([])
    const [username, setUsername] = useState<any>()
    const [loading, setLoading] = useState<any>(false)
    const org_id = localStorage.getItem('orgId')
    const leadAddMemberAccess = localStorage.getItem('role') === 'SUPERADMIN' ? true :  roleData?.data?.addMember?.create?.includes(`${localStorage.getItem('role')}`)

    

    const direction = useAppSelector((state) => state.theme.direction)


    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const leadId = queryParams.get('id')
    const folderName = queryParams.get('folder_name') // Assuming folder_name is in the query params
    const navigate = useNavigate()

    interface User {
        role: string
        username: string
    }

    type Option = {
        value: number
        label: string
    }

    // useEffect(() => {
    //     const response = async () => {
    //         const data = await apiGetAllUsersList()
    //         const userdata = data.data
    //     }
    //     response()
    // }, [])

    const [dialogIsOpen, setIsOpen] = useState(false)

    const openDialog = (username: string) => {
        setIsOpen(true)
        setUsername(username)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    // useEffect(() => {
    //     setLoading(true)

    //     const fetchDataAndLog = async () => {
    //         try {
    //             const leadData = await apiGetCrmUsersAssociatedToLead(leadId)
    //             setLeadData(leadData?.data)


    //             setLoading(false)
    //         } catch (error) {
    //             console.error('Error fetching lead data', error)
    //         }
    //     }

    //     fetchDataAndLog()
    // }, [])
    // console.log(leadData)

    const removeUser = async (username: string) => {
        function warn(text: string) {
            toast.push(
                <Notification closable type="warning" duration={2000}>
                    {text}
                </Notification>, { placement: 'top-center' }
            )
        }


        const postData = {
            lead_id: leadId,
            username: username,
            org_id,

        };
        try {
            await apiLeadsRemoveUser(postData);
            toast.push(
                <Notification closable type="success" duration={2000}>
                    User removed successfully
                </Notification>, { placement: 'top-end' }
            )
            window.location.reload()
        } catch (error) {
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error removing user
                </Notification>, { placement: 'top-end' }
            )
        }
    }


    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [page, setPage] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });
    const totalData = leadData.length

    const pageSizeOption = [
        { value: 5, label: '5 / page' },
        { value: 10, label: '10 / page' },
        { value: 15, label: '15 / page' },
        { value: 20, label: '20 / page' },
        { value: 25, label: '25 / page' },
    ]

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                header: 'User', accessorKey: 'user_name',
                cell: ({ row }) => {
                    const lead = row.original

                    return <div className='flex items-center gap-2'>{lead?.user_name}</div>
                }
            },

            {
                header: 'Role', accessorKey: 'role', cell: ({ row }) => {
                    return <div>{row.original.role}</div>
                }
            },


            // {
            //     header: 'Created', accessorKey: 'date', cell: ({ row }) => {
            //         return <div>{formateDate(row.original.date)}</div>
            //     }
            // },
            {
                header: 'Actions', accessorKey: 'actions',
                cell: ({ row }) => {
                    const { roleData } = useRoleContext()
                    // console.log(roleData)
                    const deleteAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.addMember?.delete?.includes(`${localStorage.getItem('role')}`)
                    return <div className='flex items-center gap-2'>
                        {deleteAccess &&
                        <Tooltip title="Remove">
                            <HiOutlineUserRemove className='text-xl cursor-pointer hover:text-red-500' onClick={() => openDialog(row.original.user_name)} />
                            </Tooltip>}
                    </div>
                }
            },
        ],
        []
    )

    const table = useReactTable({
        data: leadData,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        state: {
            columnFilters,
            globalFilter,
            pagination: page
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
    // const onPaginationChange = (page: number) => {
    //     table.setPageIndex(page - 1)
    // }

    // const onSelectChange = (value = 0) => {
    //     table.setPageSize(Number(value))
    // }
    const onPaginationChange = (page: number) => {
        setPage((prev) => ({ ...prev, pageIndex: page - 1 }));
    };

    const onSelectChange = (value: any) => {
        setPage((prev) => ({ ...prev, pageSize: value, pageIndex: 0 })); // Reset to first page when page size changes
    };

    const role = localStorage.getItem('role');

    return (
        <div>
            <div className="w-full">
                <div className="flex-1 px-4">
                    <div className='flex items-center gap-2 justify-end'>

                    <div className=' flex mb-4 gap-3'>

                        { leadAddMemberAccess &&
                            <Button variant='solid' size='sm' className='' onClick={() => openDialog3()}>
                            Add User</Button>
                        }

                        </div>

                        <DebouncedInput
                            value={globalFilter ?? ''}
                            className="p-2 font-lg shadow border border-block"
                            placeholder="Search..."
                            onChange={(value) => setGlobalFilter(String(value))}
                        />
                     

                    </div>
                    {leadData ? (
                        <div className=' overflow-y-auto'>
                            <TableContainer className='max-h-[400px]' style={{ scrollbarWidth: 'none', boxShadow: 'none'}}>
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
                                                            {header.isPlaceholder || header.id === 'actions' ? null : (
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
                                    {loading ? <TableRowSkeleton
                                        rows={5}
                                        avatarInColumns={[0]}
                                        columns={3}
                                        avatarProps={{ width: 14, height: 14 }}
                                    /> :
                                        (leadData.length === 0 ? <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={columns.length}>
                                                    <NoData />
                                                </TableCell>
                                            </TableRow>
                                        </TableBody> :
                                            <TableBody >
                                                {table.getRowModel().rows.map((row) => {
                                                    return (
                                                        <TableRow key={row.id} sx={{'&:hover': { backgroundColor: '#dfedfe' }}}>
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


                                            </TableBody>)}
                                </Table>
                            </TableContainer>
                        </div>
                    ) : (<NoData />)}

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
                                        table.getState().pagination.pageSize
                                )}
                                options={pageSizeOption}
                                onChange={(option) => onSelectChange(option?.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={dialogIsOpen}
                type="danger"
                onClose={onDialogClose}
                confirmButtonColor="red-600"
                onCancel={onDialogClose}
                onConfirm={() => removeUser(username)}
                title="Remove Assignee"
                onRequestClose={onDialogClose}
            >
                <p> Are you sure you want to remove this assignee? </p>
            </ConfirmDialog>


        </div>
    )
}

export default AddedUser
