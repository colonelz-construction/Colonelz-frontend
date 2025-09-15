import { Tabs } from '@/components/ui'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import React, { useContext, useEffect, useState } from 'react'
import Profile, { ProfileFormModel } from './profile'
import Password from './passsword'
import Users from '../users'
import { UserDetailsContext} from '@/views/Context/userdetailsContext'
import { apiGetUserData } from '@/services/CrmService'
import Roles from './Roles'
import { useRoleContext } from '../Roles/RolesContext'
import { AuthorityCheck } from '@/components/shared'
import ArchivedUsers from '../users/ArchivedUsers'
import { useNavigate } from 'react-router-dom'

  const Index = () => {
    const userRole=localStorage.getItem('role') || ''
    const {roleData}=useRoleContext()
    const data = useContext(UserDetailsContext);
    const [userData, setUserData] = useState<any>(data)
    
    const navigate = useNavigate();

    interface QueryParams {
      type:string
    
    }
    const queryParams = new URLSearchParams(location.search);

    const allQueryParams: QueryParams = {
      type: queryParams.get('type') || '',
    };

    const handleTabChange = (selectedTab:any) => {
      const currentUrlParams = new URLSearchParams(location.search);
      currentUrlParams.set('type', selectedTab);
      navigate(`${location.pathname}?${currentUrlParams.toString()}`);
  };
  
  useEffect(() => {
    const fetchFresh = async () => {
      try {
        const res = await apiGetUserData(localStorage.getItem('userId'))
        setUserData(res.data)
      } catch (e) {
        // silent
      }
    }
    if (allQueryParams.type === 'profile') {
      fetchFresh()
    }
  }, [allQueryParams.type])
    
    const userAccess= userRole === 'SUPERADMIN' ? true : roleData?.data?.user?.read?roleData?.data?.user?.read.includes(userRole):false
    const roleAccess= userRole === 'SUPERADMIN' ? true : roleData?.data?.role?.read?roleData?.data?.role?.read.includes(userRole):false
    const archivedAccess= userRole === 'SUPERADMIN' ? true : roleData?.data?.userArchive?.read?roleData?.data?.userArchive?.read.includes(userRole):false
    

    
  return (<div className='px-4'>
    <h3 className='mb-5'>My Profile</h3>
    <Tabs defaultValue={allQueryParams.type} onChange={handleTabChange}>
    <TabList>
        <TabNav value="profile">Profile</TabNav>
        <TabNav value="pass">Password</TabNav>
       {userAccess &&
         <TabNav value="users">Users</TabNav>
       }
      {roleAccess &&
        <TabNav value="roles">Roles</TabNav>
        }
      {archivedAccess &&
         <TabNav value="archived">Archived Users</TabNav>
         }
    </TabList>
    <div className="p-4">
        <TabContent value="profile">
          <Profile
            data={userData}
            onUpdated={async () => {
              try {
                const res = await apiGetUserData(localStorage.getItem('userId'))
                setUserData(res.data)
              } catch (e) {}
            }}
          />
        </TabContent>
        <TabContent value="pass">
            <Password/>
        </TabContent>
        <TabContent value="users">
           <Users/>
        </TabContent>
        <TabContent value="roles">
           <Roles/>
        </TabContent>
        <TabContent value="archived">
           <ArchivedUsers/>
        </TabContent>
    </div>
</Tabs>
</div>
  )
}

export default Index