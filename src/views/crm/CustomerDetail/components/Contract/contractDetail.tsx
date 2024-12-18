
import { useRef, useEffect, useMemo, useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    FilterFn
} from '@tanstack/react-table'
import Table from '@/components/ui/Table'
import Checkbox from '@/components/ui/Checkbox'
import type { ChangeEvent, InputHTMLAttributes } from 'react'
import type { CheckboxProps } from '@/components/ui/Checkbox'
import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table'
import { Button, Dialog, FormItem, Input, Notification, Select, Upload, toast } from '@/components/ui'
import Pagination from '@/components/ui/Pagination'
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { apiGetCrmFileManagerShareContractFile, apiGetCrmProjectShareContractApproval, apiGetCrmProjectShareQuotation, apiGetCrmProjectShareQuotationApproval } from '@/services/CrmService'
import { use } from 'i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useRoleContext } from '@/views/crm/Roles/RolesContext'
import { rankItem } from '@tanstack/match-sorter-utils'

type FormData = {
    user_name: string;
    file_id: string;
    folder_name: string;
    project_id: string;
    client_name: string;
    client_email: string;
    type: string;
};



type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
    onChange: (event: CheckBoxChangeEvent) => void;
    indeterminate: boolean;
    onCheckBoxChange?: (event: CheckBoxChangeEvent) => void;
    onIndeterminateCheckBoxChange?: (event: CheckBoxChangeEvent) => void;
}

const { Tr, Th, Td, THead, TBody } = Table

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div className="flex justify-end">
            <div className="flex items-center mb-4">
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value)

    // Store the itemRank info
    addMeta({
        itemRank,
    })

    // Return if the item should be filtered in/out
    return itemRank.passed
}
export type FileItemProps = {
    data: FileItem[]
}
export type FileItem = {
    admin_status: string,
    client_status: string,
    file_name: string,
    files: Files[],
    itemId: string,
    remark: string,
    _id: string
}
type Files = {
    fileUrl: string,
    date: string;
    fileId: string;
    fileName: string;
    fileSize: string;
}



function IndeterminateCheckbox({
    indeterminate,
    onChange,
    ...rest
}: IndeterminateCheckboxProps) {
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (typeof indeterminate === 'boolean' && ref.current) {
            ref.current.indeterminate = !rest.checked && indeterminate
        }
    }, [ref, indeterminate])

    return <Checkbox ref={ref} onChange={(_, e) => onChange(e)} {...rest} />
}


