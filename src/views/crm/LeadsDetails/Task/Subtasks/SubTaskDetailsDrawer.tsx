
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import { HiOutlinePencil } from 'react-icons/hi'
import { Progress, Tabs } from '@/components/ui';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import { useLocation, useNavigate } from 'react-router-dom';
import SubTaskTimer from './SubTaskTimer';

export type TimerResponse = {
  code: number;
  data: TimerData
}

type TimerData={
  project_id:string,
  task_id:string,
  sub_task_id:string
  sub_task_assignee:string,
  time:string,
  isrunning:boolean,
  current:string,
  total_time:string,
}

type SubTask = {
    lead_id: string;
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


    const onDrawerClose = () => {
        setVerticalOpen(false)
    } 

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

                    <SubTaskTimer isShow={Data.isShow} user={Data.user} data={Data.data}/>

                    <CustomerInfoField title="Creator" value={Data.data.sub_task_createdBy} />
                    <CustomerInfoField title="Created On" value={formateDate(Data.data.sub_task_createdOn)} />
                    <div className='p-1'> </div>
                    <CustomerInfoField title="Name" value={(Data.data.sub_task_name)} />
                    <CustomerInfoField title="Status" value={(Data.data.sub_task_status)} />
                    <CustomerInfoField title="Priority" value={(Data.data.sub_task_priority)} />
                    <CustomerInfoField title="Delegation Date" value={formateDate(Data.data.estimated_sub_task_start_date)} />
                    {/* <CustomerInfoField title="Estimated End Date" value={formateDate(Data.data.estimated_sub_task_end_date)} /> */}
                    <CustomerInfoField title="Start Date" value={Data.data.actual_sub_task_start_date?formateDate(Data.data.actual_sub_task_start_date):'-'} />
                    <CustomerInfoField title="End Date" value={Data.data.actual_sub_task_end_date?formateDate(Data.data.actual_sub_task_end_date):'-'} />
                    <CustomerInfoField title="Reporter" value={(Data.data.sub_task_reporter)} />
                    <CustomerInfoField title="Assignee" value={(Data.data.sub_task_assignee)} />
                    <CustomerInfoField title="Description" value={Data.data.sub_task_description} />
                      <span className='text-gray-700 dark:text-gray-200 font-semibold'>Remark:</span>
                    <ul className='list-disc ml-4' >
                    {Data.data.remark.map((remark:any,index:any)=>(
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

