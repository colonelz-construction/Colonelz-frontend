import { apiGetCrmProjects } from '@/services/CrmService';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';


export type ProjectResponse = {
    code: number;
    data: Data;
    errorMessage: string;
  }
  
  type Data = {
    Design_Execution: number;
    Design_Phase: number;
    Execution_Phase: number;
    active_Project: number;
    archive: number;
    commercial: string;
    residential: string;
    completed: number;
    total_Project: number;
    projects: ProjectData[];
  
  }
  
  type ProjectData = {
    client: Client[];
    client_name: string;
    designer: string;
    project_end_date: string;
    project_id: string;
    project_name: string;
    project_start_date: string;
    project_status: string;
    project_type: string;
  }
  
  type Client = {
    client_contact: string;
    client_email: string;
    client_name: string;
  }
interface ProjectContextType {
  projects: any[];
  apiData: any;
  loading:boolean;
}

const ProjectContext = createContext<ProjectContextType>({ projects: [], apiData: {},loading:true });

export const useProjectContext = () => useContext(ProjectContext);
const org_id = localStorage.getItem('orgId')
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [apiData, setApiData] = useState<Data>();
    const [loading, setLoading] = useState(true);
useEffect(() => {
    const fetchData = async () => {
        const response = await apiGetCrmProjects(org_id);
        const data = response.data.projects;
        console.log(data)
        setProjects(data);
        setLoading(false);
        setApiData(response.data);
    };
    fetchData();
}
, []);

    return (
        <ProjectContext.Provider value={{ projects, apiData,loading }}>
            {children}
        </ProjectContext.Provider>
    );
}