const ContractDetails = (data: FileItemProps) => {
    const [rowSelection, setRowSelection] = useState({})
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [remark, setRemark] = useState("");
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const leadId = queryParams.get('id')
    const [approvalLoading, setApprovalLoading] = useState(false)
    const { roleData } = useRoleContext()
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const org_id = localStorage.getItem('orgId')





    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {

        setIsOpen(false)
    }

    const Approval = async (fileID: string, status: string) => {
        setApprovalLoading(true);
        const postData = {
            lead_id: leadId,
            file_id: fileID,
            status: status,
            remark: remark,
            org_id,
        };
        try {
            const response = await apiGetCrmProjectShareContractApproval(postData);
            setApprovalLoading(false);
            if (response.code === 200) {
                toast.push(
                    <Notification closable type='success' duration={2000}>
                        {response.message}
                    </Notification>
                )
                window.location.reload();
            }
        }
        catch (error) {
            setApprovalLoading(false);
            toast.push(
                <Notification closable type='danger' duration={2000}>
                    Internal Server Error
                </Notification>
            )
        }
    }

    const role = localStorage.getItem('role');
    const columns =
        useMemo<ColumnDef<FileItem>[]>
            (() => {
                return [
                    {
                        header: 'File Name',
                        accessorKey: 'file_name',
                        cell: ({ row }) => {
                            const fileName = row.original.file_name;
                            const [isHovered, setIsHovered] = useState(false);
                            const hoverTimeout = useRef<any>(null);

                            const handleMouseEnter = () => {
                                if (hoverTimeout.current) {
                                    clearTimeout(hoverTimeout.current);
                                }
                                setIsHovered(true);
                            };

                            const handleMouseLeave = () => {
                                hoverTimeout.current = setTimeout(() => {
                                    setIsHovered(false);
                                }, 200);
                            };
                            return (
                                <div
                                    className='relative inline-block'
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <a href={`${row.original.files[0].fileUrl}`} className=' cursor-pointer' target='_blank'>
                                        <div>{fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName}</div></a>
                                    {isHovered && (
                                        <div className='absolute bottom-0 left-full ml-2 bg-white border border-gray-300 p-2 shadow-lg z-9999 whitespace-nowrap transition-opacity duration-200'>
                                            <p>File Name: {fileName}</p>

                                        </div>
                                    )}
                                </div>
                            );

                        }
                    },

                    {
                        header: 'Admin Status',
                        accessorKey: 'admin_status',
                        cell: ({ row }) => {
                            const fileId = row.original.itemId;
                            const status = row.original.admin_status;
                            const [dialogIsOpen, setIsOpen] = useState(false)


                            const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                                setRemark(event.target.value);
                            };

                            const openDialog1 = (fileId: string) => {
                                setIsOpen(true)
                            }

                            const onDialogClose1 = () => {
                                setIsOpen(false)
                            }

                            return (
                                status === 'approved' ? (
                                    <div>Approved</div>
                                ) : status === 'rejected' ? (
                                    <div>Rejected</div>
                                ) : status === 'pending' ?
                                    (
                                        (role !== 'SUPERADMIN' && !roleData.data.contract?.update?.includes(`${role}`)) ? (
                                            <div>Pending</div>
                                        ) : (
                                            <div className='flex gap-1'>
                                                <Button variant='solid' size='sm' onClick={() => Approval(fileId, 'approved')}>{approvalLoading ? "Approving..." : 'Approve'}</Button>
                                                <Button variant='solid' color='red-600' size='sm' onClick={() => openDialog1(fileId)}>Reject</Button>
                                                <Dialog
                                                    isOpen={dialogIsOpen}
                                                    onClose={onDialogClose1}
                                                    onRequestClose={onDialogClose1}
                                                >
                                                    <h3 className='mb-4'> Reject Remarks</h3>
                                                    <Formik
                                                        initialValues={{ lead_id: leadId, file_id: fileId, status: 'rejected', remark: '', org_id }}
                                                        validationSchema={Yup.object({ remark: Yup.string().required('Required') })}
                                                        onSubmit={async (values, { setSubmitting }) => {
                                                            setSubmitting(true);
                                                            const response = await apiGetCrmProjectShareContractApproval(values);
                                                            setSubmitting(false);
                                                            if (response.code === 200) {
                                                                toast.push(
                                                                    <Notification closable type='success' duration={2000}>
                                                                        {response.message}
                                                                    </Notification>
                                                                )
                                                                window.location.reload();
                                                            }
                                                            else {
                                                                toast.push(
                                                                    <Notification closable type='danger' duration={2000}>
                                                                        {response.errorMessage}
                                                                    </Notification>
                                                                )
                                                            }

                                                            setSubmitting(false);
                                                        }}
                                                    >
                                                        {({ handleSubmit, isSubmitting }) => (
                                                            <Form>
                                                                <FormItem label="Remark">
                                                                    <Field name="remark"    >
                                                                        {({ field, form }: any) => (
                                                                            <Input
                                                                                textArea
                                                                                {...field}
                                                                                onChange={
                                                                                    (e: React.ChangeEvent<HTMLInputElement>) => {
                                                                                        handleInputChange(e);
                                                                                        form.setFieldValue(field.name, e.target.value);
                                                                                    }
                                                                                }
                                                                            />
                                                                        )}
                                                                    </Field>
                                                                </FormItem>
                                                                <div className='flex justify-end'>
                                                                    <Button type="submit" variant='solid' loading={isSubmitting}>{isSubmitting ? 'Submitting' : 'Submit'}</Button>
                                                                </div>
                                                            </Form>)}
                                                    </Formik>
                                                </Dialog>
                                            </div>
                                        )
                                    ) : (
                                        <div>Not Sent</div>
                                    )
                            )
                        }
                    }
                    ,
                    ...(role !== 'designer' ? [{
                        header: 'Remark',
                        accessorKey: 'remark',
                        cell: ({ row }: any) => {
                            const Remark = row.original.remark;
                            const admin_status = row.original.admin_status;
                            const [dialogIsOpen, setIsOpen] = useState(false)

                            const openDialog = () => {
                                setIsOpen(true)
                            }

                            const onDialogClose = () => {
                                setIsOpen(false)
                            }

                            return (<>
                                {admin_status === 'rejected' &&
                                    <div><Button size='sm' variant='solid' onClick={() => openDialog()}>Remark</Button></div>}
                                <Dialog
                                    isOpen={dialogIsOpen}
                                    onClose={onDialogClose}
                                    onRequestClose={onDialogClose}
                                >
                                    <h3 className='mb-4'>Remarks</h3>
                                    <p style={{ overflowWrap: "break-word" }}>{Remark}</p>
                                </Dialog>
                            </>

                            )
                        }
                    }] : [])
                ]
            },
                [])

    const table = useReactTable({
        data: data?.data || [],
        columns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        state: {
            rowSelection,
            columnFilters,
            globalFilter,
        },
        enableRowSelection: true,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })
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

    interface FormValues {
        client_name: string;
        email: string;
        file_id: string;
        type: string
        lead_id: string
        folder_name: string
        project_name: string
        site_location: string
        quotation: File[]
        user_id: string

    }
    type Option = {
        value: number
        label: string
    }

    interface SelectFieldProps {
        options: Option[];
        field: any;
        form: any;
    }
    const handleShareFileForApproval = async () => {
        if (selectedFileIds.length === 0) {
            toast.push(
                <Notification closable type="warning" duration={2000}>
                    Please select a file to share
                </Notification>, { placement: 'top-center' }
            )
            return;
        }


        const postData = {
            type: 'Internal',
            file_id: selectedFileIds[0],
            folder_name: 'Quotation',
            lead_id: leadId,
            org_id,
        };
        try {
            const response = await apiGetCrmProjectShareQuotation(postData);

            //   const responseJson=await response.json()
            if (response.ok) {
                toast.push(
                    <Notification closable type="success" duration={2000}>
                        File shared successfully
                    </Notification>, { placement: 'top-center' }
                )
            }
        }
        catch (error) {
            console.error('Error sharing files:', error);
        }
    }

    const SelectField: React.FC<any> = ({ options, field, form }) => (
        <Select
            options={options}
            name={field.name}
            value={options ? options.find((option: any) => option.value === field.value) : ''}
            onChange={(option) => form.setFieldValue(field.name, option ? option.value : '')}
        />
    );
    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        formData.append('client_name', values.client_name);
        formData.append('email', values.email);
        formData.append('file_id', values.file_id);
        formData.append('type', values.type);
        formData.append('lead_id', values.lead_id);
        formData.append('folder_name', values.folder_name);
        formData.append('project_name', values.project_name);
        formData.append('site_location', values.site_location);
        formData.append('user_id', localStorage.getItem('userId') as string);
        formData.append('org_id', localStorage.getItem('orgId') as string);

        setLoading(true);
        values.quotation.forEach((file: File) => {
            formData.append('quotation', file);
        })
        const response = await apiGetCrmFileManagerShareContractFile(formData);
        // const responseData=  await response.json();
        setLoading(false);
        if (response.code === 200) {
            toast.push(
                <Notification closable type='success' duration={2000}>
                    {response.message}
                </Notification>
            )
            window.location.reload();
        }
        else {
            toast.push(
                <Notification closable type='danger' duration={2000}>
                    {response.errorMessage}
                </Notification>
            )
        }


    };

    const navigate = useNavigate()
    const approvedFiles = data.data.filter(file => file.admin_status === 'approved').map(file => ({ value: file.itemId, label: file.file_name }));
    return (
        <div>
            <div className='flex items-center gap-2 justify-end'>
                <DebouncedInput
                    value={globalFilter ?? ''}
                    className="p-2 font-lg shadow border border-block"
                    placeholder="Search..."
                    onChange={(value) => setGlobalFilter(String(value))}
                />
                <div className=' flex mb-4 gap-3'>
                    <Button variant='solid' size='sm' onClick={() => openDialog()} >Share to Client</Button>
                </div>
            </div>
            {table.getRowModel().rows.length > 0 ? (
                <div>
                    <Table>
                        <THead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Th key={header.id} colSpan={header.colSpan}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </Th>
                                    ))}
                                </Tr>
                            ))}
                        </THead>
                        <TBody>
                            {table.getRowModel().rows.map((row) => (
                                <Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Td>
                                    ))}
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
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
            ) : (
                <div style={{ textAlign: 'center' }}>No Contracts for approval</div>
            )}


            <Dialog
                isOpen={dialogIsOpen}
                onClose={() => {
                    setLoading(false);
                    onDialogClose();
                }}
                onRequestClose={() => {
                    setLoading(false);
                    onDialogClose();
                }}
                className={`pb-3`}>
                <h3 className='mb-4'>Share To Client</h3>
                <Formik
                    initialValues={{
                        client_name: '',
                        email: '',
                        file_id: '',
                        type: 'Client',
                        lead_id: leadId,
                        folder_name: 'contract',
                        project_name: '',
                        site_location: '',
                        user_id: localStorage.getItem('userId'),
                        quotation: []
                    }}
                    validationSchema={Yup.object({
                        client_name: Yup.string().required('Client name is required'),
                        email: Yup.string().email('Invalid email address').required('Client email is equired'),
                        file_id: Yup.string().required('Select atleast one file to upload.'),
                        project_name: Yup.string().required('Project name is required'),
                        site_location: Yup.string().required('Site location is Required.'),
                        quotation: Yup.array().min(1, 'At least one quotation is required')
                    })}
                    onSubmit={(values, { setSubmitting }) => {
                        ;
                        handleSubmit(values);
                        setSubmitting(false);
                    }}
                >
                    {({ errors, touched }) => {
                        return (
                            <div className='max-h-96 overflow-y-auto '>
                                <Form className='mr-3'>
                                    <FormItem label='Client Name' asterisk
                                        invalid={errors.client_name && touched.client_name}
                                        errorMessage={errors.client_name}
                                    >
                                        <Field name="client_name" type="text" component={Input} />
                                    </FormItem>
                                    <FormItem label='Client Email' asterisk

                                        invalid={errors.email && touched.email}
                                        errorMessage={errors.email}
                                    >
                                        <Field name="email" type="text" component={Input} />
                                    </FormItem>
                                    <FormItem label='File' asterisk

                                        invalid={errors.file_id && touched.file_id}
                                        errorMessage={errors.file_id}
                                    >
                                        <Field name="file_id" >
                                            {({ field, form }: any) => (
                                                <SelectField
                                                    options={approvedFiles}
                                                    field={field}
                                                    form={form}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem label='Project Name' asterisk

                                        invalid={errors.project_name && touched.project_name}
                                        errorMessage={errors.project_name}
                                    >
                                        <Field name="project_name" type="text" component={Input} />
                                    </FormItem>
                                    <FormItem label='Site Location' asterisk

                                        invalid={errors.site_location && touched.site_location}
                                        errorMessage={errors.site_location}
                                    >
                                        <Field name="site_location" type="text" component={Input} />
                                    </FormItem>
                                    <FormItem label='Quotation' asterisk
                                    >
                                        <Field name="quotation" type="text">
                                            {({ field, form }: any) => (

                                                <Upload
                                                    accept='.pdf'
                                                    draggable
                                                    onChange={(files) => {
                                                        form.setFieldValue('quotation', files);
                                                    }}
                                                />

                                            )}
                                        </Field>
                                    </FormItem>
                                    <Button type='submit' block variant='solid' loading={loading}> {loading ? 'Submitting' : 'Submit'} </Button>
                                </Form>
                            </div>)
                    }}
                </Formik>

            </Dialog>



        </div>
    )
}

export default ContractDetails

