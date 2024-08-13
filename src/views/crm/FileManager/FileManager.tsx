import {  Tabs } from '@/components/ui'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import { MdManageAccounts } from "react-icons/md";
import TabNav from '@/components/ui/Tabs/TabNav'
import { GoRepoTemplate } from "react-icons/go";
import { LuFileStack } from "react-icons/lu";
import Leads from './Components/Leads';
import Projects from './Components/Projects';
import Template from './Components/Template';
import { DataProvider } from './FileManagerContext/FIleContext';
import { AuthorityCheck } from '@/components/shared';
import { useRoleContext } from '../Roles/RolesContext';

const FileManager = () => {
  const role=localStorage.getItem('role')
  const {roleData}=useRoleContext()
  return (
    <div>
    <Tabs 
    defaultValue="leads"
    >
        <TabList>
          <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.lead?.read??[]}
                    >
           <TabNav value="leads" icon={<MdManageAccounts />}>
           
                Leads
            </TabNav>
            </AuthorityCheck>
            <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.project?.read??[]}
                    >
  <TabNav value="project" icon={<LuFileStack />}>
    Projects
  </TabNav>
  </AuthorityCheck>

         {(role === 'ADMIN' || role === 'Senior Architect' || role === 'Jr. Executive HR & Marketing') && (
  <TabNav value="company" icon={<GoRepoTemplate />}>
    Company Data
  </TabNav>
)}
        </TabList>
        <div className="p-4">
          <DataProvider>
            <TabContent value="leads">
               <Leads/>
            </TabContent>
            <TabContent value="project">
               <Projects />
            </TabContent>
            <TabContent value="company">
                <Template/>
            </TabContent>
            </DataProvider>
        </div>
    </Tabs>
</div>
  )
}

export default FileManager