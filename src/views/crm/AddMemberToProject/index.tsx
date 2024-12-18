import React, { useEffect, useState } from 'react';
import { Formik, Field, Form, useFormikContext } from 'formik';
import axios from 'axios';
import { Button, FormItem, Input, Notification, Select, toast } from '@/components/ui';
import { apiAddMember } from '@/services/AuthService';
import { apiGetAllUsersList } from '@/services/CrmService';
import { apiGetCrmProjects } from '@/services/CrmService';
import { set } from 'lodash';
import { useRoleContext } from '../Roles/RolesContext';

export type ProjectResponse = {
  code: number;
  data: Data;
  errorMessage: string;
}

type Data = {
  Design_Execution: number;
  Design_Phase: number;
  Execution_Phase: number;
  active_Project: number;
  archive: number;
  commercial: string;
  residential: string;
  completed: number;
  total_Project: number;
  projects: ProjectData[];

}

type ProjectData = {
  client: Client[];
  client_name: string;
  designer: string;
  project_end_date: string;
  project_id: string;
  project_name: string;
  project_start_date: string;
  project_status: string;
  project_type: string;
}

type Client = {
  client_contact: string;
  client_email: string;
  client_name: string;
}

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


const id=localStorage.getItem('userId');
const token=localStorage.getItem('auth');


const Index = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  // console.log(filteredUsers)
  const [filteredProjects, setFilteredProjects] = useState<Projects[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false)
  const { rolelist } = useRoleContext();
  const queryParams = new URLSearchParams(location.search);
  const org_id = localStorage.getItem('orgId')

  const projectId: any = queryParams.get('project_id')



  const Options = rolelist.filter((role) => role !== 'ADMIN' && role !== 'Senior Architect').map((role) => ({ value: role, label: role }));

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await apiGetAllUsersList()
      const projects = await apiGetCrmProjects(org_id);
      setUsers(response.data);
      setFilteredProjects(projects.data.projects);
    };

    fetchUsers();
  }, []);
 


  useEffect(() => {

    const func = async () => {

      

      setFilteredUsers(
        users.filter((user: any) => user.role === selectedRole)
      );
  

    }

    func()

  }, [selectedRole, users]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true)
    const response = await apiAddMember(values);


    setLoading(false)
    if (response?.code === 200) {

      toast.push(
        <Notification closable type="success" duration={2000}>
          Member Added Successfully
        </Notification>

      )

    }
    else {
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
        id: id || '',
        org_id,
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

          <Button type="submit" variant='solid' loading={loading} block>{loading ? 'Submitting...' : 'Submit'}</Button>
        </Form>
      )}
    </Formik>
  );
};

export default Index;