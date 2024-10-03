import { apiGetCrmFileManagerProjects } from '@/services/CrmService'

export interface FileItem {
    date: string
    fileUrl: string
    fileId: string
    fileName: string
    fileSize: string
}

export interface FolderItem {
    folder_name: string
    total_files: string
    updated_date: string
    files: FileItem[]
}
export interface Data {
    data: FolderItem[]
}

export interface ProjectDataItem {
    _id: string
    lead_id: string
    lead_name: string
    files: FolderItem[]
    createdAt: string
    __v: number
    project_id: string
    project_name: string
}

export interface ApiResponse {
    message: string
    status: boolean
    errorMessage: string
    code: number
    data: ProjectDataItem[]
}

export const fetchProjectData = async (
    projectId: string | null,
): Promise<FolderItem[]> => {
    try {
        const response = await apiGetCrmFileManagerProjects(projectId)
        // console.log(response)
        const data = response
        return data.data
    } catch (error) {
        console.error('Error fetching lead data', error)
        throw error
    }
}
