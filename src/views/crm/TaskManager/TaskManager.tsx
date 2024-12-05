import { Skeleton, Tabs } from '@/components/ui'
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
import { useState, useEffect } from 'react';
import Archive from '@/views/crm/FileManager/Components/Template/Archive/Components/Index'
// import { IoMdArchive } from "react-icons/io";
import { MdOutlineArchive } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import AllTask from './Components/AllTask';

const TaskManager = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';
  const { roleData, loading } = useRoleContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (roleData) {
      setIsLoading(false);
    }
  }, [roleData]);

  if (loading) {
    return <div><Skeleton height={400}/></div>;
  }

  const hasProjectTaskReadPermission = role === 'SUPERADMIN' ? true : roleData?.data?.task?.read?.includes(role);
  const hasLeadTaskReadPermission = role === 'SUPERADMIN' ? true :  roleData?.data?.task?.read?.includes(role);
  const hasAllTaskReadPermission = role === 'SUPERADMIN' ? true :  roleData?.data?.task?.read?.includes(role);

  // useEffect(() => {

  // }, [])

  

  //   interface QueryParams {
  //     tab:string
    
  //   }
  //   const queryParams = new URLSearchParams(location.search);

  //   const allQueryParams: QueryParams = {
  //     tab: queryParams.get('tab') || '',
  //   };

  //   const handleTabChange = (selectedTab:any) => {
  //     const currentUrlParams = new URLSearchParams(location.search);
  //     currentUrlParams.set('tab', selectedTab);
  //     navigate(`${location.pathname}?${currentUrlParams.toString()}`);
  // };

  return (
    <div>
      <Tabs 
        defaultValue={"leads"} /*onChange={handleTabChange}*/
      >
        <TabList>
          {hasLeadTaskReadPermission &&
            <TabNav value="leads" icon={<MdManageAccounts />}>
              Leads
            </TabNav>
          }
          {hasProjectTaskReadPermission &&
            <TabNav value="project" icon={<LuFileStack />}>
              Projects
            </TabNav>
          }
          {hasAllTaskReadPermission &&
            <TabNav value="all" icon={<GoRepoTemplate />}>
              All Tasks
            </TabNav>
}
          {/* {hasArchiveDataReadPermission &&
            <TabNav value="archive" icon={<MdOutlineArchive />}>
              Archive
            </TabNav>
} */}
        </TabList>
        <div className="p-4">
          <DataProvider>
            <TabContent value="leads">
              <Leads />
            </TabContent>

            <TabContent value="project">
              <Projects />
            </TabContent>
            <TabContent value="all">
              <AllTask />
            </TabContent>
            {/* <TabContent value="archive">
              <Archive />
            </TabContent> */}
          </DataProvider>
        </div>
      </Tabs>
    </div>
  );
}

export default TaskManager;