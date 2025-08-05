import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FormikContext } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, Tooltip, toast } from '@/components/ui'
import { apiCreateCrmExecSubTask, apiCreateCrmExecTask, apiGetCrmLeadsAddMiniTask, apiGetCrmLeadsAddSubTask, apiGetCrmProjectsAddMiniTask, apiGetCrmProjectsAddSubTask, apiGetCrmProjectsAddTask, apiGetUsersList, apiUpdateCrmExecSubTask, apiUpdateCrmExecSubTaskDetail } from '@/services/CrmService'
import { MdOutlineAdd } from 'react-icons/md'
import * as Yup from 'yup'
import { useLocation } from 'react-router-dom'
import { setUser } from '@/store'
import SelectWithBg from '@/components/ui/CustomSelect/SelectWithBg'

interface EditExecSubTaskDetailsProps {
    task: any;
    subtask: any;
    detail: any;
    openDialog: (task: any, subtask: any, detail: any) => void;
    onDialogClose: () => void;
    dialogIsOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onUpdateSuccess?: (taskId: string, subtaskId: string, detailId: string, updatedDetail: any) => void;
}

const EditExecSubTaskDetails = ({ task, subtask, detail, openDialog, onDialogClose, dialogIsOpen, setIsOpen, onUpdateSuccess }: EditExecSubTaskDetailsProps) => {

    const [loading, setLoading] = useState(false)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const project_id = queryParams.get('project_id')
    const org_id = localStorage.getItem('orgId')
    const [bgColor, setBgColor] = useState<any>(detail?.color || "");

    // const task_id=queryParams.get('task')

    // console.log(detail)

    const typeOptions = [
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Delay', label: 'Delay' }
    ]

    const handleChange = (value: string) => {
        setBgColor(value);
      };






    return (
        <div>
            {/* <Button onClick={openDialog}  variant='solid' size='sm' className=' rounded-lg'> Add Details</Button> */}
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
                <div className="pl-4 ">
                    <h3>Edit Details</h3>
                </div>
                <Formik
                    initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        project_id: project_id || '',
                        task_id: task?.task_id,
                        subtask_id: subtask?.sub_task_id,
                        subtask_name: subtask?.subtask_name,
                        subtask_details_start_date: new Date(detail?.subtask_details_start_date),
                        subtask_details_end_date: new Date(detail?.subtask_details_end_date),
                        subtask_comment: detail?.subtask_comment,
                        subtask_type: detail?.subtask_type,
                        subtask_details_id: detail?.subtask_details_id,
                        color: detail?.color,
                    }}
                    validationSchema={Yup.object().shape({
                        subtask_details_start_date: Yup.string().required('Start Date is required'),
                        subtask_details_end_date: Yup.string().required('End Date is required'),
                        subtask_comment: Yup.string().required('Comment is required'),
                        subtask_type: Yup.string().required('Type is required'),
                    })}
                    onSubmit={async (values, actions) => {

                        // console.log(values)
                        setLoading(true)
                        const colorValue = bgColor || values.color;
                        const val = {...values, color: colorValue, detail_color: colorValue }
                        const response = await apiUpdateCrmExecSubTaskDetail(val)
                        if (response.code === 200) {
                            setLoading(false)
                            toast.push(
                                <Notification closable type='success' duration={2000}>Task Updated Successfully</Notification>
                            )
                            onDialogClose()
                            if (onUpdateSuccess) {
                                onUpdateSuccess(task?.task_id, subtask?.sub_task_id, detail?.subtask_details_id, val);
                            }
                        }
                        else {
                            setLoading(false)
                            toast.push(
                                <Notification closable type='danger' duration={2000}>{response.errorMessage}</Notification>
                            )
                        }
                    }}
                >
                    {({ values, errors, touched, setFieldValue }: any) => (
                        <Form className=' p-4 max-h-96 overflow-y-auto'>
                            {/* Hidden field to include subtask_name in the payload */}
                            <Field name='subtask_name' type='hidden' />
                            <div className=' grid grid-cols-2 gap-x-5'>

                                <FormItem label='Start Date'
                                    asterisk
                                    invalid={errors.subtask_start_date && touched.subtask_start_date}
                                    errorMessage={errors.subtask_start_date}

                                >
                                    <Field name='subtask_details_start_date' placeholder='Start Date'>
                                        {({ field }: any) => (
                                            <DatePicker name='subtask_details_start_date'
                                                value={field.value}
                                                onChange={(value) => { field.onChange({ target: { name: 'subtask_details_start_date', value: `${value}` } }) }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem label='End Date'
                                    asterisk
                                    invalid={errors.subtask_details_end_date && touched.subtask_details_end_date}
                                    errorMessage={errors.subtask_details_end_date}

                                >
                                    <Field name='subtask_details_end_date' placeholder='End Date'>
                                        {({ field }: any) => (
                                            <DatePicker name='subtask_details_end_date'
                                                value={field.value}
                                                onChange={(value) => { field.onChange({ target: { name: 'subtask_details_end_date', value: `${value}` } }) }}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem label="Type" asterisk>
                                    <Field name='subtask_type'>
                                        {({ field }: any) => (

                                            <Select
                                                options={typeOptions}
                                                placeholder={field.value}
                                                onChange={(option) => setFieldValue('subtask_type', option?.value || '')}
                                            />

                                        )}
                                    </Field>

                                </FormItem>

                                <FormItem label='Comment'
                                    asterisk
                                    invalid={errors.subtask_comment && touched.subtask_comment}
                                    errorMessage={errors.subtask_comment}
                                >
                                    <Field name='subtask_comment' component={Input} placeholder='Name' />
                                </FormItem>

                                {/* <FormItem label="Color" >
                                    <Field name='color'>
                                        {({ field }: any) => {
                                            console.log(field.value)
                                            
                                            
                                            return (

                                            <SelectWithBg onChange={handleChange} placeholder={field.value} />

                                        )}
                                        
                                        }
                                    </Field>




                                </FormItem> */}



                                {values.subtask_type !== 'Delay' && (
  <FormItem label="Color">
    <Field name='color'>
      {({ field }: any) => (
        <SelectWithBg 
          onChange={(value) => {
            handleChange(value);
            setFieldValue('color', value);
          }} 
          value={bgColor || field.value}
          placeholder={bgColor || field.value || "Select..."}
        />
      )}
    </Field>
  </FormItem>
)}


                            </div>
                            <div className='flex justify-end'>
                                <Button type='submit' variant='solid' size='sm' loading={loading}>{loading ? 'Editing' : 'Edit'}</Button>
                            </div>
                        </Form>)}
                </Formik>
            </Dialog>
        </div>
    )
}

export default EditExecSubTaskDetails