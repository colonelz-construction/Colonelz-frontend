import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { Progress, Tabs } from '@/components/ui';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import { useNavigate } from 'react-router-dom';

type Task = {
    project_id: string;
    task_id: string;
    task_name: string;
    task_description: string;
    actual_task_start_date: string;
    actual_task_end_date: string;
    estimated_task_start_date: string;
    estimated_task_end_date: string;
    task_status: string;
    task_priority: string;
    task_createdOn: string;
    task_assignee: string;
    reporter: string;
    task_createdBy: string;
    percentage:string
};
type Data={
    data:Task
}
type CustomerInfoFieldProps = {
    title?: string
    value?: any
}
const formateDate = (dateString: string) => {
    if (!dateString) return '-';
    // Debug: print the received start date
    console.log("Received dateString in formateDate:", dateString);
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;}

const TaskDetails = (Data: Data) => {
    console.log("TaskDetails component rendered with Data:", Data);

    const [verticalOpen, setVerticalOpen] = useState(false)
    const navigate = useNavigate();

    // Debug: Print the entire task object received by the component
    useEffect(() => {
        console.log("Received Task Data:", Data.data);
        // Print all date fields for debugging
        console.log("Received Dates:", {
            task_createdOn: Data.data.task_createdOn,
            actual_task_start_date: Data.data.actual_task_start_date,
            actual_task_end_date: Data.data.actual_task_end_date,
            estimated_task_start_date: Data.data.estimated_task_start_date,
            estimated_task_end_date: Data.data.estimated_task_end_date,
        });
    }, [Data.data]);

    const onVerticalOpen = () => {
        setVerticalOpen(true)
    }
    const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
        return (
            <div className='flex gap-1 mb-2 pt-1'>
                <span className='text-gray-700 dark:text-gray-200 font-semibold'>{title}:</span>
                <p className="" style={{overflowWrap:"break-word"}}>
                {value }
                </p>
            </div>
        )
    }

    const CircleCustomInfo = ({ percent }: { percent: number }) => {
        return (
            <div className="text-center flex gap-1">
                <h6>{percent}%</h6>
                <span>Done</span>
            </div>
        )
    }


    const onDrawerClose = () => {
        setVerticalOpen(false)
    }

    return (
        <div>
            <div
                onClick={() => onVerticalOpen()}
                className=' cursor-pointer'
            >
                {Data.data.task_name}
            </div>
            <Drawer
                
                isOpen={verticalOpen}
                placement="right"
                width={500}
                bodyClass="py-3"
                onRequestClose={onDrawerClose}
                closable={false}
            >
                <div className='flex gap-5 items-center'>
                <h4 className='p-2'>Task:{Data.data.task_name}</h4>
                <Button className='flex items-center justify-center gap-1'  variant='twoTone' size='sm' onClick={()=>navigate(`/app/crm/Projects/TaskDetails?project_id=${Data.data.project_id}&task=${Data.data.task_id}`)}><p className=''>View Task Details</p></Button>
                </div>
                <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Details</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                    <CustomerInfoField title="Creator" value={Data.data.task_createdBy} />
                    <CustomerInfoField title="Created On" value={formateDate(Data.data.task_createdOn)} />
                    <CustomerInfoField title="Task Name" value={(Data.data.task_name)} />
                    <CustomerInfoField title="Task Status" value={(Data.data.task_status)} />
                    <CustomerInfoField title="Task Priority" value={(Data.data.task_priority)} />
                    <CustomerInfoField title="Actual Task Start Date" value={Data.data.actual_task_start_date?formateDate(Data.data.actual_task_start_date):'-'} />
                    <CustomerInfoField title="Actual Task End Date" value={Data.data.actual_task_end_date?formateDate(Data.data.actual_task_end_date):'-'} />
                    <CustomerInfoField title="Estimated Task Start Date" value={formateDate(Data.data.estimated_task_start_date)} />
                    <CustomerInfoField title="Estimated Task End Date" value={formateDate(Data.data.estimated_task_end_date)} />
                    <CustomerInfoField title="Reporter" value={(Data.data.reporter)} />
                    <CustomerInfoField title="Assignee" value={(Data.data.task_assignee)} />
                    <div><p><span className='text-gray-700 dark:text-gray-200 font-semibold'>Description: </span>{Data.data.task_description}</p></div>
                    {/* <div className='my-4'>
                    <div className='flex justify-between items-center py-2'>
                    <h5>Subtasks</h5>
                    <AddSubTask task={{taskid:Data.data.task_id,project_id:Data.data.project_id}}/>
                    </div>
                    <Progress className="" size="sm" percent={Number(Data.data.percentage)} customInfo={<CircleCustomInfo percent={Number(Data.data.percentage)} />} />
                    </div>
                    <Subtasks task={Data.data.task_id}/> */}
                    </TabContent>
                </div>
                </Tabs>
                
            </Drawer>
        </div>
    )
}

export default TaskDetails

