import { apiGetRoleDetails, apiGetRoleWiseDetails } from "@/services/CrmService";

type RoleAccessPermissions = {
    read?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
    restore?: string[];
    move?: string[];
  };
  
  type ModuleNames = 
    | "user"
    | "lead"
    | "project"
    | "task"
    | "leadtask"
    | "opentask"
    | "file"
    | "mom"
    | "dailyLineUp"
    | "archive"
    | "contract"
    | "quotation"
    | "addMember"
    | "userArchive"
    | "leadArchive"
    | "role"
    | "companyData";
  
  type RoleAccessData = {
    message: string;
    status: boolean;
    errorMessage: string;
    code: number;
    data: {
      [key in ModuleNames]?: RoleAccessPermissions;
    };
  };


  export async function fetchRoleAccessData(): Promise<RoleAccessData> {
    const response = await apiGetRoleWiseDetails();
    return response;
  }
  fetchRoleAccessData()
    .then((roleAccessData) => {
    })
    .catch((error) => {
      console.error("Error fetching role access data:", error);
    });
  