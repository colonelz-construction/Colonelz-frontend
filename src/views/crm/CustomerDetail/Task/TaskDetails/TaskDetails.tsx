import { Button, Card, Skeleton } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import Subtasks from '../Subtasks/Subtasks'
import { useLocation } from 'react-router-dom'
import { apiGetCrmProjectsSingleTaskData, apiGetUsersList, apiGetUsersListProject } from '@/services/CrmService'
import AddSubTask from '../Subtasks/AddSubtask'
import EditTask from '../EditTask'
import NoData from '@/views/pages/NoData'
import { Tasks } from '../../store'
import { useNavigate } from 'react-router-dom'

export type TaskDataResponse = {
    code: number;
    data: Tasks[]
}

type CustomerInfoFieldProps = {
    title?: string
    value?: any
}

const TaskDetails = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const task_id = queryParams.get('task')
    const org_id = localStorage.getItem('orgId')
    const navigate = useNavigate()

    const project_id = queryParams.get('project_id') || ''

    const [users, setUsers] = useState<any>()

    const tempTasks = {
        project_id: "",
        task_id: "",
        task_name: "",
        task_description: "",
        actual_task_start_date: "",
        actual_task_end_date: "",
        estimated_task_start_date: "",
        estimated_task_end_date: "",
        task_status: "",
        task_priority: "",
        task_createdOn: "",
        reporter: "",
        task_createdBy: "",
        number_of_subtasks: 0,
        user_id: "",
        task_assignee: "",
        percentage: "",
    };

    const [taskData, setTaskData] = React.useState<Tasks>(tempTasks)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchData = async () => {
            const response = await apiGetCrmProjectsSingleTaskData(project_id, task_id, org_id);
            const list = await apiGetUsersList(project_id)
            setLoading(false)
            setTaskData(response.data[0]);
            setUsers(list.data)
        }
        fetchData();
    }
        , [project_id, task_id])
    const header = (
        <div className="flex items-center justify-between mt-2">
            <h5 className="pl-5">Task-{taskData?.task_name}</h5>
        </div>
    )

    const cardFooter = (
        loading ? <div className='flex justify-center'><Skeleton width={400} /></div> :
            <EditTask Data={taskData} users={users} task={true} />
    )


    const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
        return (
            <div className='flex gap-1 mb-2 pt-1'>
                <span className='text-gray-700 dark:text-gray-200 font-semibold'>{title}:</span>
                {!loading ? value && value.length === 0 ? '-' :
                    <p className="" style={{ overflowWrap: "break-word" }}>
                        {value}
                    </p> : <Skeleton width={100} />}
            </div>
        )
    }
    const formateDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    return (
        <>

            <h3 className='mb-6'>Task Details</h3>
            <div className='flex flex-col gap-5 xl:flex-row'>

                <div className='xl:w-1/3 '>
                    <Card
                        clickable
                        className="hover:shadow-lg transition p-2 duration-150 ease-in-out dark:border dark:border-gray-600 dark:border-solid"
                        header={header}
                        footer={cardFooter}
                        headerClass="p-0"
                        footerBorder={false}
                        headerBorder={false}
                    >
                        <CustomerInfoField title='Task Created On' value={formateDate(taskData.task_createdOn)} />
                        <CustomerInfoField title='Task Created By' value={taskData.task_createdBy} />
                        <CustomerInfoField title='Task Name' value={taskData.task_name} />
                        <CustomerInfoField title='Task Status' value={taskData.task_status} />
                        <CustomerInfoField title='Task Priority' value={taskData.task_priority} />
                        <CustomerInfoField title='Actual Task Start Date' value={taskData.actual_task_start_date ? formateDate(taskData.actual_task_start_date) : "-"} />
                        <CustomerInfoField title='Actual Task End Date' value={taskData.actual_task_end_date ? formateDate(taskData.actual_task_end_date) : '-'} />
                        <CustomerInfoField title='Estimated Task Start Date' value={formateDate(taskData.estimated_task_start_date)} />
                        <CustomerInfoField title='Estimated Task End Date' value={formateDate(taskData.estimated_task_end_date)} />
                        <CustomerInfoField title='Task Assignee' value={taskData.task_assignee} />
                        <CustomerInfoField title='Reporter' value={taskData.reporter} />
                        <CustomerInfoField title='Number of subtasks' value={taskData.number_of_subtasks} />
                        <div>
                            <p>
                                <span className='text-gray-700 dark:text-gray-200 font-semibold'>Description: </span>{taskData.task_description}
                            </p>
                        </div>
                    </Card>
                </div>
                <div className='xl:w-2/3'>

                    <div className='flex justify-between mb-4 items-center'>
                        <h5>Subtasks</h5>
                        <AddSubTask users={users} data={taskData} />
                    </div>

                    <Subtasks task={task_id} users={users} />
                    <Button
                        size="sm"
                        className="ltr:mr-3 rtl:ml-3"
                        type="button"
                        onClick={() => {
                            navigate(-1)
                        }}
                    >
                        Back
                    </Button>
                </div>
            </div>


        </>
    )
}

export default TaskDetails