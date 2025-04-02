import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RiArrowRightSFill, RiArrowDownSFill } from "react-icons/ri";
import App from '../../../CustomerDetail/components/MOM/Richtext';
import { Skeleton } from "@/components/ui";
import AddNotes from "./AddNotes";
import MiniTaskTimer from "./MiniTaskTimer";
import EditMiniTaskStatus from "./EditMiniTaskStatus";
import EditMiniTask from "./EditMiniTask";

type MiniTask = {
    estimated_mini_task_end_date: string;
    mini_task_assignee: string;
    mini_task_createdBy: string;
    mini_task_createdOn: string;
    mini_task_description: string;
    mini_task_id: string;
    mini_task_priority: string;
    mini_task_project_id: string;
    mini_task_status: string;
    mini_task_name: string;
    mini_task_updatedBy: string;
    mini_task_updatedOn: string;
};

interface TaskListProps {
    miniTasks: MiniTask[];
    loading: any;
    users: any;
    expand: any;
    taskData: any;
}

const MiniTasks: React.FC<TaskListProps> = ({taskData, miniTasks, loading, users, expand }) => {
    const [searchParams, setSearchParams] = useSearchParams(); 
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

    const userId = localStorage.getItem('userId');

    // Load expanded rows from URL on mount
    useEffect(() => {
        const expandedFromUrl = searchParams.get("expanded");
        if (expandedFromUrl) {
            const expandedIds = expandedFromUrl.split(",");
            const expandedState = expandedIds.reduce((acc, id) => {
                acc[id] = true;
                return acc;
            }, {} as { [key: string]: boolean });
            setExpandedRows(expandedState);
        }
    }, [searchParams]);

    // Toggle row and update URL without removing existing parameters
    const toggleRow = (mini_task_id: string) => {
        setExpandedRows((prev) => {
            const newState = { ...prev, [mini_task_id]: !prev[mini_task_id] };
            const expandedIds = Object.keys(newState).filter((id) => newState[id]);

            // Preserve existing parameters and update only 'expanded'
            const newParams = new URLSearchParams(searchParams);
            if (expandedIds.length) {
                newParams.set("expanded", expandedIds.join(","));
            } else {
                newParams.delete("expanded");
            }
            setSearchParams(newParams, { replace: true });

            return newState;
        });
    };

    const CustomerInfoField = ({ title, value }: any) => {
        return (
            <div className='flex gap-1 flex-wrap'>
                <span className='text-gray-700 dark:text-gray-200 font-semibold'>{title}:</span>
                {!loading ? value && value.length === 0 ? '-' :
                    <span className="" style={{ overflowWrap: "break-word" }}>
                        {value}
                    </span> : <Skeleton width={100} />}
            </div>
        )
    };

    const formateDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    console.log(users)

    return (
        <div className="w-full mt-4 flex flex-col gap-2">
            {miniTasks?.map((task: any) => (
                <div key={task.mini_task_id} className="p-2 bg-blue-100 rounded-lg" >

                    <span className="flex items-center justify-between">
                        <span
                            className="w-[20rem] gap-2 flex items-center p-1 cursor-pointer"
                            onClick={() => toggleRow(task.mini_task_id)}
                            
                        >
                            {task.name}
                            <span>{expandedRows[task.mini_task_id] ? <RiArrowDownSFill /> : <RiArrowRightSFill />}</span>
                                <span className="flex w-full flex-col gap-1">
                                    <CustomerInfoField title='Task' value={task.mini_task_name} />
                                    <CustomerInfoField title='Assignee' value={task.mini_task_assignee} />
                                    <CustomerInfoField title='Due Date' value={formateDate(task.estimated_mini_task_end_date)} />

                                    {!expandedRows[task.mini_task_id] && <span className="flex items-center gap-1">
                                        <span className='text-gray-700 dark:text-gray-200 font-semibold'>Timer:</span>
                                        <span>
                                            <MiniTaskTimer Data={{ data: task, isShow: false, users: users }} />
                                        </span>

                                    </span>}

                                </span>
                        </span>

                        {
                        taskData.task_assignee === users?.find((u:any) => u._id === userId)?.username && 
                        <span className="m-4">
                                <EditMiniTask  Data={task} users={users}/>
                        </span>}

                    </span>
                    {expandedRows[task.mini_task_id] && (
                        <div className="p-3 bg-gray-50 border-l-4 border-blue-500 rounded-lg mt-2">
                            <div className={`flex ${!expand ? "flex-col justify-center items-start" : "items-center justify-end"} w-full gap-4 mt-2 mb-2`}>
                                <MiniTaskTimer Data={{ data: task, isShow: true, users: users }} />
                                <EditMiniTaskStatus Data={task}  users={users} />
                            </div>
                            <App value={task.mini_task_description} toolbar={[]} readOnly={true} title={'Description:'} />
                            <AddNotes Data={task} users={users} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MiniTasks;
