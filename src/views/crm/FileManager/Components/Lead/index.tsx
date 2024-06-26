import React, { useEffect, useState } from 'react'
import { FolderItem,fetchLeadData} from './data';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Dialog, Dropdown, Notification, Pagination, Select, Tooltip, toast } from '@/components/ui';
import type { MouseEvent } from 'react'
import YourFormComponent from './LeadForm';
import { FaFolder, FaRegFolder } from 'react-icons/fa';
import { useTheme } from '@emotion/react';
import { ConfirmDialog, StickyFooter } from '@/components/shared';
import { apiDeleteFileManagerFolders, apiGetCrmFileManagerLeads } from '@/services/CrmService';
import Indexe from './Folders';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiTrash } from 'react-icons/hi';
import { format, isValid, parse, parseISO } from 'date-fns';
import { CgDanger } from 'react-icons/cg';


import { useMemo} from 'react'
import Table from '@/components/ui/Table'
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
import { MdDeleteOutline } from 'react-icons/md';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div className="flex justify-end">
            <div className="flex items-center mb-4">
                <span className="mr-2">Search:</span>
                <Input
                    {...props}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
        </div>
    )
}

type Option = {
  value: number
  label: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    
    const itemRank = rankItem(row.getValue(columnId), value)

    addMeta({
        itemRank,
    })
    return itemRank.passed
}

const Index = () => {
    const [leadData, setLeadData] = useState<FolderItem[]>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const leadId = queryParams.get('lead_id');
    const leadName = queryParams.get('lead_name');
    const role=localStorage.getItem('role')
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchLeadData(leadId);
            setLeadData(data);
        };
        fetchData();
    }, [leadId]);

    console.log(leadData);
    

    const [dialogIsOpen2, setIsOpen2] = useState(false)
    const [folderName, setFolderName] = useState<string>('')

    const openDialog2 = (folder_name:string) => {
        setIsOpen2(true)
        setFolderName(folder_name)
    }

    const onDialogClose2 = () => {
        setIsOpen2(false)
    }

    const deleteFolders = async (folder_name:string) => {
      function warn(text:string) {
        toast.push(
            <Notification closable type="warning" duration={2000}>
                {text}
            </Notification>,{placement:'top-center'}
        )
    }
      if (folder_name.length === 0) {
        warn('No files selected for deletion.')
        return;
      }   
      const postData = {
        lead_id:leadId,
        folder_name: folder_name,
        type:"",
        project_id:""
      };
      try {
        await apiDeleteFileManagerFolders(postData);
        toast.push(
          <Notification closable type="success" duration={2000}>
            Folder deleted successfully
          </Notification>,{placement:'top-center'}
        )
        window.location.reload()
      } catch (error) {
        toast.push(
          <Notification closable type="danger" duration={2000}>
            Error deleting folder
          </Notification>,{placement:'top-center'}
        )
      }
      
    }
    
    const navigate=useNavigate()

    const [dialogIsOpen, setIsOpen] = useState(false)

    const openDialog = () => {
         setIsOpen(true)
     }
 
     const onDialogClose = (e: MouseEvent) => {
         console.log('onDialogClose', e)
         setIsOpen(false)
     }
     const theme=useTheme
     console.log(leadData);
function formatDate(dateString:string) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}


const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const [globalFilter, setGlobalFilter] = useState('')


const columns = useMemo<ColumnDef<FolderItem>[]>(
    () => [
        { header: 'Name', accessorKey: 'folder_name'
        , cell: ({row}) => {
            return(
                <div>
                <div className="flex items-center gap-2">
                  <FaFolder/>
                  <a className="font-medium cursor-pointer" onClick={()=> navigate(
                              `/app/crm/fileManager/leads/folder?lead_id=${leadId}&lead_name=${leadName}&folder_name=${row.original.folder_name}`,
                          )}>
                    {row.original.folder_name}
                  </a>
                </div>
              </div>
            )
          }},
         
        { header: 'Type', cell: ({row}) => {
            return(
                <div>Folder</div>
            )
        }},
        { header: 'Files', accessorKey: 'total_files' },
        { header: 'Modified', accessorKey: 'updated_date', cell: ({row}) => {
            const date=row.original.updated_date
            return(
                <div>{formatDate(date)}</div>
            )
        }
        },

        {
            header: 'Actions',
            id: 'actions',
            cell: ({row}) => {
                return(
                    <div className=' ml-3 cursor-pointer' onClick={()=>openDialog2(row.original.folder_name)}>
                          <Tooltip title="Delete">
                          <span className="cursor-pointer">
                  <MdDeleteOutline className=' text-xl text-center hover:text-red-500'/>
                  </span>
                  </Tooltip>
                  </div>
                )
            }
        },
    ],
    []
)

