
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
import { apiGetCrmLeadsSingleMiniTaskDataTimer, apiGetCrmLeadsSingleMiniTaskTimer } from '@/services/CrmService';
import { time } from 'console';

export type TimerResponse = {
  code: number;
  data: TimerData
}

type TimerData={
  project_id:string,
  task_id:string,
  mini_task_id:string
  mini_task_assignee:string,
  time:string,
  isrunning:boolean,
  current:string,
  total_time:string,
}

type MiniTask = {
    lead_id: string;
    task_id: string;
    mini_task_id:string;
    mini_task_name: string;
    mini_task_description: string;
    actual_mini_task_start_date: string;
    actual_mini_task_end_date: string;
    estimated_mini_task_start_date: string;
    estimated_mini_task_end_date: string;
    mini_task_status: string;
    mini_task_priority: string;
    mini_task_createdOn: string;
    mini_task_reporter: string;
    mini_task_createdBy: string;
    mini_task_assignee: string;
    remark:Remarks[]
};
type Remarks={
    remark:string;
    remark_by:string;
    remark_date:string;}
type Data={
    data:MiniTask
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

const MiniTaskTimer = ({Data}:any) => {

    const [verticalOpen, setVerticalOpen] = useState(false)
        const location=useLocation()
        const queryParam=new URLSearchParams(location.search);
        const leadId=queryParam.get('lead_id') || ''; 
        const org_id = localStorage.getItem('orgId')
        const userId = localStorage.getItem('userId')
        const role = localStorage.getItem('role')
    
        console.log(Data.data)
    
        
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
            lead_id:string,
            task_id:string,
            org_id: string | null,
            mini_task_id:string
            mini_task_assignee:string,
            time:string,
            isrunning:boolean,
            current:string,
            total_time:string,
        }
    
        const [data, setData] = useState<UpdateData>({
            lead_id:leadId,
            org_id,
            task_id:Data.data.task_id,
            mini_task_id:Data.data.mini_task_id,
            mini_task_assignee:Data.data.mini_task_assignee,
            time:'',
            isrunning:false,
            current:'',
            total_time:'',
        })
        const Submit=async(data:UpdateData)=>{
            const response=await apiGetCrmLeadsSingleMiniTaskTimer(data);
            // window.location.reload();
    
        }
    
        
        const usePersistentTimer = (minitaskId: string) => {
            const getInitialState = () => {
              const savedTimers = localStorage.getItem('timers');
              const timers = savedTimers ? JSON.parse(savedTimers) : {};
              return timers[minitaskId] || { time: 0, isRunning: true, totalTime: 0, current:new Date().getTime()  };
            };
          
            const [timerData, setTimerData] = useState(getInitialState);
    
            useEffect(() => {
                const fetchData = async () => {
                    
                    const response = await apiGetCrmLeadsSingleMiniTaskDataTimer(leadId, Data.data.task_id, Data.data.mini_task_id, org_id);
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
            }, [leadId])
          
            useEffect(() => {
              const savedTimers = localStorage.getItem('timers');
              const timers = savedTimers ? JSON.parse(savedTimers) : {};
              timers[minitaskId] = timerData;
              localStorage.setItem('timers', JSON.stringify(timers));
            }, [timerData, minitaskId]);
          
            return [timerData, setTimerData];
          };
        
       
          const [timerData, setTimerData] = usePersistentTimer(Data.data.mini_task_id);
    
        
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
        
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    <div className={`flex   items-center ${Data?.isShow &&  "gap-4 "}`}>

                      {Data.isShow && ((Data.data.mini_task_status==='Completed' || Data.data.mini_task_status==='Cancelled') || Data.data.mini_task_status==='Pending' || ((role !== 'SUPERADMIN' && role !== 'ADMIN') && Data.data.mini_task_assignee !== Data?.users?.find((u:any) => u.user_id === userId)?.user_name))?
                      
                      (<>
                      <Button className='!rounded-full shadow-md' variant='twoTone' size='sm'disabled ><IoPlayOutline className='font-bold'/></Button>

                      <Button className='!rounded-full shadow-md' variant='twoTone' size='sm'disabled ><PiSquareThin/></Button>
                      
                      </>):
                    Data.isShow &&
                    <><span  className=''  onClick={timerData.isRunning?handlePause:handleStart}>


                            {timerData.isRunning?
                            
                            <Button className='!rounded-full shadow-md' variant='twoTone' size='sm' ><CiPause1 className='font-bold'/></Button>
                            
                            :<Button className='!rounded-full shadow-md' variant='twoTone' size='sm'><IoPlayOutline className=''/></Button>}</span>


                                <Button className='!rounded-full shadow-md' variant='twoTone' size='sm' onClick={handleReset} disabled={Data.data.mini_task_status==='Completed'?true:false}><PiSquareThin/></Button></>    }

                                {Data.isShow ? <h5>{formatTime()}</h5> : <p className='font-semibold'>{formatTime()}</p>}
      
    </div>
  )
}

export default MiniTaskTimer