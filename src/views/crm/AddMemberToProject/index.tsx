import React, { useEffect, useState } from 'react';
import { Formik, Field, Form } from 'formik';
import axios from 'axios';
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import { apiAddMember } from '@/services/AuthService';
import { apiGetUsers } from '@/services/CommonService';
import { apiGetCrmProjects } from '@/services/CrmService';
import { set } from 'lodash';
import { useRoleContext } from '../Roles/RolesContext';

interface FormValues {
  id: string;
  role: string;
  user_name: string;
  project_id: string;
}

interface User {
  username: string;
  role: string;
}
interface Projects {
  project_id: string;
  project_name: string;
}
const response = await apiGetUsers();
const projects = await apiGetCrmProjects();
const id=localStorage.getItem('userId');
const token=localStorage.getItem('auth');
const Index = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Projects[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading,setLoading]=useState(false)
  const {rolelist}=useRoleContext();

  const Options = rolelist.data.
  filter((role)=>role!=='ADMIN'&& role!=='Senior Architect')
  .map((role) => ({ value: role, label: role }));

  useEffect(() => {
    const fetchUsers = async () => {
      setUsers(response.data);
      setSelectedProject(projects.data.projects);
    };

    fetchUsers();
  },[]);
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) => user.role === selectedRole)
    );
    setFilteredProjects(
      projects.data.projects
    );
  }, [selectedRole, users]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true)
    const response=await apiAddMember(values,token);
    const responseData=  await response.json();
    setLoading(false)
    if(response.status===200){
     
      toast.push(
        <Notification closable type="success" duration={2000}>
            Member Added Successfully
        </Notification>
    
     )
      
    }
    else{
      toast.push(
        <Notification closable type="danger" duration={2000}>
            {responseData.errorMessage}
        </Notification>
    
     )
      console.log(responseData);
      
    }
    console.log(responseData);
  };

  return (
    <Formik
      initialValues={{
        id:id || '',
        role: '',
        user_name: '',
        project_id: '',
      }}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue }) => (
        <Form className='w-2/5'>
          <h3 className='mb-4'>Add User To Project</h3>
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
          <FormItem label="Project">
          <Select
              options={filteredProjects.map((project) => ({ value: project.project_id, label: project.project_name }))}
              onChange={(option) => setFieldValue('project_id', option?.value || '')}
            />
          </FormItem>

          <Button type="submit" variant='solid' loading={loading} block>{loading?'Submitting...':'Submit'}</Button>
        </Form>
      )}
    </Formik>
  );
};

export default Index;