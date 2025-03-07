import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileItem, FolderItem } from '../../../data';
import { Button, Dialog, FormItem, Input, Notification, Pagination, Select, Upload, toast } from '@/components/ui';
import { AuthorityCheck, ConfirmDialog, RichTextEditor, StickyFooter } from '@/components/shared';
import CreatableSelect from 'react-select/creatable';
import { CiFileOn, CiImageOn } from 'react-icons/ci';
import { apiDeleteFileManagerFiles, apiGetAllUsersList, apiGetCrmFileManagerCreateLeadFolder, apiGetCrmFileManagerDrawingData, apiGetCrmFileManagerDrawingUpload, apiGetCrmFileManagerLeads, apiGetCrmFileManagerShareContractFile, apiGetCrmFileManagerShareFiles } from '@/services/CrmService';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { HiShare } from 'react-icons/hi';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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
import NoData from '@/views/pages/NoData';
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton';
import { MdDeleteOutline } from 'react-icons/md';
import { useRoleContext } from '@/views/crm/Roles/RolesContext';
import formateDate from '@/store/dateformate';
import Sorter from '@/components/ui/Table/Sorter';
import AddFile from './AddFile';
import { FaFolder } from 'react-icons/fa';


export type FileManagerLeadType = {
  code: number;
  data: FolderItem[];
}

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size' | 'prefix'> {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
}

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

export type UserListResponse = {
  code: number;
  data: User[]
}

interface User {
  username: string;
  role: string
}

