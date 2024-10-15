import { useMemo, useState, useEffect } from 'react'
import Table from '@/components/ui/Table'
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
import type { ColumnDef, FilterFn, ColumnFiltersState } from '@tanstack/react-table'
import type { InputHTMLAttributes } from 'react'
import { useNavigate } from 'react-router-dom'
import {  Select } from '@/components/ui'
import { ProjectMomItem } from '../store'
import { apiGetMomData } from '@/services/CrmService'
import formateDate from '@/store/dateformate'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import NoData from '@/views/pages/NoData'


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
    let itemValue:any = row.getValue(columnId);

    
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
    const columns = useMemo<ColumnDef<ProjectMomItem>[]>(
        () => [
            {
                header: 'Project Name',
                accessorKey: 'project_name',
               
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
                  const FormattedDate=formateDate(row.meetingDate)
              
                  return (
                      <span>{FormattedDate}</span>
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
        data:ordersData,
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
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                {loading ?<TableRowSkeleton columns={columns.length} /> :
                ordersData.length === 0 ? <Td colSpan={columns.length}><NoData/></Td>:
                <TBody>
                    {table.getRowModel().rows.map((row) => {  
                        return (
                            <Tr key={row.id} className=' capitalize cursor-pointer' onClick={() => navigate(`/app/crm/project-details?project_id=${row.original.project_id}&id=65c32e19e0f36d8e1f30955c&type=mom`)}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>}
            </Table>
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

