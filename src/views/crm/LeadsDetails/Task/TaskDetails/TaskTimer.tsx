
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { useLocation, useNavigate } from 'react-router-dom';
import { IoPlayOutline } from "react-icons/io5";
import { PiSquareThin } from "react-icons/pi";
import { CiPause1 } from 'react-icons/ci';
import { apiGetCrmLeadsSingleTaskDataTimer, apiGetCrmLeadsSingleTaskTimer } from '@/services/CrmService';
import { Tooltip } from '@/components/ui';

export type TimerResponse = {
  code: number;
  data: TimerData
}

type TimerData = {
  lead_id: string,
  task_id: string,
  sub_task_id: string
  sub_task_assignee: string,
  time: string,
  isrunning: boolean,
  current: string,
  total_time: string,
}

type SubTask = {
  project_id: string;
  task_id: string;
  sub_task_id: string;
  sub_task_name: string;
  sub_task_description: string;
  actual_sub_task_start_date: string;
  actual_sub_task_end_date: string;
  estimated_sub_task_start_date: string;
  estimated_sub_task_end_date: string;
  sub_task_status: string;
  sub_task_priority: string;
  sub_task_createdOn: string;
  sub_task_reporter: string;
  sub_task_createdBy: string;
  sub_task_assignee: string;
  remark: Remarks[]
};
type Remarks = {
  remark: string;
  remark_by: string;
  remark_date: string;
}
type Data = {
  data: SubTask
  user: any
}
type CustomerInfoFieldProps = {
  title?: string
  value?: any
}
const formateDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

