import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../../Footer'

import { useMemo } from 'react'
// import Table from '@/components/ui/Table'
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
import type { ColumnDef, FilterFn, ColumnFiltersState } from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import { AiOutlineFolder } from 'react-icons/ai'
import { apiGetCrmFileManagerCompanyData } from '@/services/CrmService'
import NoData from '@/views/pages/NoData'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
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
        <div className="flex justify-end">
            <div className="flex items-center mb-4">
                <span className="mr-2"></span>
                <Input
                    {...props}
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




const Residential = () => {
    type Result = {
        sub_folder: string,
        count: number,
        date: string,
        name: string,
        type: string
    }
    type folderpairs = {
        folder_name: string,
        sub_folder_name_first: string
        folder: string
    }
    const navigate = useNavigate()
    const [data, setData] = useState<Result[]>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchDataAndLog = async () => {

            const data = await apiGetCrmFileManagerCompanyData()
            const templateData = data.data.templateData
            //   console.log(templateData);

            setLoading(false)
            const folderSubFolderPairs: folderpairs[] = [
                { folder_name: 'residential', sub_folder_name_first: 'designing', folder: "Design" },
                { folder_name: 'residential', sub_folder_name_first: 'executing', folder: "Design and Execution" },
            ];
            //   console.log(templateData);

            const results = [];
            for (const pair of folderSubFolderPairs) {
                let count = 0;
                let date = ''
                templateData?.flatMap(
                    (item: any) => {
                        item.files.filter(
                            (file: any) => {
                                if (file.folder_name === pair.folder_name && file.sub_folder_name_first === pair.sub_folder_name_first) {
                                    count++;
                                    date = formatDate(file.updated_date)
                                }
                            }
                        )
                    }
                );
                results.push({ name: pair.folder, sub_folder: pair.sub_folder_name_first, count: count, date: date, type: 'Folder' });

            }

            // console.log(results);
            setData(results);
        };

        fetchDataAndLog();
    }, []);

    function formatDate(dateString: string) {
        if (dateString == "-") return "-"
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }


    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const columns = useMemo<ColumnDef<Result>[]>(
        () => [
            {
                header: 'Name', accessorKey: 'name', cell: ({ row }) =>
                    <div className="flex items-center">
                        <AiOutlineFolder className="mr-2 text-lg" />
                        <Link to={`/app/crm/fileManager/project/templates/residential/subfolder?type=residential&folder=${row.original.sub_folder}`}>{row.original.name}</Link>
                    </div>
            },
            { header: 'type', accessorKey: 'type' },
            { header: 'items', accessorKey: 'count' },
            { header: 'modified', accessorKey: 'date' },
        ],
        []
    )



    const table = useReactTable({
        data: data,
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
    return (
        <>
            <div>
                <h3 className='mb-8'>Company Data</h3>
                <div className="h-screen w-full">
                    <div className="flex-1 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <nav className="flex">
                                <ol className="flex items-center space-x-2">
                                    <li>
                                        <a href="/app/crm/fileManager" className="text-blue-600 dark:text-blue-400 hover:underline">FileManager</a>
                                    </li>
                                    <li>
                                        <span className="mx-2">/</span>
                                    </li>
                                    <li>
                                        <a href="/app/crm/fileManager" className="text-blue-600 dark:text-blue-400 hover:underline">Company Data</a>
                                    </li>
                                    <li>
                                        <span className="mx-2">/</span>
                                    </li>

                                    <li className="text-gray-500">Residential</li>
                                </ol>
                            </nav>
                            <DebouncedInput
                                value={globalFilter ?? ''}
                                className="p-2 font-lg border-block"
                                placeholder="Search"
                                onChange={(value) => setGlobalFilter(String(value))}
                            />
                        </div>
                        <>
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
                                        avatarInColumns={[0]}
                                        columns={columns.length}
                                        rows={2}
                                        avatarProps={{ width: 14, height: 14 }}
                                    /> : data.length === 0 ? <NoData /> :
                                        <TableBody>
                                            {table.getRowModel().rows.map((row) => {
                                                return (
                                                    <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: '#dfedfe' } }}>
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
                        </>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Residential