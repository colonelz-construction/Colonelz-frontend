import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik } from 'formik'
import { DatePicker, FormItem, Input, Notification, toast } from '@/components/ui'
import { apiUpdateCrmExecSubTask } from '@/services/CrmService'
import * as Yup from 'yup'
import { useLocation } from 'react-router-dom'
import SelectWithBg from '@/components/ui/CustomSelect/SelectWithBg'

const EditExecSubTask = ({ task, subtask, openDialog, onDialogClose, dialogIsOpen, setIsOpen, onUpdateSuccess }: any) => {
    const [loading, setLoading] = useState(false)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const project_id = queryParams.get('project_id')
    const org_id = localStorage.getItem('orgId')
    const [bgColor, setBgColor] = useState<any>(subtask?.color || "")

    const handleChange = (value: string) => {
        setBgColor(value)
    }

    const stopPropagationOnScrollbar = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        const isScrollbarClick =
            target.scrollHeight > target.clientHeight &&
            e.clientX > target.getBoundingClientRect().right - 20 // adjust for scrollbar width
        if (isScrollbarClick) {
            e.stopPropagation()
        }
    }

    return (
        <div>
            <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
                <div className="pl-4 ">
                    <h3>Edit SubTask</h3>
                </div>
                <Formik
                    initialValues={{
                        user_id: localStorage.getItem('userId') || '',
                        org_id,
                        project_id: project_id || '',
                        task_id: task?.task_id,
                        subtask_name: subtask?.sub_task_name,
                        subtask_id: subtask?.sub_task_id,
                        subtask_start_date: new Date(subtask?.sub_task_start_date),
                        subtask_end_date: new Date(subtask?.sub_task_end_date),
                        color: subtask?.color
                    }}
                    validationSchema={Yup.object().shape({
                        subtask_name: Yup.string().required('Sub Name is required'),
                        subtask_start_date: Yup.string().required('Start Date is required'),
                        subtask_end_date: Yup.string().required('End Date is required'),
                    })}
                    onSubmit={async (values, actions) => {
                        setLoading(true)
                        const val = { ...values, color: bgColor || values.color }
                        const response = await apiUpdateCrmExecSubTask(val)
                        if (response.code === 200) {
                            setLoading(false)
                            toast.push(
                                <Notification closable type='success' duration={2000}>Subtask Updated Successfully</Notification>
                            )
                            
                            // Call the callback to update parent state instead of reloading
                            if (onUpdateSuccess) {
                                onUpdateSuccess(task?.task_id, subtask?.sub_task_id, {
                                    sub_task_name: values.subtask_name,
                                    sub_task_start_date: values.subtask_start_date,
                                    sub_task_end_date: values.subtask_end_date,
                                    color: bgColor || values.color
                                });
                            }
                            
                            // Close the dialog
                            onDialogClose()
                        } else {
                            setLoading(false)
                            toast.push(
                                <Notification closable type='danger' duration={2000}>{response.errorMessage}</Notification>
                            )
                        }
                    }}
                >
                    {({ values, errors, touched, setFieldValue }: any) => (
                        <div
                            className='p-4 max-h-96 overflow-y-auto'
                            onMouseDown={stopPropagationOnScrollbar}
                        >
                            <Form>
                                <div className='grid grid-cols-2 gap-x-5'>
                                    <FormItem
                                        label='Start Date'
                                        asterisk
                                        invalid={errors.subtask_start_date && touched.subtask_start_date}
                                        errorMessage={errors.subtask_start_date}
                                    >
                                        <Field name='subtask_start_date' placeholder='Start Date'>
                                            {({ field }: any) => (
                                                <DatePicker
                                                    name='subtask_start_date'
                                                    value={field.value}
                                                    onChange={(value) => {
                                                        field.onChange({ target: { name: 'subtask_start_date', value: `${value}` } })
                                                    }}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label='End Date'
                                        asterisk
                                        invalid={errors.subtask_end_date && touched.subtask_end_date}
                                        errorMessage={errors.subtask_end_date}
                                    >
                                        <Field name='subtask_end_date' placeholder='End Date'>
                                            {({ field }: any) => (
                                                <DatePicker
                                                    name='subtask_end_date'
                                                    value={field.value}
                                                    onChange={(value) => {
                                                        field.onChange({ target: { name: 'subtask_end_date', value: `${value}` } })
                                                    }}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label='Sub Task Name'
                                        asterisk
                                        invalid={errors.subtask_name && touched.subtask_name}
                                        errorMessage={errors.subtask_name}
                                    >
                                        <Field name='subtask_name' component={Input} placeholder='Name' />
                                    </FormItem>

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
                                </div>
                                <div className='flex justify-end'>
                                    <Button type='submit' variant='solid' size='sm' loading={loading}>
                                        {loading ? 'Adding' : 'Edit SubTask'}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </Formik>
            </Dialog>
        </div>
    )
}

export default EditExecSubTask
