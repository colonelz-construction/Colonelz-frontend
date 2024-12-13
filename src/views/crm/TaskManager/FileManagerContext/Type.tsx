export type File = {
    fileUrl: string;
    fileName: string;
    fileId: string;
    fileSize: string;
    date: string;
  };
  
  export type Folder = {
    folder_name: string;
    updated_date: string;
    files: File[];
  };
  
  export type Lead = {
    lead_id: string;
    lead_Name: string;
    lead_email: string;
    lead_phone: string;
    lead_status: string;
    lead_date: string;
    files: Folder[];
  };

  
  export type Project = {
    project_name: string;
    project_id: string;
    client_name: string;
    project_type: string;
    project_status: string;
    files: Folder[];
  };

  
  export type TemplateFolder = {
    folder_name: string;
    folder_id: string;
    sub_folder_name_first: string;
    sub_folder_name_second: string;
    updated_date: string;
    total_files: number;
    files: File[];
  };
  
  export type Template = {
    type: string;
    files: TemplateFolder[];
  };
  
  export type ResponseData = {
    leadData: Lead[];
    projectData: Project[];
    templateData: Template[];
  };
  
  export type ApiResponse = {
    message: string;
    status: boolean;
    errorMessage: string;
    code: number;
    data: ResponseData;
  };