const TaskTimer = (Data: any) => {
  const location = useLocation()
  const queryParam = new URLSearchParams(location.search);
  const leadId = queryParam.get('lead_id') || '';
  const taskId = queryParam.get('task') || '';
  const org_id = localStorage.getItem('orgId')
  const role: any = localStorage.getItem('role')
  const userId: any = localStorage.getItem('userId')

  // console.log(Data)



  const navigate = useNavigate();


  type UpdateData = {
    lead_id: string,
    task_id: string,
    org_id: string | null,
    task_assignee: string,
    time: string,
    isrunning: boolean,
    current: string,
    total_time: string,
  }

  const [data, setData] = useState<UpdateData>({
    lead_id: leadId,
    org_id,
    task_id: Data.data.task_id,
    task_assignee: Data.data.task_assignee,
    time: '',
    isrunning: false,
    current: '',
    total_time: '',
  })
  const Submit = async (data: UpdateData) => {
    // console.log(data)
    const response = await apiGetCrmLeadsSingleTaskTimer(data);
    window.location.reload();
  }


  const usePersistentTimer = (taskId: string) => {
    const getInitialState = () => {
      const savedTimers = localStorage.getItem('timers');
      const timers = savedTimers ? JSON.parse(savedTimers) : {};
      return timers[taskId] || { time: 0, isRunning: true, totalTime: 0, current: new Date().getTime() };
    };

    const [timerData, setTimerData] = useState(getInitialState);

    useEffect(() => {
      const fetchData = async () => {


        const response = await apiGetCrmLeadsSingleTaskDataTimer(leadId, taskId, org_id);
        if (response) {
          const { time, isrunning, total_time, current } = response.data;

          time.length === 0 ?
            setTimerData({
              time: 0,
              isRunning: false,
              totalTime: 0,
              current: null,
            }) :
            setTimerData({
              time: parseInt(time, 10),
              isRunning: isrunning,
              totalTime: parseInt(time, 10),
              current: parseInt(current, 10),
            });
        }
      }
      fetchData();
    }, [leadId])

    useEffect(() => {
      const savedTimers = localStorage.getItem('timers');
      const timers = savedTimers ? JSON.parse(savedTimers) : {};
      timers[taskId] = timerData;
      localStorage.setItem('timers', JSON.stringify(timers));
    }, [timerData, taskId]);

    return [timerData, setTimerData];
  };


  const [timerData, setTimerData] = usePersistentTimer(taskId);


  useEffect(() => {
    let interval = null;
    if (timerData.isRunning) {
      interval = setInterval(() => {
        setTimerData((prevData: any) => {
          const now = new Date().getTime();
          const diff = now - prevData.current;
          time: prevData.time + diff
          return { ...prevData };
        });
      }, 1);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => { if (interval) { clearInterval(interval); } }
  }, [timerData.isRunning]);

  const formatTime = () => {
    const totalTime = timerData.isRunning
      ? timerData.time + (new Date().getTime() - timerData.current)
      : timerData.time;
    const hours = Math.floor(totalTime / 3600000);
    const minutes = Math.floor((totalTime % 3600000) / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    const milliseconds = Math.floor(totalTime % 1000).toString().padStart(3, '0');

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds}`;
  };

  const handleStart = (data:any) => {
    const now = new Date().getTime();
    setTimerData((prevData: any) => {
      const updatedData = {
        ...prevData,
        isRunning: true,
        current: now,
      };

      // console.log(data)


      const temp = 
      {
        lead_id: leadId,
        org_id,
        task_id: Data.data.task_id,
        task_assignee: Data.data.task_assignee,
        time: '',
        isrunning: false,
        current: '',
        total_time: '',
      }

      const submitData = {
        ...temp,
        time: `${updatedData.time}`,
        isrunning: true,
        current: now.toString(),
        total_time: updatedData.totalTime.toString(),
      };
      Submit(submitData);

      return updatedData;
    });
  };

  const handlePause = (data:any) => {
    setTimerData((prevData: any) => {
      const now = new Date().getTime();
      const updatedTime = prevData.time + (now - (prevData.current || now));
      const updatedData = {
        ...prevData,
        isRunning: false,
        time: updatedTime,
        current: null,
      };

      const temp = 
      {
        lead_id: leadId,
        org_id,
        task_id: Data.data.task_id,
        task_assignee: Data.data.task_assignee,
        time: '',
        isrunning: false,
        current: '',
        total_time: '',
      }


      const submitData = {
        ...temp,
        time: updatedData.time.toString(),
        isrunning: false,
        current: now.toString(),
        total_time: updatedData.totalTime.toString(),
      };


      Submit(submitData);

      return updatedData;
    });
  };

  const handleReset = (data:any) => {
    setTimerData({ time: 0, isRunning: false, totalTime: 0, current: null })

    const temp = 
      {
        lead_id: leadId,
        org_id,
        task_id: Data.data.task_id,
        task_assignee: Data.data.task_assignee,
        time: '',
        isrunning: false,
        current: '',
        total_time: '',
      }
    

    const submitData = {
      ...temp,
      time: '0',
      isrunning: false,
      current: new Date().getTime().toString(),
      total_time: '0',
    };
    Submit(submitData);
  };





{/* <Tooltip title="Delete"> */}

const [toolTipMsg, setToolTipMsg] = useState<any>();

useEffect(() => {

  const res = Data.data;

  if(res.task_status === 'Completed' || res.task_status === 'Cancelled') {
    setToolTipMsg(`You can not start a ${res.task_status} task`)

  } else if(res.task_status === 'Pending') {
    setToolTipMsg(`Make task In progress to start`)

  } else if(res.task_status === 'In Progress') {
    setToolTipMsg(`Start`)
  }

}, [Data])

console.log(Data.data.task_assignee)
console.log(Data.user)




  return (
    <div>
        <div className='flex  gap-4 items-center mb-5'>

          {
 ((Data.data.task_status === 'Completed' || Data.data.task_status === 'Cancelled') || Data.data.task_status === 'Pending' || ((role !== 'SUPERADMIN' &&   role !== 'ADMIN') && Data.data.task_assignee !== Data.user?.find((u:any) => u.user_id === userId)?.user_name)) ?

              (<>

                <Tooltip title={toolTipMsg}>

                  <Button className='!rounded-full shadow-md' variant='twoTone' size='sm' disabled ><IoPlayOutline className='font-bold' /></Button>

                </Tooltip>

                <Button className='!rounded-full shadow-md' variant='twoTone' size='sm' disabled ><PiSquareThin /></Button>
              
              </>)
              :
              (<>
                <span className='' onClick={timerData.isRunning ? () => handlePause(data) : () => handleStart(data)}>

                  {
                  timerData.isRunning ?

                  <Tooltip title="Stop">
                    <Button className='!rounded-full shadow-md' variant='twoTone' size='sm' ><CiPause1 className='font-bold' /></Button> </Tooltip>
                      :

                      <Tooltip title={toolTipMsg}>
                    <Button className='!rounded-full shadow-md' variant='twoTone' size='sm'><IoPlayOutline className='' /></Button></Tooltip>
                      
                  }
                
                </span>
                <Button className='!rounded-full shadow-md' variant='twoTone' size='sm' onClick={() => handleReset(data)} disabled={Data.data.sub_task_status === 'Completed' ? true : false}><PiSquareThin /></Button>
              </>)
              
          }
          <h5>{formatTime()}</h5>

        </div>
    </div>
  )
}

export default TaskTimer

