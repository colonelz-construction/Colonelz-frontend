import appConfig from '@/configs/app.config';
import ApiService from './ApiService'

const { apiPrefix } = appConfig
const token = localStorage.getItem('auth');
const userId=localStorage.getItem('userId');


export async function apiGetNotification(userId: string | null) {
    const response = await fetch(`${apiPrefix}admin/get/notification?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });    
    return response.json();
}

export async function apiGetUserData(UserId:string | null) {
    const response = await fetch(`${apiPrefix}users/getdata?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });
    const data = await response.json();
    return data;
}
export async function apiGetRoleDetails() {
    const response = await fetch(`${apiPrefix}admin/get/role`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });
    const data = await response.json();
    return data;
}
export async function apiGetRoleList() {
    const response = await fetch(`${apiPrefix}admin/get/rolename`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
export async function apiGetRoleWiseDetails() {
    const response = await fetch(`${apiPrefix}admin/rolewise/access?role=ADMIN`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}



export async function apiCreateRole(Data: any) {
    const response = await fetch(`${apiPrefix}admin/create/role`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(Data)
    });
    const responseData = await response.json();
    return responseData;
}
export async function apiEditRoles(Data: any,id:string |null) {
    const response = await fetch(`${apiPrefix}admin/update/role?id=${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(Data)
    });

    return response;}
export async function apiDeleteRole(id:string |null) {
    const response = await fetch(`${apiPrefix}admin/delete/role?id=${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        
    });
    const responseData = await response.json();

    return responseData;}
export async function addProfilePhoto(Data: any) {
    const response = await fetch(`${apiPrefix}users/profileurl`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: Data
    });

    return response;}
export async function addcontractinfileManager(Data: any) {
    const response = await fetch(`${apiPrefix}admin/view/contract`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: Data
    });

    return response;}

export async function EditPassword(Data: any) {
    const response = await fetch(`${apiPrefix}users/change/password`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(Data)
    });

    return response;}
export async function apiGetUsers() {
    const response = await fetch(`${apiPrefix}admin/get/alluser?id=${localStorage.getItem('userId')}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export async function apiDeleteUsers(userid: string) {
    const response=await fetch(`${apiPrefix}admin/delete/user?userId=${userid}&id=${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userId })
    });
    return response;
}
export async function apiGetDeletedUsers() {
    const response = await fetch(`${apiPrefix}admin/archive/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
export async function apiRestoreDeletedUsers(UserId: any) {
    const response = await fetch(`${apiPrefix}admin/restore/user`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({user_id:UserId})
    });

    return response;}
export async function apiPermanantlyDeleteUsers(userId: string) {
    const response=await fetch(`${apiPrefix}admin/delete/archive/user`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId })
    });
    return response;
}
    
export async function addMemberToProject(Data: any) {
    const response = await fetch(`${apiPrefix}admin/add/member`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(Data)
    });

    return response;}
export async function apiPutNotificationUpdate(notificationId: string,type:string) {
    const response = await fetch(`${apiPrefix}admin/update/notification`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: userId,type: type, notification_id: notificationId })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}



export async function apiGetUsersList(projectId:string) {
    const response = await fetch(`${apiPrefix}admin/get/user/project?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });

    
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetAllUsersList() {
    const response = await fetch(`${apiPrefix}admin/get/userlist?user_id=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });

    
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetMomData() {
    const response = await fetch(`${apiPrefix}admin/getall/project/mom?id=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });

    
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiCreateMom(formData: any) {
    const response=await fetch(`${apiPrefix}admin/create/mom/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
        body: formData,
      });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apishareMom(formData: any) {
    const response=await fetch(`${apiPrefix}admin/send/momdata`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth')}`,
        },
        body: formData,
      });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiGetCrmProjects() {
    const response = await fetch(`${apiPrefix}admin/getall/project/?id=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiGetCrmProjectMakeContract(formData: any) {
    const response = await fetch(`${apiPrefix}admin/view/contract`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });

    return response;
}
export async function apiGetCrmSingleProjectQuotation(projectId:string ) {
    const response = await fetch(`${apiPrefix}admin/get/quotationdata/?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
export async function apiGetCrmProjectShareQuotation(formData: any) {
    const response = await fetch(`${apiPrefix}admin/share/quotation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });

    return response;
}
export async function apiGetCrmProjectShareContractApproval(formData: any) {
    const response = await fetch(`${apiPrefix}admin/contract/approval`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });

    return response;
}
export async function apiGetCrmProjectShareQuotationApproval(formData: any) {
    const response = await fetch(`${apiPrefix}admin/quotation/approval`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });

    return response;
}

export async function apiGetCrmSingleProjects(projectId:string ) {
    const response = await fetch(`${apiPrefix}admin/getsingle/project/?project_id=${projectId}&id=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
export async function apiGetCrmSingleProjectReport(projectId:string | null ) {
    const response = await fetch(`${apiPrefix}admin/gettask/details?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export async function apiGetCrmSingleProjectEdit(formData: any) {
    try {
      const response = await fetch(`${apiPrefix}admin/update/project/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
        }),
      });
      return response;
    } catch (error) {
      console.error('Error in apiGetCrmSingleProjectEdit:', error);
    }
  }
