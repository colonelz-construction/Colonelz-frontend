
import { useState, useEffect, useRef, ChangeEvent } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DataTable from '@/components/shared/DataTable'
import debounce from 'lodash/debounce'
import axios from 'axios'
import type { ColumnDef, OnSortParam, CellContext } from '@/components/shared/DataTable'
import { apiDeleteRole, apiGetRoleDetails } from '@/services/CommonService'
import { BiPencil } from 'react-icons/bi'
import { MdDeleteOutline } from 'react-icons/md'
import formateDate from '@/store/dateformate'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '@/components/shared'
import { Notification, toast } from '@/components/ui'

interface Access {
    file?: string[];
    lead?: string[];
    project?: string[];
    task?: string[];
    mom?: string[];
    quotation?: string[];
    contract?: string[];
    archive?: string[];
    user?: string[];
    addMember?: string[];
    role?: string[];
  }
  
  interface Role {
    _id: string;
    role: string;
    access: Access;
    createdAt: string;
    __v: number;
  }

const Roles = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [id,setId]=useState<string>('')
    const [tableData, setTableData] = useState<{
        pageIndex: number
        pageSize: number
        sort: {
            order: '' | 'asc' | 'desc'
            key: string | number;
        };
        query: string
        total: number
    }>({
        total: 0,
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sort: {
            order: '',
            key: '',
        },
    })

    const [open, setOpen] = useState(false)

    

    const handleOpen = (id:string) => {
        setId(id)
        setOpen(true)
    }
    const handleClose = () => {
        console.log('Close')
        setOpen(false)
    }

    const handleConfirm = (id:string) => {
        console.log('Confirm')
        setOpen(false)
    }

    const inputRef = useRef(null)

    const debounceFn = debounce(handleDebounceFn, 500)

    function handleDebounceFn(val: string) {
        if (typeof val === 'string' && (val.length > 1 || val.length === 0)) {
            setTableData((prevData) => ({
                ...prevData,
                ...{ query: val, pageIndex: 1 },
            }))
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        debounceFn(e.target.value)
    }

    const deleteRole=async(id:string)=>{
        const response=await apiDeleteRole(id)
        if(response.code===200){
            toast.push(
                <Notification type='success' duration={2000} closable>
                    {response.message}
                </Notification>
            )
            window.location.reload()
            
        }
        else{
            toast.push(
                <Notification type='danger' duration={2000} closable>
                    {response.errorMessage}
                </Notification>
            )
        }
    }


    const columns: ColumnDef<Role>[] = [
        {
            header: 'Role',
            accessorKey: 'role',
        },
        {
            header: 'Created At',
            accessorKey: 'createdAt',
            cell: ({ row }) => {
                return <span>{formateDate(row.original.createdAt)}</span>
            }
        },
        {
            header: 'Access Level',
            accessorKey: 'access',
            cell: ({ row }) => {
                const access = row.original.access
                const accessLevels = Object.entries(access).map(([key, value]) => {
                    return `${key}: ${value.join(', ')}`
                }).join(' | ')
                return <span>{accessLevels}</span>
            }
        },
        {
            header: '',
            id: 'action',
            cell: (props) => {
                const { row } = props
                const role= row.original.role
                const id= row.original._id
                return(
                <span className='flex items-center text-lg gap-2'>
                    
                <span>
                    <Link to={`/app/crm/roles/edit?role=${role}&id=${id}`}>
                <BiPencil/>
                </Link>
                </span>
                <span onClick={()=>handleOpen(id)} className=' cursor-pointer'><MdDeleteOutline/></span>
                </span>)
            },
        },
    ]

    const handlePaginationChange = (pageIndex: number) => {
        setTableData((prevData) => ({ ...prevData, ...{ pageIndex } }))
    }

    const handleSelectChange = (pageSize: number) => {
        setTableData((prevData) => ({ ...prevData, ...{ pageSize } }))
    }


    const handleSort = ({ order, key }: OnSortParam) => {
        console.log({ order, key })
        setTableData((prevData) => ({
            ...prevData,
            ...{ sort: { order, key } },
        }))
    }

   

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const response = await apiGetRoleDetails()
            if (response) {
                setData(response.data)
                setLoading(false)
                console.log(response.data);
                
                setTableData((prevData) => ({
                    ...prevData,
                    ...{ total: response.data.total },
                }))
            }
        }
        fetchData()
    }, [
        tableData.pageIndex,
        tableData.sort,
        tableData.pageSize,
        tableData.query,
    ])

    return (
        <>
            <div className="flex justify-end mb-4">
                <Input
                    ref={inputRef}
                    placeholder="Search..."
                    size="sm"
                    className="lg:w-52"
                    onChange={handleChange}
                />
                <Link to={`/app/crm/roles/create`}>
                <Button size="sm" className="ml-2" variant='solid'>
                    Create Role
                </Button>
                </Link>
            </div>
            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagingData={tableData}
                onPaginationChange={handlePaginationChange}
                onSelectChange={handleSelectChange}
                onSort={handleSort}
            />
             <ConfirmDialog
                isOpen={open}
                type={'danger'}
                title={`Delete Role`}
                confirmButtonColor={'red-600'}
                onClose={handleClose}
                children={<p>Are you sure you want to delete this role?</p>}
                onRequestClose={handleClose}
                onCancel={handleClose}
                onConfirm={()=>deleteRole(id)}
            >
                
            </ConfirmDialog>
        </>
    )
}

export default Roles

