
import { useMemo, useState, useEffect } from 'react'
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
import type { Product } from '../LeadList/store/productListSlice'
import type { ColumnDef, FilterFn, ColumnFiltersState } from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pagination, Select } from '@/components/ui'
import { useRoleContext } from '../Roles/RolesContext'
import formateDate from '@/store/dateformate'
import { useLeadContext } from '../LeadList/store/LeadContext'
import NoData from '@/views/pages/NoData'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import Sorter from '@/components/ui/Table/Sorter'

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix'> {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
}

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
    const role = localStorage.getItem('role')

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value])

    const { roleData } = useRoleContext()

    return (
        <div className="flex justify-between md:flex-col lg:flex-row">
            <h3>Leads</h3>
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
    let itemValue: any = row.getValue(columnId);


    if (columnId === 'date') {
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
    'Not Contacted': 'bg-red-200 text-red-700',
    'Inactive': 'bg-yellow-200 text-yellow-700',
    'Contract': 'bg-violet-200 text-violet-700',
    'Project': 'bg-lime-200 text-lime-700',
};

const Timeline = () => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const navigate = useNavigate()
    const apiData = useLeadContext()
    const responseData = apiData
    const totalData = responseData?.length

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                header: 'Lead Name', accessorKey: 'name',
                cell: ({ row }) => {
                    const name = row.original.name
                    return <Link to={`/app/crm/timeline/lead`} className=' capitalize'>{name}</Link>
                }
            },
            {
                header: 'Lead Status', accessorKey: 'status',
                cell: ({ row }) => {

                    let status;
                    if (row.original.lead_status === 'contract') {
                        status = 'Contract'
                    } else if (row.original.lead_status === 'project') {
                        status = 'Project'
                    } else {
                        status = row.original.status
                    }

                    return (
                        <span
                            className={`px-2 py-1 rounded-sm text-xs font-semibold ${statusColors[status]}`}
                        >
                            {status}
                        </span>
                    )
                }
            },
            { header: 'Location', accessorKey: 'location' },
            { header: 'Email', accessorKey: 'email' },
            { header: 'Phone', accessorKey: 'phone' },
            {
                header: 'Created date', accessorKey: 'date',
                cell: ({ row }) => {
                    const date = row.original.date;
                    const [year, month, day] = new Date(date).toISOString().split('T')[0].split('-');
                    return `${day}-${month}-${year}`;
                }
            },


        ],
        []
    )

    // console.log(responseData)


    const table = useReactTable({
        data: responseData || [],
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
            <DebouncedInput
                value={globalFilter ?? ''}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search..."
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

                    {responseData && responseData?.length <= 0 ? <TableBody>
                        <TableRow>
                            <TableCell colSpan={columns.length}>
                                <NoData />
                            </TableCell>
                        </TableRow>
                    </TableBody> :

                        <TableBody>
                            {table.getRowModel().rows.map((row) => {
                                return (
                                    <TableRow sx={(theme) => ({'&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(55, 65, 81, 0.10)' : 'rgba(243, 244, 246, 0.10)' }})} key={row.id} onClick={() => navigate(`/app/crm/timeline/lead?id=${row.original.lead_id}`)} className=' cursor-pointer'>
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
                    }
                </Table>

            </TableContainer>
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

export default Timeline

