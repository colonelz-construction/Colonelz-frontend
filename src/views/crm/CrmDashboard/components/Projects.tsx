import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { Customer } from '../store'
import { useEffect, useMemo, useState } from 'react'
import { BiSolidBellRing } from 'react-icons/bi'
import { Dropdown } from '@/components/ui'
import { useProjectContext } from '../../Customers/store/ProjectContext'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'



type LeadsProps = {
    data?: Customer[]
    className?: string
    
}

const { Tr, Td, TBody, THead, Th } = Table

const Project = ({  className }: LeadsProps) => { 
    const navigate = useNavigate()
    

    const onNavigate = () => {
        navigate('/app/crm/projectslist')
    }
    interface client{
        client_name:string
        client_email:string
        client_contact:string
        designer:string
    }
    interface Projects {
       project_name:string
       project_type:string
       project_status:string
       project_id:string
       designer:string
       client:client[]
       project_updated_by:client[]
       timeline_date:string
      }
      interface Data {
        projects:Projects[]
      }
 
    const projects=useProjectContext();
    const {loading}=useProjectContext()
    console.log(loading);
    
    const memoizedProjects = useMemo(() => projects.projects, [projects.projects]);

    return (
        <Card className={className}>
            <div className="flex items-center justify-between mb-4">
                <h4>Projects</h4>
                <Button size="sm" onClick={onNavigate}>
                    View All Projects
                </Button>
            </div>
            <Table>
                <THead>
                    <Tr>
                        <Th>Project Name</Th>
                        <Th>Project Type</Th>
                        <Th>Client Name</Th>
                        <Th>Project Status</Th>
                        <Th>Project Incharge</Th>
                        <Th>Project End Date</Th>
                        <Th></Th>
                    </Tr>
                </THead>
                    {loading ?
                     <TableRowSkeleton
                     avatarInColumns= {[0]}
                     columns={6}
                     rows={5}
                     avatarProps={{ width: 14, height: 14 }}
                 />:
                <TBody>
                    {
                    memoizedProjects.slice(0, 5).map((item, index) => {
                        const currentDate = new Date();
                        const projectEndDate = new Date(item.project_end_date);
                        const dateDifference = Math.floor((projectEndDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
                        return (
                            <Tr key={index}>
                                <Td className={`capitalize ${dateDifference <= 1 ? 'text-red-500' : ''} flex gap-2 items-center cursor-pointer`} onClick={() => navigate(`/app/crm/project-details?project_id=${item.project_id}&client_name=${item.client[0].client_name}&id=65c32e19e0f36d8e1f30955c&type=details`)}>
                                    {item.project_name} {dateDifference <= 1 && <BiSolidBellRing />}
                                </Td>
                                <Td >
                                    <span className={
                                        item.project_type === 'commercial' || item.project_type === 'Commercial'
                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0 rounded px-2 py-1 capitalize font-semibold text-xs'
                                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100  border-0 rounded capitalize font-semibold text-xs px-3 py-1'
                                    }>{item.project_type}</span>
                                </Td>
                                <Td className="capitalize cursor-pointer"><Dropdown placement="bottom-center" renderTitle={<span>{item.client[0].client_name}</span>} className=' cursor-pointer' style={{width:'auto'}}>
                            <div className='px-2'>
                                <p>Client Name: {item.client[0].client_name}</p>
                                <p>Client Email: {item.client[0].client_email}</p>
                                <p>Client Contact: {item.client[0].client_contact}</p>
                            </div>
                        </Dropdown></Td>
                                <Td className=' capitalize'>{item.project_status}</Td>
                                <Td className=' capitalize'>{item.designer}</Td>
                                <Td>{dayjs(item.project_end_date).format('DD-MM-YYYY')}</Td>
                            </Tr>
                        )
                    })}
                </TBody>}
            </Table>
        </Card>
    )
}

export default Project
