import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import { useAppSelector } from '@/store'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import {  HiOutlineLogout, HiOutlineUser, HiOutlineUserAdd, HiUser } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import { AiOutlineUser, AiOutlineUserAdd, } from 'react-icons/ai'
import { useContext } from 'react'
import { UserDetailsContext } from '@/views/Context/userdetailsContext'
import { useRoleContext } from '@/views/crm/Roles/RolesContext'
import { AuthorityCheck } from '../shared'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
    authority?: string[]
}


const _UserDropdown = ({ className }: CommonProps) => {
    const role=localStorage.getItem('role')
    const data=useContext(UserDetailsContext)
    const {roleData}=useRoleContext()
    
    
    const dropdownItemList: DropdownList[] = [
        {
            label:"My Profile",
            path:"/app/crm/profile?type=profile",
            icon:<AiOutlineUser/>,
            authority:[
                `${localStorage.getItem('role')}`
            ]
        
            },
        {
        label:"Add User to Project",
        path:"/app/crm/addmember",
        icon:<AiOutlineUserAdd/>,
        authority: role==='SUPERADMIN'?['SUPERADMIN']:roleData?.data?.addMember?.create
    
        },
        {
        label:"Create User",
        path:"/app/crm/register",
        icon:<AiOutlineUserAdd/>,
        authority: role==='SUPERADMIN'?['SUPERADMIN']:roleData?.data?.user?.create    
        },
        {
        label:"Add User to Lead",
        path:"/app/crm/addUserToLead",
        icon:<AiOutlineUserAdd/>,
        authority: role==='SUPERADMIN'?['SUPERADMIN']:roleData?.data?.addMember?.create
    
        },
        
      
    ]

    const {  authority, email } = useAppSelector(
        (state) => state.auth.user
    )

    const { signOut } = useAuth()
  
    

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-2')}>
            {data?.avatar.length ===0 ? <HiOutlineUser className=' text-xl'/>:<img src={data?data.avatar:""} className='w-8' alt="" />}
           
            <div className="hidden md:block">
                <div className="text-xs capitalize">
                    {authority?.[0] || 'guest'}
                </div>
               
            </div>
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-2">
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                            </div>
                            <div className="text-xs">{email}</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />

                {dropdownItemList.map((item) => {
                
                        return (
                            <AuthorityCheck
                            key={item.label}
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={item.authority??[]}
                            >
                        <div>
                            <Dropdown.Item
                            key={item.label}
                            eventKey={item.label}
                            className="mb-1 px-0"
                            >
                            <Link 
                                className="flex h-full w-full px-2" 
                                to={item.path}
                            >
                                <span className="flex gap-2 items-center w-full">
                                <span className="text-xl opacity-50">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                                </span>
                            </Link>
                            </Dropdown.Item>
                            <Dropdown.Item variant="divider" />
                        </div>
                        </AuthorityCheck>
                        );
                    }
                    )}
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50">
                        <HiOutlineLogout />
                    </span>
                    <span>Sign Out</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
