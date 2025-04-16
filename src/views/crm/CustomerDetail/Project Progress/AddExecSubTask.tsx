import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FormikContext } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, Tooltip, toast } from '@/components/ui'
import { apiCreateCrmExecSubTask, apiCreateCrmExecTask, apiGetCrmLeadsAddMiniTask, apiGetCrmLeadsAddSubTask, apiGetCrmProjectsAddMiniTask, apiGetCrmProjectsAddSubTask, apiGetCrmProjectsAddTask, apiGetUsersList } from '@/services/CrmService'
import { MdOutlineAdd } from 'react-icons/md'
import * as Yup from 'yup'
import { useLocation } from 'react-router-dom'
import { setUser } from '@/store'
import SelectWithBg from '@/components/ui/CustomSelect/SelectWithBg'


const AddExecSubTask = ({task, openDialog, onDialogClose, dialogIsOpen, setIsOpen}:any) => {

    // const [dialogIsOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const location=useLocation()
    const queryParams=new URLSearchParams(location.search)
    const project_id=queryParams.get('project_id')
    const org_id = localStorage.getItem('orgId')
    const [bgColor, setBgColor] = useState<any>("");

    // const task_id=queryParams.get('task')
    
    
    
// const openDialog = () => {
//     setIsOpen(true)
// }

// const onDialogClose = () => {
//     setIsOpen(false)
// }
const handleChange = (value: string) => {
    setBgColor(value);
  };
  

    return (
        <div>
            {/* <Button onClick={openDialog}  variant='solid' size='sm' className=' rounded-lg'> Add Sub Task</Button> */}
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
                <div className="pl-4 ">
                    <h3>Add New SubTask</h3>
                </div>
                <Formik 
                       initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        project_id: project_id || '',
                        task_id: task?.task_id,
                        subtask_name: "",
                        subtask_start_date: '',
                        subtask_end_date: '',
                        color: ""
                      }}
                      validationSchema={Yup.object().shape({
                        subtask_name: Yup.string().required('Sub Name is required'),
                        subtask_start_date: Yup.string().required('Start Date is required'),
                        subtask_end_date: Yup.string().required('End Date is required'),
                      })}
                     onSubmit={async(values, actions) => {

                        // console.log(values)

                        const val = {...values, color: bgColor }
                        setLoading(true)
                            const response = await apiCreateCrmExecSubTask(val)
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
                     }}
                     >
                        {({values, errors, touched, setFieldValue}:any)=>(
                        <Form className=' p-4 max-h-96 overflow-y-auto'>
                            <div className=' grid grid-cols-2 gap-x-5'>


                            



                            <FormItem label='Start Date'
                            asterisk
                            invalid={errors.subtask_start_date && touched.subtask_start_date}
                            errorMessage={errors.subtask_start_date}
                           
                            >
                                <Field name='subtask_start_date'  placeholder='Start Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='subtask_start_date'
                                        value={field.value}
                                        onChange={(value) => { field.onChange({ target: {name:'subtask_start_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>

                            <FormItem label='End Date'
                            asterisk
                            invalid={errors.subtask_end_date && touched.subtask_end_date}
                            errorMessage={errors.subtask_end_date}
                           
                            >
                                <Field name='subtask_end_date'  placeholder='End Date'>
                                    {({field}:any)=>(
                                        <DatePicker name='subtask_end_date'
                                        value={field.value}
                                        onChange={(value) => { field.onChange({ target: {name:'subtask_end_date', value: `${value}` } }) }}
                                        />
                                    )}
                                </Field>
                            </FormItem>

                            <FormItem label='Sub Task Name'
                            asterisk
                        invalid={errors.subtask_name && touched.subtask_name}
                        errorMessage={errors.subtask_name}
                            >
                                <Field name='subtask_name'  component={Input} placeholder='Name'/>
                            </FormItem>

                            <FormItem label="Color" >
                                    <Field name='subtask_type'>
                                        {({ field }: any) => (

                                            <SelectWithBg onChange={handleChange} />

                                        )}
                                    </Field>

                                </FormItem>


                            </div>
                            <div className='flex justify-end'>
                                <Button type='submit' variant='solid' size='sm' loading={loading}>{loading?'Adding':'Add Sub Task'}</Button>
                            </div>
                        </Form>)}
                </Formik>
            </Dialog>
        </div>
    )
}

export default AddExecSubTask