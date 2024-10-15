import appConfig from '@/configs/app.config'
import ApiService from './ApiService'
import { NotificationResponse } from '@/components/template/Notification'
import { ProfileFormModel } from '@/views/Context/userdetailsContext'
import { RoleResponse } from '@/views/crm/Profile/Roles'
import { RoleList } from '@/views/crm/Roles/RolesContext'
import { RoleAccessData } from '@/@types/navigation'
import { LeadResponseType, UserResponse } from '@/views/crm/AddUserToLead'
import {
    ProjectResponseType,
    QuotationResponseType,
    ReportResponse,
    TaskResponse,
    UserList,
} from '@/views/crm/CustomerDetail/CustomerDetail'
import {
    FileManagerLeadType,
    UserListResponse,
} from '@/views/crm/FileManager/Components/Lead/Folders'
import { MomResponse } from '@/views/crm/Inventory/components/DataTable'
import { ProjectResponse } from '@/views/crm/AddMemberToProject'
import {
    ApiResponse,
    DataType,
} from '@/views/crm/CustomerDetail/store/MomContext'
import { TaskDataResponse } from '@/views/crm/CustomerDetail/Task/TaskDetails/TaskDetails'
import { SubTaskResponse } from '@/views/crm/CustomerDetail/Task/Subtasks/Subtasks'
import { UsersResponse } from '@/views/crm/users'
import { TimerResponse } from '@/views/crm/CustomerDetail/Task/Subtasks/SubTaskDetailsDrawer'
import { ApiResponseData } from '@/views/crm/FileManager/Components/type'
import {
    CompanyDataResponse,
    FileManagerResponseType,
} from '@/views/crm/FileManager/Components/data'
import { ArchiveResponse } from '@/views/crm/FileManager/Components/Template/Archive/Components/Index'
import { Data } from '@/views/crm/FileManager/Components/Project/data'
import { ContractResponseType } from '@/views/crm/CustomerDetail/components/Contract'
import { LeadDetailsResponse } from '@/views/crm/LeadsDetails/LeadDetail'
import { ArchiveUserResponseType } from '@/views/crm/users/ArchivedUsers'
import { ProfileProps } from '@/views/crm/Profile/profile'
import { LeadApiResponse } from '@/views/crm/LeadList/store/LeadContext'

const { apiPrefix } = appConfig
const token = localStorage.getItem('auth')
const userId = localStorage.getItem('userId')
const org_id = localStorage.getItem('orgId')

