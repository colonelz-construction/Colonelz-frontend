import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FormikContext } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, toast } from '@/components/ui'
import { apiGetCrmLeadsAddTask, apiGetCrmProjectsAddTask, apiGetCrmUsersAssociatedToLead, apiGetUsersList } from '@/services/CrmService'
import * as Yup from 'yup'
import { AiOutlinePlus } from "react-icons/ai";
import { IoIosAddCircleOutline } from "react-icons/io";
import App from '../../CustomerDetail/components/MOM/Richtext'

type Task = {
    user_id: string;
    project_id: string;
    task_name: string;
    task_description: string;
    estimated_task_start_date: string;
    estimated_task_end_date: string;
    actual_task_start_date: string; 
    actual_task_end_date: string; 
    task_status: string; 
    task_priority: string; 
    task_assignee: string;
    reporter: string;
  };

const AddTask = ({leadId,addButton}:any) => {
    // console.log(leadId)
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const org_id = localStorage.getItem('orgId')
    const role :any = localStorage.getItem('role')



    const [users, setUsers] = useState<any>([]);
    // console.log(users)

    useEffect(()=> {

        const fetchData = async() => {
            const list = await apiGetCrmUsersAssociatedToLead(leadId)
        setUsers(list.data)
        }

        fetchData()

    }, [])
    
    
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
    { label: "Pending/Todo", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Cancelled", value: "Cancelled" },
  ];

//   console.log(userData)
  const userOptions = users?.map((user:any) => ({label: user.user_name, value: user.user_name}))

//   console.log(userOptions)

  return (
        <div>
            {addButton ? <Button onClick={openDialog}  variant='solid' size='sm'>Add Task</Button> : <span onClick={openDialog} className='flex items-center gap-1 cursor-pointer text-[#6B7280] font-semibold text-xl'> <IoIosAddCircleOutline/></span>}

            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
                <div className="pl-4 ">
                    <h3>Add New Task</h3>
                </div>
                <Formik 
                       initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        lead_id: leadId ,
                        task_name: "",
                        task_description: "",
                        // delegation_date: "",
                        estimated_task_end_date: "",
                        // actual_task_start_date: "",
                        // actual_task_end_date: "",
                        task_status: "Pending", 
                        task_priority: "", 
                        task_assignee: "",
                        reporter: "",
                      }}
                      validationSchema={Yup.object().shape({
                        task_name: Yup.string().required("Task Name is required"),
                      
                        estimated_task_end_date: Yup.string().required("Deadline is required"),
                        // actual_task_start_date: Yup.string().required("Actual start Date is required"),
                        // actual_task_end_date: Yup.string().required("Actual End Date is required").test(
                        //     "is-greater",
                        //     "End Date must be greater than Start Date",
                        //     function (value) {
                        //       const { actual_task_start_date } = this.parent;
                        //       if (actual_task_start_date && value) {
                        //         return new Date(value) > new Date(actual_task_start_date);
                        //       }
                        //       return true;
                        //     }
                          
                        // ),
                        // task_status: Yup.string().required("Task Status is required"),
                        task_priority: Yup.string().required("Task Priority is required"),
                        // task_assignee: Yup.string().required("Task Assignee is required"),
                        // reporter: Yup.string().required("Reporter is required"),
                      })
                      }
                     onSubmit={async(values, actions) => {
                        setLoading(true)
                            const response = await apiGetCrmLeadsAddTask(values)
                            
                            if(response.code===200){
                                setLoading(false)
                                toast.push(
                                    <Notification closable type='success' duration={2000}>Task Added Successfully</Notification>
                                )
                                window.location.reload()
                            }
                            else{
                                setLoading(false)
                                toast.push(
                                    <Notification closable type='danger' duration={2000}>{response.errorMessage}</Notification>
                                )
                            }
                        }
                            
                    }
                     >
                        {({ values, touched, errors, setFieldValue}) => (
                        <Form className=' p-4 max-h-96 overflow-y-auto'>
                            <div className=' grid grid-cols-2 gap-x-5'>
                            <FormItem label='Name'
                            asterisk
                            invalid={errors.task_name && touched.task_name}
                            errorMessage={errors.task_name}>
                                <Field name='task_name'  component={Input} placeholder='Name'/>
                               
                            </FormItem>
                            <FormItem label='Assignee'
                            
                            invalid={errors.task_assignee && touched.task_assignee}
                            errorMessage={errors.task_assignee}>
                                <Field name='task_assignee'  placeholder='Task'>
                                    {({field}:any)=>(
                                        <Select
                                        options={userOptions}
                                        name='task_assignee'
                                        onChange={(value:any) => { field.onChange({ target: {name:'task_assignee', value: value?.value } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>


                            {/* <FormItem label='Status'
                            asterisk
                            invalid={errors.task_status && touched.task_status}
                            errorMessage='Task Status is required'
                            >
                                <Field name='task_status'  placeholder='Task'>
                                    {({field}:any)=>(
                                        <Select
                                        options={statusOptions}
                                        name='task_status'
                                        onChange={(value) => { field.onChange({ target: {name:'task_status', value: value?.value } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem> */}

                            <FormItem label='Due Date' asterisk
                            invalid={errors.estimated_task_end_date && touched.estimated_task_end_date}
                            errorMessage={errors.estimated_task_end_date}
                            >
                                <Field name='estimated_task_end_date'  placeholder='Due Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='estimated_task_end_date'
                                        onChange={(value) => { field.onChange({ target: {name:'estimated_task_end_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>


                            {/* <FormItem label='Actual Start Date' asterisk
                            invalid={errors.actual_task_start_date && touched.actual_task_start_date}
                            errorMessage={errors.actual_task_start_date}
                            >
                                <Field name='actual_task_start_date'  placeholder='Actual Start date'>
                                    {({field}:any)=>(
                                        <DatePicker name='actual_task_start_date'
                                        onChange={(value) => { field.onChange({ target: {name:'actual_task_start_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>


                            <FormItem label='Actual End Date' asterisk
                            invalid={errors.actual_task_end_date && touched.actual_task_end_date}
                            errorMessage={errors.actual_task_end_date}
                            
                            
                            >
                                <Field name='actual_task_end_date' placeholder='End Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='actual_task_end_date'
                                        onChange={(value) => { field.onChange({ target: {name:'actual_task_end_date', value: `${value }`} }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem> */}


                            {/* <FormItem label='Estimated Start Date'
                            asterisk
                            invalid={errors.estimated_task_start_date && touched.estimated_task_start_date}
                            errorMessage={errors.estimated_task_start_date}
                            >
                                <Field name='estimated_task_start_date' placeholder='Start Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='estimated_task_start_date'
                                        onChange={(value) => { field.onChange({ target: {name:'estimated_task_start_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem> */}


                            {/* <FormItem label='Estimated End Date'
                            asterisk
                            invalid={errors.estimated_task_end_date && touched.estimated_task_end_date}
                            >
                                <Field name='estimated_task_end_date' placeholder='End Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='estimated_task_end_date'
                                        onChange={(value) => { field.onChange({ target: {name:'estimated_task_end_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                                <div className=' text-red-600'>{errors.estimated_task_end_date}</div>
                            </FormItem> */}
                           
                            <FormItem label='Report to'
                            
                            invalid={errors.reporter && touched.reporter}
                            >
                                <Field name='reporter' placeholder='Reporting to'>
                                    {({field}:any)=>(
                                        <Select
                                        options={userOptions}
                                        name='reporter'
                                        onChange={(value:any) => { field.onChange({ target: {name:'reporter', value: value?.value } }) }}
                                        />
                                    )}
                                </Field>
                                <div className=' text-red-600'>{errors.reporter}</div>  
                            </FormItem>
                            <FormItem label='Priority'
                            asterisk
                            invalid={errors.task_priority && touched.task_priority} 
                            errorMessage={errors.task_priority}
                            >
                                <Field name='task_priority'  placeholder='Task Priority'>
                                    {({field}:any)=>(
                                        <Select
                                        name='task_priority'
                                        options={priorityOptions}
                                        onChange={(value) => { field.onChange({ target: {name:'task_priority', value: value?.value } }) }}
                                        />
                                    )}  
                                        
                                </Field>
                            </FormItem>


                            </div>
                            {/* <FormItem label='Desription'>
                                <Field name='task_description' placeholder='Description'>
                                    {({field}:any)=>{
                                        return (
                                            <Input textArea name='task_description'
                                            {...field}/>
                                        )
                                    }}
                                </Field>
                            </FormItem> */}
                            <App
                                value={values.task_description}
                                onChange={(value) => {
                                    setFieldValue('task_description', value)
                                }}
                            />
                            <div className='flex justify-end mt-5'>
                                <Button type='submit' variant='solid' size='sm' loading={loading}>{loading?'Adding':'Add Task'}</Button>
                            </div>
                        </Form>)}
                </Formik>
            </Dialog>
        </div>
    )
}

export default AddTask