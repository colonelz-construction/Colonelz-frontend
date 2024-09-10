import {  useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useLocation } from 'react-router-dom'
import {
    Customer, Data, Project,
} from '../store'
import { DatePicker, Dialog, FormItem, Input, Notification, Select, Timeline, toast } from '@/components/ui'
import Cookies from 'js-cookie'
import { apiGetCrmSingleProjectEdit } from '@/services/CrmService'
import Progress from '../Project Progress/Activity'
import { HiOutlinePencil } from 'react-icons/hi'
import Report from '../Project Progress/Report'
import { useRoleContext } from '../../Roles/RolesContext'
import { AuthorityCheck } from '@/components/shared'
import * as Yup from 'yup'
import { Field, Form, Formik } from 'formik'
import { format } from 'date-fns'


type CustomerInfoFieldProps = {
    title?: string
    value?: string
    onChange?: (value: string) => void
}

type CustomerProfileProps = {
    data: Customer
    report:any
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based in JavaScript
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

const CustomerInfoField = ({
    title,
    value,
}: CustomerInfoFieldProps) => {
    if (title === 'Project Id' || title === 'Project Type' || title === 'Project Start Date') {
        return (
            <div className='flex gap-1 mb-3 pt-1'>
            <span className='text-gray-700 dark:text-gray-200 font-semibold'>{title}:</span>
            <p className="" style={{overflowWrap:"break-word"}}>
            {value }
            </p>
        </div>
        );
    } else if (title === 'Description') {
        return (
            <div className='flex gap-1 mb-2 pt-1'>
            <span className='text-gray-700 dark:text-gray-200 font-semibold'>{title}:</span>
            <p className="" style={{overflowWrap:"break-word"}}>
            {value }
            </p>
        </div>
        );
    } else {
        return (
            <div className='flex gap-1 mb-2 pt-1'>
            <span className='text-gray-700 dark:text-gray-200 font-semibold'>{title}:</span>
            <p className="" style={{overflowWrap:"break-word"}}>
            {value }
            </p>
        </div>
        );
    }
};


interface ProjectUpdateData {
  user_id: string | null;
    project_id: string | null;
    project_budget: string;
    project_status:string;
    timeline_date:string;
    designer:string
    email: string;
  }
  const ProjectUpdate: React.FC<Data> = (data) => {
    const location=useLocation()
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('project_id');
    const userId = localStorage.getItem('userId');
    const [loading, setLoading] = useState(false);
    const validationSchema = Yup.object().shape({
      project_budget: Yup.string().required('Project Budget is required'),
      designer: Yup.string().required('Designer is required'),
      timeline_date: Yup.string().required('Timeline Date is required'),
      project_status: Yup.string().required('Project Status is required'),
      client_email: Yup.string().email('Invalid email').required('Client Email is required')
  });
  
    const projectStatusOptions = [
      { value: 'completed', label: 'Completed' },
      { value: 'designing', label: 'Designing' },
      { value: 'executing', label: 'Executing' },
  ]
  
    return (
      <div className='max-h-96 overflow-y-auto mt-6'>
        <Formik
        initialValues={{
          user_id: userId,
          project_id: projectId,
          project_budget:data.data.project_budget,
          designer:data.data.designer,
          timeline_date:new Date(data.data.timeline_date),
          project_status:data.data.project_status,
          client_email:data.data.client[0].client_email
        }}
        validationSchema={validationSchema}
        onSubmit={
          async(values,{setSubmitting})=>{
            console.log(values);
            
            try {
              const response = await apiGetCrmSingleProjectEdit(values);
              console.log(response)
              setSubmitting(false);
              if (response?.errorMessage) {
                toast.push(
                  <Notification closable type="danger" duration={2000}>
                      {response?.errorMessage}
                  </Notification>
              )
            } else {
                toast.push(
                    <Notification closable type="success" duration={2000}>
                     Project Updated Successfully
                  </Notification>
              )
              window.location.reload()
              }
            } catch (error) {
              setSubmitting(false);
              toast.push(
                <Notification closable type="danger" duration={2000}>
                   Error updating project status
                </Notification>
            )
            }
          }
        }
        >
          {({ values, isSubmitting, errors,touched }:any) => (
            <Form>
          <h3 className=' mb-3'>Edit Project</h3>
        <FormItem label='Client Email'
        asterisk
        invalid={errors.client_email && touched.client_email}
        errorMessage={errors.client_email}
        >
           <Field>
            {({ field, form }: any) => (
              <Input
                type='text'
                name='client_email'
                value={values.client_email}
              onChange={(e)=>form.setFieldValue('client_email',e.target.value)}
              />
            )}
           </Field>
          </FormItem>
        <FormItem label='Timeline Date'
        asterisk
        invalid={errors.timeline_date && touched.timeline_date}
        errorMessage={errors.timeline_date}
        >
          <Field>
          {({field,form}:any) => (
          <DatePicker
          name='timeline_date'
          minDate={new Date(data.data.project_start_date)}
          inputFormat='DD-MM-YYYY'
          value={values.timeline_date}
          onChange={(date) => form.setFieldValue('timeline_date', `${date}`)}
          />
          )}
          </Field>
          </FormItem>

         <FormItem label='Project Budget'
          asterisk
          invalid={errors.project_budget && touched.project_budget}
          errorMessage={errors.project_budget}
          >
            <Field>
            {({field,form}:any) => (
            <Input
            type='text'
            name='project_budget'
            value={values.project_budget}
            onChange={(e)=>form.setFieldValue('project_budget',e.target.value)}
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
         
          <FormItem label='Project Incharge'
          asterisk
          invalid={errors.designer && touched.designer}
          errorMessage={errors.designer}
          >
            <Field>
            {({field,form}:any) => (
            <Input
            type='text'
            name='designer'
            value={values.designer}
            onChange={(e)=>form.setFieldValue('designer',e.target.value)}
            />
            )}
            </Field>
            </FormItem>
         
          <FormItem label='Project Status'
          asterisk
          invalid={errors.project_status && touched.project_status}
          errorMessage={errors.project_status}
          >
            <Field>
            {({field,form}:any) => (
            <Select
            options={projectStatusOptions}
            value={projectStatusOptions.find(option=>option.value===values.project_status)}
            onChange={(value) => form.setFieldValue('project_status', value?.value)}
            />
            )}
            </Field>
            </FormItem>
          <Button type="submit" 
           variant='solid'
             loading={isSubmitting}
             block
           >
            {isSubmitting?"Updating...":"Update Project"}
          </Button>
          </Form>)}
        </Formik>
      </div>
    );
  };
  


const CustomerProfile = ({ data,report }: CustomerProfileProps) => {
    const [dialogIsOpen, setIsOpen] = useState(false)
    const {roleData} = useRoleContext()

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }
    return (
      <div className='flex flex-col gap-5 lg:flex-row'>
        <Card className='lg:w-2/5'>
            <div className="flex flex-col xl:justify-between h-full 2xl:min-w-[360px] mx-auto">
                <div className="flex xl:flex-row gap-4 justify-between">
                    <div className="flex xl:flex-row items-center gap-4">
                        <h4 className="font-bold capitalize">{data?.project_name}</h4>
                    </div>
                    <div className="mt-4 flex flex-col xl:flex-row gap-2">
                    <AuthorityCheck
                    userAuthority={[`${localStorage.getItem('role')}`]}
                    authority={roleData?.data?.project?.update??[]}
                    >
                    <Button variant="solid" onClick={() => openDialog()} size='sm' className='flex justify-center items-center gap-1'>
            <span>  <HiOutlinePencil/></span><span>  Edit</span>
            </Button>
            </AuthorityCheck>
                    </div>
                </div>
                <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
         <ProjectUpdate data={data}/>
            </Dialog>
                <div className=" mt-4 capitalize">
                    <CustomerInfoField title="Project Id" value={data?.project_id} />
                    <CustomerInfoField 
                        title="Project Type"
                        value={data?.project_type}
                    />
                      <CustomerInfoField
                        title="Client Name"
                        value={data?.client?data.client[0]?.client_name:""}
                    />
                      <CustomerInfoField
                        title="Client Email"
                        value={data?.client?data.client[0]?.client_email:""}
                    />
                      <CustomerInfoField
                        title="Client Contact"
                        value={data?.client?data.client[0]?.client_contact:""}
                    />

                    <CustomerInfoField
                        title="Project status"
                        value={data?.project_status}
                    />
                  
                  

                  
                    <CustomerInfoField
                        title="Project Start Date"
                        value={formatDate(data?.project_start_date)}
                    />
                    <CustomerInfoField
                        title="Project End Date"
                        value={formatDate(data?.timeline_date)}
                    />
                    <CustomerInfoField
                        title="Project Budget"
                        value={data?.project_budget}
                    />
                    <CustomerInfoField
                        title="Project Incharge"
                        value={data?.designer}
                    />
                    {data?.project_updated_by && data.project_updated_by.length>0 &&<>
                    <CustomerInfoField
                        title="Updated By"
                        value={data.project_updated_by.length > 0 ? data.project_updated_by[data.project_updated_by.length-1].username : ""}                    />
                    <CustomerInfoField
                        title="Updated Date"
                        value={formatDate(data?.project_updated_by.length>0?data?.project_updated_by[data.project_updated_by.length-1].updated_date:"")}
                    />
                    </>}
                </div>
                <div>
                    <p>
                        <span className='text-gray-700 dark:text-gray-200 font-semibold'>Description: </span>{data.description}
                    </p>
                </div>
            </div>
          
        </Card>
        <Report report={report}/>
      
        </div>
    )
}

export default CustomerProfile
