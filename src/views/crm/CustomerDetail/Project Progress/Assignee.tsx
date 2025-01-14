import { useMemo, useState, useEffect } from 'react'
// import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import { MdDeleteOutline } from 'react-icons/md'
import { HiOutlineUserRemove } from "react-icons/hi";
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
import type {
    ColumnDef,
    FilterFn,
    ColumnFiltersState,
} from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import { apiGetUsersListProject, apiRemoveUserProject } from '@/services/CrmService'
import {
    Button,
    Dialog,
    Notification,
    Pagination,
    Select,
    toast,
    Tooltip,
} from '@/components/ui'
import { useRoleContext } from '../../Roles/RolesContext'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import { ConfirmDialog } from '@/components/shared'
import NoData from '@/views/pages/NoData'
import useQuery from '@/utils/hooks/useQuery';
import AddUserToProject from './AddUserToProject';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Sorter from '@/components/ui/Table/Sorter';

type User = {
    user_name: string
    role: string
    user_id: string
}

export type UsersResponse = {
    data: any
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div className="flex justify-end">
            <div className="flex items-center mb-4">
                <Input
                    {...props}
                    size="sm"
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

const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
    { value: 40, label: '40 / page' },
    { value: 50, label: '50 / page' },
]

const Assignee = ({data}: any) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const { roleData } = useRoleContext()
    const [loading, setLoading] = useState(true)
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [userId, setUserId] = useState('')
    const [userName, setUserName] = useState('')
    const [userData, setUserData] = useState()
    const query = useQuery()
    const project_id = query.get('project_id')
    const role = localStorage.getItem('role')
    const queryParams = new URLSearchParams(location.search);
    const allQueryParams: QueryParams = {
        id: queryParams.get('id') || '',
        project_id: queryParams.get('project_id') || '',

    };

    const openDialog = (UserId: any, userName: any) => {
        setIsOpen(true)
        setUserId(UserId)
        setUserName(userName)
    }
    const onDialogClose = () => {
        setIsOpen(false)
    }

    interface QueryParams {
        id: string;
        project_id: string;
    }


    const deleteuser = async (username: string, project_id: any) => { // org done
        const response = await apiRemoveUserProject(username, project_id)
        if (response.code === 200) {
            toast.push(
                <Notification closable type="success" duration={2000}>
                    {response.message}
                </Notification>,
            )
            window.location.reload()
        } else {
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    {response.errorMessage}
                </Notification>,
            )
        }
    }

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            { header: 'Username', accessorKey: 'user_name' },
            { header: 'Role', accessorKey: 'role' },
            {
                header: '',
                id: 'action',
                cell: ({ row }) => {

                    const deleteAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.addMember?.delete?.includes(`${role}`)
                    return (
                        <div className="">

                            {deleteAccess && <span className="flex items-center text-lg gap-2">
                                <Tooltip title="Remove">
                                    <p
                                        className=" text-xl hover:text-red-500 cursor-pointer"
                                        onClick={() =>
                                            openDialog(row.original.user_id, row.original.user_name)
                                        }
                                    >
                                        <HiOutlineUserRemove />
                                    </p>
                                </Tooltip>
                            </span>}

                            
                        </div>
                    )
                },
            },
        ],
        [],
    )

    const [datas] = useState(() => data)

    const table = useReactTable({
        data,
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

    const leadAddMemberAccess = localStorage.getItem('role') === 'SUPERADMIN' ? true :  roleData?.data?.addMember?.create?.includes(`${localStorage.getItem('role')}`)

    const [dialogIsOpen3, setIsOpen3] = useState(false)

    const openDialog3 = () => {
        setIsOpen3(true)
    }

    const onDialogClose3 = () => {
        setIsOpen3(false)
    }


    return (
        <>
            <div className="flex flex-col sm:flex-row gap-5 justify-between mb-5">
                <h3>Assignee</h3>
                <div className="flex gap-3">

                    <div className=' flex mb-4 gap-3'>

                        { leadAddMemberAccess &&
                            <Button variant='solid' size='sm' className='' onClick={() => openDialog3()}>
                            Add User</Button>
                        }

                    </div>

                    <DebouncedInput
                        value={globalFilter ?? ''}
                        className="p-2 font-lg shadow border border-block"
                        placeholder="Search ..."
                        onChange={(value) => setGlobalFilter(String(value))}
                    />
                </div>
            </div>

            {data.length > 0 ? (
                <TableContainer className='max-h-[400px]' style={{ scrollbarWidth: 'none', boxShadow: 'none'}}>
                    <Table stickyHeader>
                        <TableHead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableCell
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className='uppercase'
                                                sx={{fontWeight:'600'}}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        {...{
                                                            className:
                                                                header.column.getCanSort()
                                                                    ? 'cursor-pointer select-none'
                                                                    : '',
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
                                                        {header.column.id !==
                                                            'action' && (
                                                                <Sorter
                                                                    sort={header.column.getIsSorted()}
                                                                />
                                                            )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHead>
                        {false ? (
                            <TableRowSkeleton
                                avatarInColumns={[0]}
                                columns={columns.length}
                                rows={10}
                            />
                        ) : (
                            <TableBody>
                                {table.getRowModel().rows.map((row) => {
                                    return (
                                        <TableRow key={row.id} sx={{'&:hover': { backgroundColor: '#dfedfe' }}}>
                                            {row.getVisibleCells().map((cell) => {
                                                return (
                                                    <TableCell key={cell.id} className='capitalize' >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        )}
                    </Table>
                </TableContainer>
                
                ) : (
                <NoData />
            )}
            <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={table.getFilteredRowModel().rows.length}
                    onChange={onPaginationChange}
                />
                <div style={{ minWidth: 130 }}>
                    <Select
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

            <Dialog
                isOpen={dialogIsOpen3}
                onClose={onDialogClose3}
                onRequestClose={onDialogClose3}
            ><AddUserToProject project_id={project_id} /></Dialog>

            <ConfirmDialog
                isOpen={dialogIsOpen}
                type="danger"
                onClose={onDialogClose}
                confirmButtonColor="red-600"
                onCancel={onDialogClose}
                onConfirm={() => deleteuser(userName, allQueryParams.project_id)}
                title="Remove Assignee"
                onRequestClose={onDialogClose}
            >
                <p> Are you sure you want to remove this Assignee from This Project? </p>
            </ConfirmDialog>
        </>
    )
}

export default Assignee