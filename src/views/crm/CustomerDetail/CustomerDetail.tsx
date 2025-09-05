import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import CustomerProfile from './components/CustomerProfile'
import useQuery from '@/utils/hooks/useQuery'
import MOM from './components/MOM/Mom'
import { Button, Dropdown, Notification, Skeleton, Tabs, toast } from '@/components/ui'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import TabContent from '@/components/ui/Tabs/TabContent'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiCreateCrmExecTask, apiGetCrmExecutionTask, apiGetCrmProjectsMom, apiGetCrmProjectsTaskData, apiGetCrmSingleProjectQuotation, apiGetCrmSingleProjectReport, apiGetCrmSingleProjects, apiGetUsersList, apiGetUsersListProject, apiDeactivateProject, apiDeleteInactiveProject, apiReactivateProject } from '@/services/CrmService'
import Index from './Quotation'
import Task from './Task/index'
import Activity from './Project Progress/Activity'
import Timeline from './Timeline/Timeline'
import { AuthorityCheck, ConfirmDialog } from '@/components/shared'
import { useRoleContext } from '../Roles/RolesContext'
import { Customer, Data, Tasks } from './store'
import { FileItemType } from './Quotation/Quotations'
import Assignee, { UsersResponse } from './Project Progress/Assignee'
import { update } from 'lodash'
import { GoChevronDown } from 'react-icons/go'

import PdfTextLinker from '../PdfTextLinkerProject'
import Visualizer from '../Visualizer/Visualizer'
// import ExexutionTimeline from './Project Progress/ExexutionTimeline'

import ExexutionTimeline from './Project Progress/ExexutionTimeline'



export type QuotationResponseType = {
  code: number;
  data: FileItemType[];
}

export type TaskResponse = {
  code: number;
  data: Tasks[]

}

export type UserList = {
  code: number;
  data: string[];
}
export type ProjectResponseType = {
  data: Customer[]
}

export type ReportResponse = {
  code: number;
  data: ReportData[];
}

type ReportData = {
  percentage: number;
  task_name: string;
}



