import Header from '@/components/template/Header'
import SidePanel from '@/components/template/SidePanel'
import UserDropdown from '@/components/template/UserDropdown'
import LanguageSelector from '@/components/template/LanguageSelector'
import Notification from '@/components/template/Notification'
import HeaderLogo from '@/components/template/HeaderLogo'
import SecondaryHeader from '@/components/template/SecondaryHeader'
import MobileNav from '@/components/template/MobileNav'
import View from '@/views'
import { UserDetailsProvider } from '@/views/Context/userdetailsContext'
import { RoleProvider } from '@/views/crm/Roles/RolesContext'
import { LeadProvider } from '@/views/crm/LeadList/store/LeadContext'
import { ProjectProvider } from '@/views/crm/Customers/store/ProjectContext'

const HeaderActionsStart = () => {
    return (
        <>
            <HeaderLogo />
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

const DeckedLayout = () => {
    return (
        <div className="app-layout-simple flex flex-auto flex-col min-h-screen">
            <div className="flex flex-auto min-w-0">
            <UserDetailsProvider>
                <ProjectProvider>
            <LeadProvider>
            <RoleProvider>
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        container
                        className="shadow dark:shadow-2xl"
                        headerStart={<HeaderActionsStart />}
                        headerEnd={<HeaderActionsEnd />}
                    />
                    <SecondaryHeader contained />
                   
                    <View pageContainerType="contained" />
                </div>
                    </RoleProvider>
                    </LeadProvider>
                    </ProjectProvider>
                    </UserDetailsProvider>
            </div>
        </div>
    )
}

export default DeckedLayout
