import React, { useState, useRef, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
// import Table from '@/components/ui/Table'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { BiSolidBellRing } from 'react-icons/bi'
import { useProjectContext } from '../../Customers/store/ProjectContext'
import TableRowSkeleton from '@/components/shared/loaders/TableRowSkeleton'

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Tooltip,
} from "@mui/material";

type LeadsProps = {
    className?: string
}

// const { Tr, Td, TBody, THead, Th } = Table

const Project = ({ className }: LeadsProps) => {
    const navigate = useNavigate()
    const onNavigate = () => {
        navigate('/app/crm/projectslist')
    }

    interface Client {
        client_name: string
        client_email: string
        client_contact: string
    }

    interface ProjectType {
        project_name: string
        project_type: string
        project_status: string
        project_id: string
        designer: string
        client: Client[]
        project_end_date: string // Added this to match your code
    }

    const projects = useProjectContext() || { projects: [] } // Ensure projects is defined
    // console.log(projects)
    // console.log(projects.loading)
    const memoizedProjects = useMemo(
        () => projects.projects || [],
        [projects.projects],
    )

    // console.log(memoizedProjects)

    const [hoveredClient, setHoveredClient] = useState<number | null>(null)
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null)
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const handleMouseEnter = (index: number) => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current)
        }
        setHoveredClient(index)
    }

    const handleMouseLeave = () => {
        hoverTimeout.current = setTimeout(() => {
            setHoveredClient(null)
        }, 200)
    }

    return (
        <Card className={className}>
            <div className="flex items-center justify-between mb-4">
                <h3>Projects</h3>
                <Button size="sm" onClick={onNavigate} variant="solid">
                    View All Projects
                </Button>
            </div>
            {/* <Table>
                <THead>
                    <Tr>
                        <Th>Project Name</Th>
                        <Th>Project Type</Th>
                        <Th>Client Name</Th>
                        <Th>Project Status</Th>
                        <Th>Project Incharge</Th>
                        <Th>Project End Date</Th>
                    </Tr>
                </THead>

                {projects.loading ? (<TableRowSkeleton
                               rows={5}
                                avatarInColumns={[0]}
                                columns={6}
                                avatarProps={{ width: 14, height: 14 }}
                            />) : (

                                <TBody>
                    {
                        Array.isArray(memoizedProjects) && memoizedProjects.length > 0 && (
                        memoizedProjects.slice(0, 5).map((item, index) => {
                            const currentDate = new Date()
                            const projectEndDate = new Date(
                                item.project_end_date,
                            )
                            const dateDifference = Math.floor(
                                (projectEndDate.getTime() -
                                    currentDate.getTime()) /
                                    (1000 * 3600 * 24),
                            )
 
                            return (
                                <Tr
                                    key={index}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        navigate(
                                            `/app/crm/project-details?project_id=${item.project_id}&client_name=${item.client[0].client_name}&id=65c32e19e0f36d8e1f30955c&type=details`,
                                        )
                                    }
                                >
                                    <Td>
                                        <span
                                            className={`capitalize ${
                                                dateDifference <= 1
                                                    ? 'text-red-500'
                                                    : ''
                                            } flex gap-2 items-center`}
                                        >
                                            {item.project_name}{' '}
                                            {dateDifference <= 1 && (
                                                <BiSolidBellRing />
                                            )}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span
                                            className={
                                                item.project_type.toLowerCase() ===
                                                'commercial'
                                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0 rounded px-2 py-1 capitalize font-semibold text-xs'
                                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded capitalize font-semibold text-xs px-3 py-1'
                                            }
                                        >
                                            {item.project_type}
                                        </span>
                                    </Td>
                                    <Td
                                        className="capitalize cursor-pointer relative"
                                        onMouseEnter={() =>
                                            handleMouseEnter(index)
                                        }
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.client[0]?.client_name}
                                        {hoveredClient === index && (
                                            <div className="absolute bottom-0 left-20 ml-2 bg-white border border-gray-300 p-2 shadow-lg z-99999 whitespace-nowrap transition-opacity duration-200">
                                                <p>
                                                    Client Name:{' '}
                                                    {item.client[0].client_name}
                                                </p>
                                                <p>
                                                    Client Email:{' '}
                                                    {
                                                        item.client[0]
                                                            .client_email
                                                    }
                                                </p>
                                                <p>
                                                    Client Contact:{' '}
                                                    {
                                                        item.client[0]
                                                            .client_contact
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </Td>
                                    <Td className="capitalize">
                                        {item.project_status}
                                    </Td>
                                    <Td className="capitalize">
                                        {item.designer}
                                    </Td>
                                    <Td>
                                        {dayjs(item.project_end_date).format(
                                            'DD-MM-YYYY',
                                        )}
                                    </Td>
                                </Tr>
                            )
                        })
                    ) }
                </TBody>

                            )} */}


            {/* <TBody>
                    {
                        Array.isArray(memoizedProjects) && memoizedProjects.length > 0 && (
                        memoizedProjects.slice(0, 5).map((item, index) => {
                            const currentDate = new Date()
                            const projectEndDate = new Date(
                                item.project_end_date,
                            )
                            const dateDifference = Math.floor(
                                (projectEndDate.getTime() -
                                    currentDate.getTime()) /
                                    (1000 * 3600 * 24),
                            )
 
                            return (
                                <Tr
                                    key={index}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        navigate(
                                            `/app/crm/project-details?project_id=${item.project_id}&client_name=${item.client[0].client_name}&id=65c32e19e0f36d8e1f30955c&type=details`,
                                        )
                                    }
                                >
                                    <Td>
                                        <span
                                            className={`capitalize ${
                                                dateDifference <= 1
                                                    ? 'text-red-500'
                                                    : ''
                                            } flex gap-2 items-center`}
                                        >
                                            {item.project_name}{' '}
                                            {dateDifference <= 1 && (
                                                <BiSolidBellRing />
                                            )}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span
                                            className={
                                                item.project_type.toLowerCase() ===
                                                'commercial'
                                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0 rounded px-2 py-1 capitalize font-semibold text-xs'
                                                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded capitalize font-semibold text-xs px-3 py-1'
                                            }
                                        >
                                            {item.project_type}
                                        </span>
                                    </Td>
                                    <Td
                                        className="capitalize cursor-pointer relative"
                                        onMouseEnter={() =>
                                            handleMouseEnter(index)
                                        }
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {item.client[0]?.client_name}
                                        {hoveredClient === index && (
                                            <div className="absolute bottom-0 left-20 ml-2 bg-white border border-gray-300 p-2 shadow-lg z-99999 whitespace-nowrap transition-opacity duration-200">
                                                <p>
                                                    Client Name:{' '}
                                                    {item.client[0].client_name}
                                                </p>
                                                <p>
                                                    Client Email:{' '}
                                                    {
                                                        item.client[0]
                                                            .client_email
                                                    }
                                                </p>
                                                <p>
                                                    Client Contact:{' '}
                                                    {
                                                        item.client[0]
                                                            .client_contact
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </Td>
                                    <Td className="capitalize">
                                        {item.project_status}
                                    </Td>
                                    <Td className="capitalize">
                                        {item.designer}
                                    </Td>
                                    <Td>
                                        {dayjs(item.project_end_date).format(
                                            'DD-MM-YYYY',
                                        )}
                                    </Td>
                                </Tr>
                            )
                        })
                    ) }
                </TBody> */}


            {/* </Table> */}


            <TableContainer className="overflow-y-auto shadow-none" style={{ scrollbarWidth: 'none', boxShadow: 'none' }}>
                <Table>
                    <TableHead>
                        <TableRow >
                            <TableCell className='font-bold' sx={{ backgroundColor: '#f9fafb', color: "#6B7280", fontWeight: "600" }}>Project Name</TableCell>
                            <TableCell className='font-bold' sx={{ backgroundColor: '#f9fafb', color: "#6B7280", fontWeight: "600" }}>Project Type</TableCell>
                            <TableCell className='font-bold' sx={{ backgroundColor: '#f9fafb', color: "#6B7280", fontWeight: "600" }}>Client Name</TableCell>
                            <TableCell className='font-bold' sx={{ backgroundColor: '#f9fafb', color: "#6B7280", fontWeight: "600" }}>Project Status</TableCell>
                            <TableCell className='font-bold' sx={{ backgroundColor: '#f9fafb', color: "#6B7280", fontWeight: "600" }}>Project Incharge</TableCell>
                            <TableCell className='font-bold' sx={{ backgroundColor: '#f9fafb', color: "#6B7280", fontWeight: "600" }}>Project End Date</TableCell>
                        </TableRow>
                    </TableHead>
                    {projects.loading ? (<TableRowSkeleton
                        rows={5}
                        avatarInColumns={[0]}
                        columns={6}
                        avatarProps={{ width: 14, height: 14 }}
                    />) : (
                        <TableBody>
                            {Array.isArray(memoizedProjects) && memoizedProjects.length > 0 ? (
                                memoizedProjects.slice(0, 5).map((item, index) => {
                                    const currentDate = new Date();
                                    const projectEndDate = new Date(item.project_end_date);
                                    const dateDifference = Math.floor(
                                        (projectEndDate.getTime() - currentDate.getTime()) /
                                        (1000 * 3600 * 24)
                                    );

                                    return (
                                        <TableRow
                                            key={index}
                                            hover
                                            onClick={() =>
                                                navigate(
                                                    `/app/crm/project-details?project_id=${item.project_id}&client_name=${item.client[0].client_name}&id=65c32e19e0f36d8e1f30955c&type=details`
                                                )
                                            }
                                            onMouseEnter={() => setHoveredRow(index)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            <TableCell sx={{ color: "#6B7280" }}>
                                                <Typography
                                                    className={`capitalize flex gap-2 items-center ${dateDifference <= 1 ? "text-red-500" : ""
                                                        }`}
                                                >
                                                    {item.project_name}
                                                    {dateDifference <= 1 && <BiSolidBellRing />}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`${item.project_type.toLowerCase() === "commercial"
                                                        ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0 rounded px-2 py-1 capitalize font-semibold text-xs"
                                                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100 border-0 rounded capitalize font-semibold text-xs px-3 py-1"
                                                        }`}
                                                >
                                                    {item.project_type}
                                                </span>
                                            </TableCell>
                                            <TableCell
                                                className="capitalize cursor-pointer relative"
                                                onMouseEnter={() => handleMouseEnter(index)}
                                                onMouseLeave={handleMouseLeave}
                                                sx={{ color: "#6B7280" }}
                                            >
                                                {item.client[0]?.client_name}
                                                {hoveredClient === index && (
                                                    <Tooltip
                                                        title={
                                                            <div>
                                                                <p>
                                                                    <strong>Client Name:</strong> {item.client[0].client_name}
                                                                </p>
                                                                <p>
                                                                    <strong>Client Email:</strong> {item.client[0].client_email}
                                                                </p>
                                                                <p>
                                                                    <strong>Client Contact:</strong> {item.client[0].client_contact}
                                                                </p>
                                                            </div>
                                                        }
                                                        arrow
                                                        placement="right"
                                                        open
                                                    >
                                                        <div className="absolute bottom-0 left-20 ml-2">
                                                            {/* The tooltip will attach to an invisible placeholder element */}
                                                        </div>
                                                    </Tooltip>
                                                )}
                                            </TableCell>

                                            <TableCell sx={{ color: "#6B7280" }}>
                                                <Typography className="capitalize">
                                                    {item.project_status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ color: "#6B7280" }}>
                                                <Typography className="capitalize">
                                                    {item.designer}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ color: "#6B7280" }}>
                                                {dayjs(item.project_end_date).format("DD-MM-YYYY")}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography align="center">No Projects Found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    )}
                </Table>
            </TableContainer>


        </Card>
    )
}


export default Project