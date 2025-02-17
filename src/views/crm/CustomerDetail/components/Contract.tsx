import { Button } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ContractDetails, { FileItem } from './Contract/contractDetail'
import { apiGetCrmContractDetails, apiGetCrmUsersInContractFileApproval, apiGetUsers } from '@/services/CrmService'

export type ContractResponseType = {
  code: number;
  data: FileItem[]
}

const Contract = ({leadData}:any) => {
  const navigate=useNavigate()
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const lead_id = queryParams.get('id')
  const [details, setDetails] = useState<ContractResponseType>();
  const [users, setUsers] = useState<any>([])
  const [usersData, setUsersData] = useState<any>([])
  const [loading, setLoading] = useState<any>(true);
  const [fileIdsForApproval, setFileIdsForApproval] = useState<any>([])

  console.log(users)
 useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGetCrmContractDetails(lead_id);
        const data = await apiGetUsers();
        const res = await apiGetCrmUsersInContractFileApproval(lead_id);
        setFileIdsForApproval(res.data)

        console.log(data)

        
        
        const usersWithUpdateContract = usersData.filter((user:any) => 

          (!user.access || (user.access.contract && user.access.contract.includes("update")))
          
        );
        console.log(usersWithUpdateContract)
    
        const filteredList = usersWithUpdateContract.filter((item:any) => 
          leadData.some((firstItem:any) => firstItem.user_id === item.UserId)
        );
    
        // console.log(filteredList) 
        setUsers(data.data)
        
        setDetails(response);
        setLoading(false)
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  },[])

  // useEffect(() => {

  //   const usersWithUpdateContract = usersData.filter((user:any) => 

  //     (!user.access || (user.access.contract && user.access.contract.includes("update")))
      
  //   );
  //   console.log(usersWithUpdateContract)

  //   const filteredList = usersWithUpdateContract.filter((item:any) => 
  //     leadData.some((firstItem:any) => firstItem.user_id === item.UserId)
  //   );

  //   console.log(filteredList) 
  //   setUsers(filteredList)

  // }, [usersData])
    
  return (
    <>  
    <div>
    {details && <ContractDetails leadData={leadData}  fileIdsForApproval={fileIdsForApproval} users={users} loading={loading} data={details.data}/>}
    </div>
    </> 
  )
}

export default Contract