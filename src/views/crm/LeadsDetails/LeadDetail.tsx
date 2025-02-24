// for Individual Lead
import { useEffect, useState } from 'react'
import Container from '@/components/shared/Container'
import reducer, { getCustomer, useAppDispatch } from './store'
import { injectReducer } from '@/store'
import useQuery from '@/utils/hooks/useQuery'
import { useLocation, useNavigate } from 'react-router-dom';
import LeadForm from './components/LeadForm'
import { Button, Card, Dialog, Dropdown, Notification, Skeleton, Steps, Tabs, toast } from '@/components/ui'
import CustomerProfile from './components/LeadProfile'
import { apiDeleteInactiveLead, apiGetCrmLeadsDetails, apiGetCrmLeadsTaskData, apiGetCrmLeadsUpdates, apiGetCrmSingleLeadReport, apiGetCrmUsersAssociatedToLead } from '@/services/CrmService'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import TabContent from '@/components/ui/Tabs/TabContent'
import Contract from '../CustomerDetail/components/Contract'
import { GoChevronDown } from 'react-icons/go'
import FollowDetails from './components/Follow-UpDetails'
import EditLead from './components/EditLead'
import LeadActivity from './components/LeadActivity'
import { Link } from 'react-router-dom'
import { AuthorityCheck, ConfirmDialog } from '@/components/shared'
import { useRoleContext } from '../Roles/RolesContext'
import { Lead } from '../LeadList/store/LeadContext'
import  AddedUser  from './components/AddedUser'
import AddUserToLead from './components/AddUserToLead'
import LeadTask from './components/LeadTask'
import { fetchData } from '../FileManager/Components/data';

export type LeadDetailsResponse = {
    code: number;
    data: Lead[]
}

injectReducer('crmCustomerDetails', reducer)

