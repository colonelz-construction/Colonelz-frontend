import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { Lead, useLeadContext } from '../../LeadList/store/LeadContext'
import { Skeleton, Spinner } from '@/components/ui'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'




const { Tr, Td, TBody, THead, Th } = Table

const NameColumn = ({ row }: { row: any }) => {
    
    
    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold">{row.projectName}</span>
        </div>
    )
}




const Leads = ({ data = [], className }: any) => {
    const navigate = useNavigate()

    const onNavigate = () => {
        navigate('/app/leads')
    }
    interface Data {
       name:string
       status:string
       location:string
       date:string
       phone:string
       lead_id:string
       email:string
      }
     

    const apiData = useLeadContext()
    
    


    const statusColors: { [key: string]: string } = {
        'Follow Up': 'bg-green-200 text-green-700',
        'Interested': 'bg-blue-200 text-blue-700',
        'No Response': 'bg-red-200 text-red-700',
        'Not Contacted': 'bg-red-200 text-red-700',
        'Inactive': 'bg-yellow-200 text-yellow-700',
    };



    return (
        <Card className={className}>
            <div className="flex items-center justify-between mb-4">
                <h3>Leads</h3>
                <Button size="sm" onClick={onNavigate} variant='solid'>
                    View All Leads
                </Button>
            </div>
            <Table>
        <THead>
          <Tr>
            <Th>Lead Name</Th>
            <Th>Lead Status</Th>
            <Th>Location</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Created Date</Th>
          </Tr>
        </THead>
        <TBody>
        {apiData === null ? (
       <TableRowSkeleton
       avatarInColumns={[0]}
       columns={6}
       rows={5}
       avatarProps={{ width: 14, height: 14 }}
   />
      ) : (
        apiData?.slice(0, 5).map((item, index) => (
          <Tr key={index} onClick={()=>navigate(`/app/crm/lead/?id=${item.lead_id}&tab=Details`)} className=' cursor-pointer'>
            <Td className=' capitalize'>{item.name}</Td>
            <Td className={`capitalize`}>
              <span className={`${statusColors[item.status]} px-2 py-1 rounded-sm text-xs font-semibold`}>{item.status}</span>
            </Td>
            <Td className="capitalize">{item.location}</Td>
            <Td>{item.phone}</Td>
            <Td>{item.email}</Td>
            <Td>{dayjs(item.date).format('DD-MM-YYYY')}</Td>
          </Tr>
        ))
      )}
        </TBody>
      </Table>
        </Card>
    )
}

export default Leads