const totalData = leadData.length

const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
    { value: 40, label: '40 / page' },
    { value: 50, label: '50 / page' },
]

const onPaginationChange = (page: number) => {
  table.setPageIndex(page - 1)
}

const onSelectChange = (value = 0) => {
  table.setPageSize(Number(value))
}



const table = useReactTable({
    data:leadData,
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
      <div>
          <div className=" flex justify-between">
              <h3 className="">Lead-{leadName}</h3>
              <Button variant="solid" size="sm" onClick={() => openDialog()}>
                  Upload
              </Button>
          </div>
        

          <div className=" w-full">
      <div className="flex-1 p-4">
      

        {/* <div className="border rounded-lg shadow-sm dark:border-gray-700">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Files
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                    Modified
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0  ">
                    Actions
                  </th>
                </tr>
              </thead>
           
            
          <tbody className="[&amp;_tr:last-child]:border-0">
          {leadData.map((item) => 
          {
            // If the folder is 'contract' and the user is not an admin or senior architect, skip rendering this item
            if (item.folder_name === 'contract' && (role==="3D Visualizer" || role==="Jr. Interior Designer"|| role==="Project Architect"|| role==="Executive Assistant")) {
              return null;
            }
            
           return (
            <tr key={item.folder_name} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  >
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                  </svg>
                  <a className="font-medium cursor-pointer" onClick={()=> navigate(
                              `/app/crm/fileManager/leads/folder?lead_id=${leadId}&lead_name=${leadName}&folder_name=${item.folder_name}`,
                          )}>
                    {item.folder_name}
                  </a>
                </div>
              </td>
              <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">Folder</td>
              <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">{Number(item.total_files)>1?`${item.total_files} items`:`${item.total_files} item`}</td>
              <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
              {formatDate(item.updated_date)}
                </td>
              <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0 text-center">
               
                <div className=' flex justify-center cursor-pointer' onClick={()=>openDialog2(item.folder_name)}>
              <HiTrash className=' text-xl text-center hover:text-red-500'/>
              </div>
              </td>
            </tr>)
})}
          
          </tbody>

            </table>
          </div>
        </div> */}
      </div>
    </div>


    <>
    <div className=' flex justify-between'>
    <div className="flex items-center mb-4">
  <nav className="flex">
    <ol className="flex items-center space-x-2">
      <li>
      <Link to={`/app/crm/fileManager`} className="text-blue-600 dark:text-blue-400 hover:underline">FileManager</Link>
      </li>
      <li>
        <span className="mx-2">/</span>
      </li>
      <li className="text-gray-500">Leads</li>
    
    </ol>
  </nav>
</div>
            <DebouncedInput
                value={globalFilter ?? ''}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search all columns..."
                onChange={(value) => setGlobalFilter(String(value))}
            />
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
                                        {header.isPlaceholder  || header.id === 'actions' ? null : (
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
                <TBody>
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
                </TBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={totalData}
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
              <StickyFooter
                  className="-mx-8 px-8 flex items-center justify-between py-4 mt-7"
                  stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                  <div className="md:flex items-center">
                      <Button
                          size="sm"
                          className="ltr:mr-3 rtl:ml-3"
                          type="button"
                          onClick={() => {
                              navigate('/app/crm/fileManager')
                          }}
                      >
                          Back
                      </Button>
                  </div>
              </StickyFooter>
          <Dialog
              isOpen={dialogIsOpen}
              onClose={onDialogClose}
              onRequestClose={onDialogClose}
          >
              <YourFormComponent data={leadData} />
          </Dialog>
          <ConfirmDialog
          isOpen={dialogIsOpen2}
          type="danger"
          onClose={onDialogClose2}
          confirmButtonColor="red-600"
          onCancel={onDialogClose2}
          onConfirm={() => deleteFolders(folderName)}
          title="Delete Folder"
          onRequestClose={onDialogClose2}>
            <p> Are you sure you want to delete this folder? </p>            
        </ConfirmDialog>
          
      </div>
  )
}

export default Index