import React, { createContext, useState, useEffect } from 'react';
import { ApiResponse, FolderItem } from './data';
import { apiGetCrmFileManagerLeads } from '@/services/CrmService';
import { useLocation } from 'react-router-dom';

export const LeadDataContext = createContext<FolderItem[] | null>(null);

export const LeadDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [leadData, setLeadData] = useState<FolderItem[] | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('lead_id');
  const token = localStorage.getItem('auth');
  // console.log(leadId,token);

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const response = await apiGetCrmFileManagerLeads(leadId);
        const data = response;
        setLeadData(data.data);
      } catch (error) {
        console.error('Error fetching lead data', error);
        throw error;
      }
    };

    fetchLeadData();
  }, []);

  return (
    <LeadDataContext.Provider value={leadData}>
      {children}
    </LeadDataContext.Provider>
  );
};