import { Button, Card, Notification, Skeleton, toast } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import Subtasks from '../Subtasks/Subtasks'
import { useLocation, useSearchParams } from 'react-router-dom'
import { apiGetCrmLeadsMiniTaskData, apiGetCrmLeadsSingleTaskData, apiGetCrmLeadsSingleTaskDataTimer, apiGetCrmLeadsTaskUpdate, apiGetCrmUsersAssociatedToLead } from '@/services/CrmService'
import AddSubTask from '../Subtasks/AddSubtask'
import * as Yup from 'yup'
import EditTask from '../EditTask'
import { useNavigate } from 'react-router-dom'
import { useRoleContext } from '@/views/crm/Roles/RolesContext'
import TaskTimer from './TaskTimer'
import App from '../../../CustomerDetail/components/MOM/Richtext'
import { IoMdContract } from "react-icons/io";
import { FaExpand } from "react-icons/fa";
import AddMiniTask from '../Minitasks/AddMinitask'
import MiniTasks from '../Minitasks/MiniTasks'
import classNames from 'classnames';
import AddNotes from './AddNotes'
import { Form, Formik } from 'formik'
import EditMiniTaskStatus from './EditTaskStatus'
import EditTaskStatus from './EditTaskStatus'

type CustomerInfoFieldProps = {
    title?: string
    value?: any
}
export type LeadTasks = {
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
    number_of_subtasks: number;
    user_id: string;
    task_assignee: string;
    percentage:string;
};
export type LeadTaskDataResponse = {
    code: number;
    data: LeadTasks[]
}

const TaskDetails = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [searchParams, setSearchParams] = useSearchParams();
    const task_id = queryParams.get('task')
    const org_id = localStorage.getItem('orgId')
    const userId = localStorage.getItem('userId')
    const role :any = localStorage.getItem('role')
    const navigate = useNavigate()
    const lead_id = queryParams.get('lead_id') || ''
    const [users, setUsers] = useState<any>()
    const [expand, setExpand] = useState<any>(searchParams.get('expand') === 'true')

    const tempTasks = {
        lead_id: "",
        task_id: "",
        task_name: "",
        task_description: "",
        task_note: "",
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
    const { roleData } = useRoleContext();
    const hasLeadTaskUpdatePermission = role === 'SUPERADMIN' ? true :  roleData?.data?.leadtask?.update?.includes(role);
    const leadSubtaskCreateAccess = role === 'SUPERADMIN' ? true :  roleData?.data?.leadtask?.create?.includes(role);

    const [taskData, setTaskData] = React.useState<LeadTasks>(tempTasks)
    console.log(taskData)
    const [timerData, setTimerData] = React.useState<any>()
    const [miniTasks, setMiniTasks] = React.useState<any>([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchData = async () => {
            const response = await apiGetCrmLeadsSingleTaskData(lead_id, task_id, org_id);
            const list = await apiGetCrmUsersAssociatedToLead(lead_id)
            const res = await apiGetCrmLeadsSingleTaskDataTimer(lead_id, task_id, org_id);
            const resmini = await apiGetCrmLeadsMiniTaskData(lead_id, task_id, org_id);

            setTimerData(res.data)
            setLoading(false)
            setTaskData(response.data[0]);
            setMiniTasks(resmini.data);
            setUsers(list.data)
        }
        fetchData();
    }
        , [lead_id, task_id])

        const toggleExpand = () => {
            setExpand((prev:any) => {
                const newExpandState = !prev;
                const newParams = new URLSearchParams(searchParams);
                
                if (newExpandState) {
                    newParams.set("expand", "true");
                } else {
                    newParams.delete("expand");
                }
                
                setSearchParams(newParams, { replace: true });
                return newExpandState;
            });
        };

        // taskData.task_assignee !== users?.find((u:any) => u.user_id === userId)?.user_name

        console.log(taskData.task_createdBy)
        console.log(users?.find((u:any) => u.user_id === userId)?.user_name)

    const header = (
        <div className={`flex ${!expand ? "pl-5 flex-col gap-2" : "pl-5 items-center justify-between"}  mt-2`}>

            <span className='flex items-center justify-between'>
                <h5 className={""}>Task-{taskData?.task_name}</h5>
                {!expand && <span onClick={toggleExpand} className='mr-2'>{!expand ? <FaExpand/> : <IoMdContract/>}</span>}

            </span>
            <span className='flex gap-3 items-center'>

                {(taskData.task_assignee === users?.find((u:any) => u.user_id === userId)?.user_name) && <EditTaskStatus Data={taskData}  users={users} />}


                {loading ? <div className='flex justify-center'><Skeleton width={400} /></div> :
                hasLeadTaskUpdatePermission && (['ADMIN', 'SUPERADMIN'].includes(role) || taskData.task_createdBy === users?.find((u:any) => u.user_id === userId)?.user_name) && <EditTask Data={taskData} users={users} task={true} />}

                { (['ADMIN', 'SUPERADMIN'].includes(role) || taskData.task_assignee === users?.find((u:any) => u.user_id === userId)?.user_name) &&

                    <span><AddMiniTask showButton={false} users={users} data={taskData} /></span>

                }

                {expand && <span onClick={toggleExpand} className='mr-2'>{!expand ? <FaExpand/> : <IoMdContract/>}</span>}

            </span>
        </div>
    )

    const cardFooter = (
        loading ? <div className='flex justify-center'><Skeleton width={400} /></div> :
        hasLeadTaskUpdatePermission && <EditTask Data={taskData} users={users} task={true} />
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

                <div className={` ${expand ? "xl:w-full" : "xl:w-1/3"} transition-all duration-500`}>
                    <Card
                        clickable
                        className="hover:shadow-lg transition p-2 duration-150 ease-in-out dark:border dark:border-gray-600 dark:border-solid"
                        header={header}
                        // footer={cardFooter}
                        headerClass="p-0"
                        footerBorder={false}
                        headerBorder={false}
                    >
                        {taskData && <TaskTimer data={taskData} user={users}/>}
                        <div className='flex flex-col justify-start'>
                            <CustomerInfoField title='Created On' value={formateDate(taskData.task_createdOn)} />
                            <CustomerInfoField title='Created By' value={taskData.task_createdBy} />
                            <CustomerInfoField title='Name' value={taskData.task_name} />
                            <CustomerInfoField title='Status' value={taskData.task_status} />
                            <CustomerInfoField title='Priority' value={taskData.task_priority} />
                            <CustomerInfoField title='Due Date' value={formateDate(taskData.estimated_task_end_date)} />
                            <CustomerInfoField title='Assignee' value={taskData.task_assignee} />
                            <CustomerInfoField title='Reporter' value={taskData.reporter} />
                            <CustomerInfoField title='Number of subtasks' value={taskData.number_of_subtasks} />
                            {taskData.task_description && <App
                                    value={taskData.task_description}
                                    toolbar={[]}
                                    readOnly={true}
                                    title={'Description:'}
                                />}
                            {
                            <span className='mt-3'>
                                <AddNotes Data={taskData} users={users} />
                            </span> 
                                }

                            <MiniTasks taskData={taskData} expand={expand} miniTasks={miniTasks} loading={loading} users={users}/>

                        </div>

                    </Card>
                </div>
                <div className={`xl:w-2/3  ${expand ? "hidden" : ""} `}>

                    <div className='flex justify-between mb-4 items-center'>
                        <h5>Subtasks</h5>
                        {leadSubtaskCreateAccess && timerData && <AddSubTask showButton={false} users={users} data={taskData} />}
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