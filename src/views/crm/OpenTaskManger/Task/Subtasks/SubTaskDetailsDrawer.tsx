
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { HiOutlinePencil } from 'react-icons/hi'
import { Progress, Tabs } from '@/components/ui';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineAdd } from 'react-icons/md';
import { AiOutlineEye } from 'react-icons/ai';
import { BiArrowFromRight } from 'react-icons/bi';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoMdSquareOutline } from 'react-icons/io';
import { IoPlayOutline } from "react-icons/io5";
import { PiPause, PiSquareThin } from "react-icons/pi";
import { CiPause1 } from 'react-icons/ci';
import { GiSquare } from "react-icons/gi";
import { apiGetCrmOpenSingleSubTaskDataTimer, apiGetCrmOpenSingleSubTaskTimer, apiGetCrmProjectsSingleSubTaskDataTimer, apiGetCrmProjectsSingleSubTaskTimer } from '@/services/CrmService';
import { time } from 'console';

export type TimerResponse = {
  code: number;
  data: TimerData
}

type TimerData={
  task_id:string,
  sub_task_id:string
  sub_task_assignee:string,
  time:string,
  isrunning:boolean,
  current:string,
  total_time:string,
}

type SubTask = {
    task_id: string;
    sub_task_id:string;
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
    remark:Remarks[]
};
type Remarks={
    remark:string;
    remark_by:string;
    remark_date:string;}
type Data={
    data:SubTask
}
type CustomerInfoFieldProps = {
    title?: string
    value?: any
}
const formateDate = (dateString:string) => {
    const date = new Date(dateString);
    const day=date.getDate().toString().padStart(2, '0');
    const month=(date.getMonth() + 1).toString().padStart(2, '0');
    const year=date.getFullYear();
    return `${day}-${month}-${year}`;
    }

