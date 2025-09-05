import React, { useEffect, useState } from 'react';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import { apiAddMember, apiAddMemberToLead, apiAddBulkMembersToLead } from '@/services/AuthService';
import { apiGetAllUsersList } from '@/services/CrmService';
import { apiGetCrmLeads } from '@/services/CrmService';
import { useRoleContext } from '../Roles/RolesContext';
import { useNavigate } from 'react-router-dom';

export type LeadResponseType = {
  code: number;
  data: LeadDataType;
}

type LeadDataType = {
  leads: DataType[];
}

type DataType = {
  date: string;
  email: string;
  lead_id: string;
  location: string;
  name: string;
  phone: string;
  status: string;

}

interface FormValues {
  id: string;
  role: string;
  user_name: string;
  lead_id: string;
}

export type UserResponse = {

  code: number;
  data: User[];
  errorMessage: string;
}

export interface User {
  username: string;
  role: string;
  email: string;
  UserId: string;
}
interface Projects {
  lead_id: string;
  name: string;
}



const id=localStorage.getItem('userId');
const token=localStorage.getItem('auth');
const Index = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Projects[]>([]);
  const [selectedProject, setSelectedProject] = useState<DataType[]>([]);
  const [loading,setLoading]=useState(false)
  const {rolelist}=useRoleContext()
  const org_id = localStorage.getItem('orgId')
  const navigate = useNavigate();

  const Options = rolelist.
  filter((role)=>role!=='ADMIN'&&role!=='Senior Architect')
  .map((role:string) => ({ value: role, label: role }));

  useEffect(() => {
    const fetchUsers = async () => {
      const list :any=await apiGetAllUsersList()

      const leads = await apiGetCrmLeads();
      setUsers(list.data);
      
      
      setSelectedProject(leads.data.leads);
    };

    fetchUsers();
  },[]);

  useEffect(() => {

    const func = async () => {

      const leads = await apiGetCrmLeads();
      setFilteredUsers(
        users.filter((user) => user.role === selectedRole)
      );
      setFilteredLeads(
        leads.data.leads
      );
      
    }

    func();
    
  }, [selectedRole, users]);

  

  const handleSubmit = async (values: any) => {
    setLoading(true)

    // Check if multiple users are selected
    const isMultipleUsers = Array.isArray(values.user_name) && values.user_name.length > 1;

    if (isMultipleUsers) {
      // Handle bulk assignment
      const users = values.user_name.map((username: string) => ({
        user_name: username,
        role: values.role
      }));

      const bulkData = {
        id: values.id,
        lead_id: values.lead_id,
        users: users,
        org_id: values.org_id
      };

      const response = await apiAddBulkMembersToLead(bulkData);
      setLoading(false)

      if (response?.code === 200) {
        toast.push(
          <Notification closable type="success" duration={2000}>
            {response.message}
          </Notification>
        )
        navigate(`/app/crm/lead/?id=${values.lead_id}&tab=AddedUser`);
      } else {
        toast.push(
          <Notification closable type="danger" duration={2000}>
            {response.errorMessage}
          </Notification>
        )
      }
    } else {
      // Handle single user assignment (existing logic)
      const singleUserData = {
        ...values,
        user_name: Array.isArray(values.user_name) ? values.user_name[0] : values.user_name
      };

      const response = await apiAddMemberToLead(singleUserData);
      setLoading(false)

      if (response.code === 200) {
        toast.push(
          <Notification closable type="success" duration={2000}>
            Member Added Successfully
          </Notification>
        )
        navigate(`/app/crm/lead/?id=${values.lead_id}&tab=AddedUser`);
      } else {
        toast.push(
          <Notification closable type="danger" duration={2000}>
            {response.errorMessage}
          </Notification>
        )
      }
    }
  };

  return (
    <Formik
      initialValues={{
        id:id || '',
        org_id,
        role: '',
        user_name: [],
        lead_id: '',
      }}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue }) => (
        <Form className='w-2/5'>
          <h3 className='mb-4'>Add User(s) To Lead</h3>
          <FormItem label="Role">
            <Select
              options={Options}
              onChange={(option) => {
                setSelectedRole(option?.value || null);
                setFieldValue('role', option?.value || '');
              }}
            />
          </FormItem>
          <FormItem label="User Name(s)">
            <Select
              isMulti
              options={filteredUsers.map((user) => ({ value: user.username, label: user.username }))}
              onChange={(options) => {
                const selectedUsers = options ? options.map((option: any) => option.value) : [];
                setFieldValue('user_name', selectedUsers);
              }}
              placeholder="Select one or more users..."
            />
          </FormItem>
          <FormItem label="Lead Name">
          <Select
              options={filteredLeads.map((leads) => ({ value: leads.lead_id, label: leads.name }))}
              onChange={(option) => setFieldValue('lead_id', option?.value || '')}
            />
          </FormItem>

          <Button type="submit" variant='solid' loading={loading} block>{loading?'Submitting':'Submit'}</Button>
        </Form>
      )}
    </Formik>
  );
};

export default Index;