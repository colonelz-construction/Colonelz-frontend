import { Avatar, AvatarProps, Card, Timeline } from '@/components/ui'
import React from 'react'


export type CustomerProfileProps = {
    data?: Partial<Customer>
  }
  
  type Customer = {
    _id: string
    name: string
    lead_id:string
    email:string
    phone:string
    location:string
    status:string
    source:string
    notes?: Note[];
  }
  
  interface Note {
    _id: string;
    content: string;
    createdBy: string;
    date: string;
    status: string;
  }

  type TimelineAvatarProps = AvatarProps

const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
    return (
        <Avatar {...rest} size={25} shape="circle">
            {children}
        </Avatar>
    )
}

const FollowDetails = ({details}:any) => {
    
  return (
    <>
    <Timeline>
    {

        details?.data[0].notes?.map((note:Note,index:number)=>(
           <Timeline.Item 
           media={
            <TimelineAvatar className="bg-amber-500">
                {note.createdBy[0].toUpperCase()}
            </TimelineAvatar>
        }>
             <p className="my-1 flex items-center">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {note.createdBy}
                        </span>
                        <span className="mx-2">has Changed lead Status to {note.status} on </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {note?.date ? new Date(note.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric',hour:'2-digit',minute:'2-digit' }).replace(/\//g, '-') : ''}
                        </span>
                    </p>
                    <Card className="mt-4">
                        <p>
                        <div className="remark-content" dangerouslySetInnerHTML={{ __html: note.content }} />
                        </p>
                    </Card>
           </Timeline.Item>
        ))
    }
    </Timeline>
    </>
  )
}

export default FollowDetails