const SubTaskDetails = (Data:any) => {
    const [verticalOpen, setVerticalOpen] = useState(false)
    const location=useLocation()
    const queryParam=new URLSearchParams(location.search);
    const projectId=queryParam.get('project_id') || ''; 
    const org_id = localStorage.getItem('orgId')
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')

    // console.log(Data)

    
    const navigate=useNavigate();
    
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

    type UpdateData={
        task_id:string,
        org_id: string | null,
        sub_task_id:string
        sub_task_assignee:string,
        time:string,
        isrunning:boolean,
        current:string,
        total_time:string,
    }

    const [data, setData] = useState<UpdateData>({
        org_id,
        task_id:Data.data.task_id,
        sub_task_id:Data.data.sub_task_id,
        sub_task_assignee:Data.data.sub_task_assignee,
        time:'',
        isrunning:false,
        current:'',
        total_time:'',
    })
    const Submit=async(data:UpdateData)=>{
        const response=await apiGetCrmOpenSingleSubTaskTimer(data);

    }

    
    const usePersistentTimer = (subtaskId: string) => {
        const getInitialState = () => {
          const savedTimers = localStorage.getItem('timers');
          const timers = savedTimers ? JSON.parse(savedTimers) : {};
          return timers[subtaskId] || { time: 0, isRunning: true, totalTime: 0, current:new Date().getTime()  };
        };
      
        const [timerData, setTimerData] = useState(getInitialState);

        useEffect(() => {
            const fetchData = async () => {
                
                const response = await apiGetCrmOpenSingleSubTaskDataTimer(Data.data.task_id, Data.data.sub_task_id);
                if (response) {
                    const { time, isrunning, total_time, current } = response.data;
                    
                    time.length===0 ?
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
        }, [projectId])
      
        useEffect(() => {
          const savedTimers = localStorage.getItem('timers');
          const timers = savedTimers ? JSON.parse(savedTimers) : {};
          timers[subtaskId] = timerData;
          localStorage.setItem('timers', JSON.stringify(timers));
        }, [timerData, subtaskId]);
      
        return [timerData, setTimerData];
      };
    
   
      const [timerData, setTimerData] = usePersistentTimer(Data.data.sub_task_id);

    
      useEffect(() => {
        let interval = null;
        if (timerData.isRunning) {
          interval = setInterval(() => {
            setTimerData((prevData:any) => {
              const now = new Date().getTime();
              const diff = now - prevData.current;
              time: prevData.time + diff
              return { ...prevData  };
            });
          }, 1);
        } else {
            if(interval)          clearInterval(interval);
        }
        return () =>{if(interval) {clearInterval(interval);}}
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
    
      const handleStart = () => {
        const now = new Date().getTime();
        setTimerData((prevData:any) => {
          const updatedData = {
            ...prevData,
            isRunning: true,
            current: now,
          };
      
          const submitData = {
            ...data,
            time: `${updatedData.time}`, 
            isrunning: true,
            current: now.toString(),
            total_time: updatedData.totalTime.toString(), 
          };
          Submit(submitData);
      
          return updatedData;
        });
      };
    
      const handlePause = () => {
        setTimerData((prevData:any) => {
          const now = new Date().getTime();
          const updatedTime = prevData.time + (now - (prevData.current || now));
          const updatedData = {
            ...prevData,
            isRunning: false,
            time: updatedTime,
            current: null,
          };
      
          
          const submitData = {
            ...data,
            time: updatedData.time.toString(), 
            isrunning: false,
            current: now.toString(),
            total_time: updatedData.totalTime.toString(), 
          };
      
          
          Submit(submitData);
      
          return updatedData;
        });
      };
    
      const handleReset = () =>{ setTimerData({ time: 0, isRunning: false, totalTime: 0, current: null })
        const submitData = {
            ...data,
            time: '0',
            isrunning: false,
            current: new Date().getTime().toString(),
            total_time: '0',
        };
        Submit(submitData);
    };
    
      
    

    

   

    return (
        <div>
            <div
                onClick={() => onVerticalOpen()}
                className=' cursor-pointer'
            >
                {Data.data.sub_task_name}
            </div>
            <Drawer
                
                isOpen={verticalOpen}
                placement="right"
                width={450}
                bodyClass="py-3"
                onRequestClose={onDrawerClose}
                closable={false}
            >
                <div className='flex gap-5 items-center'>
                <h4 className='p-2'>Subask:{Data.data.sub_task_name}</h4>
                </div>
                <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Details</TabNav>
                </TabList>



                <div className="p-4">
                    <TabContent value="tab1">
                    <div className='flex  gap-4 items-center mb-5'>

                      {(Data.data.sub_task_status==='Completed' || Data.data.sub_task_status==='Cancelled') || Data.data.sub_task_status==='Pending' || ((role !== 'SUPERADMIN' && role !== 'ADMIN') && Data.data.sub_task_assignee !== Data?.users?.find((u:any) => u.UserId === userId)?.username)?
                      
                      (<><Button className='!rounded-full shadow-md' variant='twoTone' size='sm'disabled ><IoPlayOutline className='font-bold'/></Button>
                      <Button className='!rounded-full shadow-md' variant='twoTone' size='sm'disabled ><PiSquareThin/></Button></>):

                    <><span  className=''  onClick={timerData.isRunning?handlePause:handleStart}>
                            {timerData.isRunning?<Button className='!rounded-full shadow-md' variant='twoTone' size='sm' ><CiPause1 className='font-bold'/></Button>:<Button className='!rounded-full shadow-md' variant='twoTone' size='sm'><IoPlayOutline className=''/></Button>}</span>
                                <Button className='!rounded-full shadow-md' variant='twoTone' size='sm' onClick={handleReset} disabled={Data.data.sub_task_status==='Completed'?true:false}><PiSquareThin/></Button></>    }
                            <h5>{formatTime()}</h5>
      
    </div>
                    <CustomerInfoField title="Creator" value={Data.data.sub_task_createdBy} />
                    <CustomerInfoField title="Created On" value={formateDate(Data.data.sub_task_createdOn)} />
                    <div className='p-1'> </div>
                    <CustomerInfoField title="Name" value={(Data.data.sub_task_name)} />
                    <CustomerInfoField title="Status" value={(Data.data.sub_task_status)} />
                    <CustomerInfoField title="Priority" value={(Data.data.sub_task_priority)} />
                    <CustomerInfoField title="Start Date" value={Data.data.actual_sub_task_start_date?formateDate(Data.data.actual_sub_task_start_date):'-'} />
                    <CustomerInfoField title="End Date" value={Data.data.actual_sub_task_end_date?formateDate(Data.data.actual_sub_task_end_date):'-'} />
                    <CustomerInfoField title="Estimated Start Date" value={formateDate(Data.data.estimated_sub_task_start_date)} />
                    <CustomerInfoField title="Estimated End Date" value={formateDate(Data.data.estimated_sub_task_end_date)} />
                    <CustomerInfoField title="Reporter" value={(Data.data.sub_task_reporter)} />
                    <CustomerInfoField title="Assignee" value={(Data.data.sub_task_assignee)} />
                    <CustomerInfoField title="Description" value={Data.data.sub_task_description} />
                      <span className='text-gray-700 dark:text-gray-200 font-semibold'>Remark:</span>
                    <ul className='list-disc ml-4' >
                    {Data.data.remark.map((remark :any,index :any)=>(
                      <li key={index}>
                         <div className='flex gap-1 mb-2 pt-1'>
                <p className="" style={{overflowWrap:"break-word"}}>
                {remark.remark}-{remark.remark_by}({(formateDate(remark.remark_date))})
                </p>
            </div>
                       
                        </li>
                    ))}
                    </ul>


                   
                    </TabContent>
                </div>
                </Tabs>
                
            </Drawer>
        </div>
    )
}

export default SubTaskDetails

