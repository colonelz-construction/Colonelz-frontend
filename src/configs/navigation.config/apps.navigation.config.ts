import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree, RoleAccessData } from '@/@types/navigation'
import { fetchRoleAccessData } from '@/views/crm/Roles/roleData'
import { apiGetRoleList } from '@/services/CrmService'

async function getRoleAccessData(): Promise<RoleAccessData> {
    try {
        const roleAccessData = await fetchRoleAccessData()
        return roleAccessData
    } catch (error) {
        console.error('Error fetching role access data:', error)
        throw error
    }
}

const data: RoleAccessData = await getRoleAccessData()
const rolelist = await apiGetRoleList()

const role = localStorage.getItem('role')

const appsNavigationConfig: NavigationTree[] = [
    {
        key: 'appsCrm.dashboard',
        path: `${APP_PREFIX_PATH}/crm/dashboard`,
        title: 'Dashboard',
        translateKey: 'nav.appsCrm.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: role === 'SUPERADMIN' ? ['SUPERADMIN'] : rolelist.data,
        subMenu: [],
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager`,
        title: 'File Manager',
        translateKey: 'nav.appsCrm.fileManager',
        icon: 'files',
        type: NAV_ITEM_TYPE_ITEM,
        authority:
            role === 'SUPERADMIN'
                ? ['SUPERADMIN']
                : data?.data?.file?.read ?? [],
        subMenu: [],
    },  
    {
        key: 'appsSales.productList',
        path: `${APP_PREFIX_PATH}/leads`,
        title: 'Lead Manager',
        translateKey: 'nav.appsSales.productList',
        icon: 'lead',
        type: NAV_ITEM_TYPE_ITEM,
        authority:
            role === 'SUPERADMIN'
                ? ['SUPERADMIN']
                : data?.data?.lead?.read ?? [],
        subMenu: [],
    },
    
    {
        key: 'appsCrm.mom',
        path: `${APP_PREFIX_PATH}/crm/MOM`,
        title: 'MOM',
        translateKey: '',
        icon: 'mom',
        type: NAV_ITEM_TYPE_ITEM,
        authority:
            role === 'SUPERADMIN'
                ? ['SUPERADMIN']
                : data?.data?.mom?.read ?? [],
        subMenu: [],
    },
    {
        key: 'appsCrm.project',
        path: `${APP_PREFIX_PATH}/crm/projectslist`,
        title: 'Project Manager',
        translateKey: '',
        icon: 'projects',
        type: NAV_ITEM_TYPE_ITEM,
        authority:
            role === 'SUPERADMIN'
                ? ['SUPERADMIN']
                : data?.data?.project?.read ?? [],
        subMenu: [],
    },
    {
        key: 'appsCrm.taskManager',
        path: `${APP_PREFIX_PATH}/crm/taskManager`,
        title: 'Task Manager',
        translateKey: 'Task Manager',
        icon: 'task',
        type: NAV_ITEM_TYPE_ITEM,
        authority:
            role === 'SUPERADMIN'
                ? ['SUPERADMIN']
                : data?.data?.task?.read ?? [],
        subMenu: [],
    },
    {
        key: 'appsCrm.ai-chatbot',
        path: `${APP_PREFIX_PATH}/crm/ai-chatbot`,
        title: 'Ask Ada',
        translateKey: '',
        icon: 'chatbot',
        type: NAV_ITEM_TYPE_ITEM,
        authority: role === 'SUPERADMIN' ? ['SUPERADMIN'] : rolelist.data,
        subMenu: [],
    },
    {
        key: 'appsCrm.timeline',
        path: `${APP_PREFIX_PATH}/crm/timeline`,
        title: 'Timeline',
        translateKey: 'Timeline',
        icon:'timeline',
        type: NAV_ITEM_TYPE_ITEM,
        authority:
        role === 'SUPERADMIN'
        ? ['SUPERADMIN']
        : data?.data?.task?.read ?? [],
        subMenu: [],
    },
    {
        key: 'appsCrm.dailyLineUp',
        path: `${APP_PREFIX_PATH}/crm/daily-lineup`,
        title: 'Daily LineUp',
        translateKey: 'Daily LineUp',
        icon: 'calendar',
        type: NAV_ITEM_TYPE_ITEM,
        authority:
            role === 'SUPERADMIN'
                ? ['SUPERADMIN']
                : data?.data?.dailyLineUp?.read ?? [],
        subMenu: [],
    },
    // {
    //     key: 'appsCrm.visualizer',
    //     path: `${APP_PREFIX_PATH}/crm/visualizer`,
    //     title: '3D Visualizer',
    //     translateKey: 'nav.appsCrm.visualizer',
    //     icon: 'visualizer',
    //     type: NAV_ITEM_TYPE_ITEM,
    //     authority:
    //         role === 'SUPERADMIN'
    //             ? ['SUPERADMIN']
    //             : data?.data?.task?.read ?? [],
    //     subMenu: [],
    // },
]

export default appsNavigationConfig
