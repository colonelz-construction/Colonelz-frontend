import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { Field, Form, Formik, FieldArray } from 'formik'
import { DatePicker, FormItem, Input, Notification, Select, toast } from '@/components/ui'
import { apiGetCrmExecutionTask, apiUpdateCrmExecSubTask } from '@/services/CrmService'
import * as Yup from 'yup'
import { useLocation } from 'react-router-dom'
import SelectWithBg from '@/components/ui/CustomSelect/SelectWithBg'

interface AddExecSubTaskDetailsProps {
    task: any;
    subtask: any;
    openDialog: () => void;
    onDialogClose: () => void;
    dialogIsOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onAddSuccess?: () => void;
}

const AddExecSubTaskDetails = ({ task, subtask, openDialog, onDialogClose, dialogIsOpen, setIsOpen, onAddSuccess }: AddExecSubTaskDetailsProps) => {

    const [loading, setLoading] = useState(false)
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const project_id = queryParams.get('project_id')
    const org_id = localStorage.getItem('orgId')
    const [bgColor, setBgColor] = useState<any>("");
    const [showAffectionForm, setShowAffectionForm] = useState(false)
    const [affectionForm, setAffectionForm] = useState<any>({})
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [taskList, setTaskList] = useState<any>()

    const typeOptions = [
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Delay', label: 'Delay' }
    ]

    const handleChange = (value: string) => {
        setBgColor(value);
    }


    useEffect(() => {

        const fetchData = async () => {

            try {
                const exec = await apiGetCrmExecutionTask(project_id)

                function transformTasksForAffectionSelector(data: any[]) {
                    return data.map(task => ({
                        label: task.task_name,
                        value: task.task_id,
                        subtasks: (task.subtasks || []).map((sub: any) => {
                            const firstDetail = sub.sub_task_details?.[0] || {};
                            return {
                                sub_task_name: sub.sub_task_name,
                                sub_task_id: sub.sub_task_id,
                                days_number: firstDetail.days_number || '',
                                reason: firstDetail.reason || '',
                                sub_task_start_date: sub.sub_task_start_date,
                                sub_task_end_date: sub.sub_task_end_date,
                                color: sub.color,
                            };
                        })
                    }));
                }

                const tList = transformTasksForAffectionSelector(exec.data);

                // console.log(tList)
                setTaskList(tList)




            } catch (error: any) {
                throw new Error('Something went wrong', error)
            }
        }

        fetchData();

    }, [])

    const affectionValidation = Yup.object().shape({
        main_task: Yup.string().required("Main Task is required"),
        subtask: Yup.string().required("Subtask is required"),
        days_number: Yup.string().required("Days Number is required"),
        reason: Yup.string().required("Reason is required")
    })

    // const taskList = [
    //     {
    //         label: 'Design',
    //         value: 'task1',
    //         subtask: [
    //             { subtask_name: 'Wireframe', subtask_id: 'sub1', days_number: '2', reason: 'Initial Planning' },
    //             { subtask_name: 'Prototype', subtask_id: 'sub2', days_number: '3', reason: 'Client Request' }
    //         ]
    //     },
    //     {
    //         label: 'Development',
    //         value: 'task2',
    //         subtask: [
    //             { subtask_name: 'Frontend', subtask_id: 'sub3', days_number: '5', reason: 'Change Request' },
    //         ]
    //     }
    // ]



    return (
        <Dialog isOpen={dialogIsOpen} onClose={onDialogClose} onRequestClose={onDialogClose}>
            <div className="pl-4 ">
                <h3>Add New Detail</h3>
            </div>
            <Formik
                initialValues={{
                    user_id: localStorage.getItem('userId') || '',
                    org_id,
                    project_id: project_id || '',
                    task_id: task?.task_id,
                    subtask_id: subtask?.sub_task_id,
                    subtask_name: subtask?.sub_task_name,
                    subtask_start_date: subtask?.sub_task_start_date,
                    subtask_end_date: subtask?.sub_task_end_date,
                    color: subtask?.color,
                    subtask_details_start_date: "",
                    subtask_details_end_date: "",
                    subtask_comment: "",
                    subtask_type: "In Progress",
                    affection: [],
                }}
                validationSchema={Yup.object().shape({
                    subtask_name: Yup.string().required('Sub Name is required'),
                    subtask_start_date: Yup.string().required('Start Date is required'),
                    subtask_end_date: Yup.string().required('End Date is required'),
                    subtask_details_start_date: Yup.string().required('Start Date is required'),
                    subtask_details_end_date: Yup.string().required('End Date is required'),
                    subtask_comment: Yup.string().required('Comment is required'),
                    subtask_type: Yup.string().required('Type is required'),
                })}
                onSubmit={async (values, actions) => {
                    const val = { ...values, detail_color: bgColor || values.color }
                    setLoading(true)

                    console.log(val)
                    const response = await apiUpdateCrmExecSubTask(val)
                    if (response.code === 200) {
                        setLoading(false)
                        toast.push(<Notification closable type='success' duration={2000}>Task Added Successfully</Notification>)
                        onDialogClose()
                        if (onAddSuccess) {
                            onAddSuccess()
                        }
                    } else {
                        setLoading(false)
                        toast.push(<Notification closable type='danger' duration={2000}>{response.errorMessage}</Notification>)
                    }
                }}
            >
                {({ values, errors, touched, setFieldValue }) => (
                    <Form className='p-4 max-h-[90vh] overflow-y-auto'>
                        <div className='grid grid-cols-2 gap-x-5'>
                            <FormItem
                                label='Start Date'
                                asterisk
                                invalid={typeof errors.subtask_start_date === 'string' && touched.subtask_start_date ? true : undefined}
                                errorMessage={
                                    Array.isArray(errors.subtask_start_date)
                                        ? errors.subtask_start_date.join(', ')
                                        : typeof errors.subtask_start_date === 'string'
                                            ? errors.subtask_start_date
                                            : undefined
                                }
                            >
                                <Field name='subtask_details_start_date'>
                                    {({ field }: any) => (
                                        <DatePicker name='subtask_details_start_date' value={field.value} onChange={(value) => field.onChange({ target: { name: 'subtask_details_start_date', value } })} />
                                    )}
                                </Field>
                            </FormItem>
                            <FormItem label='End Date' asterisk invalid={errors.subtask_details_end_date && touched.subtask_details_end_date} errorMessage={errors.subtask_details_end_date}>
                                <Field name='subtask_details_end_date'>
                                    {({ field }: any) => (
                                        <DatePicker name='subtask_details_end_date' value={field.value} onChange={(value) => field.onChange({ target: { name: 'subtask_details_end_date', value } })} />
                                    )}
                                </Field>
                            </FormItem>

                            <FormItem label="Type" asterisk>
                                <Select options={typeOptions} onChange={(option) => setFieldValue('subtask_type', option?.value || '')} />
                            </FormItem>

                            <FormItem label='Comment' asterisk invalid={errors.subtask_comment && touched.subtask_comment} errorMessage={errors.subtask_comment}>
                                <Field name='subtask_comment' component={Input} placeholder='Comment' />
                            </FormItem>

                            {values.subtask_type !== 'Delay' && (
                                <FormItem label="Color">
                                    <Field name='color'>
                                        {() => <SelectWithBg onChange={handleChange} />}
                                    </Field>
                                </FormItem>
                            )}
                        </div>

                        {values.subtask_type === 'Delay' && (
                            <>
                                <div className='text-blue-500 hover:underline cursor-pointer mb-2' onClick={() => {
                                    setShowAffectionForm(true);
                                    setAffectionForm({ main_task: '', subtask: '', days_number: '', reason: '' });
                                    setEditIndex(null);
                                }}>
                                    {editIndex !== null ? 'Edit Affection' : 'Add Affection'}
                                </div>

                                <FieldArray name="affection">
                                    {({ push, remove, replace }) => (
                                        <>
                                            {showAffectionForm && (
                                                <div className='grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 border rounded'>
                                                    {/* Main Task Select */}
                                                    <Select
                                                        placeholder="Select Task"
                                                        options={taskList}
                                                        value={taskList.find((task: any) => task.value === affectionForm.task_id)}
                                                        onChange={(selected) => {
                                                            setAffectionForm((prev: any) => ({
                                                                ...prev,
                                                                task_id: selected.value,
                                                                task_name: selected.label,
                                                                sub_task_id: '',         // Clear subtask-related fields
                                                                sub_task_name: '',
                                                                days_number: '',
                                                                reason: ''
                                                            }))
                                                        }}
                                                    />

                                                    {/* Subtask Select */}
                                                    <Select
                                                        placeholder="Select Subtask"
                                                        options={
                                                            taskList.find((task: any) => task.value === affectionForm.task_id)?.subtasks.map((st: any) => ({
                                                                label: st.sub_task_name,
                                                                value: st.sub_task_id,
                                                                ...st
                                                            })) || []
                                                        }
                                                        value={
                                                            taskList
                                                                .find((task: any) => task.value === affectionForm.task_id)
                                                                ?.subtasks
                                                                .map((st: any) => ({
                                                                    label: st.sub_task_name,
                                                                    value: st.sub_task_id,
                                                                    ...st
                                                                }))
                                                                .find((st: any) => st.value === affectionForm.sub_task_id) || null
                                                        }
                                                        onChange={(selected: any) => {
                                                            setAffectionForm((prev: any) => ({
                                                                ...prev,
                                                                sub_task_id: selected.sub_task_id,
                                                                sub_task_name: selected.sub_task_name,
                                                                days_number: selected.days_number || '',
                                                                reason: selected.reason || '',
                                                            }))
                                                        }}
                                                        isDisabled={!affectionForm.task_id}
                                                    />

                                                    {/* Days Number */}
                                                    <Input
                                                        placeholder='Days Number'
                                                        type='number'
                                                        value={affectionForm.days_number}
                                                        onChange={(e) =>
                                                            setAffectionForm((prev: any) => ({ ...prev, days_number: e.target.value }))
                                                        }
                                                    />

                                                    {/* Reason */}
                                                    <Input
                                                        placeholder='Reason'
                                                        value={affectionForm.reason}
                                                        onChange={(e) =>
                                                            setAffectionForm((prev: any) => ({ ...prev, reason: e.target.value }))
                                                        }
                                                    />

                                                    {/* Add / Update Buttons */}
                                                    <div className='col-span-2 flex gap-3 mt-2'>
                                                        <Button
                                                            size='sm'
                                                            type='button'
                                                            onClick={() => {
                                                                if (!affectionForm.task_id || !affectionForm.sub_task_id || !affectionForm.days_number || !affectionForm.reason) {
                                                                    toast.push(<Notification closable type='danger'>All affection fields are required.</Notification>)
                                                                    return;
                                                                }

                                                                if (editIndex !== null) {
                                                                    replace(editIndex, affectionForm)
                                                                    setEditIndex(null)
                                                                } else {
                                                                    push(affectionForm)
                                                                }

                                                                setShowAffectionForm(false)
                                                            }}
                                                        >
                                                            {editIndex !== null ? 'Update' : 'Add'}
                                                        </Button>
                                                        <Button size='sm' variant='plain' type='button' onClick={() => {
                                                            setShowAffectionForm(false)
                                                            setEditIndex(null)
                                                        }}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Existing affections list */}
                                            {values.affection.length > 0 && values.affection.reverse().map((item: any, index: number) => {

                                                // console.log(item)
                                                
                                                
                                                return (
                                                <div key={index} className='p-2 border mb-2 rounded'>
                                                    <div className='text-sm'>
                                                        <strong>Main Task:</strong> {item?.task_name}<br />
                                                        <strong>Subtask:</strong> {item?.sub_task_name}<br />
                                                        <strong>Days:</strong> {item?.days_number || 0}<br />
                                                        <strong>Reason:</strong> {item?.reason}
                                                    </div>
                                                    <div className='flex gap-2 mt-1'>
                                                        <Button size='xs' variant='twoTone' type='button' onClick={() => {
                                                            setEditIndex(index)
                                                            setAffectionForm(item)
                                                            setShowAffectionForm(true)
                                                        }}>Edit</Button>
                                                        <Button size='xs' variant='plain' type='button' onClick={() => remove(index)}>Delete</Button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            )}
                                        </>
                                    )}
                                </FieldArray>
                            </>
                        )}

                        <div className='flex justify-end mt-4'>
                            <Button type='submit' variant='solid' size='sm' loading={loading}>
                                {loading ? 'Adding' : 'Add Details'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Dialog>
    )
}

export default AddExecSubTaskDetails
