import { lazy } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import {} from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const appsRoute: Routes = [
    {
        key: 'appsCrm.dashboard',
        path: `${APP_PREFIX_PATH}/crm/dashboard`,
        component: lazy(() => import('@/views/crm/CrmDashboard')),

        authority: [],
    },
    {
        key: 'appsCrm.taskManager',
        path: `${APP_PREFIX_PATH}/crm/taskManager`,
        component: lazy(() => import('@/views/crm/TaskManager')),

        authority: [],
    },
    {
        key: 'appsCrm.visualizer',
        path: `${APP_PREFIX_PATH}/crm/visualizer`,
        component: lazy(() => import('@/views/crm/Visualizer/index')),

        authority: [],
    },
    {
        key: 'appsCrm.timeline',
        path: `${APP_PREFIX_PATH}/crm/timeline`,
        component: lazy(() => import('@/views/crm/Timeline/index')),

        authority: [],
    },
    {
        key: 'appsCrm.timeline',
        path: `${APP_PREFIX_PATH}/crm/timeline/lead`,
        component: lazy(() => import('@/views/crm/Timeline/OrderTimeline')),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.ai-chatbot',
        path: `${APP_PREFIX_PATH}/crm/ai-chatbot`,
        component: lazy(() => import('@/views/crm/Chatbot/index')),

        authority: [],
    },
    {
        key: 'appsCrm.register',
        path: `${APP_PREFIX_PATH}/crm/profile`,
        component: lazy(() => import('@/views/crm/Profile/index')),

        authority: [],
    },
    {
        key: 'appsCrm.register',
        path: `${APP_PREFIX_PATH}/crm/org-profile`,
        component: lazy(() => import('@/views/crm/OrgProfile/index')),

        authority: [],
    },

    {
        key: 'appsCrm.roles',
        path: `${APP_PREFIX_PATH}/crm/roles/edit`,
        component: lazy(() => import('@/views/crm/Roles/EditRoles')),

        authority: [],
    },
    {
        key: 'appsCrm.roles',
        path: `${APP_PREFIX_PATH}/crm/roles/Create`,
        component: lazy(() => import('@/views/crm/Roles/CreateRole')),

        authority: [],
    },
    {
        key: 'appsCrm.register',
        path: `${APP_PREFIX_PATH}/crm/register`,
        component: lazy(() => import('@/views/crm/Register')),

        authority: [],
    },
    {
        key: 'appsCrm.addmember',
        path: `${APP_PREFIX_PATH}/crm/addmember`,
        component: lazy(() => import('@/views/crm/AddMemberToProject/index')),

        authority: [],
    },
    {
        key: 'appsCrm.addmember',
        path: `${APP_PREFIX_PATH}/crm/addUserToLead`,
        component: lazy(() => import('@/views/crm/AddUserToLead/index')),

        authority: [],
    },
    {
        key: 'appsCrm.addmember',
        path: `${APP_PREFIX_PATH}/crm/allusers`,
        component: lazy(() => import('@/views/crm/users/index')),

        authority: [],
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager`,
        component: lazy(() => import('@/views/crm/FileManager')),

        authority: [],
        meta: {
            header: 'File Manager',
            headerContainer: true,
        },
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/leads`,
        component: lazy(() => import('@/views/crm/FileManager/Components/Lead/index'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/leads/folder`,
        component: lazy(
            () =>
                import('@/views/crm/FileManager/Components/Lead/Folders/index'),
        ),
        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/leads/upload`,
        component: lazy(
            () =>
                import('@/views/crm/FileManager/Components/Lead/Folders/index'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project`,
        component: lazy(
            () => import('@/views/crm/FileManager/Components/Project/index'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/folder`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/FileManager/Components/Project/Folders/index'
                ),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/upload`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/FileManager/Components/Project/Folders/index'
                ),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/commercial`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/FileManager/Components/Template/Commercial/commercial'
                ),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/commercial/subfolder`,
        component: lazy(
            () =>
                import('@/views/crm/FileManager/Components/Template/Subfolder'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/commercial/subfolder/files`,
        component: lazy(
            () => import('@/views/crm/FileManager/Components/Template/Files'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/residential`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/FileManager/Components/Template/Residential/residential'
                ),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/residential/subfolder`,
        component: lazy(
            () =>
                import('@/views/crm/FileManager/Components/Template/Subfolder'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/residential/subfolder/files`,
        component: lazy(
            () => import('@/views/crm/FileManager/Components/Template/Files'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/layout`,
        component: lazy(() => import('@/views/crm/Layout/layout')),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/miscellaneous/subfolder`,
        component: lazy(
            () =>
                import('@/views/crm/FileManager/Components/Template/Subfolder'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/project/templates/miscellaneous/subfolder/files`,
        component: lazy(
            () => import('@/views/crm/FileManager/Components/Template/Files'),
        ),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.fileManager',
        path: `${APP_PREFIX_PATH}/crm/fileManager/archive`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/FileManager/Components/Template/Archive/Components/Index'
                ),
        ),

        authority: [],
        meta: {},
    },

    {
        key: 'appsCrm.project',
        path: `${APP_PREFIX_PATH}/crm/projectslist`,
        component: lazy(() => import('@/views/crm/Customers')),

        authority: [],
        meta: {},
    },
    {
        key: 'appsSales.orderDetails',
        path: `${APP_PREFIX_PATH}/crm/project-details?id=8`,
        component: lazy(() => import('@/views/crm/CustomerDetail')),

        authority: [],
    },
    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/project-details`,
        component: lazy(() => import('@/views/crm/CustomerDetail')),

        authority: [],
        meta: {},
    },
    {
        key: 'appsCrm.form',
        path: `${APP_PREFIX_PATH}/crm/project/momform`,
        component: lazy(
            () => import('@/views/crm/CustomerDetail/components/MOM/MomForm'),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.form',
        path: `${APP_PREFIX_PATH}/crm/project/MOM/Update`,
        component: lazy(
            () => import('@/views/crm/CustomerDetail/components/MOM/MOMUpdate'),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.form',
        path: `${APP_PREFIX_PATH}/crm/project/AllMOM`,
        component: lazy(
            () => import('@/views/crm/CustomerDetail/components/MOM/AllMom'),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.mom',
        path: `${APP_PREFIX_PATH}/crm/MOM`,
        component: lazy(() => import('@/views/crm/Inventory')),

        authority: [],
    },
    {
        key: 'appsCrm.inventory',
        path: `${APP_PREFIX_PATH}/crm/Inventory`,
        component: lazy(() => import('@/views/crm/Projects')),

        authority: [],
    },
    {
        key: 'appsCrm.inventory',
        path: `${APP_PREFIX_PATH}/crm/Projects/TaskDetails`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/CustomerDetail/Task/TaskDetails/TaskDetails'
                ),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.inventory',
        path: `${APP_PREFIX_PATH}/crm/Tasks/OpenTaskDetails`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/OpenTaskManger/Task/TaskDetails/TaskDetails'
                ),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.inventory',
        path: `${APP_PREFIX_PATH}/crm/Leads/TaskDetails`,
        component: lazy(
            () =>
                import(
                    '@/views/crm/LeadsDetails/Task/TaskDetails/TaskDetails'
                ),
        ),

        authority: [],
    },

    // {
    //     key: 'appsCrm.customers',
    //     path: `${APP_PREFIX_PATH}/crm/projects`,
    //     component: lazy(() => import('@/views/crm/ProjectList')),
    //
    //

    //     meta: {

    //     },
    // },

    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/contract`,
        component: lazy(
            () =>
                import('@/views/crm/CustomerDetail/components/Contract/index'),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/pdf`,
        component: lazy(
            () => import('@/views/crm/CustomerDetail/components/Contract/pdf'),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/pdf2`,
        component: lazy(
            () => import('@/views/crm/CustomerDetail/components/Contract/pdf'),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/pdf1`,
        component: lazy(
            () => import('@/views/crm/CustomerDetail/components/Contract'),
        ),

        authority: [],
    },

    {
        key: 'appsSales.allmom',
        path: `${APP_PREFIX_PATH}/crm/allmom`,
        component: lazy(
            () => import('@/views/crm/CustomerDetail/components/MOM/AllMom'),
        ),

        authority: [],
    },
    {
        key: 'appsCrm.customerDetails',
        path: `${APP_PREFIX_PATH}/crm/lead`,
        component: lazy(() => import('@/views/crm/LeadsDetails')),

        authority: [],
        meta: {},
    },
    // {
    //     key: 'appsCrm.quotationform',
    //     path: `${APP_PREFIX_PATH}/crm/project/quotation-form`,
    //     component: lazy(() => import('@/views/crm/CustomerDetail/components/QuotationForm')),
    //
    //

    //     meta: {
    //         header: 'Quotation',
    //         headerContainer: true,
    //     },
    // },

    {
        key: 'appsSales.productNew',
        path: `${APP_PREFIX_PATH}/crm/lead-new`,
        component: lazy(() => import('@/views/crm/CrmDashboard/LeadNew')),

        authority: [],
        meta: {
            header: 'Add Lead',
        },
    },

    {
        key: 'appsSales.productList',
        path: `${APP_PREFIX_PATH}/leads`,
        component: lazy(() => import('@/views/crm/LeadList')),

        authority: [],
    },

    {
        key: 'appsSales.productNew',
        path: `${APP_PREFIX_PATH}/crm/lead-project`,
        component: lazy(() => import('@/views/crm/ProjectNew')),

        authority: [],
        meta: {
            header: 'Add Project',
        },
    },
    {
        key: 'appsSales.orderList',
        path: `${APP_PREFIX_PATH}/sales/order-list`,
        component: lazy(() => import('@/views/crm/Inventory')),

        authority: [],
    },
]

export default appsRoute
