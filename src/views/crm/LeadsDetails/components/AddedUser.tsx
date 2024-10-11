import React, { useEffect, useMemo, useState } from 'react'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import Table from '@/components/ui/Table'
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

const AddedUser = () => {
    const [leadData, setLeadData] = useState<any>([])
    const [username, setUsername] = useState<any>()
    const [loading, setLoading] = useState<any>(false)
    console.log(leadData)

    const direction = useAppSelector((state) => state.theme.direction)


    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const leadId = queryParams.get('id')
    const folderName = queryParams.get('folder_name') // Assuming folder_name is in the query params
    const navigate = useNavigate()
    const { roleData } = useRoleContext()
    const fetchProjectData = async (
        projectId: string | null,
    ): Promise<any[]> => {
        try {
            const response = await apiGetCrmFileManagerProjects(projectId)
            // console.log(response)
            const data = response
            return data.data
        } catch (error) {
            console.error('Error fetching lead data', error)
            throw error
        }
    }

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

    const [dialogIsOpen3, setIsOpen3] = useState(false)

    const openDialog3 = (username: string) => {
        setIsOpen3(true)
        setUsername(username)
    }

    const onDialogClose3 = () => {
        setIsOpen3(false)
    }

    useEffect(() => {
        setLoading(true)

        const fetchDataAndLog = async () => {
            try {
                const leadData = await apiGetCrmUsersAssociatedToLead(leadId)
                setLeadData(leadData?.data)


                  setLoading(false)
            } catch (error) {
                console.error('Error fetching lead data', error)
            }
        }

        fetchDataAndLog()
    }, [])
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
          username: username

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
                    const deleteAccess = roleData?.data?.file?.delete?.includes(`${localStorage.getItem('role')}`)
                    return <div className='flex items-center gap-2'>
                        {deleteAccess &&
                            <MdDeleteOutline className='text-xl cursor-pointer hover:text-red-500' onClick={() => openDialog3(row.original.user_name)} />}
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
    
                        <DebouncedInput
                            value={globalFilter ?? ''}
                            className="p-2 font-lg shadow border border-block"
                            placeholder="Search..."
                            onChange={(value) => setGlobalFilter(String(value))}
                        />
                    </div>
                    <div className='h-[13rem] overflow-y-auto'>
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
                                            </Th>
                                        )
                                    })}
                                </Tr>
                            ))}
                        </THead>
                        { loading ? <TableRowSkeleton
                               rows={5}
                                avatarInColumns={[0]}
                                columns={3}
                                avatarProps={{ width: 14, height: 14 }}
                            /> :
                            (leadData.length === 0 ? <Td colSpan={columns.length}><NoData /></Td> :
                                <TBody >
                                    

                                    
                                    {table.getRowModel().rows.map((row) => {
                                        return (
                                            <Tr key={row.id}>
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


                                </TBody>)}
                    </Table>
                    </div>

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
                isOpen={dialogIsOpen3}
                type="danger"
                onClose={onDialogClose3}
                confirmButtonColor="red-600"
                onCancel={onDialogClose3}
                onConfirm={() => removeUser(username)}
                title="Remove Assignee"
                onRequestClose={onDialogClose3}
            >
                <p> Are you sure you want to remove this assignee? </p>
            </ConfirmDialog>


        </div>
    )
}

export default AddedUser
