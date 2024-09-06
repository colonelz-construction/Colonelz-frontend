import React, { useEffect, useState } from 'react';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import { apiAddMember, apiAddMemberToLead } from '@/services/AuthService';
import { apiGetUsers } from '@/services/CrmService';
import { apiGetCrmLeads, apiGetCrmProjects } from '@/services/CrmService';
import { useRoleContext } from '../Roles/RolesContext';

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
const response = await apiGetUsers();
const leads = await apiGetCrmLeads();
console.log(leads)
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
  const Options = rolelist.
  filter((role)=>role!=='ADMIN'&&role!=='Senior Architect')
  .map((role:string) => ({ value: role, label: role }));

  useEffect(() => {
    const fetchUsers = async () => {
      setUsers(response.data);
      console.log(leads);
      
      setSelectedProject(leads.data.leads);
    };

    fetchUsers();
  },[]);
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) => user.role === selectedRole)
    );
    setFilteredLeads(
      leads.data.leads
    );
  }, [selectedRole, users]);

  

  const handleSubmit = async (values: FormValues) => {
    setLoading(true)
    const response=await apiAddMemberToLead(values);
    setLoading(false)
    if(response.code===200){
     
      toast.push(
        <Notification closable type="success" duration={2000}>
            Member Added Successfully
        </Notification>
    
     )
      
    }
    else{
      toast.push(
        <Notification closable type="danger" duration={2000}>
            {response.errorMessage}
        </Notification>
    
     )
      
    }
  };

  return (
    <Formik
      initialValues={{
        id:id || '',
        role: '',
        user_name: '',
        lead_id: '',
      }}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue }) => (
        <Form className='w-2/5'>
          <h3 className='mb-4'>Add User To Lead</h3>
          <FormItem label="Role">
            <Select
              options={Options}
              onChange={(option) => {
                setSelectedRole(option?.value || null);
                setFieldValue('role', option?.value || '');
              }}
            />
          </FormItem>
          <FormItem label="User Name">
            <Select
              options={filteredUsers.map((user) => ({ value: user.username, label: user.username }))}
              onChange={(option) => setFieldValue('user_name', option?.value || '')}
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