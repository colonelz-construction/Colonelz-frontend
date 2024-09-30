import { Avatar, AvatarProps, Card, Timeline } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { Customer, ProjectUpdate } from '../store'
import { apiGetCrmProjectActivity } from '@/services/CrmService'

type CustomerProfileProps = {
    Data: Customer
}
type TimelineAvatarProps = AvatarProps

const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
    return (
        <Avatar {...rest} size={25} shape="circle">
            {children}
        </Avatar>
    )
}
const Activity = ({ Data} : CustomerProfileProps) => {
    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get('project_id')
    console.log(Data)
    
    const [activityData, setActivityData] = useState<any[]>([]);
    console.log(activityData)

    useEffect(() => {

        const getData = async () => {

            const act = await apiGetCrmProjectActivity(projectId);
            console.log(act.data.activities)
            setActivityData(act.data.activities)

        }

        getData()

    }, [])
    
    
    

    //at first the activity is not on reverse but after reload it appears in reverse, using useEffect fixs the problem.
    useEffect(() => {
        const data = Data?.project_updated_by
        console.log(data)
        setActivityData(data)

    }, [])
    
  return (
    <Card className=''>
        <h4 className='font-bold capitalize py-3'>Project Activity</h4>
            <Timeline className='mt-4'>
                {activityData?.map((item, index) => (
            <Timeline.Item  media={
                        <TimelineAvatar className="bg-amber-500">
                            {item.username[0]}
                        </TimelineAvatar>
                    }>
                         <p className="my-1 flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.username}{' '}
                        </span>
                        <span className="mx-2">{item.message} </span>
                        <span className="ml-3 rtl:mr-3">
          {new Date(item.updated_date)?.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).replace(/[/,]/g, '-').replace(/,/, '')}
        </span>
                    </p>

            </Timeline.Item>
             ))} 
            </Timeline>
        </Card>
  )
}

export default Activity
