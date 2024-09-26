// types.ts

import { apiGetMomData } from "@/services/CrmService";

export interface Attendees {
    client_name: string;
  }
interface Files{

}
type Data = {
  client_name: string;
  location: string;
  meetingDate: string;
  mom_id: string;
  project_id: string;
  project_name: string;

}
  
  export interface Mom {
    mom_id: number;
    meetingdate: string;
    source: string;
    attendees: Attendees;
    location:string
    files:Files[]
  }
  
  export interface Project {
    project_name: string;
    mom: Mom[];
  }

  export const MomData = {};
  export const fetchMomData = async () => {
    try {
      const response = await apiGetMomData() 
      const data = response.data.MomData;
      Object.assign(MomData, data);
    } catch (error) {
      console.error('Failed to fetch MomData:', error);
    }
  };
  