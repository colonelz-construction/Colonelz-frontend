import { CalendarView } from '@/components/shared'
import { apiGetCrmProjectsTaskData } from '@/services/CrmService'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

type TaskData = {
    task_name: string;
    estimated_task_start_date: string;
    estimated_task_end_date: string;
    actual_task_start_date: string;
    actual_task_end_date: string;   
}

const Timeline = () => {
    const location=useLocation()
    const queryParams = new URLSearchParams(location.search);
    const projectId=queryParams.get('project_id') || '';
    const [taskData,setTaskData]=useState<any>(null)
    function formatDate(inputDate: string): string {
        const date = new Date(inputDate);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, add 1 to match calendar months
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
  
    useEffect(() => {
        const TaskData=async()=>{
            const response = await apiGetCrmProjectsTaskData(projectId);
            setTaskData(response.data)
        }
        TaskData();
  
    }, [])
   
   const colorMap: { [key: string]: string } = {
    A: 'red',
    B: 'orange',
    C: 'amber',
    D: 'yellow',
    E: 'lime',
    F: 'green',
    G: 'emerald',
    H: 'teal',
    I: 'cyan',
    J: 'sky',
    K: 'blue',
    L: 'indigo',
    M: 'purple',
    N: 'fuchsia',
    O: 'pink',
    P: 'rose',
    Q: 'red',
    R: 'orange',
    S: 'amber',
    T: 'yellow',
    U: 'lime',
    V: 'green',
    W: 'emerald',
    X: 'teal',
    Y: 'cyan',
    Z: 'sky'
};

const getColorForTask = (taskName: string): string => {
    const firstLetter = taskName[0].toUpperCase();
    return colorMap[firstLetter] || 'gray'; // Default color if the letter is not in the map
};

const event = taskData?.map((task: any) => ({
    start: formatDate(task.estimated_task_start_date),
    end: formatDate(task.estimated_task_end_date),
    title: task.task_name,
    eventColor: getColorForTask(task.task_name)
}));

   return( <div><CalendarView
    editable
                selectable
                events={event}
               /></div>
  )
}

export default Timeline