const CustomerDetail = () => {
  const query = useQuery()
  const [loading, setLoading] = useState(true);
  interface QueryParams {
    id: string;
    project_id: string;
    mom: string

  }
  const [fileData, setFileData] = useState<FileItemType[]>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const { roleData } = useRoleContext();
  const queryParams = new URLSearchParams(location.search);
  const allQueryParams: QueryParams = {
    id: queryParams.get('id') || '',
    project_id: queryParams.get('project_id') || '',
    mom: queryParams.get('type') || '',
  };
  const [details, setDetails] = useState<any | null>(null);
  const [projectData, setProjectData] = useState<any>()
  const [execData, setExecData] = useState<any>()
  // console.log(projectData)
  const [task, setTaskData] = useState<Tasks[]>([])
  const [data, setData] = useState<any>([])
  const [report, setReport] = useState<ReportResponse>()
  const [activity, setActivity] = useState<any>()
  const [users, setUsers] = useState<any>([]) 
  const quotationAccess = role === 'SUPERADMIN' ? true : roleData?.data?.quotation?.read?.includes(`${localStorage.getItem('role')}`)
  const momAccess = role === 'SUPERADMIN' ? true : roleData?.data?.mom?.read?.includes(`${localStorage.getItem('role')}`)
  const taskAccess = role === 'SUPERADMIN' ? true : roleData?.data?.task?.read?.includes(`${localStorage.getItem('role')}`)
  const projectAccess = role === 'SUPERADMIN' ? true : roleData?.data?.project?.read?.includes(`${localStorage.getItem('role')}`)

  const org_id = localStorage.getItem('orgId')

  // Project deletion state and functions
  const [dialogIsOpen2, setIsOpen2] = useState(false)
  const [dialogIsOpen4, setIsOpen4] = useState(false)
  const [dialogIsOpen5, setIsOpen5] = useState(false)
  const projectUpdateAccess = role === 'SUPERADMIN' ? true : roleData?.data?.project?.update?.includes(`${localStorage.getItem('role')}`)
  const projectDeleteAccess = role === 'SUPERADMIN' ? true : roleData?.data?.project?.delete?.includes(`${localStorage.getItem('role')}`)

  const openDialog2 = () => {
    setIsOpen2(true)
  }

  const onDialogClose2 = () => {
    setIsOpen2(false)
  }

  const openDialog4 = () => {
    setIsOpen4(true)
  }

  const onDialogClose4 = () => {
    setIsOpen4(false)
  }

  const openDialog5 = () => {
    setIsOpen5(true)
  }

  const onDialogClose5 = () => {
    setIsOpen5(false)
  }

  const deactivateProject = async () => {
    const values = {
      project_id: allQueryParams.project_id,
      org_id,
      content: '',
    }

    try {
      const response = await apiDeactivateProject(values)
      if (response.code === 200) {
        toast.push(
          <Notification type='success' duration={2000} closable>
            Project deactivated successfully
          </Notification>
        )
        window.location.reload()
      } else {
        toast.push(
          <Notification type='danger' duration={2000} closable>
            Error deactivating project
          </Notification>
        )
      }
    } catch (error: any) {
      console.log(error)
      toast.push(
        <Notification type='danger' duration={2000} closable>
          Error deactivating project
        </Notification>
      )
    }
  }

  const handleDeleteInactiveProject = async () => {
    try {
      if (projectData[0]?.status === 'Inactive') {
        const res = await apiDeleteInactiveProject(allQueryParams.project_id);
        toast.push(
          <Notification closable type="success" duration={2000}>
            Project deleted successfully
          </Notification>, { placement: 'top-end' }
        )
        navigate('/app/crm/projects');
        window.location.reload()
      }
    } catch (error) {
      toast.push(
        <Notification closable type="danger" duration={2000}>
          Error deleting project
        </Notification>, { placement: 'top-end' }
      )
    }
  }

  const reactivateProject = async () => {
    const values = {
      project_id: allQueryParams.project_id,
      org_id,
      content: '',
    }
    try {
      const response = await apiReactivateProject(values);
      if (response?.errorMessage) {
        toast.push(
          <Notification closable type="danger" duration={2000}>
            {response?.errorMessage}
          </Notification>, { placement: 'top-end' }
        )
      } else {
        toast.push(
          <Notification closable type="success" duration={2000}>
            Project reactivated successfully
          </Notification>, { placement: 'top-end' }
        )
        window.location.reload()
      }
    } catch (error) {
      toast.push(
        <Notification closable type="danger" duration={2000}>
          Error reactivating project
        </Notification>, { placement: 'top-end' }
      )
    }
  }

  const handleTabChange = (selectedTab: any) => {
    const currentUrlParams = new URLSearchParams(location.search);
    currentUrlParams.set('type', selectedTab);
    navigate(`${location.pathname}?${currentUrlParams.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiGetCrmSingleProjects(allQueryParams.project_id, org_id);
        const Report = await apiGetCrmSingleProjectReport(allQueryParams.project_id, org_id);
        const list = await apiGetUsersList(allQueryParams.project_id)
        const exec = await apiGetCrmExecutionTask(allQueryParams.project_id)

        // console.log(list)
        const data = response
        setActivity(data.data)
        setExecData(exec.data)
        setProjectData(data.data)
        setLoading(false);
        setReport(Report)
        setUsers(list.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Function to refresh execution data
  const refreshExecData = async () => {
    try {
      const exec = await apiGetCrmExecutionTask(allQueryParams.project_id);
      setExecData(exec.data);
    } catch (error) {
      console.error('Error refreshing exec data:', error);
    }
  };

  useEffect(() => {
    if (!quotationAccess) return;

    const fetchDataAndLog = async () => {
      try {
        const leadData = await apiGetCrmSingleProjectQuotation(allQueryParams.project_id);
        const response = await apiGetUsersListProject(allQueryParams.project_id)

        const data: UsersResponse = response

        setData(data.data)
        // console.log(data)

        setFileData(leadData.data);
      } catch (error) {
        console.error('Error fetching lead data', error);
      }
    };

    fetchDataAndLog();
  }, [allQueryParams.project_id, quotationAccess]);
  useEffect(() => {
    if (!momAccess) return;

    const fetchDataAndLog = async () => {
      try {
        const response = await apiGetCrmProjectsMom(allQueryParams.project_id, org_id);
        setDetails(response.data);
      } catch (error) {
        console.error('Error fetching lead data', error);
      }
    };

    fetchDataAndLog();
  }, [allQueryParams.project_id, quotationAccess]);


  useEffect(() => {
    if (!taskAccess) return;

    const fetchDataAndLog = async () => {
      try {
        const taskResponse = await apiGetCrmProjectsTaskData(allQueryParams.project_id, org_id);
        // console.log(taskResponse.data)
        setTaskData(taskResponse.data);
      } catch (error) {
        console.error('Error fetching task data', error);
      }
    };

    fetchDataAndLog();
  }, [allQueryParams.project_id, taskAccess]);

  const Toggle =
    <Button variant='solid' size='sm' className='flex justify-center items-center gap-2'>
      <span>Design View</span><span><GoChevronDown /></span></Button>

  return (
    <>

      <span className='flex justify-between'>
        <h3 className='pb-5 capitalize flex items-center'><span>Project-</span>{loading ? <Skeleton width={100} /> : projectData[0]?.project_name}</h3>

        <div className=''>
          <Dropdown renderTitle={
            <Button variant='solid' size='sm' className='flex justify-center items-center gap-4'>
              <span>Actions</span>
              <span><GoChevronDown /></span>
            </Button>
          } placement='middle-end-top' >

            {<AuthorityCheck
                userAuthority={[`${localStorage.getItem('role')}`]}
                authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.read ?? []}
            >
                <Link to={`/app/crm/projects/blueprint?project_id=${allQueryParams.project_id}`}><Dropdown.Item eventKey="d">2D View</Dropdown.Item></Link>
            </AuthorityCheck>}

            {<AuthorityCheck
                userAuthority={[`${localStorage.getItem('role')}`]}
                authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.read ?? []}
            >
                <Link to={`/app/crm/visualizer?project_id=${allQueryParams.project_id}`}><Dropdown.Item eventKey="g">3D View</Dropdown.Item></Link>
            </AuthorityCheck>}

            {projectData && projectData[0]?.status === "Inactive" && projectDeleteAccess && <AuthorityCheck
                userAuthority={[`${localStorage.getItem('role')}`]}
                authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.delete ?? []}
            >
                <Dropdown.Item eventKey="delete" onClick={() => openDialog2()}><div>Delete Project</div></Dropdown.Item>
            </AuthorityCheck>}

            {projectData && projectData[0]?.status === "Inactive" && projectUpdateAccess && <AuthorityCheck
                userAuthority={[`${localStorage.getItem('role')}`]}
                authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.update ?? []}
            >
                <Dropdown.Item eventKey="reactivate" onClick={() => openDialog5()}><div>Reactivate Project</div></Dropdown.Item>
            </AuthorityCheck>}

            {projectData && projectData[0]?.status !== "Inactive" && projectUpdateAccess && <AuthorityCheck
                userAuthority={[`${localStorage.getItem('role')}`]}
                authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.update ?? []}
            >
                <Dropdown.Item eventKey="deactivate" onClick={() => openDialog4()}><div>Deactivate Project</div></Dropdown.Item>
            </AuthorityCheck>}
          </Dropdown>
        </div>

        {/* {<AuthorityCheck
                  userAuthority={[`${localStorage.getItem('role')}`]}
                  authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.lead?.read ?? []}
              >
              <Dropdown.Item
                  eventKey="d"
                  onMouseEnter={() => setIsOpen6(true)}
                  onMouseLeave={() => setIsOpen6(false)}
                  >
                  <div className="relative">

                      <div className='flex gap-3 justify-between items-center'>
                          <span>Design View</span>
                          <span><GoChevronDown /></span>
                      </div>
                      
                      {isOpen6 && (
                      <div
                          ref={dropdownRef}
                          className="absolute left-14 transform -translate-x-full mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg"
                      >
                          <ul className="py-2">
                          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"><Link to={`/app/crm/leads/blueprint?lead_id=${myParam}`}>2D View</Link></li>
                          <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"><Link to={`/app/crm/visualizer?lead_id=${myParam}`}>3D View</Link></li>
                          </ul>
                      </div>
                      )}
                  </div>
                  </Dropdown.Item>                      
              </AuthorityCheck>}
          </Dropdown> */}


      </span>
      <div>


        {loading ? <Skeleton height={400} /> :
          <Tabs defaultValue={allQueryParams.mom} onChange={handleTabChange}>
            <TabList>
              <TabNav value="details">Details</TabNav>
              {quotationAccess &&
                <TabNav value="Quotation">Quotation</TabNav>
              }
              <>
                {momAccess &&
                  <TabNav value="mom" >MOM</TabNav>
                }
                {taskAccess &&
                  <TabNav value="task">Internal Task Manager</TabNav>
                }
                {
                  <TabNav value="exectimeline">Execution Timeline</TabNav>
                }
                <AuthorityCheck
                  userAuthority={[`${localStorage.getItem('role')}`]}
                  authority={['ADMIN', 'SUPERADMIN']}
                >
                  <TabNav value="activity">Project Activity</TabNav>
                </AuthorityCheck>
                {taskAccess &&
                  <TabNav value="timeline">Timeline</TabNav>
                }
                {
                  <TabNav value="assignee" className='flex gap-1'>
                    <span>Assignee</span>
                    <span className={data?.length == 0 ? "text-red-500" : ""}>{"("}{data?.length}{")"}</span>
                  </TabNav>
                }
                {
                  <TabNav value="2dview" className='flex gap-1'>
                    <AuthorityCheck
                      userAuthority={[`${localStorage.getItem('role')}`]}
                      authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.read ?? []}
                    >
                      {/* <Link to={`/app/crm/projects/blueprint?project_id=${allQueryParams.project_id}`}> */}
                      2D View
                      {/* </Link> */}

                    </AuthorityCheck>
                  </TabNav>
                }
                {
                  <TabNav value="3dview" className='flex gap-1'>
                    <AuthorityCheck
                      userAuthority={[`${localStorage.getItem('role')}`]}
                      authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.read ?? []}
                    >
                      {/* <Dropdown.Item eventKey="g">*/}
                      {/* <Link to={`/app/crm/visualizer?project_id=${allQueryParams.project_id}`}> */}
                      3D View
                      {/* </Link> */}
                      {/* </Dropdown.Item> */}

                    </AuthorityCheck>
                  </TabNav>
                }
              </>

            </TabList>
            <div className="p-4">
              <TabContent value="details">
                {loading ? <Skeleton width={150} /> :
                  <Container>
                    <CustomerProfile data={projectData[0]} report={report} />
                  </Container>}
              </TabContent>
              <TabContent value="Quotation">
                <Index data={fileData} />
              </TabContent>
              <TabContent value="mom">
                <MOM data={details} />
              </TabContent>
              <TabContent value="task">
                <Task task={task} users={users} />
              </TabContent>
              <TabContent value="activity">
                <Activity Data={activity[0]} />
              </TabContent>
              <TabContent value="timeline">
                <Timeline />
              </TabContent>
              <TabContent value="assignee">
                <Assignee data={data} />
              </TabContent>
              <TabContent value="exectimeline">
                <ExexutionTimeline execData={execData} onRefreshData={refreshExecData} />
              </TabContent>
              <TabContent value="2dview">
                <PdfTextLinker />
              </TabContent>
              <TabContent value="3dview">
                <Visualizer />
              </TabContent>

            </div>
          </Tabs>}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={dialogIsOpen2}
        type="danger"
        onClose={onDialogClose2}
        confirmButtonColor="red-600"
        onCancel={onDialogClose2}
        onConfirm={handleDeleteInactiveProject}
        title="Delete Project"
        onRequestClose={onDialogClose2}>
        <p>Are you sure you want to delete this project? This action cannot be undone.</p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={dialogIsOpen4}
        type="warning"
        onClose={onDialogClose4}
        confirmButtonColor="amber-600"
        onCancel={onDialogClose4}
        onConfirm={deactivateProject}
        title="Deactivate Project"
        onRequestClose={onDialogClose4}>
        <p>Are you sure you want to deactivate this project? You can reactivate it later if needed.</p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={dialogIsOpen5}
        type="success"
        onClose={onDialogClose5}
        confirmButtonColor="green-600"
        onCancel={onDialogClose5}
        onConfirm={reactivateProject}
        title="Reactivate Project"
        onRequestClose={onDialogClose5}>
        <p>Are you sure you want to reactivate this project? This will make it active again and available for normal operations.</p>
      </ConfirmDialog>
    </>);

};


export default CustomerDetail
