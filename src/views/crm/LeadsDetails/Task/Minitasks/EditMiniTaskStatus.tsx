import { useEffect, useState } from 'react'
import { Field, Form, Formik } from 'formik'
import { FormItem, Notification, Select, toast } from '@/components/ui'
import { apiGetCrmLeadsMiniTaskUpdate } from '@/services/CrmService'
import { HiOutlinePencil } from 'react-icons/hi'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import classNames from 'classnames';

type MiniTask = {
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

type MinitaskData = {
    Data: MiniTask;
    users: any;
};

const EditMiniTaskStatus = ({ Data, users }: MinitaskData) => {
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
                    mini_task_status: Yup.string().required('Minitask Status is required'),
                })}
                onSubmit={() => {}} // No need for a submit action

               
            >
                {({ values, errors, touched, setFieldValue }) => {
                    // Auto-trigger API when status changes
                    console.log(values.mini_task_status)
                    useEffect(() => {

                        console.log(values.mini_task_status)
                        if (values.mini_task_status !== Data.mini_task_status) {
                            setLoading(true);
                            apiGetCrmLeadsMiniTaskUpdate(values)
                                .then((response) => {
                                    if (response.code === 200) {
                                        toast.push(
                                            <Notification closable type="success" duration={2000}>
                                                Subtask Updated Successfully
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
                    }, [values.mini_task_status]);

                    return (
                        <Form className="">
                            <div className="">
                                <FormItem
                                    label=""
                                    invalid={errors.mini_task_status && touched.mini_task_status}
                                    errorMessage={errors.mini_task_status}
                                    className='mb-0 pb-0'
                                >
                                    <Field name="mini_task_status">
                                        {({ field }: any) => (
                                            <Select
                                                placeholder={Data?.mini_task_status === "Pending" ? "Pending/Todo" : Data?.mini_task_status}
                                                options={statusOptions}
                                                name="mini_task_status"
                                                isDisabled={Data.mini_task_assignee !== users?.find((u:any) => u.user_id === userId)?.user_name}
                                                onChange={(value) => {
                                                    setFieldValue('mini_task_status', value?.value);
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

export default EditMiniTaskStatus;
