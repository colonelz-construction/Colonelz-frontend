export interface NavigationTree {
    key: string
    path: string
    isExternalLink?: boolean
    title: string
    translateKey: string
    icon: string
    type: 'title' | 'collapse' | 'item'
    authority: string[]
    subMenu:[]
    
}

type RoleAccessPermissions = {
    read?: string[];
    create?: string[];
    update?: string[];
    delete?: string[];
    restore?: string[];
  };
  
  type ModuleNames = 
    | "user"
    | "lead"
    | "project"
    | "task"
    | "file"
    | "mom"
    | "dailyLineUp"
    | "archive"
    | "contract"
    | "quotation"
    | "addMember"
    | "role";
  
  export type RoleAccessData = {
    message: string;
    status: boolean;
    errorMessage: string;
    code: number;
    data: {
      [key in ModuleNames]?: RoleAccessPermissions;
    };
  };