export async function apiGetNotification<T>(
    userId: string | null,
    page: number,
) {
    return ApiService.fetchData<NotificationResponse>({
        url: `admin/get/notification?userId=${userId}&page=${page}&limit=20`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetUserData<T>(UserId: string | null) {
    return ApiService.fetchData<ProfileFormModel>({
        url: `users/getdata?userId=${userId}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmUsersAssociatedToLead<T>(lead_id:any) {
    return ApiService.fetchData<LeadApiResponse>({
        url: `admin/get/userlist/lead?lead_id=${lead_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
 
 
export async function apiLeadsRemoveUser(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/remove/member/lead',
        method: 'post',
        data,
    }).then((response) => {
        return response.data;
    });
}

export async function apiGetRoleDetails<T>(org_id:any) {
    return ApiService.fetchData<RoleResponse>({
        url: `admin/get/role?org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetRoleList<T>() {
    return ApiService.fetchData<RoleList>({
        url: `admin/get/rolename`,
        method: 'get',
    })
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            throw new Error(`HTTP error! status: ${error}`)
        })
}

export async function apiGetRoleWiseDetails<T>() {
    return ApiService.fetchData<RoleAccessData>({
        url: `admin/rolewise/access?role=ADMIN`,
        method: 'get',
    })
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            throw new Error(`HTTP error! status: ${error}`)
        })
}

export async function apiCreateRole<U extends Record<string, unknown>>(
    data: U,
) {
    return ApiService.fetchData<any>({
        url: 'admin/create/role',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}

export async function apiEditRoles(data: any, id: string | null) {
    return ApiService.fetchData<any>({
        url: `admin/update/role?id=${id}`,
        method: 'put',
        data,
    }).then((response) => {
        return response.data
    })
}

export async function apiEditUserRole(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/update/users/role',
        method: 'put',
        data,
    }).then((response) => {
        return response.data
    })
}

export async function apiDeleteRole(id: any) {
    return ApiService.fetchData<any>({
        url: `admin/delete/role?id=${id}`,
        method: 'delete',
        data: id,
    }).then((response) => {
        return response.data
    })
}
export async function apiDeleteInactiveLead(id: any) {
    return ApiService.fetchData<any>({
        url: `admin/delete/inactive/lead?lead_id=${id}`,
        method: 'delete',
        data: id,
    }).then((response) => {
        return response.data
    })
}

export async function addProfilePhoto(data: any) {
    return ApiService.fetchData<ProfileProps>({
        url: 'users/profileurl',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}

export async function addcontractinfileManager(Data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/view/contract',
        method: 'post',
        data: Data,
    }).then((response) => {
        return response.data
    })
}

export async function EditPassword<U extends Record<string, unknown>>(data: U) {
    return ApiService.fetchData<any>({
        url: 'users/change/password',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetUsers<T>() {
    return ApiService.fetchData<UsersResponse>({
        url: `admin/get/alluser?id=${localStorage.getItem('userId')}`,
        method: 'get',
    })
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            throw new Error(`HTTP error! status: ${error}`)
        })
}

export async function apiDeleteUsers(userid: any, orgId: any) {
    return ApiService.fetchData<any>({
        url: `admin/delete/user?userId=${userid}&id=${userId}&org_id=${orgId}`,
        method: 'delete',
        data: { userId: userId },
    }).then((response) => {
        return response.data
    })
}

export async function apiRemoveUserProject(username: any, project_id: any) {
    return ApiService.fetchData<any>({
        url: `/admin/remove/member/project`,
        method: 'post',
        data: { username: username, project_id: project_id },
    }).then((response) => {
        return response.data
    })
}

export async function apiGetDeletedUsers<T>(org_id:any) {
    return ApiService.fetchData<ArchiveUserResponseType>({
        url: `admin/archive/user?org_id=${org_id}`,
        method: 'get',
    })
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            throw new Error(`HTTP error! status: ${error}`)
        })
}

export async function apiRestoreDeletedUsers(UserId: any) {
    return ApiService.fetchData<any>({
        url: 'admin/restore/user',
        method: 'post',
        data: { user_id: UserId },
    }).then((response) => {
        return response.data
    })
}

export async function apiPermanantlyDeleteUsers(userid: any, orgId:any) {
    return ApiService.fetchData<any>({
        url: `admin/delete/archive/user`,
        method: 'delete',
        data: { user_id: userid,
            org_id:orgId
         },
    }).then((response) => {
        return response.data
    })
}

export async function addMemberToProject(Data: any) {
    //Not in use
    return ApiService.fetchData<any>({
        url: 'admin/add/member',
        method: 'post',
        data: Data,
    }).then((response) => {
        return response.data
    })
}

export async function apiPutNotificationUpdate(notificationId: any, type: any) {
    return ApiService.fetchData<any>({
        url: `admin/update/notification`,
        method: 'put',
        data: { userId: userId, type: type, notification_id: notificationId },
    }).then((response) => {
        return response.data
    })
}

export async function apiGetUsersList<T>(projectId: string) {
    return ApiService.fetchData<UserList>({
        url: `admin/get/user/project?project_id=${projectId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
export async function apiGetUsersListProject<T>(projectId: string) {
    return ApiService.fetchData<UserList>({
        url: `/admin/get/userlist/project?project_id=${projectId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
export async function apiGetAllUsersList<T>() {
    return ApiService.fetchData<UserListResponse>({
        url: `admin/get/userlist?user_id=${userId}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetMomData<T>(org_id: any) {
    return ApiService.fetchData<MomResponse>({
        url: `admin/getall/project/mom?id=${userId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
export async function apiGetSingleMomData<T>() { //not used
    return ApiService.fetchData<MomResponse>({
        url: `admin/getsingle/mom`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
export async function apiGetMomUpdate<T>( //org done
    data: any,
    project_id: string,
    mom_id: string,
    org_id: string | null
) {
    return ApiService.fetchData<any>({
        url: `admin/update/mom?project_id=${project_id}&mom_id=${mom_id}&org_id=${org_id}`,
        method: 'put',
        data: data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetMomDelete<T>(data: any) { //done org
    return ApiService.fetchData<any>({
        url: `admin/delete/mom`,
        method: 'delete',
        data: data,
    }).then((response) => {
        return response.data
    })
}

export async function apiCreateMom(formData: any) { //org done
    return ApiService.fetchData<any>({
        url: 'admin/create/mom/',
        method: 'post',
        data: formData,
    }).then((response) => {
        return response.data
    })
}

export async function apishareMom(formData: any) {
    //Not in use
    return ApiService.fetchData<any>({
        url: 'admin/send/momdata',
        method: 'post',
        data: formData,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjects<T>(org_id: string  | null) { //org done
    return ApiService.fetchData<ProjectResponse>({
        url: `admin/getall/project/?id=${userId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectMakeContract(formData: any) {
    //Not in use
    return ApiService.fetchData<any>({
        url: 'admin/view/contract',
        method: 'post',
        data: formData,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmSingleProjectQuotation<T>(projectId: string) { //org done
    return ApiService.fetchData<QuotationResponseType>({
        url: `admin/get/quotationdata/?project_id=${projectId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectShareQuotation(formData: any) { //org done
    return ApiService.fetchData<any>({
        url: 'admin/share/quotation',
        method: 'post',
        data: formData,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectShareContractApproval(formData: any) {
    return ApiService.fetchData<any>({
        url: 'admin/contract/approval',
        method: 'post',
        data: formData,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectShareQuotationApproval(formData: any) { //org done
    return ApiService.fetchData<any>({
        url: 'admin/quotation/approval',
        method: 'post',
        data: formData,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmSingleProjects<T>(projectId: string, org_id: any) {
    return ApiService.fetchData<ProjectResponseType>({
        url: `admin/getsingle/project/?project_id=${projectId}&id=${userId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmSingleProjectReport<T>( //org done
    projectId: string | null,
    org_id: string | null,
) { //org done
    return ApiService.fetchData<ReportResponse>({
        url: `admin/gettask/details?project_id=${projectId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmSingleProjectEdit(formData: any) {
    return ApiService.fetchData<any>({
        url: `admin/update/project`,
        method: 'put',
        data: { ...formData },
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsMom<T>(projectId: string, org_id: string | null) { //org done
    return ApiService.fetchData<ApiResponse>({
        url: `admin/getall/mom/?project_id=${projectId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmProjectsSingleMom<T>(
    projectId: string,
    momId: string,
    org_id: string | null
) { //org done
    return ApiService.fetchData<ApiResponse>({
        url: `admin/getsingle/mom/?project_id=${projectId}&mom_id=${momId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsAddTask(Data: any) { //org done
    return ApiService.fetchData<any>({
        url: 'admin/create/task',
        method: 'post',
        data: Data,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsTaskData<T>(projectId: string, org_id: string | null) { //org done
    return ApiService.fetchData<TaskResponse>({
        url: `admin/get/all/task?user_id=${userId}&project_id=${projectId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsSingleTaskData<T>( //org done
    projectId: string | null,
    taskId: string | null,
    org_id: string | null
) {
    return ApiService.fetchData<TaskDataResponse>({
        url: `admin/get/single/task?user_id=${userId}&project_id=${projectId}&task_id=${taskId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsTaskUpdate(task: any) { //org done
    return ApiService.fetchData<any>({
        url: `admin/update/task`,
        method: 'put',
        data: task,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsTaskDelete(Data: any) {  //org done
    return ApiService.fetchData<any>({
        url: `admin/delete/task`,
        method: 'delete',
        data: Data,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsSubTaskData<T>( //org done
    projectId: string,
    taskId: string,
    org_id: string | null
) {
    return ApiService.fetchData<SubTaskResponse>({
        url: `admin/get/all/subtask?user_id=${userId}&project_id=${projectId}&task_id=${taskId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsAddSubTask(Data: any) { //org done
    return ApiService.fetchData<any>({
        url: 'admin/create/subtask',
        method: 'post',
        data: Data,
    }).then((response) => {
        return response.data
    })
}

//NOT IN USE ->
export async function apiGetCrmProjectsSingleSubTaskDetails(  //org done
    projectId: string,
    taskId: string,
    subTaskId: string,
    org_id : string | null
) {
    const response = await fetch(
        `${apiPrefix}admin/get/single/subtask?user_id=${userId}&project_id=${projectId}&task_id=${taskId}&sub_task_id=${subTaskId}&org_id=${org_id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    const data = await response.json()
    return data
}

export async function apiGetCrmProjectsSubTaskUpdate(task: any) { //org done
    return ApiService.fetchData<any>({
        url: `admin/update/subtask`,
        method: 'put',
        data: task,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsSubTaskDelete(Data: any) { //org done
    return ApiService.fetchData<any>({
        url: `admin/delete/subtask`,
        method: 'delete',
        data: Data,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsSingleSubTaskTimer(Data: any) { //org done
    return ApiService.fetchData<any>({
        url: `admin/update/subtask/time`,
        method: 'put',
        data: Data,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmProjectsSingleSubTaskDataTimer<T>( //org done
    projectId: string,
    taskId: string,
    subTaskId: string,
    org_id: string | null
) {
    return ApiService.fetchData<TimerResponse>({
        url: `admin/get/subtask/time?project_id=${projectId}&task_id=${taskId}&sub_task_id=${subTaskId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManager<T>() {
    return ApiService.fetchData<FileManagerResponseType>({
        url: `admin/getfile/`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerCompanyData<T>() {
    return ApiService.fetchData<FileManagerResponseType>({
        url: `admin/get/companydata`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerArchive<T>(userId: string | null) {
    return ApiService.fetchData<ArchiveResponse>({
        url: `admin/get/archive?user_id=${userId}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerArchiveRestore(Formdata: any) {
    return ApiService.fetchData<any>({
        url: 'admin/restore/file',
        method: 'post',
        data: Formdata,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerDeleteArchiveFiles(postData: any) {
    return ApiService.fetchData<any>({
        url: `admin/delete/archive`,
        method: 'delete',
        data: postData,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerProjects<T>(
    projectId: string | null,
) {
    return ApiService.fetchData<Data>({
        url: `admin/project/getfile/?project_id=${projectId}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerCreateLeadFolder(Formdata: any) {
    return ApiService.fetchData<any>({
        url: 'admin/fileupload/',
        method: 'post',
        data: Formdata,
    }).then((response) => {
        return response.data
    })
}

export async function apiDeleteFileManagerFolders(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/delete/folder',
        method: 'delete',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiDeleteFileManagerFiles(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/delete/file',
        method: 'delete',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmFileManagerCreateProjectFolder(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/project/fileupload',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmFileManagerCreateTemplateFolder(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/template/fileupload',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerLeads<T>(leadId: string | null) {
    return ApiService.fetchData<FileManagerLeadType>({
        url: `admin/lead/getfile/?lead_id=${leadId}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmContractDetails<T>(leadId: string | null) {
    return ApiService.fetchData<ContractResponseType>({
        url: `admin/get/contractdata?lead_id=${leadId}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmFileManagerShareFiles(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/share/file',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmFileManagerShareContractFile(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/share/contract',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmLeads<T>(org_id:any) {
    return ApiService.fetchData<LeadApiResponse>({
        url: `admin/getall/lead?org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiGetCrmLeadsDetails<T>(leadId: string | null, org_id: any) {
    return ApiService.fetchData<LeadDetailsResponse>({
        url: `admin/getsingle/lead/?lead_id=${leadId}&org_id=${org_id}`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmProjectActivity<T>(project_id: any, page: any, org_id : any) {
    return ApiService.fetchData<any>({
        url: `admin/get/project/activity?project_id=${project_id}&org_id=${org_id}&page=${page}&limit=5`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmLeadActivity<T>(lead_id: any, page: any) {
    return ApiService.fetchData<any>({
        url: `admin/get/lead/activity?lead_id=${lead_id}&page=${page}&limit=5`,
        method: 'get',
    }).then((response) => {
        return response.data
    })
}

export async function apiLeadsAnotherProject(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/lead/multiple/project',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmCreateLead(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/create/lead/',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmCreateLeadToProject(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/create/lead/project',
        method: 'post',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmLeadsUpdates(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/update/lead/',
        method: 'put',
        data,
    }).then((response) => {
        return response.data
    })
}
export async function apiGetCrmEditLead(data: any) {
    return ApiService.fetchData<any>({
        url: 'admin/update/lead/data/',
        method: 'put',
        data,
    }).then((response) => {
        return response.data
    })
}
