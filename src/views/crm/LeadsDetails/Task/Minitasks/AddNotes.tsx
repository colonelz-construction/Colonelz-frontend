import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FormikContext } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, Tooltip, toast } from '@/components/ui'
import { apiGetCrmLeadsMiniTaskUpdate, apiGetCrmLeadsSubTaskUpdate, apiGetCrmProjectsAddSubTask, apiGetCrmProjectsAddTask, apiGetCrmProjectsSingleSubTaskTimer, apiGetCrmProjectsSubTaskUpdate, apiGetUsersList } from '@/services/CrmService'
import { MdOutlineAdd } from 'react-icons/md'
import { HiOutlinePencil } from 'react-icons/hi'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import App from '../../../CustomerDetail/components/MOM/Richtext'

type MiniTask = {
    lead_id: string;
    task_id: string;
    mini_task_id: string;
    mini_task_name: string;
    mini_task_description: string;
    estimated_mini_task_end_date: string;
    mini_task_note: string;
    mini_task_status: string;
    mini_task_priority: string;
    mini_task_createdOn: string;
    mini_task_reporter: string;
    mini_task_createdBy: string;
    mini_task_assignee: string;
};

  type MinitaskData={
    Data:MiniTask
    users:any
  }

const AddNotes = ({Data, users}:MinitaskData) => {
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const location=useLocation();
    const queryParams=new URLSearchParams(location.search);
    const lead_id=queryParams.get('lead_id')
    const org_id = localStorage.getItem('orgId')
    const userId = localStorage.getItem('userId');

    
  
const openDialog = () => {
    setIsOpen(true)
}

const onDialogClose = () => {
    setIsOpen(false)
}
    return (
        <div>

                <Formik 
                       initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        lead_id: lead_id || '',
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
                        mini_task_note: Yup.string(),
                
                      })}
                     onSubmit={async(values, actions) => {
                         setLoading(true)

                         console.log(values)
                         const response = await apiGetCrmLeadsMiniTaskUpdate(values)
                         setLoading(false)
                         if(response.code===200){
                                toast.push(
                                    <Notification closable type='success' duration={2000}>Note added</Notification>
                                )
                                setLoading(false)
                                // window.location.reload()
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
                        <Form className='mt-4 max-h-96 overflow-y-auto'>

                            <App
                                value={values.mini_task_note}
                                readOnly={Data.mini_task_assignee !== users?.find((u:any) => u.user_id === userId)?.user_name}
                                onChange={(value:any) => {
                                    setFieldValue('mini_task_note', value)
                                }}
                                title={`${values.mini_task_assignee}'s Notes:`}
                            />
                            <div className='flex justify-start mt-2'>


                                {Data.mini_task_assignee === users?.find((u:any) => u.user_id === userId)?.user_name &&
                                    
                                    <Button type='submit' variant='solid' size='sm' loading={loading}>{loading?'Saving':'Save'}</Button>}
                            </div>


                        </Form>)}
                </Formik>
        
        </div>
    )
}

export default AddNotes