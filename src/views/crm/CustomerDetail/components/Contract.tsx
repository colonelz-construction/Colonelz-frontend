import { Button } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ContractDetails, { FileItem } from './Contract/contractDetail'
import { apiGetCrmContractDetails } from '@/services/CrmService'

export type ContractResponseType = {
  code: number;
  data: FileItem[]
}

const Contract = () => {
  const navigate=useNavigate()
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const lead_id = queryParams.get('id')
  const [details, setDetails] = useState<ContractResponseType>();
  console.log(details?.data)
 useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGetCrmContractDetails(lead_id);
        
        setDetails(response);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();},[])
    
  return (
    <>
    <div>
    {details && <ContractDetails data={details.data}/>}
    </div>
    </>
  )
}

export default Contract