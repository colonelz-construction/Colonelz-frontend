import { useMemo, useState, useEffect } from 'react'
// import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import { IoIosAddCircleOutline } from "react-icons/io";
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
import { useNavigate } from 'react-router-dom'
import { Select, Tooltip } from '@/components/ui'
import { ProjectMomItem } from '../store'
import { apiGetMomData } from '@/services/CrmService'
import formateDate from '@/store/dateformate'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import NoData from '@/views/pages/NoData'
import { ActionLink, AuthorityCheck } from '@/components/shared'
import { useRoleContext } from '../../Roles/RolesContext'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Sorter from '@/components/ui/Table/Sorter';


export type MomResponse = {
    code: number;
    data: MomData;
}

type MomData = {
    MomData: Data[];
}

type Data = {
    client_name: string;
    location: string;
    meetingDate: string;
    mom_id: string;
    project_id: string;
    project_name: string;

}
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
        <div className="flex justify-between ">
            <h3>Minutes of Meeting </h3>
            <div className="flex items-center mb-4">
                <Input
                    {...props}
                    value={value}
                    size='sm'
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>

        </div>
    )
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    let itemValue: any = row.getValue(columnId);


    if (columnId === 'meetingDate') {
        itemValue = formateDate(itemValue);
    }

    const itemRank = rankItem(itemValue, value);
    addMeta({
        itemRank,
    });

    return itemRank.passed;
};
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


const Filtering = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const { roleData } = useRoleContext()
    const role = localStorage.getItem('role')
    const columns = useMemo<ColumnDef<ProjectMomItem>[]>(
        () => [
            {
                header: 'Project Name',
                accessorKey: 'project_name',
                cell: (props) => {
                    const row = props.row.original

                    return (
                        <span className='cursor-pointer' onClick={() => navigate(`/app/crm/project-details?project_id=${row.project_id}&id=65c32e19e0f36d8e1f30955c&type=mom`)}>{row.project_name}</span>
                    )
                },
            },
            {
                header: 'Client Name',
                accessorKey: 'client_name',
                cell: (props) => {
                    const row = props.row.original

                    return (
                        <span>{row.client_name}</span>
                    )
                },


            },
            {
                header: 'Location',
                accessorKey: 'location',
                cell: (props) => {
                    const row = props.row.original

                    return (
                        <span>{row.location}</span>
                    )
                },

            },
            {
                header: 'Meeting Date',
                accessorKey: 'meetingDate',
                cell: (props) => {
                    const row = props.row.original
                    const FormattedDate = formateDate(row.meetingDate)

                    return (
                        <span>{FormattedDate}</span>
                    )
                },
            },
            {
                header: '',
                id: 'action',
                cell: ({ row }) => {

                    const projectId = row.original.project_id
                    const clientName = row.original.client_name
                    return (
                        <div className="">


                            <span className="flex items-center text-lg gap-2 cursor-pointer">
                                {
                                    // editAccess&&
                                    <Tooltip title="Add MOM">
                                        <AuthorityCheck
                                            userAuthority={[
                                                `${localStorage.getItem(
                                                    'role',
                                                )}`,
                                            ]}
                                            authority={
                                                role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.mom?.create ?? []
                                            }
                                        >
                                            <IoIosAddCircleOutline onClick={() => navigate(`/app/crm/project/momform?project_id=${projectId}&client_name=${clientName}`)} />



                                        </AuthorityCheck>
                                    </Tooltip>
                                }
                            </span>
                        </div>
                    )
                },
            },

        ],
        []
    )
    const [ordersData, setOrdersData] = useState<Data[]>([])
    const [loading, setLoading] = useState(true)
    const org_id = localStorage.getItem('orgId')
    useEffect(() => {
        apiGetMomData(org_id).then((response) => {
            if (response.code === 200) {
                setOrdersData(response.data.MomData)
                setLoading(false)
            }
        })
    }, [])
    const navigate = useNavigate()

    const table = useReactTable({
        data: ordersData,
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


    const filteredRowCount = table.getFilteredRowModel().rows.length

    return (
        <>

            <DebouncedInput
                value={globalFilter ?? ''}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search ..."
                onChange={(value) => setGlobalFilter(String(value))}
            />
            <TableContainer className='max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' style={{ boxShadow: 'none' }}>
                <Table stickyHeader>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='uppercase'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableCell
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            sx={{ fontWeight: '600' }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    {...{
                                                        className:
                                                            header.column.getCanSort()
                                                                ? 'cursor-pointer select-none'
                                                                : 'pointer-events-none',
                                                        onClick:
                                                            header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext()
                                                    )}
                                                    {header.column.getCanSort() && (
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
                    {loading ? <TableRowSkeleton
                        avatarInColumns={[0]}
                        columns={columns.length}
                        avatarProps={{ width: 14, height: 14 }}
                    /> :
                        ordersData.length === 0 ? <TableBody>
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <NoData />
                                </TableCell>
                            </TableRow>
                        </TableBody> :
                            <TableBody>
                                {table.getRowModel().rows.map((row) => {
                                    return (
                                        <TableRow key={row.id} className=' capitalize' sx={{ '&:hover': { backgroundColor: '#dfedfe' } }}>
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
                            </TableBody>}
                </Table>
            </TableContainer>
            <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={filteredRowCount}
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
        </>
    )
}

export default Filtering

