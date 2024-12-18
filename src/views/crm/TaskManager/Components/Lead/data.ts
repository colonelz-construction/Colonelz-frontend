import { apiGetCrmFileManagerLeads } from "@/services/CrmService";

export interface FileItem {
    fileUrl: string;
    fileId: string;
    fileName:string
    date:string
    fileSize:string
  }
  
  export interface FolderItem {
    folder_name: string;
    files: FileItem[];
    updated_date:"string"
    total_files:string
  }
  export interface Data {
    data:FolderItem[]
  }
  
  export interface LeadDataItem {
    _id: string;
    lead_id: string;
    lead_name: string;
    files: FolderItem[];
    createdAt: string;
    __v: number;
    project_id: string;
    project_name: string;
  }
  
  export interface ApiResponse {
    message: string;
    status: boolean;
    errorMessage: string;
    code: number;
    data: FolderItem[];
    
  }
  

  export const fetchLeadData = async (leadId: string | null): Promise<FolderItem[]> => {
    try {
      const response = await apiGetCrmFileManagerLeads(leadId);
      const data = response
      return data.data;
    } catch (error) {
      console.error('Error fetching lead data', error);
      throw error;
    }
  };
