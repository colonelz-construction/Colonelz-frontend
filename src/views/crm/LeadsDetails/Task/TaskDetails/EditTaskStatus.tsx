import { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import { FormItem, Notification, Select, toast } from '@/components/ui'
import { apiGetCrmLeadsTaskUpdate } from '@/services/CrmService'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'

type MiniTask = {
    lead_id: string;
    task_id: string;
    task_name: string;
    task_description: string;
    task_note: string;
    estimated_task_end_date: string;
    task_status: string;
    task_priority: string;
    task_createdOn: string;
    reporter: string;
    task_createdBy: string;
    task_assignee: string;
};

type MinitaskData = {
    Data: MiniTask;
    users: any;
};

const EditTaskStatus = ({ Data, users }: MinitaskData) => {
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const lead_id = queryParams.get('lead_id');
    const org_id = localStorage.getItem('orgId');
    const userId = localStorage.getItem('userId');

    const statusOptions = [
        { label: "In Progress", value: "In Progress" },
        { label: "Pending/Todo", value: "Pending" },
        { label: "Completed", value: "Completed" },
        { label: "Cancelled", value: "Cancelled" },
        { label: "Under Revision", value: "Under Revision" },
    ];

    return (
        <div className=''>

       
            <Formik
                initialValues={{
                    user_id: localStorage.getItem('userId') || '',
                    org_id,
                    lead_id: lead_id || '',
                    task_id: Data?.task_id,
                    task_name: Data?.task_name,
                    task_description: Data?.task_description,
                    task_note: Data?.task_note,
                    estimated_task_end_date: new Date(Data?.estimated_task_end_date),
                    task_status: Data?.task_status,
                    task_priority: Data?.task_priority,
                    task_assignee: Data?.task_assignee,
                    reporter: Data?.reporter,
                    remark: '',
                }}
                validationSchema={Yup.object().shape({
                    task_status: Yup.string().required('Task Status is required'),
                })}
                onSubmit={() => {}} // No need for a submit action

               
            >
                {({ values, errors, touched, setFieldValue }) => {
                    // Auto-trigger API when status changes
                    console.log(values.task_status)
                    useEffect(() => {

                        console.log(values.task_status)
                        if (values.task_status !== Data.task_status) {
                            setLoading(true);
                            apiGetCrmLeadsTaskUpdate(values)
                                .then((response) => {
                                    if (response.code === 200) {
                                        toast.push(
                                            <Notification closable type="success" duration={2000}>
                                                Task Updated Successfully
                                            </Notification>
                                        );

                                        window.location.reload();
                                    } else {
                                        toast.push(
                                            <Notification closable type="danger" duration={2000}>
                                                {response.errorMessage}
                                            </Notification>
                                        );
                                    }
                                })
                                .finally(() => setLoading(false));
                        }
                    }, [values.task_status]);

                    return (
                        <Form className="">
                            <div className="">
                                <FormItem
                                    label=""
                                    invalid={errors.task_status && touched.task_status}
                                    errorMessage={errors.task_status}
                                    className='mb-0 pb-0'
                                >
                                    <Field name="task_status">
                                        {({ field }: any) => (
                                            <Select
                                                placeholder={Data?.task_status === "Pending" ? "Pending/Todo" : Data?.task_status}
                                                options={statusOptions}
                                                name="task_status"
                                                isDisabled={Data.task_assignee !== users?.find((u:any) => u.user_id === userId)?.user_name}
                                                onChange={(value) => {
                                                    setFieldValue('task_status', value?.value);
                                                }}
                                                menuPortalTarget={document.body} // Ensures dropdown renders at the body level
                                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} // Prevents dropdown from being hidden
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            </div>
                        </Form>
                    );
                }}
            </Formik>

            </div>
    );
};

export default EditTaskStatus;
