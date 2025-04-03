import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import {  Form, Formik } from 'formik'
import { Notification, toast } from '@/components/ui'
import {  apiGetCrmLeadsSingleTaskData, apiGetCrmLeadsTaskUpdate } from '@/services/CrmService'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import App from '../../../CustomerDetail/components/MOM/Richtext'

type Task = {
    lead_id: string;
    task_id: string;
    task_name: string;
    task_description: string;
    estimated_task_end_date: string;
    task_note: string;
    task_status: string;
    task_priority: string;
    task_createdOn: string;
    reporter: string;
    task_createdBy: string;
    task_assignee: string;
};

  type TaskData={
    Data:Task
    users:any
  }

const AddNotes = ({Data, users}:TaskData) => {
    const [loading, setLoading] = useState(false)
    const location=useLocation();
    const queryParams=new URLSearchParams(location.search);
    const lead_id=queryParams.get('lead_id')
    const org_id = localStorage.getItem('orgId')
    const userId = localStorage.getItem('userId');
    const role :any = localStorage.getItem('role');
    const task_id = queryParams.get('task');


    const [initialValues, setInitialValues] = useState<any>({});
    const [data, setData] = useState<any>({});

    const [note, setNote] = useState<any>(Data?.task_note);

    // console.log(note);
    // console.log(Data?.task_note);

    useEffect(() => {

        setNote(Data?.task_note);
        setData(Data);

    }, [Data])    

    console.log(initialValues)
 
    const postData = async (data:any) => {

        setLoading(true)

        const initValue = {
            user_id: localStorage.getItem('userId') || '',
            org_id,
            lead_id: lead_id || '',
            task_id: data.task_id,
            task_name: data.task_name,
            task_description: data.task_description,
            task_note: note,
            estimated_task_end_date: new Date(data?.estimated_task_end_date),
            task_status: data?.task_status, 
            task_priority: data?.task_priority, 
            task_assignee: data?.task_assignee,
            reporter: data?.reporter,
            remark: '',
          }
        const response = await apiGetCrmLeadsTaskUpdate(initValue);

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

    
    }





    console.log(Data)

    return (
        <div>

                { <Formik 
                       initialValues={initialValues}
                      validationSchema={Yup.object().shape({
                        task_note: Yup.string(),
                 
                      })}
                     onSubmit={async(values, actions) => {
                            
                     }}

                     >
                        {({values, errors, touched, setFieldValue}:any) => (
                        <Form className=''>

                            <App
                                value={note}
                                readOnly={!((['ADMIN', 'SUPERADMIN'].includes(role) || data?.task_assignee === users?.find((u:any) => u.user_id === userId)?.user_name))}
                                onChange={(value:any) => {

                                    console.log(value)
                                    setNote(value)
                                }}
                                title={`${data?.task_assignee}'s Notes:`}
                            />
                            <div className='flex justify-start mt-2'>


                                {(['ADMIN', 'SUPERADMIN'].includes(role) || data?.task_assignee === users?.find((u:any) => u.user_id === userId)?.user_name) &&
                                    
                                    <Button onClick={() => postData(data)} variant='solid' size='sm' loading={loading}>{loading?'Saving':'Save'}</Button>}
                            </div>


                        </Form>)}
                </Formik>}
        
        </div>
    )
}

export default AddNotes