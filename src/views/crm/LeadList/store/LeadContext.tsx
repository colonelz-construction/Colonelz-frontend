import { apiGetCrmLeads } from '@/services/CrmService';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface Note {
    content: string;
    createdBy: string;
    date: string;
    status: string;
    _id: string;
  }
  
  interface File {
    fileUrl: string;
    fileName: string;
    fileId: string;
    fileSize: string;
    date: string;
  }
  
  export interface Contract {
    admin_status: string;
    itemId: string;
    file_name: string;
    files: File[];
    remark: string;
    _id: string;
  }
  
 export interface Lead {
    _id: string;
    name: string;
    lead_id: string;
    lead_manager: string;
    email: string;
    phone: string;
    location: string;
    status: string;
    source: string;
    date: string;
    updated_date: string;
    notes: Note[];
    contract: Contract[];
    createdAt: string;
    __v: number;
  }
  
  interface LeadData {
    leads: Lead[];
  }
  
  export interface LeadApiResponse {
    message: string;
    status: boolean;
    errorMessage: string;
    code: number;
    data: LeadData;
  }
const LeadContext = createContext<Lead[] | null>(null);

export const useLeadContext = () => useContext(LeadContext);

const org_id = localStorage.getItem('orgId')

export const LeadProvider = ({ children }: { children: ReactNode }) => {
  const [apiData, setApiData] = useState<Lead[] | null>(null);
  console.log(apiData)

  useEffect(() => {
    const fetchData = async () => {
      const response = await apiGetCrmLeads();

      setApiData(response.data.leads?.reverse());
    };

    fetchData();
  }, []);

  return <LeadContext.Provider value={apiData}>{children}</LeadContext.Provider>;
};