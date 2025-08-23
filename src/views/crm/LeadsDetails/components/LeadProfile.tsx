// Changes in this
import Button from '@/components/ui/Button'
import { useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, Dialog, FormItem, Input, Notification, Skeleton, toast } from '@/components/ui'
import { AuthorityCheck, ConfirmDialog } from '@/components/shared'
import { apiLeadsAnotherProject } from '@/services/CrmService'
import { useRoleContext } from '../../Roles/RolesContext'
import Report from './Report'
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import DateTimepicker from '@/components/ui/DatePicker/DateTimepicker'
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";


type CustomerInfoFieldProps = {
    title?: string
    value?: any
}

type CustomerProfileProps = {
    data?: Partial<CustomerType>;
    report?: any
}
export type CustomerType = {
    _id: string
    name: string
    lead_id: string
    email: string
    phone: string
    location: string
    lead_manager: string
    status: string
    source: string
    notes?: Note[];
    date: string
    project: boolean
    contract_Status: boolean
    lead_details: any
}
interface Note {
    _id: string;
    content: string;
    createdBy: string;
    date: string;
    status: string;
}
export type AddProject = {
    lead_id: string
    user_id: string | null
    type: string,
    org_id: string | null
}





const CustomerProfile: React.FC<CustomerProfileProps> = ({ data, report }) => {

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const myParam = queryParams.get('id') || ''
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [dialogIsOpen2, setIsOpen2] = useState(false)
    const org_id = localStorage.getItem('orgId')
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev === 0 ? data?.lead_details?.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev === data?.lead_details?.length - 1 ? 0 : prev + 1));
    };

    const currentLead = data?.lead_details?.length > 0 && data?.lead_details[currentIndex];
    const role = localStorage.getItem('role')
    const [project, setProject] = useState<AddProject>()
    const { roleData } = useRoleContext()
    const createProjectAccess = role === 'SUPERADMIN' ? true : roleData?.data?.project?.create?.includes(`${role}`)


    const onDialogClose = () => {
        setIsOpen(false)
    }
    const openDialog2 = () => {
        setIsOpen2(true)
        setProject({ lead_id: myParam, user_id: localStorage.getItem('userId'), type: 'true', org_id })
    }

    const onDialogClose2 = () => {
        setIsOpen2(false)
    }

    const navigate = useNavigate()

    const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {


        return (
            <div className='flex items-center my-3  '>
                <span className="text-gray-700 dark:text-gray-200 font-semibold" >{title}: </span>
                {!data ? <Skeleton width={100} /> :
                    <p style={{ overflowWrap: "break-word" }}>
                        {value || '-'}
                    </p>}
            </div>
        )
    }

    // const addProject = async () => {

    //     const response = await apiLeadsAnotherProject(project)
    //     if (response.code === 200) {
    //         toast.push(
    //             <Notification closable type="success" duration={2000}>
    //                 {response.message}
    //             </Notification>
    //         )
    //         console.log("Naya Project Added")
    //         // window.location.reload()
    //     }
    //     else {
    //         toast.push(
    //             <Notification closable type="danger" duration={2000}>
    //                 {response.errorMessage}
    //             </Notification>
    //         )
    //         console.log("Kuch To Gadbad Hai")
    //     }
    // }
    return (
        <div className=" flex flex-col gap-5 lg:flex-row">
            {/* <Card className='lg:w-2/5'>
                <div className="flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto">
                    <div className="">
                        <div className="flex justify-between items-center">
                            <h5>Lead Details</h5>
                            {
                                createProjectAccess && data?.contract_Status && <>
                                    {data?.project ?
                                        <Button onClick={() => openDialog2()} variant='solid'>
                                            Add Another Project
                                        </Button> :
                                        <Button
                                            variant="solid"

                                            onClick={() =>
                                                navigate(
                                                    `/app/crm/lead-project/?id=${myParam}&name=${data?.name}&email=${data?.email}&phone=${data?.phone}&location=${data?.location}`,
                                                )
                                            }
                                        >
                                            Create Project
                                        </Button>}
                                </>}
                        </div>
                        <CustomerInfoField
                            title="Lead Name"
                            value={data?.name}
                        />
                        <CustomerInfoField title="Email" value={data?.email} />
                        <CustomerInfoField title="Phone" value={data?.phone} />

                        <CustomerInfoField
                            title="Location"
                            value={data?.location}
                        />
                        <CustomerInfoField
                            title="Lead Manager"
                            value={data?.lead_manager

                            }
                        />
                        <CustomerInfoField
                            title="Lead Status"
                            value={data?.status}
                        />
                        <CustomerInfoField
                            title="Created Date"
                            value={data?.date ? new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : ''}
                        />
                        <CustomerInfoField
                            title="Source"
                            value={data?.source || "NA"}
                        />

                        <Dialog
                            isOpen={dialogIsOpen}
                            width={1000}
                            height={490}
                            onClose={onDialogClose}
                            onRequestClose={onDialogClose}
                        >
                            <div
                                style={{
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    marginRight: '2%',
                                    marginLeft: '1%',
                                    scrollbarWidth: 'none',
                                }}
                                className=" whitespace-nowrap"
                            >
                                {data?.notes?.map((note) => (
                                    <div key={note._id} className="mb-4 mr-4">
                                        <Card>
                                            <div className="flex flex-row justify-between items-center mb-4 ">
                                                <CustomerInfoField
                                                    title="Date"
                                                    value={note.date}
                                                />
                                                <CustomerInfoField
                                                    title="Lead Status"
                                                    value={note.status}
                                                />
                                            </div>
                                            <div>
                                                <p>Description</p>
                                                <p className="text-gray-700 dark:text-gray-200 font-semibold text-wrap">
                                                </p>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                                <div className="text-right mt-6 mb-4 mr-[2%]">
                                    <Button
                                        variant="solid"
                                    >
                                        Okay
                                    </Button>
                                </div>
                            </div>
                        </Dialog>
                    </div>
                    <div className='flex mb-3'>
                        <p className=' text-gray-700 dark:text-gray-200 font-semibold'>Description:</p>
                        <p className="text-wrap">
                            <div className="remark-content" dangerouslySetInnerHTML={{ __html: data?.notes ? data?.notes[0]?.content : "" }} /></p>
                    </div>
                </div>
            </Card> */}


            <Card className='lg:w-2/5'>
                <div className="flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto ">
                    <div className="">
                        <div className="flex justify-between items-center">
                            <div className='flex flex-row justify-between items-center gap-3'>
                                {data?.lead_details?.length > 1 && <FaAngleLeft onClick={goToPrevious} />}
                                <h5>Lead Details</h5>
                                {data?.lead_details?.length > 1 && <FaAngleRight onClick={goToNext} />}
                            </div>
                            {
                                createProjectAccess && data?.contract_Status && <>
                                    {data?.project ?
                                        <Button onClick={() => openDialog2()} variant='solid'>
                                            Add Another Project
                                        </Button> :
                                        <Button
                                            variant="solid"

                                            onClick={() =>
                                                navigate(
                                                    `/app/crm/lead-project/?id=${myParam}&name=${currentLead?.name}&email=${currentLead?.email}&phone=${currentLead?.phone}&location=${currentLead?.location}`,
                                                )
                                            }
                                        >
                                            Create Project
                                        </Button>}
                                </>}
                        </div>

                        {/* <hr className="my-4 border-gray-200 dark:border-gray-600" /> */}
                        <CustomerInfoField
                            title="Lead Name"
                            value={data?.lead_details?.length > 0 ? currentLead?.name : data?.name}
                        />
                        <CustomerInfoField
                            title="Email"
                            value={data?.lead_details?.length > 0 ? currentLead?.email : data?.email}
                        />
                        <CustomerInfoField
                            title="Phone"
                            value={data?.lead_details?.length > 0 ? currentLead?.phone : data?.phone}
                        />
                        <CustomerInfoField
                            title="Location"
                            value={data?.lead_details?.length > 0 ? currentLead?.location : data?.location}
                        />
                        <CustomerInfoField
                            title="Lead Manager"
                            value={data?.lead_details?.length > 0 ? currentLead?.lead_manager : data?.lead_manager}
                        />
                        <CustomerInfoField
                            title="Created Date"
                            value={(data?.lead_details?.length > 0 && currentLead?.date) ? new Date(currentLead.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            }).replace(/\//g, '-') : data?.date
                            }
                        />
                        <CustomerInfoField
                            title="Source"
                            value={data?.lead_details?.length > 0 ? currentLead?.source : data?.source || 'NA'}
                        />
                        {/* <hr className="my-4 border-gray-200 dark:border-gray-600" /> */}

                        <div className='flex mb-3'>
                            <p className='text-gray-700 dark:text-gray-200 font-semibold'>Description:</p>
                            <p className="text-wrap">
                                <div className="remark-content" dangerouslySetInnerHTML={{
                                    __html: data?.notes?.[0]?.content || ""
                                }} />
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
            <Report report={report} />

            <Dialog
                isOpen={dialogIsOpen2}
                onClose={onDialogClose2}
                onRequestClose={onDialogClose2}
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
                                    <Field component={Input} name='lead_manager' placeholder='Enter lead manager' />
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

        </div>
    )
}

export default CustomerProfile
