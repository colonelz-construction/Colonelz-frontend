// for Individual Lead
import { useEffect, useRef, useState } from 'react'
import Container from '@/components/shared/Container'
import reducer, { getCustomer, useAppDispatch } from './store'
import { injectReducer } from '@/store'
import useQuery from '@/utils/hooks/useQuery'
import { useLocation, useNavigate } from 'react-router-dom';
import LeadForm from './components/LeadForm'
import CustomerProfile from './components/LeadProfile'
import { Button, Card, Dialog, Dropdown, FormItem, Input, Notification, Skeleton, Steps, Tabs, toast } from '@/components/ui'
import { apiDeleteInactiveLead, apiGetCrmLeadsDetails, apiGetCrmLeadsTaskData, apiGetCrmLeadsUpdates, apiGetCrmSingleLeadReport, apiGetCrmUsersAssociatedToLead, apiLeadsAnotherProject } from '@/services/CrmService'
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
import AddedUser from './components/AddedUser'
import AddUserToLead from './components/AddUserToLead'
import LeadTask from './components/LeadTask'
import { fetchData } from '../FileManager/Components/data';
import { AddProject } from './components/LeadProfile'
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'


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
    const myParam = urlParams.get('id') || '';
    const [details, setDetails] = useState<any | null>(null);
    const role = localStorage.getItem('role')
    const [loading, setLoading] = useState(true)
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [dialogIsOpen1, setIsOpen1] = useState(false)
    const [dialogIsOpen2, setIsOpen2] = useState(false)
    const [dialogIsOpen3, setIsOpen3] = useState(false)
    const [dialogIsOpen4, setIsOpen4] = useState(false)
    const [dialogIsOpen5, setIsOpen5] = useState(false)
    const [isOpen6, setIsOpen6] = useState(false);
    const [dialogIsOpen7, setIsOpen7] = useState(false)
    const [project, setProject] = useState<AddProject>()

    const [leadData, setLeadData] = useState<any>([])

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            setCloseTimeout(null);
        }
        setIsOpen6(true);
    };

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setIsOpen6(false);
        }, 300); // 300ms delay - adjust as needed
        setCloseTimeout(timeout);
    };

    // Add cleanup effect
    useEffect(() => {
        return () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
            }
        };
    }, [closeTimeout]);




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
    const openDialog5 = () => {
        setIsOpen5(true)
    }

    const openDialog7 = () => {
        setIsOpen7(true)
        setProject({ lead_id: myParam, user_id: localStorage.getItem('userId'), type: 'true', org_id })
    }

    const onDialogClose7 = () => {
        setIsOpen7(false)
    }

    const onDialogClose5 = () => {
        setIsOpen5(false)
    }


    // const navigate = useNavigate();

    interface QueryParams {
        type: string

    }
    const queryParams = new URLSearchParams(location.search);

    const allQueryParams: QueryParams = {
        type: queryParams.get('tab') || '',
    };

    const handleTabChange = (selectedTab: any) => {
        const currentUrlParams = new URLSearchParams(location.search);
        currentUrlParams.set('tab', selectedTab);
        navigate(`${location.pathname}?${currentUrlParams.toString()}`);
    };

    const inactiveLead = async () => {

        const values: any = {
            userId: localStorage.getItem('userId') || '',
            org_id,
            lead_id: myParam,
            status: 'Inactive',
            date: new Date(),
            content: '',
            createdBy: 'ADMIN'
        }

        try {

            const response = await apiGetCrmLeadsUpdates(values)
            if (response.code === 200) {

                toast.push(
                    <Notification type='success' duration={2000} closable>
                        Lead Status Updated Successfully
                    </Notification>
                )
                window.location.reload()
            }
            else {
                toast.push(
                    <Notification type='danger' duration={2000} closable>
                        Error Updating Lead
                    </Notification>
                )
            }

        } catch (error: any) {

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
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


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
    const { roleData } = useRoleContext()
    const [currentIndex, setCurrentIndex] = useState(0);
    const goToPrevious = () => {
        setCurrentIndex(prev => (prev === 0 ? lead?.lead_details?.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev === lead?.lead_details?.length - 1 ? 0 : prev + 1));
    };
    const currentLead = lead?.lead_details?.length > 0 && lead?.lead_details[currentIndex];
    const createProjectAccess = role === 'SUPERADMIN' ? true : roleData?.data?.project?.create?.includes(`${role}`)
    // console.log(details?.data[0].notes)
    const notes = details?.data[0].notes?.reverse()
    // console.log("reveerse", notes)

    const contractAccess = role === 'SUPERADMIN' ? true : roleData?.data?.contract?.read?.includes(`${role}`)
    const leadDeleteAccess = role === 'SUPERADMIN' ? true : roleData?.data?.lead?.delete?.includes(`${role}`)
    const leadUpdateAccess = role === 'SUPERADMIN' ? true : roleData?.data?.lead?.update?.includes(`${role}`)
    const taskReadAccess = role === 'SUPERADMIN' ? true : roleData?.data?.leadtask?.read?.includes(`${localStorage.getItem('role')}`)


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

        <Button variant='solid' size='sm' className='flex justify-center items-center gap-4'>
            <span>Actions</span><span><GoChevronDown /></span></Button>
    return (
        <>
            <div className='flex justify-between'>
                <h3 className='pb-5'>Lead-{lead?.lead_details?.length > 0 ? (lead?.lead_details[0].name || <Skeleton />) : (lead?.name || <Skeleton />)}</h3>
                <div className=''>
                    <Dropdown renderTitle={Toggle} placement='middle-end-top' >
                        <AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.lead?.update ?? []}
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

                        <AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.project?.create ?? []}
                        >
                            {
                                createProjectAccess && lead?.contract_Status && <>
                                    {lead?.project ? (
                                        <Dropdown.Item eventKey="a">
                                            <span onClick={() => openDialog7()}>Add Another Project</span>
                                        </Dropdown.Item>
                                    ) : (
                                        <Dropdown.Item eventKey="b">
                                            <Link
                                                to={`/app/crm/lead-project/?id=${myParam}&name=${currentLead?.name}&email=${currentLead?.email}&phone=${currentLead?.phone}&location=${currentLead?.location}`}
                                            >
                                                Create Project
                                            </Link>
                                        </Dropdown.Item>
                                    )}
                                </>}
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

                        {<AuthorityCheck
                            userAuthority={[`${localStorage.getItem('role')}`]}
                            authority={role === 'SUPERADMIN' ? ["SUPERADMIN"] : roleData?.data?.lead?.read ?? []}
                        >
                            <Dropdown.Item eventKey="design">
                                <div
                                    className="relative"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className='flex gap-3 justify-between items-center'>
                                        <span>Design View</span>
                                        <span><GoChevronDown /></span>
                                    </div>

                                    {isOpen6 && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute left-14 transform -translate-x-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50"
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <ul className="py-2">
                                                <li
                                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                    onMouseEnter={handleMouseEnter}
                                                >
                                                    <Link
                                                        to={`/app/crm/leads/blueprint?lead_id=${myParam}`}
                                                        className="block w-full h-full"
                                                    >
                                                        2D View
                                                    </Link>
                                                </li>
                                                <li
                                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                                    onMouseEnter={handleMouseEnter}
                                                >
                                                    <Link
                                                        to={`/app/crm/visualizer?lead_id=${myParam}`}
                                                        className="block w-full h-full"
                                                    >
                                                        3D View
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Dropdown.Item>



                        </AuthorityCheck>}
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
                            Internal Task Manager
                        </TabNav>
                        {['ADMIN', 'SUPERADMIN'].includes(localStorage.getItem('role') || '') &&
                            <TabNav value="Activity" >
                                Lead Activity
                            </TabNav>
                        }

                        {someAccess &&
                            <TabNav value="AddedUser" className='flex gap-1'>
                                <span>{"Assignee "}</span>
                                <span className={leadData.filter((lead: any) => lead.role !== "ADMIN" && lead.role !== "Senior Architect")?.length == 0 ? `text-red-500` : ''}> {` (${leadData.filter((lead: any) => lead.role !== "ADMIN" && lead.role !== "Senior Architect")?.length})`}</span>
                            </TabNav>}
                    </TabList>
                    <div className="p-4">

                        <TabContent value="Details">
                            <div className='h-[30rem] overflow-y-auto' style={{ scrollbarWidth: 'none' }}>
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

                        {taskReadAccess &&
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
                            <AddedUser leadData={leadData} openDialog3={openDialog3} />
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

            <Dialog
                isOpen={dialogIsOpen7}
                onClose={onDialogClose7}
                onRequestClose={onDialogClose7}
            >
                <>
                    <h3 className='mb-3'>Update Latest Details</h3>
                    <Formik
                        initialValues={{
                            user_id: localStorage.getItem('userId') || '',
                            org_id,
                            lead_id: myParam,
                            lead_name: currentLead?.name,
                            email: currentLead?.email,
                            date: new Date(currentLead?.date),
                            phone: currentLead?.phone,
                            location: currentLead?.location,
                            source: currentLead?.source,
                            lead_manager: currentLead?.lead_manager,
                        }}
                        validationSchema={Yup.object().shape({
                            lead_name: Yup.string().required('Lead Name is required'),
                            email: Yup.string().email('Invalid email').required('Email is required'),
                            phone: Yup.string()
                                .required('Phone is required')
                                .matches(/^[0-9]*$/, 'Phone number must be numeric')
                                .length(10, 'Phone number must be exactly 10 digits'),
                            location: Yup.string().required('Location is required'),
                            source: Yup.string(),
                            lead_manager: Yup.string().required('Lead Manager is required'),

                        })}
                        onSubmit={async (values: any, { setSubmitting }) => {
                            setSubmitting(true);
                            console.log(values, "values");
                            values.date = `${values.date}`;
                            const submissionData = {
                                ...values,
                                lead_id: myParam,
                                type: 'true',
                            };

                            const response = await apiLeadsAnotherProject(submissionData);
                            if (response.code === 200) {
                                toast.push(
                                    <Notification type='success' duration={2000} closable>
                                        Lead Details updated for Another Project
                                    </Notification>
                                );
                                window.location.reload();
                            } else {
                                toast.push(
                                    <Notification type='danger' duration={2000} closable>
                                        Some Error Occured
                                    </Notification>
                                );
                            }
                            setSubmitting(false);
                        }}
                    >
                        {({ values, isSubmitting, errors, touched }: any) => (
                            <Form className='max-h-96 overflow-y-auto'>
                                <FormItem label='Lead Name'
                                    asterisk={true}
                                    invalid={errors.lead_name && touched.lead_name}
                                    errorMessage={errors.lead_name}

                                >
                                    <Field component={Input} name='lead_name' placeholder='Enter Lead Name' />
                                </FormItem>

                                <FormItem label='Email'
                                    asterisk={true}
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                >
                                    <Field component={Input} name='email' placeholder='Enter Email' />
                                </FormItem>

                                <FormItem label='Phone'
                                    asterisk
                                    invalid={errors.phone && touched.phone}
                                    errorMessage={errors.phone}
                                >
                                    <Field name='phone' placeholder=''>
                                        {({ field, form }: any) => (
                                            <Input
                                                maxLength={10}
                                                value={field.value}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length <= 10 && /^[0-9]*$/.test(value)) {
                                                        form.setFieldValue(field.name, value);
                                                    }
                                                }}
                                                onKeyPress={(e) => {
                                                    const charCode = e.which ? e.which : e.keyCode;
                                                    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem label='Location'
                                    asterisk
                                    invalid={errors.location && touched.location}
                                    errorMessage={errors.location}
                                >
                                    <Field component={Input} name='location' placeholder='Enter location' />
                                </FormItem>

                                <FormItem label='Source'

                                // invalid={errors.source && touched.source}
                                // errorMessage={errors.source}
                                >
                                    <Field component={Input} name='source' placeholder='Enter Source' />
                                </FormItem>

                                <FormItem
                                    label='Lead Manager'
                                    asterisk
                                    invalid={errors.lead_manager && touched.lead_manager}
                                    errorMessage={errors.lead_manager}
                                >
                                    <Field name='lead_manager' placeholder='Enter lead manager'>
                                        {({ field, form }: any) => (
                                            <Input
                                                {...field}
                                                value={field.value}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Regex to allow only letters and spaces
                                                    if (/^[A-Za-z\s]*$/.test(value)) {
                                                        form.setFieldValue(field.name, value);
                                                    }
                                                }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem label='Created Date'
                                    asterisk
                                    invalid={errors.date && touched.date}
                                    errorMessage={errors.date}
                                >
                                    <Field name='date'>
                                        {({ field, form }: any) => (
                                            <DateTimepicker
                                                maxDate={new Date()}
                                                value={field.value}
                                                onChange={(date) => form.setFieldValue('date', date)}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <Button variant='solid' block loading={isSubmitting} type='submit'>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </>
            </Dialog>


        </>

    );

};


export default CustomerDetail