export async function apiGetCrmProjectsMom(projectId:string) {
    const response = await fetch(`${apiPrefix}admin/getall/mom/?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsAddTask(Data: any) {
    const response = await fetch(`${apiPrefix}admin/create/task`, {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(Data)
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsTaskData(projectId:string) {
    const response = await fetch(`${apiPrefix}admin/get/all/task?user_id=${userId}&project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsSingleTaskData(projectId:string |null,taskId:string | null) {
    const response = await fetch(`${apiPrefix}admin/get/single/task?user_id=${userId}&project_id=${projectId}&task_id=${taskId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsTaskUpdate(task:any) {
    const response = await fetch(`${apiPrefix}admin/update/task`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(task)
    });
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsTaskDelete(Data:any) {
    const response = await fetch(`${apiPrefix}admin/delete/task`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(Data)
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsSubTaskData(projectId:string,taskId:string) {
    
    const response = await fetch(`${apiPrefix}admin/get/all/subtask?user_id=${userId}&project_id=${projectId}&task_id=${taskId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsAddSubTask(Data: any) {
    const response = await fetch(`${apiPrefix}admin/create/subtask`, {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(Data)
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsSingleSubTaskDetails(projectId:string,taskId:string,subTaskId:string) {
    const response = await fetch(`${apiPrefix}admin/get/single/subtask?user_id=${userId}&project_id=${projectId}&task_id=${taskId}&sub_task_id=${subTaskId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsSubTaskUpdate(task:any) {
    const response = await fetch(`${apiPrefix}admin/update/subtask`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(task)
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmProjectsSubTaskDelete(Data:any) {
    const response = await fetch(`${apiPrefix}admin/delete/subtask`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(Data)
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiGetCrmProjectsSingleSubTaskTimer(Data:any) {
    const response = await fetch(`${apiPrefix}admin/update/subtask/time`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(Data)
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiGetCrmProjectsSingleSubTaskDataTimer(projectId:string,taskId:string,subTaskId:string) {
    const response = await fetch(`${apiPrefix}admin/get/subtask/time?project_id=${projectId}&task_id=${taskId}&sub_task_id=${subTaskId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiGetCrmFileManager() {
    const response = await fetch(`${apiPrefix}admin/getfile/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmFileManagerCompanyData() {
    const response = await fetch(`${apiPrefix}admin/get/companydata`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmFileManagerArchive(userId:string | null) {
    const response = await fetch(`${apiPrefix}admin/get/archive?user_id=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiGetCrmFileManagerArchiveRestore(Formdata:any) {
    const response = await fetch(`${apiPrefix}admin/restore/file`, {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(Formdata)
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
export async function apiGetCrmFileManagerDeleteArchiveFiles(postData: any) {
    const response = await fetch(`${apiPrefix}admin/delete/archive`, {
        method: 'Delete',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(postData)
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiGetCrmFileManagerProjects(projectId:string | null) {
    const response = await fetch(`${apiPrefix}admin/project/getfile/?project_id=${projectId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export async function apiGetCrmFileManagerCreateLeadFolder(formData: any) {
    const response = await fetch(`${apiPrefix}admin/fileupload/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
        
    });

    return response;
}

export async function apiDeleteFileManagerFolders(postData: any) {     
    const response = await fetch(`${apiPrefix}admin/delete/folder`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}
export async function apiDeleteFileManagerFiles(postData: any) {     
    const response = await fetch(`${apiPrefix}admin/delete/file/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
}
export async function apiGetCrmFileManagerCreateProjectFolder(formData: any) {
    const response = await fetch(`${apiPrefix}admin/project/fileupload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
        
    });

    return response;
}
export async function apiGetCrmFileManagerCreateTemplateFolder(formData: any) {
    const response = await fetch(`${apiPrefix}admin/template/fileupload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
        
    });

    return response;
}
export async function apiGetCrmFileManagerLeads(leadId:string | null) {
    console.log('leadId',leadId,token);
    
    const response = await fetch(`${apiPrefix}admin/lead/getfile/?lead_id=${leadId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmContractDetails(leadId:string | null) {
    const response = await fetch(`${apiPrefix}admin/get/contractdata?lead_id=${leadId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('Received response from server:', data);
    return data;
}
export async function apiGetCrmFileManagerShareFiles(formData: any) {
    const response = await fetch(`${apiPrefix}admin/share/file`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });
    const data = await response.json();

    return data;

}
export async function apiGetCrmFileManagerShareContractFile(formData: any) {
    const response = await fetch(`${apiPrefix}admin/share/contract`, {
        method: 'POST',
        headers: {
            
            'Authorization': `Bearer ${token}`
        },
        body: (formData)
        
    });

    return response;
}
export async function apiGetCrmLeads() {
    const response = await fetch(`${apiPrefix}admin/getall/lead/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
export async function apiGetCrmLeadsDetails(leadId:string | null) {
    const response = await fetch(`${apiPrefix}admin/getsingle/lead/?lead_id=${leadId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received response from server:', data);
    return data;
}

export async function apiLeadsAnotherProject(formData: any) {
    const response = await fetch(`${apiPrefix}admin/lead/multiple/project`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });

    return response;
}
export async function apiGetCrmCreateLead(formData: any) {
    const response = await fetch(`${apiPrefix}admin/create/lead/`, {
        method: 'POST',
        headers: {
            'Content-type':'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });

    return response;
}
export async function apiGetCrmCreateLeadToProject(formData: any) {
    const response = await fetch(`${apiPrefix}admin/create/lead/project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        
    });

    return response;
}
export async function apiGetCrmLeadsUpdates(formData: any) {
    const response = await fetch(`${apiPrefix}admin/update/lead/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });
    const responseData = await response.json();
    return responseData;
}
export async function apiGetCrmEditLead(formData: any) {
    const response = await fetch(`${apiPrefix}admin/update/lead/data/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
        
    });
    const responseData = await response.json();
    return responseData;
}





