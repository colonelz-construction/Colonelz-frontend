import { apiGetCrmProjectsMom } from '@/services/CrmService';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';


const MomContext = createContext<Context>({ leadData:null, client: null });

export const useMomContext = () => useContext(MomContext);

type Context={
  leadData:MomDataType[] | null
  client:DataType | null
}

export interface ApiResponse {
  data: DataType;
}

export interface DataType {
  client_name: string;
  mom_data: MomDataType[];
}

export interface MomDataType {
  mom_id: string;
  meetingdate: string;
  location: string;
  attendees: Attendees;
  remark: string;
  important_note: string;
  files: File[];
}

interface Attendees {
  client_name: string;
  organisor: string;
  designer: string;
  attendees: string;
}

interface File {
  fileUrl: string;
  fileName: string;
  fileId: string;
  fileSize: string;
  date: string;
}

export const MomProvider = ({ children }: { children: ReactNode }) => {
  const [leadData, setLeadData] = useState<MomDataType[] | null>(null);
  const [client, setClient] = useState<DataType | null>(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('project_id');
    if (projectId) {
      const fetchData = async () => {
        try {
          const response = await apiGetCrmProjectsMom(projectId);
          const data = response;
          setLeadData(data.data.mom_data);
          setClient(data.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [location.search]);

  return (
    <MomContext.Provider value={{ leadData, client }}>
      {children}
    </MomContext.Provider>
  );
};