type Option = {
  value: number
  label: string
}
const Index = () => {
  const [leadData, setLeadData] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedEmailsCc, setSelectedEmailsCc] = useState<string[]>([]);
  const [selectedEmailsBCc, setSelectedEmailsBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id') || '';
  const projectId = queryParams.get('project_id') || '';
  const leadName = queryParams.get('lead_name');
  const folderName = queryParams.get('folder_name');
  const sub_folder_name_first = queryParams.get('sub_folder_name_first');
  const sub_folder_name_second = queryParams.get('sub_folder_name_second');
  const role = localStorage.getItem('role')
  const org_id: any = localStorage.getItem('orgId')

  // console.log(leadData)


  const { roleData } = useRoleContext();
  const fileUploadAccess = role === 'SUPERADMIN' ? true : roleData?.data?.file?.create?.includes(`${role}`)
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const fetchDataAndLog = async () => {
      try {
        const usersData = await apiGetAllUsersList();
        setUsers(usersData?.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchDataAndLog();
  }, []);
  const adminUsers = users.filter(user => user.role === 'ADMIN');

  const navigate = useNavigate()


  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBody(e.target.value);
  };

  const [dialogIsOpen, setIsOpen] = useState(false)
  const [dialogIsOpen2, setIsOpen2] = useState(false)
  const [dialogIsOpen3, setIsOpen3] = useState(false)
  const [dialogIsOpen4, setIsOpen4] = useState(false)
  const [dialogIsOpen5, setIsOpen5] = useState(false)
  const [fileId, setFileId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [formloading, setFormLoading] = useState(false)
  const [shareloading, setShareLoading] = useState(false)
  const [drawingFolders, setDrawingFolders] = useState<any>([])


  const openDialog = (fileId: string) => {
    setIsOpen(true)
    setSelectedFiles([fileId])
    // console.log(fileId);
  }
  const onDialogClose = () => {
    setIsOpen(false)
  }


  const [dialogIsOpen1, setIsOpen1] = useState(false)

  const openDialog1 = () => {
    setIsOpen1(true)
  }

  const onDialogClose1 = () => {

    setIsOpen1(false)
  }

  const openDialog5 = () => {
    setIsOpen5(true)
  }

  const onDialogClose5 = () => {

    setIsOpen5(false)
  }

  const onDialogClose2 = () => {
    setIsOpen2(false)
  }
  const openDialog2 = () => {
    setIsOpen2(true)
  }

  const openDialog3 = (file_id: string) => {
    setIsOpen3(true)
    setFileId(file_id)
  }

  const onDialogClose3 = () => {
    setIsOpen3(false)
  }

  const openDialog4 = () => {
    setIsOpen4(true)
  }

  const onDialogClose4 = () => {
    setIsOpen4(false)
  }



  useEffect(() => {
    const fetchDataAndLog = async () => {
      try {
        // const leadData = await apiGetCrmFileManagerLeads(leadId);
        const res2 = await apiGetCrmFileManagerDrawingData(leadId, '', 'Drawing')
        console.log(res2.data.DrawingData)

        const data = res2.data.DrawingData
        console.log(data)

        const res = data?.flatMap((obj:any) => obj.files || [])
            .find((item:any) => 
            item.folder_name === folderName &&
            item.sub_folder_name_first === sub_folder_name_first &&
            item.sub_folder_name_second === sub_folder_name_second
            ) || null; // Return null if no match is found
        
          
        console.log(res)

        
        // setLeadData(result)




        setLoading(false)
        // const folderData = leadData?.data
        // console.log(folderData);

        // const selectedFolder = folderData.find((folder: any) => folder.folder_name === folderName);

        if(folderName === "Drawing") {
          setLeadData(res.files)
        }


      } catch (error) {
        console.error('Error fetching lead data', error);
      }
    };

    fetchDataAndLog();
  }, [leadId, folderName]);

  // console.log(leadData);

  const deleteFiles = async (fileId: string) => {
    selectedFiles.push(fileId)
    function warn(text: string) {
      toast.push(
        <Notification closable type="warning" duration={2000}>
          {text}
        </Notification>, { placement: 'top-center' }
      )
    }
    if (fileId.length === 0) {
      warn('No files selected for deletion.')
      return;
    }

    const postData = {
      file_id: selectedFiles,
      folder_name: folderName,
      lead_id: leadId,
      org_id,
    };
    try {
      await apiDeleteFileManagerFiles(postData);
      toast.push(
        <Notification closable type="success" duration={2000}>
          Files deleted successfully
        </Notification>, { placement: 'top-end' }
      )
      window.location.reload()
    } catch (error) {
      toast.push(
        <Notification closable type="danger" duration={2000}>
          Error deleting files
        </Notification>, { placement: 'top-end' }
      )
    }
  }
  const ShareFiles = async () => {
    setShareLoading(true)

    const postData = {
      file_id: selectedFiles,
      lead_id: leadId,
      project_id: '',
      email: selectedEmails,
      cc: selectedEmailsCc,
      bcc: selectedEmailsBCc,
      subject: subject,
      body: body,
      user_id: localStorage.getItem('userId'),
      org_id,
    };

    const response = await apiGetCrmFileManagerShareFiles(postData);
    if (response.code === 200) {
      toast.push(
        <Notification closable type="success" duration={2000}>
          Files shared successfully
        </Notification>, { placement: 'top-end' }
      )
    }
    else {
      toast.push(
        <Notification closable type="danger" duration={2000}>
          {response.errorMessage}
        </Notification>, { placement: 'top-end' }
      )
    }
    setShareLoading(false)
    onDialogClose()
    const responseData = await response.json();
    // console.log('Files shared successfully:', responseData);
    setSelectedFiles([]);
    setSelectedEmails([]);
    setSelectedEmailsCc([]);
    setSelectedEmailsBcc([]);
    setSubject('')
    setBody('')

    const updatedLeadData = leadData.map((file) => ({ ...file, active: false }));
    setLeadData(updatedLeadData);

  }
  const handleShareFiles = async () => {
    if (selectedFiles.length === 0 || selectedEmails.length === 0) {
      warn('No Email Addresses are Selected for sharing.')
      setShareLoading(false);
      return
    }
    else if (subject === "") {
      setIsOpen4(true)
      return
    }
    ShareFiles()




    function warn(text: string) {
      toast.push(
        <Notification closable type="warning" duration={2000}>
          {text}
        </Notification>,
        { placement: 'top-center' },
      )
    }





  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'ico'];
    if (imageExtensions.includes(extension as string)) {
      return <CiImageOn className='text-xl' />;
    }
    switch (extension) {
      case 'docx':
        return <CiFileOn className='text-xl' />;
      case 'png':
        return <CiImageOn className='text-xl' />;
      case 'pptx':
        return <CiFileOn className='text-xl' />;
      default:
        return <CiFileOn className='text-xl' />;
    }
  };
  const getFileType = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'ico'];
    const documentExtensions = ['docx', 'doc', 'txt', 'pdf'];
    const presentationExtensions = ['pptx', 'ppt'];
    const spreadsheetExtensions = ['xlsx', 'xls', 'csv'];
    const audioExtensions = ['mp3', 'wav', 'ogg'];
    const videoExtensions = ['mp4', 'avi', 'mov'];

    if (imageExtensions.includes(extension)) {
      return 'Image';
    } else if (documentExtensions.includes(extension)) {
      return 'Document';
    } else if (presentationExtensions.includes(extension)) {
      return 'Presentation';
    } else if (spreadsheetExtensions.includes(extension)) {
      return 'Spreadsheet';
    } else if (audioExtensions.includes(extension)) {
      return 'Audio';
    } else if (videoExtensions.includes(extension)) {
      return 'Video';
    } else {
      return 'File';
    }
  };




  function formatFileSize(fileSizeInKB: string | undefined): string {
    if (!fileSizeInKB) {
      return '-';
    }

    const size = Number(fileSizeInKB.split(' ')[0]);
    if (size < 1024) {
      return `${size.toFixed(2)} KB`;
    } else {
      return `${(size / 1024).toFixed(2)} MB`;
    }
  }

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const totalData = leadData.length

  const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 20, label: '20 / page' },
    { value: 30, label: '30 / page' },
    { value: 40, label: '40 / page' },
    { value: 50, label: '50 / page' },
  ]

  const columns = useMemo<ColumnDef<FileItem>[]>(
    () => [
      {
        header: 'Name', accessorKey: 'fileName',
        cell: ({ row }) => {
          const file = row.original
          const fileName = file.fileName
          const fileurl = file.fileUrl
          return <Link to={fileurl} target='_blank'><div className='flex items-center gap-2'>{getFileIcon(row.original.fileName)}{fileName}</div></Link>
        }
      },

      {
        header: 'Type', cell: ({ row }) => {
          return <div>{getFileType(row.original.fileName)}</div>
        }
      },


      {
        header: 'Size', accessorKey: 'fileSize',
        cell: ({ row }) => {
          return <div>{formatFileSize(row.original.fileSize)}</div>
        }
      },


      {
        header: 'Created', accessorKey: 'date', cell: ({ row }) => {
          return <div>{formateDate(row.original.date)}</div>
        }
      },
      {
        header: 'Actions', accessorKey: 'actions',
        cell: ({ row }) => {
          return <div className='flex items-center gap-2'>
            <AuthorityCheck
              userAuthority={[`${role}`]}
              authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.file?.delete ?? []}
            >
              <MdDeleteOutline className='text-xl cursor-pointer hover:text-red-500' onClick={() => openDialog3(row.original.fileId)} />
            </AuthorityCheck>
            <HiShare className='text-xl cursor-pointer' onClick={() => openDialog(row.original.fileId)} />
          </div>
        }
      },
    ],
    []
  )

  const columns2 = useMemo<ColumnDef<any>[]>(
    () => [
        {
            header: 'Name', accessorKey: 'sub_folder_name_first'
            , cell: ({ row }) => {
                return (
                    <div>
                        <div className="flex items-center gap-2">
                            <FaFolder />
                            <a className="font-medium cursor-pointer" onClick={() => navigate(
                                `/app/crm/fileManager/leads/folder?lead_id=${leadId}&lead_name=${leadName}&folder_name=${row.original.folder_name}`,
                            )}>
                                {row.original.sub_folder_name_second}
                            </a>
                        </div>
                    </div>
                )
            }
        },

        {
            header: 'Type', cell: ({ row }) => {
                return (
                    <div>Folder</div>
                )
            }
        },
        { header: 'Files', accessorKey: 'total_files',
            cell: ({ row }) => {
                // const folder_name = row.original.folder_name
                return (
                    <div>{"row.original.total_files"}</div>
                )
            }

        },
        {
            header: 'Modified', accessorKey: 'updated_date', cell: ({ row }) => {
                // const date = row.original.updated_date
                return (
                    <div>{"formateDate(date)"}</div>
                )
            }
        },

        // {
        //     header: 'Actions',
        //     id: 'actions',
        //     cell: ({ row }) => {
        //         const { roleData } = useRoleContext();
        //         return (
        //             <AuthorityCheck
        //                 userAuthority={[`${localStorage.getItem('role')}`]}
        //                 authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.file?.delete ?? []}
        //             >
        //                 <div className=' ml-3 cursor-pointer' onClick={() => openDialog2(row.original.folder_name)}>
        //                     <Tooltip title="Delete">
        //                         <span className="cursor-pointer">
        //                             <MdDeleteOutline className=' text-xl text-center hover:text-red-500' />
        //                         </span>
        //                     </Tooltip>
        //                 </div>
        //             </AuthorityCheck>
        //         )
        //     }
        // },
    ],
    []
)
   
  // const role = localStorage.getItem('role')

  // console.log(folderName, drawingFolders)
  console.log("leadData", leadData)

  const table = useReactTable({
    data:leadData,
    columns: columns,
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
    <div>
      <div className='flex justify-between'>
        <h3 className='mb-5'>Lead-{leadName}</h3>

          {fileUploadAccess &&
            <Button className='' size='sm' variant='solid' onClick={() => openDialog2()}>
              Upload Files
            </Button>}
      </div>

      <div className="w-full">
        <div className="flex-1">
          <>
            <div className='flex justify-between'>
              <div className="flex items-center mb-4">
                <nav className="flex">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <Link to={`/app/crm/fileManager`} className="text-blue-600 dark:text-blue-400 hover:underline">FileManager</Link>
                    </li>
                    <li>
                      <span className="mx-2">/</span>
                    </li>
                    <li>
                      <Link to={`/app/crm/fileManager/leads?lead_id=${leadId}&lead_name=${leadName}`} className="text-blue-600 dark:text-blue-400 hover:underline">Leads</Link>
                    </li>
                    <li>
                      <span className="mx-2">/</span>
                    </li>
                    <li>
                      <Link to={`/app/crm/fileManager/leads?lead_id=${leadId}&lead_name=${leadName}`} className="text-blue-600 dark:text-blue-400 hover:underline">{leadName}</Link>
                    </li>
                    <li>
                      <span className="mx-2">/</span>
                    </li>

                    <li className="text-gray-500">{folderName}</li>
                  </ol>
                </nav>
              </div>



              <DebouncedInput
                value={globalFilter ?? ''}
                className="p-2 font-lg shadow border border-block"
                placeholder="Search..."
                onChange={(value) => setGlobalFilter(String(value))}
              />
            </div>
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
                  avatarInColumns={[0]}
                  columns={columns.length}
                  avatarProps={{ width: 14, height: 14 }}
                /> : leadData.length === 0 ? <TableCell colSpan={columns.length}><NoData /></TableCell> :
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
        </div>
      </div>

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
              navigate(`/app/crm/fileManager/leads?lead_id=${leadId}&lead_name=${leadName}`)
            }}
          >
            Back
          </Button>
          {/* {
            folderName?.toLocaleLowerCase() === 'contract' && (
              <Button variant='solid' size='sm' onClick={() => openDialog1()}>
                Share For Approval
              </Button>
            )
          } */}

        </div>
      </StickyFooter>


      {/* Share for Approval */}
      <Dialog
        isOpen={dialogIsOpen1}
        style={{}}
        className='max-h-[300px]'
        onClose={onDialogClose1}
        onRequestClose={onDialogClose1}
      >
        <Formik
          initialValues={{
            lead_id: leadId,
            folder_name: folderName,
            file_id: "",
            // user_name: '',
            type: "Internal",
          }}
          validationSchema={Yup.object({
            lead_id: Yup.string().required('Required'),
            folder_name: Yup.string().required('Required'),
            file_id: Yup.string().required('Required'),
            // user_name: Yup.string().required('Required'),
            type: Yup.string().required('Required'),
          })}
          onSubmit={async (values: any, { setSubmitting }) => {

            const formData = new FormData()
            formData.append('lead_id', values.lead_id)
            formData.append('folder_name', values.folder_name)
            formData.append('file_id', values.file_id)
            // formData.append('user_name',values.user_name)
            formData.append('type', values.type)
            formData.append('org_id', org_id)

            const response = await apiGetCrmFileManagerShareContractFile(formData)
            // console.log(response);

            if (response.code === 200) {
              toast.push(
                <Notification closable type="success" duration={2000}>
                  Shared for approval successfully
                </Notification>, { placement: 'top-end' }
              )
            }
            else {
              toast.push(
                <Notification closable type="danger" duration={2000}>
                  {response.errorMessage}
                </Notification>, { placement: 'top-end' }
              )
            }
            onDialogClose1();
          }}
        >
          {({ handleChange, handleBlur, values, isSubmitting }) => (
            <Form>
              <h3 className='mb-5'>Share For Approval</h3>
              {/* <FormItem label='Username' className=''>
      <Select
  options={adminUsers.map(user => ({ value: user.username, label: user.username })) as any}
  onChange={(option: any) => handleChange('user_name')(option ? option.value : '')}
  value={adminUsers.find(user => user.username === values.user_name) ? { value: values.user_name, label: values.user_name } : null}
/>
</FormItem> */}
              <FormItem label='File' className='mt-4'>
                <Select
                  options={leadData.map(file => ({ value: file.fileId, label: file.fileName }))}
                  onChange={(option: any) => handleChange('file_id')(option ? option.value : '')}
                  value={leadData.find(file => file.fileId === values.file_id) ? { value: values.file_id, label: leadData.find(file => file.fileId === values.file_id)?.fileName } : null}
                />
              </FormItem>

              <Button type="submit" variant='solid' loading={isSubmitting} block>{isSubmitting ? 'Sharing' : 'Share'}</Button>
            </Form>
          )}
        </Formik>
      </Dialog>



      <Dialog
                isOpen={dialogIsOpen5}
                onClose={onDialogClose5}
                onRequestClose={onDialogClose5}
            >
                <AddFile />
            </Dialog>



      <Dialog
        isOpen={dialogIsOpen}
        style={{}}
        className='max-h-[300px]'
        onClose={onDialogClose}
        onRequestClose={onDialogClose}
      >
        <h3 className='mb-5'>Share Files</h3>

        <Formik initialValues={{ lead_id: leadId, folder_name: folderName, file_id: '', email: '', cc: '', bcc: '', subject: '', body: '' }}
          onSubmit={(values, { setSubmitting }) => {
            // console.log(values);
          }
          }>

          {({ isSubmitting }) => (
            <div className='max-h-96 overflow-y-auto'>
              <FormItem label='To ' asterisk>
                <Field>
                  {({ field, form }: any) => (
                    <Select
                      className='mt-1'
                      isMulti
                      value={selectedEmails.map((email) => ({ label: email, value: email }))}
                      componentAs={CreatableSelect}
                      placeholder="Add email addresses..."
                      onChange={(newValues) => {
                        const emails = newValues ? newValues.map((option) => option.value) : [];
                        setSelectedEmails(emails);
                      }}
                      onCreateOption={(inputValue) => {
                        const newEmails = [...selectedEmails, inputValue];
                        setSelectedEmails(newEmails);
                      }}
                    />)}
                </Field></FormItem>

              <FormItem label='Cc'>
                <Field>
                  {({ field, form }: any) => (
                    <Select
                      className='mt-1'
                      isMulti
                      value={selectedEmailsCc.map((email) => ({ label: email, value: email }))}
                      componentAs={CreatableSelect}
                      placeholder="Add email addresses..."
                      onChange={(newValues) => {
                        const emails = newValues ? newValues.map((option) => option.value) : [];
                        setSelectedEmailsCc(emails);
                      }}
                      onCreateOption={(inputValue) => {
                        const newEmails = [...selectedEmailsCc, inputValue];
                        setSelectedEmailsCc(newEmails);
                      }}
                    />)}
                </Field></FormItem>

              <FormItem label='Bcc'>
                <Field>
                  {({ field, form }: any) => (
                    <Select
                      className='mt-1'
                      isMulti
                      value={selectedEmailsBCc.map((email) => ({ label: email, value: email }))}
                      componentAs={CreatableSelect}
                      placeholder="Add email addresses..."
                      onChange={(newValues) => {
                        const emails = newValues ? newValues.map((option) => option.value) : [];
                        setSelectedEmailsBcc(emails);
                      }}
                      onCreateOption={(inputValue) => {
                        const newEmails = [...selectedEmailsBCc, inputValue];
                        setSelectedEmailsBcc(newEmails);
                      }}
                    />
                  )}
                </Field></FormItem>


              <div className=''>
                <FormItem label='Subject'>
                  <Field>
                    {({ field, form }: any) => (
                      <Input
                        required
                        type='text'
                        className='mt-1 p-2 w-full border rounded-md'
                        value={subject}
                        placeholder='Enter subject...'
                        onChange={handleSubjectChange}
                      />
                    )}
                  </Field></FormItem>
              </div>
              <div className=''>
                <FormItem label='Body'>
                  <Field>
                    {({ field, form }: any) => (
                      <RichTextEditor value={body} onChange={setBody} />
                    )}
                  </Field></FormItem>
              </div>

              <div className='flex justify-end'>
                <Button size="sm" variant="solid" type="submit" className='mt-5 ' onClick={handleShareFiles} loading={shareloading} block >
                  {shareloading ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            </div>
          )}
        </Formik>
      </Dialog>



      {/* file upload */}

      <Dialog isOpen={dialogIsOpen2}
        className=' '
        onClose={onDialogClose2}
        onRequestClose={onDialogClose2}>
        <h3>Upload Files</h3>
        <Formik
          initialValues={{
            lead_id: leadId,
            folder_name: folderName,
            files: []
          }}
          onSubmit={async (values) => {
            setFormLoading(true)
            if (values.files.length === 0) {
              toast.push(
                <Notification closable type="warning" duration={2000}>
                  No files selected for upload
                </Notification>, { placement: 'top-center' }
              )
            }
            else {
              // console.log(values);
              let formData = new FormData();
              formData.append('folder_name', 'Drawing');
              formData.append('sub_folder_name_first', sub_folder_name_first || '');
              formData.append('sub_folder_name_second', sub_folder_name_second || '');
              formData.append('type', 'Drawing');
              formData.append('org_id', org_id);
              formData.append('lead_id', leadId);
              formData.append('project_id', projectId);

              for (let i = 0; i < values.files.length; i++) {
                formData.append('files', values.files[i]);
              }

              const response = await apiGetCrmFileManagerDrawingUpload(formData)
              // const responseData=await response.json()
              setFormLoading(false)
              setLoading(false)
              // console.log(response);

              if (response.code === 200) {
                toast.push(
                  <Notification closable type="success" duration={2000}>
                    Files uploaded successfully
                  </Notification>, { placement: 'top-end' }
                )
                window.location.reload()
              }
              else {
                toast.push(
                  <Notification closable type="danger" duration={2000}>
                    {response.errorMessage}
                  </Notification>, { placement: 'top-end' }
                )
              }
            }
          }}
        >
          <Form className=' overflow-y-auto max-h-[400px] mt-4' style={{ scrollbarWidth: 'none' }}>
            <FormItem label='Files'>
              <Field name='files'>
                {({ field, form }: any) => (
                  <Upload
                    onChange={(files: File[], fileList: File[]) => {
                      form.setFieldValue('files', files);
                    }}
                    draggable
                    multiple
                  />
                )}
              </Field>
            </FormItem>
            <Button variant='solid' type='submit' block loading={formloading}>{formloading ? 'Submitting' : 'Submit'}</Button>
          </Form>
        </Formik>
      </Dialog>

      <ConfirmDialog
        isOpen={dialogIsOpen3}
        type="danger"
        onClose={onDialogClose3}
        confirmButtonColor="red-600"
        onCancel={onDialogClose3}
        onConfirm={() => deleteFiles(fileId)}
        title="Delete File"
        onRequestClose={onDialogClose3}>
        <p> Are you sure you want to delete this file? </p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={dialogIsOpen4}
        type='warning'
        onClose={onDialogClose4}
        confirmButtonColor='yellow-600'
        onCancel={onDialogClose4}
        onRequestClose={onDialogClose4}
        title="Missing Subject"
        closable
        onConfirm={() => {
          ShareFiles();
          onDialogClose4();
        }}
      >
        <p>
          Are you sure you want to share the files without a subject?
        </p>


      </ConfirmDialog>
    </div>
  );
};

export default Index;
