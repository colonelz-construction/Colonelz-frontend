import { useMemo, useState, useEffect } from 'react'
import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import { Dialog } from '@/components/ui'
import { MdDeleteOutline } from 'react-icons/md'
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
import { apiDeleteUsers, apiGetUsers } from '@/services/CrmService'
import { BiPencil, BiTrash } from 'react-icons/bi'
import {
    Button,
    Notification,
    Pagination,
    Select,
    toast,
    Tooltip,
} from '@/components/ui'
import { useRoleContext } from '../Roles/RolesContext'
import { Link } from 'react-router-dom'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import { AuthorityCheck, ConfirmDialog } from '@/components/shared'
import { AiOutlineDelete } from 'react-icons/ai'
import EditUserRole from './EditUserRole'

type User = {
    username: string
    role: string
    email: string
    UserId: string
}

export type UsersResponse = {
    data: User[]
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

const { Tr, Th, Td, THead, TBody, Sorter } = Table

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

const Users = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [data, setData] = useState<User[]>([])
    const { roleData } = useRoleContext()
    const [loading, setLoading] = useState(true)
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [userId, setUserId] = useState('')
    const [userData, setUserData] = useState()
    const org_id = localStorage.getItem('orgId')

    const role = localStorage.getItem('role')

    const [editRoledialogIsOpen, setEditRoleIsOpen] = useState(false)
  
    

    const openEditRoleDialog = (Data : any) => {
        setEditRoleIsOpen(true)
        setUserData(Data)
    }

    const onEditRoleDialogClose = () => {
        setEditRoleIsOpen(false)
    }

    const openDialog = (UserId: any) => {
        setIsOpen(true)
        setUserId(UserId)
    }
    const onDialogClose = () => {
        setIsOpen(false)
    }

    useEffect(() => {
        const fetchData = async () => {
            const response = await apiGetUsers()
            const data: UsersResponse = response
            setLoading(false)
            setData(data.data)
        }

        fetchData()
    }, [])

    const deleteuser = async (UserId: string) => {
        const response = await apiDeleteUsers(UserId, org_id)
        
        

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
            { header: 'Username', accessorKey: 'username' },
            { header: 'Role', accessorKey: 'role' },
            { header: 'Email', accessorKey: 'email' },

            {
                header: '',
                id: 'action',
                cell: ({ row }) => {
                    return (
                        <div className="">
                            <span className="flex items-center text-lg gap-2">
                                {
                                    // editAccess&&
                                    <Tooltip title="Edit">
                                        <AuthorityCheck
                                            userAuthority={[
                                                `${localStorage.getItem(
                                                    'role',
                                                )}`,
                                            ]}
                                            authority={
                                                role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.user
                                                    ?.update ?? []
                                            }
                                        >
                                            
                                                <span className="cursor-pointer" onClick={() => openEditRoleDialog(row.original)}>
                                             
                                                    <BiPencil />
                                                </span>
                                        
                                        </AuthorityCheck>
                                    </Tooltip>
                                }
                                <Tooltip title="Delete">
                                <AuthorityCheck
                                            userAuthority={[
                                                `${localStorage.getItem(
                                                    'role',
                                                )}`,
                                            ]}
                                            authority={
                                                role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.user
                                                    ?.delete ?? []
                                            }
                                        >
                                    <p
                                        className=" text-xl hover:text-red-500 cursor-pointer"
                                        onClick={() =>
                                            openDialog(row.original.UserId)
                                        }
                                    >
                                        <MdDeleteOutline />
                                    </p>
                                    </AuthorityCheck>
                                </Tooltip>
                            </span>
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


    return (
        <>
            <div className="flex flex-col sm:flex-row gap-5 justify-between mb-5">
                <h3>Users</h3>
                <div className="flex gap-3">
                    <AuthorityCheck
                        userAuthority={[`${localStorage.getItem('role')}`]}
                        authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.user?.create ?? []}
                    >
                        <Link to={`/app/crm/register`}>
                            <Button size="sm" variant="solid">
                                Create User
                            </Button>
                        </Link>
                    </AuthorityCheck>
                    <DebouncedInput
                        value={globalFilter ?? ''}
                        className="p-2 font-lg shadow border border-block"
                        placeholder="Search ..."
                        onChange={(value) => setGlobalFilter(String(value))}
                    />
                </div>

                
            </div>
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
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                {loading ? (
                    <TableRowSkeleton
                        avatarInColumns={[0]}
                        columns={columns.length}
                        rows={10}
                    />
                ) : (
                    <TBody>
                        {table.getRowModel().rows.map((row) => {
                            return (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Td>
                                        )
                                    })}
                                </Tr>
                            )
                        })}
                    </TBody>
                )}
            </Table>
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
            <ConfirmDialog
                isOpen={dialogIsOpen}
                type="danger"
                onClose={onDialogClose}
                confirmButtonColor="red-600"
                onCancel={onDialogClose}
                onConfirm={() => deleteuser(userId)}
                title="Delete User"
                onRequestClose={onDialogClose}
            >
                <p> Are you sure you want to delete this user? </p>
            </ConfirmDialog>
            <Dialog
                isOpen={editRoledialogIsOpen}
                onClose={onEditRoleDialogClose}
                onRequestClose={onEditRoleDialogClose}
                className=""
            >
                {<EditUserRole Data={userData}/>}
            </Dialog>
        </>
    )
}

export default Users
