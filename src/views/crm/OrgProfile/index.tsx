import NoData from "@/views/pages/NoData"
import { Tabs } from '@/components/ui'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import React, { useContext } from 'react'
import Address from './address'
import Primary from "./primary"
import { UserDetailsContext} from '@/views/Context/userdetailsContext'
import { useRoleContext } from '../Roles/RolesContext'
import { AuthorityCheck } from '@/components/shared'
import { useNavigate } from 'react-router-dom'


const Index = () => {

     const userRole=localStorage.getItem('role') || ''
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
    return (<div className='px-4'>
        <h3 className='mb-5'>Organisation Profile</h3>
        <Tabs defaultValue={allQueryParams.type} onChange={handleTabChange}>
        <TabList>
            <TabNav value="primary-details">Primary Details</TabNav>
            <TabNav value="address">Billing and Shipping Details</TabNav>
        </TabList>
        <div className="p-4">
            <TabContent value="primary-details">
               <Primary/>
            </TabContent>
            <TabContent value="address">
               <Address/>
            </TabContent>
        </div>
    </Tabs>
    </div>
      )
}
export default Index