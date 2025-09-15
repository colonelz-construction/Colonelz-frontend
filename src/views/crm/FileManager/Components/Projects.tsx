
import { useMemo, useState, useEffect } from 'react'
// import Table from '@/components/ui/Table'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
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
import { ProjectDataItem } from './type'
import type { ColumnDef, FilterFn, ColumnFiltersState } from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjectData } from './data'
import { Select } from '@/components/ui'
import { GoProjectRoadmap } from 'react-icons/go'
import { useData } from '../FileManagerContext/FIleContext'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import NoData from '@/views/pages/NoData'
import formateDate from '@/store/dateformate'
import { Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import Sorter from '@/components/ui/Table/Sorter'

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
            <div></div>
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


    if (columnId === 'project_end_date') {
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
    const navigate = useNavigate()

    const columns = useMemo<ColumnDef<ProjectDataItem>[]>(
        () => [

            {
                header: 'Project Name',
                accessorKey: 'project_name',
                cell: (props) => {
                    const row = props.row.original;
                    return (
                        <div className=' cursor-pointer' onClick={() => navigate(`/app/crm/fileManager/project?project_id=${row.project_id}&project_name=${row.project_name}`)}>
                            {row.project_name}
                        </div>
                    )
                }
            },
            {
                header: 'Project Type',
                accessorKey: 'project_type',
                cell: (props) => {
                    const row = props.row.original;
                    return (
                        <div className=' cursor-pointer' onClick={() => navigate(`/app/crm/fileManager/project?project_id=${row.project_id}&project_name=${row.project_name}`)}>
                            {row.project_type}
                        </div>
                    )
                }
            },
            {
                header: 'Project Status',
                accessorKey: 'project_status',
                cell: (props) => {
                    const row = props.row.original;
                    return (
                        <div className=' cursor-pointer' onClick={() => navigate(`/app/crm/fileManager/project?project_id=${row.project_id}&project_name=${row.project_name}`)}>
                            {row.project_status}
                        </div>
                    )
                }
            },
            {
                header: 'Client Name',
                accessorKey: 'client_name',
                cell: (props) => {
                    const row = props.row.original;
                    return (
                        <div className=' cursor-pointer' onClick={() => navigate(`/app/crm/fileManager/project?project_id=${row.project_id}&project_name=${row.project_name}`)}>
                            {row.client_name}
                        </div>
                    )
                }
            },

        ],
        []
    )

    const { projectData, loading } = useData();
    const totalData = projectData?.length

    const table = useReactTable({
        data: projectData.reverse() || [],
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
                placeholder="Search ..."
                onChange={(value) => setGlobalFilter(String(value))}
            />
            <TableContainer className="max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ boxShadow: 'none' }}>
                <Table stickyHeader>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className='uppercase'>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableCell
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            sx={{ fontWeight: "600" }}
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
                    /> : projectData?.length === 0 ? <TableCell colSpan={columns?.length}><NoData /></TableCell> :
                        <TableBody>
                            {table?.getRowModel().rows.map((row) => {
                                return (
                                    <TableRow key={row.id} className='capitalize' sx={(theme) => ({'&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(55, 65, 81, 0.10)' : 'rgba(243, 244, 246, 0.10)' }})}>
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

        </>
    )
}

export default Filtering

