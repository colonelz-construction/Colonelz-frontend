import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FormikContext } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, Tooltip, toast } from '@/components/ui'
import { apiGetCrmLeadsAddMiniTask, apiGetCrmLeadsAddSubTask, apiGetCrmProjectsAddSubTask, apiGetCrmProjectsAddTask, apiGetUsersList } from '@/services/CrmService'
import { MdOutlineAdd } from 'react-icons/md'
import * as Yup from 'yup'
import { useLocation } from 'react-router-dom'
import { setUser } from '@/store'
import App from '../../../CustomerDetail/components/MOM/Richtext'

export type Task = {
    user_id: string;
    lead_id: string;
    mini_task_name: string;
    mini_task_description: string;
    mini_task_note: string;
    // actual_sub_task_start_date: string; 
    // actual_sub_task_end_date: string; 
    // estimated_sub_task_start_date: string;
    estimated_mini_task_end_date: string;
    mini_task_status: string; 
    mini_task_priority: string; 
    mini_task_assignee: string;
    reporter: string;
  };
 
  type Data={
    users:String[]
    data:any
    showButton:any
  }

const AddMiniTask = ({showButton, data,users}:Data) => {

    console.log(data)
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const location=useLocation()
    const queryParams=new URLSearchParams(location.search)
    const lead_id=queryParams.get('lead_id')
    const org_id = localStorage.getItem('orgId')

    const task_id=queryParams.get('task')
    
    
    
const openDialog = () => {
    setIsOpen(true)
}

const onDialogClose = () => {
    setIsOpen(false)
}

const priorityOptions = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ];
  
  const statusOptions = [
    { label: "In Progress", value: "In Progress"},
    { label: "Pending/Todo", value: "Pending" },
    { label: "Completed", value: "Completed" },
    { label: "Cancelled", value: "Cancelled" },
  ];
  const userOptions = users?.map((user:any) => ({
    label: user.user_name,
    value: user.user_name
  }));
  

    return (
        <div>
            <Button onClick={openDialog} disabled={showButton}  variant='solid' size='sm' className=' rounded-lg'> Add Minitask</Button>
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
                <div className="pl-4 ">
                    <h3>Add New Minitask</h3>
                </div>
                <Formik 
                       initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        lead_id: lead_id || '',
                        task_id: task_id || '',
                        mini_task_name: "",
                        mini_task_description: "",
                        mini_task_note: "",
                        estimated_mini_task_end_date: "",
                        mini_task_status: "Pending", 
                        mini_task_priority: "low", 
                        mini_task_assignee: "",
                        mini_task_reporter: data.task_assignee,
                      }}
                      validationSchema={Yup.object().shape({
                        mini_task_name: Yup.string().required('Minitask Name is required'),
                        estimated_mini_task_end_date: Yup.string().required('Deadline is required'),
                        // mini_task_priority: Yup.string().required('minitask Priority is required'),
                      })}
                     onSubmit={async(values, actions) => {
                        setLoading(true)
                            const response = await apiGetCrmLeadsAddMiniTask(values)
                            if(response.code===200){
                                setLoading(false)
                                toast.push(
                                    <Notification closable type='success' duration={2000}>Minitask Added Successfully</Notification>
                                )
                                window.location.reload()
                            }
                            else{
                                setLoading(false)
                                toast.push(
                                    <Notification closable type='danger' duration={2000}>{response.errorMessage}</Notification>
                                )
                            }    
                     }}
                     >
                        {({values, errors, touched, setFieldValue}:any)=>(
                        <Form className=' p-4 max-h-96 overflow-y-auto'>
                            <div className=' grid grid-cols-2 gap-x-5'>


                            <FormItem label='Name'
                            asterisk
                        invalid={errors.mini_task_name && touched.mini_task_name}
                        errorMessage={errors.mini_task_name}
                            >
                                <Field name='mini_task_name'  component={Input} placeholder='Name'/>
                            </FormItem>


                            <FormItem label='Assignee'
                            
                            invalid={errors.mini_task_assignee && touched.mini_task_assignee}
                            errorMessage={errors.mini_task_assignee}
                            >
                                <Field name='mini_task_assignee'   placeholder='Assignee'>
                                    {({field}:any)=>(
                                        <Select
                                        options={userOptions}
                                        name='mini_task_assignee'
                                        onChange={(value:any) => { field.onChange({ target: {name:'mini_task_assignee', value: value?.value } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>


                            <FormItem label='Due Date'
                            asterisk
                            invalid={errors.estimated_mini_task_end_date && touched.estimated_mini_task_end_date}
                            errorMessage={errors.estimated_mini_task_end_date}
                           
                            >
                                <Field name='estimated_mini_task_end_date'  placeholder='Due Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='estimated_mini_task_end_date'
                                        value={field.value}
                                        maxDate={new Date(data.estimated_task_end_date)}
                                        onChange={(value) => { field.onChange({ target: {name:'estimated_mini_task_end_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>


                            <FormItem label='Priority'
                            asterisk
                            invalid={errors.mini_task_priority && touched.mini_task_priority}
                            errorMessage={errors.mini_task_priority}
                            >
                                <Field name='mini_task_priority'  placeholder='Priority'>
                                    {({field}:any)=>(
                                        <Select
                                        name='mini_task_priority'
                                        options={priorityOptions}
                                        onChange={(value) => { field.onChange({ target: {name:'mini_task_priority', value: value?.value } }) }}
                                        />
                                    )}          
                                </Field>
                            </FormItem>


                            </div>
                            <App
                                value={values.mini_task_description}
                                onChange={(value:any) => {
                                    setFieldValue('mini_task_description', value)
                                }}

                                readOnly={false}
                                title={'Description:'}
                            />
                            <div className='flex justify-end'>
                                <Button type='submit' variant='solid' size='sm' loading={loading}>{loading?'Adding':'Add Minitask'}</Button>
                            </div>
                        </Form>)}
                </Formik>
            </Dialog>
        </div>
    )
}

export default AddMiniTask