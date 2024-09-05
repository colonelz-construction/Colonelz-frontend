import Header from '@/components/template/Header'
import SidePanel from '@/components/template/SidePanel'
import UserDropdown from '@/components/template/UserDropdown'
import LanguageSelector from '@/components/template/LanguageSelector'
import Notification from '@/components/template/Notification'
import MobileNav from '@/components/template/MobileNav'
import StackedSideNav from '@/components/template/StackedSideNav'
import View from '@/views'
import { UserDetailsProvider } from '@/views/Context/userdetailsContext'
import { RoleProvider } from '@/views/crm/Roles/RolesContext'
import { LeadProvider } from '@/views/crm/LeadList/store/LeadContext'
import { ProjectProvider } from '@/views/crm/Customers/store/ProjectContext'

const HeaderActionsStart = () => {
    return (
        <>
            <MobileNav />
        </>
    )
}

const HeaderActionsEnd = () => {
    return (
        <>
            <Notification />
            <SidePanel />

            
            <UserDropdown hoverable={false} />
          
        </>
    )
}

const StackedSideLayout = () => {
    return (
        <div className="app-layout-stacked-side flex flex-auto flex-col">
            <div className="flex flex-auto min-w-0">
                <StackedSideNav />
                <UserDetailsProvider>
                    <ProjectProvider>
                <LeadProvider>
                    <RoleProvider>
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        className="shadow dark:shadow-2xl"
                        headerStart={<HeaderActionsStart />}
                        headerEnd={<HeaderActionsEnd />}
                    />
                    <div className="h-full flex flex-auto flex-col">
                        <View />
                    </div>
                </div>
                        </RoleProvider>
                        </LeadProvider>
                        </ProjectProvider>
                        </UserDetailsProvider>
            </div>
        </div>
    )
}

export default StackedSideLayout
