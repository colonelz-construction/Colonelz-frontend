import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, toast } from '@/components/ui'
import { apiGetCrmLeadsMiniTaskUpdate, apiGetCrmLeadsSubTaskUpdate, apiGetCrmProjectsMiniTaskUpdate} from '@/services/CrmService'
import { HiOutlinePencil } from 'react-icons/hi'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import App from '../../../CustomerDetail/components/MOM/Richtext'

type SubTask = {
    lead_id: string;
    task_id: string;
    mini_task_id: string;
    mini_task_name: string;
    mini_task_description: string;
    mini_task_note: string;
    estimated_mini_task_end_date: string;
    mini_task_status: string;
    mini_task_priority: string;
    mini_task_createdOn: string;
    mini_task_reporter: string;
    mini_task_createdBy: string;
    mini_task_assignee: string;
};

  type SubtaskData={
    Data:SubTask
    users:string[]
  }

const EditMiniTask = ({Data,users}:SubtaskData) => {
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const location=useLocation();
    const queryParams=new URLSearchParams(location.search);
    // const lead_id=queryParams.get('lead_id')
    const project_id=queryParams.get('project_id')
    const org_id = localStorage.getItem('orgId')

    
  
const openDialog = () => {
    setIsOpen(true)
}

const onDialogClose = () => {
    setIsOpen(false)
}
  
  const userOptions = users?.map((user:any) => ({
    label: user?.username,
    value: user?.username
  }));

    return (
        <div>
            <div onClick={openDialog} className='text-lg'><HiOutlinePencil/></div>
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
                <div className="pl-4 ">
                    <h3>Edit Minitask</h3>
                </div>
                <Formik 
                       initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        project_id: project_id || '',
                        task_id: Data?.task_id,
                        mini_task_id: Data?.mini_task_id,
                        mini_task_name: Data?.mini_task_name,
                        mini_task_description: Data?.mini_task_description,
                        mini_task_note: Data?.mini_task_note,
                        estimated_mini_task_end_date: new Date(Data?.estimated_mini_task_end_date),
                        mini_task_status: Data?.mini_task_status, 
                        mini_task_priority: Data?.mini_task_priority, 
                        mini_task_assignee: Data?.mini_task_assignee,
                        mini_task_reporter: Data?.mini_task_reporter,
                        remark: '',
                      }}
                      validationSchema={Yup.object().shape({
                        mini_task_name: Yup.string().required('Minitask Name is required'),
                        estimated_mini_task_end_date: Yup.string().required('Deadline is required'),
                      })}
                     onSubmit={async(values, actions) => {
                         setLoading(true)
                         const response = await apiGetCrmProjectsMiniTaskUpdate(values)
                         setLoading(false)
                         if(response.code===200){
                                toast.push(
                                    <Notification closable type='success' duration={2000}>Minitask Updated Successfully</Notification>
                                )
                                setLoading(false)
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
                        {({values, errors, touched, setFieldValue}:any) => (
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
                                <Field name='mini_task_assignee' placeholder='Assignee'>
                                    {({field}:any)=>(
                                        <Select
                                        placeholder={Data?.mini_task_assignee}
                                        options={userOptions}
                                        name='mini_task_assignee'
                                        onChange={(value:any) => { field.onChange({ target: {name:'mini_task_assignee', value: value?.value } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>


                            <FormItem label='Due Date'
                           
                            >
                                <Field name='estimated_mini_task_end_date'  placeholder='Due Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='estimated_mini_task_end_date'
                                        value={field.value}
                                        onChange={(value) => { field.onChange({ target: {name:'estimated_mini_task_end_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>
{/* 
                            <FormItem label='Priority'
                            asterisk
                            invalid={errors.sub_task_priority && touched.sub_task_priority}
                            errorMessage={errors.sub_task_priority}
                            >
                                <Field name='sub_task_priority'  placeholder='Priority'>
                                    {({field}:any)=>(
                                        <Select
                                        name='sub_task_priority'
                                        options={priorityOptions}
                                        value={priorityOptions.find((option)=>option.value===Data?.sub_task_priority)}
                                        onChange={(value) => { field.onChange({ target: {name:'sub_task_priority', value: value?.value } }) }}
                                        />
                                    )}          
                                </Field>
                            </FormItem> */}
                            </div>

                            <App
                                value={values.mini_task_description}
                                readOnly={false}
                                onChange={(value:any) => {
                                    setFieldValue('mini_task_description', value)
                                }}
                                title={'Description:'}
                            />
                            {values.sub_task_status==='Under Revision' &&
                            <FormItem label='Remarks'>
                                <Field name='remark' placeholder='Remarks'>
                                    {({field}:any)=>{
                                        return (
                                            <Input textArea name='remark'
                                            {...field}/>
                                        )
                                    }}
                                </Field>
                            </FormItem>}
                            <div className='flex justify-end mt-5'>
                                <Button type='submit' variant='solid' size='sm' loading={loading}>{loading?'Updating':'Update Minitask'}</Button>
                            </div>
                        </Form>)}
                </Formik>
            </Dialog>
        </div>
    )
}

export default EditMiniTask