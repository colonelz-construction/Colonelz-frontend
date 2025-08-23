import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ContractDetails, { FileItem } from './Contract/contractDetail'
import { apiGetCrmContractDetails, apiGetCrmUsersInContractFileApproval, apiGetUsers } from '@/services/CrmService'

export type ContractResponseType = {
  code: number;
  data: FileItem[]
}

const Contract = ({leadData}:any) => {
  const temp : ContractResponseType = {
    code: 200,
    data: []
  }
  const navigate=useNavigate()
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const lead_id = queryParams.get('id')
  const [details, setDetails] = useState<ContractResponseType>(temp);
  const [users, setUsers] = useState<any>([])
  const [usersData, setUsersData] = useState<any>([])
  const [loading, setLoading] = useState<any>(true);
  const [fileIdsForApproval, setFileIdsForApproval] = useState<any>([])

 useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiGetCrmContractDetails(lead_id);
        const data = await apiGetUsers();
        const res = await apiGetCrmUsersInContractFileApproval(lead_id);
        setFileIdsForApproval(res.data)

        const usersWithUpdateContract = usersData.filter((user:any) => 

          (!user.access || (user.access.contract && user.access.contract.includes("update")))
          
        );
    
        const filteredList = usersWithUpdateContract.filter((item:any) => 
          leadData.some((firstItem:any) => firstItem.user_id === item.UserId)
        );
    
        setUsers(data.data)
        
        setDetails(response);
        setLoading(false)
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  },[])
    
  return (
    <>  
    <div>
    {details && <ContractDetails leadData={leadData}  fileIdsForApproval={fileIdsForApproval} users={users} loading={loading} data={details.data}/>}
    </div>
    </> 
  )
}

export default Contract