const CustomerDetail = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch()

    const query = useQuery()
    const lead_id = query.get('id')
    const someAccess = true;


    useEffect(() => {
        fetchData()
    }, [])
    const fetchData = () => {
        const id = query.get('lead_id')
        if (id) {
            dispatch(getCustomer({ id }))
        }
    }
    const urlParams = new URLSearchParams(window.location.search);
    const myParam = urlParams.get('id');
    const [details, setDetails] = useState<any | null>(null);
    const role = localStorage.getItem('role')
    const [loading, setLoading] = useState(true)
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [dialogIsOpen1, setIsOpen1] = useState(false)
    const [dialogIsOpen2, setIsOpen2] = useState(false)
    const [dialogIsOpen3, setIsOpen3] = useState(false)
    const [dialogIsOpen4, setIsOpen4] = useState(false)
    const [leadData, setLeadData] = useState<any>([])

      
    
    const [task, setTask] = useState<any>([])

    const openDialog1 = () => {
        setIsOpen1(true)
    }

    const onDialogClose1 = () => {

        setIsOpen1(false)
    }

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {

        setIsOpen(false)
    }
    const openDialog2 = () => {
        setIsOpen2(true)
    }

    const onDialogClose2 = () => {

        setIsOpen2(false)
    }
    const openDialog3 = () => {
        setIsOpen3(true)
    }

    const onDialogClose3 = () => {

        setIsOpen3(false)
    }
    const openDialog4 = () => {
        setIsOpen4(true)
    }

    const onDialogClose4 = () => {

        setIsOpen4(false)
    }

    // const navigate = useNavigate();

    interface QueryParams {
      type:string
    
    }
    const queryParams = new URLSearchParams(location.search);

    const allQueryParams: QueryParams = {
      type: queryParams.get('tab') || '',
    };

    const handleTabChange = (selectedTab:any) => {
      const currentUrlParams = new URLSearchParams(location.search);
      currentUrlParams.set('tab', selectedTab);
      navigate(`${location.pathname}?${currentUrlParams.toString()}`);
  };

  const inactiveLead = async () => {

    const values :any = {
        userId: localStorage.getItem('userId') || '',
        org_id,
        lead_id: myParam,
        status: 'Inactive',
        date: new Date(),
        content: '',
        createdBy: 'ADMIN'
      }

    try {

        const response=await apiGetCrmLeadsUpdates(values)
        if(response.code===200){
          
          toast.push(
            <Notification type='success' duration={2000} closable>
              Lead Status Updated Successfully
            </Notification>
          )
          window.location.reload()
        }
        else{
          toast.push(
            <Notification type='danger' duration={2000} closable>
              Error Updating Lead
            </Notification>
          )
        }
        
    } catch (error:any) {

        console.log(error)

        throw new Error(error)
        
    }

    

  }


  const org_id = localStorage.getItem('orgId')

  const [report, setReport] = useState<any>([])

  useEffect(() => {
    const fetchData = async () => {
        try {
            const Report = await apiGetCrmSingleLeadReport(myParam);
            setReport(Report)
            
        } catch (error) {
            console.error('Error fetching data:', error);
            
        }
    }
    fetchData();
  }, [myParam])


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiGetCrmLeadsDetails(myParam, org_id);
                

                setLoading(false)
                setDetails(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [myParam]);


    useEffect(() => {
        // setLoading(true)

        const fetchDataAndLog = async () => {
            try {
                const taskResponse = await apiGetCrmLeadsTaskData(lead_id, org_id);
                setTask(taskResponse.data)
                const leadData = await apiGetCrmUsersAssociatedToLead(lead_id)

                // console.log(leadData)
                setLeadData(leadData?.data)


                setLoading(false)
            } catch (error) {
                console.error('Error fetching lead data', error)
            }
        }

        fetchDataAndLog()
    }, [])

    const lead = details?.data?.[0];
    // console.log(details?.data[0].notes)
    const notes = details?.data[0].notes?.reverse()
    // console.log("reveerse", notes)
    const { roleData } = useRoleContext()

    const contractAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.contract?.read?.includes(`${role}`)
    const leadDeleteAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.lead?.delete?.includes(`${role}`)
    const leadUpdateAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.lead?.update?.includes(`${role}`)
    const taskReadAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.leadtask?.read?.includes(`${localStorage.getItem('role')}`)


    const handleDeleteInactiveLead = async () => {

        try {

            if (lead?.lead_status == 'Inactive') {

                const res = await apiDeleteInactiveLead(lead_id);
                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Lead deleted successfully
                    </Notification>, { placement: 'top-end' }
                )
                navigate('/app/leads');

                window.location.reload()
            }

        } catch (error) {
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error deleting Lead
                </Notification>, { placement: 'top-end' }
            )
        }

    }

    const Toggle =

        <Button variant='solid' size='sm' className='flex justify-center items-center gap-2'>
            <span>Actions</span><span><GoChevronDown /></span></Button>
    return (
        <>
            <div className='flex justify-between'>
                <h3 className='pb-5'>Lead-{lead?.name || <Skeleton />}</h3>
                <div>
                    <Dropdown renderTitle={Toggle} placement='middle-end-top'>
                        <AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={ role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.lead?.update ?? []}
                        >
                            <Dropdown.Item eventKey="c" onClick={() => openDialog()}><div >Edit Lead</div></Dropdown.Item>
                            <Dropdown.Item eventKey="a" onClick={() => openDialog1()}><div >Add Follow-Up</div></Dropdown.Item>
                        </AuthorityCheck>
                        <AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.contract?.create ?? []}
                        >
                            <Dropdown.Item eventKey="b"><Link to={`/app/crm/contract?lead_id=${myParam}`}>Create Contract</Link></Dropdown.Item>
                        </AuthorityCheck>
                        {lead?.lead_status == "Inactive" && leadDeleteAccess && <AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.lead?.delete ?? []}
                        >
                            <Dropdown.Item eventKey="d" onClick={() => openDialog2()}><div>Delete Lead</div></Dropdown.Item>

                        </AuthorityCheck>}
                        {lead?.lead_status != "Inactive" && leadUpdateAccess && <AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.lead?.update ?? []}
                        >
                            <Dropdown.Item eventKey="g" onClick={() => openDialog4()}><div>Inactive Lead</div></Dropdown.Item>

                        </AuthorityCheck>}

                        {/* {leadAddMemberAccess && <AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.addMember?.create ?? []}
                        >
                            <Dropdown.Item eventKey="e" onClick={() => openDialog3()}><div>Add User</div></Dropdown.Item>

                        </AuthorityCheck>} */}
                    </Dropdown>
                </div>
            </div>

            <Card className='mb-5'>
                <Steps current={lead?.lead_status === 'Inactive' ? 1 : (lead?.lead_status === 'Follow Up' || lead?.lead_status === 'No Response' || lead?.lead_status === 'Not Contacted') ? 2 : (lead?.lead_status === 'Interested') ? 3 : lead?.lead_status === 'contract' ? 4 : lead?.lead_status === 'project' ? 5 : 1}
                    className=' overflow-x-auto'
                    status={lead?.lead_status === 'Inactive' ? 'error' : lead ? lead.lead_status === 'No Response' ? 'error' : lead?.lead_status === 'Not Contacted' ? 'error' : lead?.lead_status === 'Follow Up' ? 'in-progress' : lead.lead_status === 'Interested' ? 'in-progress' : lead.lead_status === 'Contract' ? 'in-progress' : lead.lead_status === 'Project' ? 'complete' : 'in-progress' : 'in-progress'}
                >
                    <Steps.Item title="Lead Created" />
                    <Steps.Item title={lead?.lead_status === 'Inactive' ? "Inactive" : "Following Up"} />
                    <Steps.Item title={lead?.lead_status === 'No Response' ? 'No Response' : lead?.lead_status === 'Not Contacted' ? 'Not Contacted' : "Interested"} />
                    <Steps.Item title="Contract" />
                    <Steps.Item title="Project" />
                </Steps>
            </Card>
            <div className='w-full'>
                {/* <CustomerProfile data={lead} /> */}
                {/* <Card className='w-full h-full' > */}
                    <Tabs defaultValue={allQueryParams.type} onChange={handleTabChange}>
                        <TabList>
                            <TabNav value="Details" >
                                Details
                            </TabNav>
                            <TabNav value="Actions" >
                                Follow-ups
                            </TabNav>
                            {contractAccess &&
                                <TabNav value="Contract" >
                                    Contract
                                </TabNav>}
                                <TabNav value="Tasks" >
                                Task Manager
                            </TabNav>
                            {['ADMIN', 'SUPERADMIN'].includes(localStorage.getItem('role') || '') &&
                                <TabNav value="Activity" >
                                    Lead Activity
                                </TabNav>
                            }

                            {someAccess &&
                                <TabNav value="AddedUser" className='flex gap-1'>
                                    <span>{"Assignee "}</span> 
                                    <span className={leadData.filter((lead:any) => lead.role !== "ADMIN" && lead.role !== "Senior Architect")?.length == 0 ? `text-red-500` :  ''}> {` (${leadData.filter((lead:any) => lead.role !== "ADMIN" && lead.role !== "Senior Architect")?.length})`}</span>
                                </TabNav>}
                        </TabList>
                        <div className="p-4">

                            <TabContent value="Details">
                                <div className='h-[18rem] overflow-y-auto' style={{ scrollbarWidth: 'none' }}>
                                <CustomerProfile data={lead} report={report} />
                                </div>
                            </TabContent>

                            
                            <TabContent value="Actions">
                                <div className='h-[18rem] overflow-y-auto' style={{ scrollbarWidth: 'none' }}>

                                <FollowDetails details={notes} />
                                </div>
                            </TabContent>
                            <TabContent value="Contract">
                                <Contract leadData={leadData} />
                            </TabContent>

                            { taskReadAccess &&
                            <TabContent value="Tasks">
                                <div className='h-[18rem] overflow-y-auto' style={{ scrollbarWidth: 'none' }}>
                                <LeadTask task={task} users={leadData} />
                                </div>
                            </TabContent>

                            }


                            <TabContent value="Activity">
                                <LeadActivity details={details} />
                            </TabContent>

                            <TabContent value="AddedUser">
                                <AddedUser leadData={leadData} openDialog3={openDialog3}  />
                            </TabContent>
                        </div>
                    </Tabs>
                {/* </Card> */}
            </div>

            {/* <Tabs defaultValue="Details">
                <TabList>
                    <TabNav value="Details">
                        Details
                    </TabNav>
                    <TabNav value="Actions" >
                        Actions
                    </TabNav>
                    {role!=='Project Architect' &&
                    <TabNav value="Contract" >
                        Contract
                    </TabNav>}
                </TabList>
                <div className="p-4">
                    <TabContent value="Details">
                    <CustomerProfile data={lead}/>
                    </TabContent>
                    <TabContent value="Actions">
                    <Card className='mt-5' >
                       <LeadForm data={lead}/>
                       </Card>
                    </TabContent>
                    <TabContent value="Contract">
                        <Contract/>
                    </TabContent>
                    </div>
                </Tabs>
               */}

            <Dialog
                isOpen={dialogIsOpen1}
                onClose={onDialogClose1}
                onRequestClose={onDialogClose1}
            ><LeadForm /></Dialog>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            ><EditLead details={details} /></Dialog>
            <Dialog
                isOpen={dialogIsOpen3}
                onClose={onDialogClose3}
                onRequestClose={onDialogClose3}
            ><AddUserToLead lead_id={lead_id} /></Dialog>


            <ConfirmDialog
                isOpen={dialogIsOpen2}
                type="danger"
                onClose={onDialogClose2}
                confirmButtonColor="red-600"
                onCancel={onDialogClose2}
                onConfirm={handleDeleteInactiveLead}
                title="Delete Lead"
                onRequestClose={onDialogClose2}>
                <p> Are you sure you want to delete this lead? </p>
            </ConfirmDialog>

            <ConfirmDialog
                isOpen={dialogIsOpen4}
                type="warning"
                onClose={onDialogClose4}
                confirmButtonColor="orange-600"
                onCancel={onDialogClose4}
                onConfirm={inactiveLead}
                title="Inactive Lead"
                onRequestClose={onDialogClose4}>
                <p> Are you sure you want to make this lead Inactive? </p>
            </ConfirmDialog>


        </>

    );

};


export default CustomerDetail