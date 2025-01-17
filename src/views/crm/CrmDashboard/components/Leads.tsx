import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
// import Table from '@/components/ui/Table'
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { useLeadContext } from '../../LeadList/store/LeadContext'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton';




// const { Tr, Td, TBody, THead, Th } = Table

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
    name: string
    status: string
    location: string
    date: string
    phone: string
    lead_id: string
    email: string
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
      <TableContainer
        style={{ scrollbarWidth: 'none', boxShadow: 'none' }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow className='uppercase'>
              <TableCell
                sx={{fontWeight:"600"}}
              >
                Lead Name
              </TableCell>
              <TableCell
                sx={{fontWeight:"600"}}
              >
                Lead Status
              </TableCell>
              <TableCell
              sx={{fontWeight:"600"}}
              >
                Location
              </TableCell>
              <TableCell
              sx={{fontWeight:"600"}}
              >
                Phone
              </TableCell>
              <TableCell
                sx={{fontWeight:"600"}}
              >
                Email
              </TableCell>
              <TableCell
                sx={{fontWeight:"600"}}
              >
                Created Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiData === null ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <TableRowSkeleton />
                </TableCell>
              </TableRow>
            ) : apiData.length > 0 ? (
              apiData.slice(0, 5).map((item, index) => {
                return (
                  <TableRow
                    key={index}
                    hover
                    onClick={() =>
                      navigate(
                        `/app/crm/lead/?id=${item.lead_id}&tab=Details`
                      )
                    }
                  >
                    <TableCell sx={{ color: '#6B7280' }}>
                      <Typography className="capitalize">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`${statusColors[item.status]} px-2 py-1 rounded-sm text-xs font-semibold`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell
                      className="capitalize"
                      sx={{ color: '#6B7280' }}
                    >
                      {item.location}
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>
                      {item.phone}
                    </TableCell>
                    <TableCell
                      className="capitalize"
                      sx={{ color: '#6B7280' }}
                    >
                      {item.email}
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280' }}>
                      {dayjs(item.date).format('DD-MM-YYYY')}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography>No Leads Found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default Leads
