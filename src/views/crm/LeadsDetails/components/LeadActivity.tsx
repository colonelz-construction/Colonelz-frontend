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
    username: string;
    role: string;
    message: string;
    updated_date:string;
  }

  type TimelineAvatarProps = AvatarProps

const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
    return (
        <Avatar {...rest} size={25} shape="circle">
            {children}
        </Avatar>
    )
}

const LeadActivity = ({details}:any) => {
    
  return (
    <>
    <Timeline>
    {

        details?.data[0].lead_update_track?.map((note:Note,index:number)=>(
           <Timeline.Item 
           media={
            <TimelineAvatar className="bg-amber-500">
                {note.username[0].toUpperCase()}
            </TimelineAvatar>
        }>
             <p className="my-1 flex">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {note.username}
                        </span>
                        <span className="mx-2">{note.message} </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {note?.updated_date ? new Date(note.updated_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric',hour:'2-digit',minute:'2-digit' }).replace(/\//g, '-') : ''}
                        </span>
                    </p>
                   
           </Timeline.Item>
        ))
    }
    </Timeline>
    </>
  )
}

export default LeadActivity