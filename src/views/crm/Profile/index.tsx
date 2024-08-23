import { Tabs } from '@/components/ui'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import React from 'react'
import Profile from './profile'
import Password from './passsword'
import Users from '../users'
import { UserDetailsProvider } from '@/views/Context/userdetailsContext'
import Roles from './Roles'
import { useRoleContext } from '../Roles/RolesContext'
import { AuthorityCheck } from '@/components/shared'
import ArchivedUsers from '../users/ArchivedUsers'

const Index = () => {
    const userRole=localStorage.getItem('role')
    const {roleData}=useRoleContext()
  return (<div className='px-4'>
    <h3 className='mb-5'>My Profile</h3>
    <Tabs defaultValue="tab1">
    <TabList>
        <TabNav value="tab1">Profile</TabNav>
        <TabNav value="tab2">Password</TabNav>
        <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.user?.read??[]}
                    >
         <TabNav value="tab3">Users</TabNav>
         </AuthorityCheck>
        <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.role?.read??[]}
                    >
        <TabNav value="tab4">Roles</TabNav>
        </AuthorityCheck>
        <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.user?.read??[]}
                    >
         <TabNav value="Archived Users">Archived Users</TabNav>
         </AuthorityCheck>
    </TabList>
    <div className="p-4">
        <TabContent value="tab1">
           <UserDetailsProvider>
        <Profile/>
        </UserDetailsProvider>
        </TabContent>
        <TabContent value="tab2">
            <Password/>
        </TabContent>
        <TabContent value="tab3">
           <Users/>
        </TabContent>
        <TabContent value="tab4">
           <Roles/>
        </TabContent>
        <TabContent value="Archived Users">
           <ArchivedUsers/>
        </TabContent>
    </div>
</Tabs>
</div>
  )
}

export default Index