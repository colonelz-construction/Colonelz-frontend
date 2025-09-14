import React, { useState, useRef, useEffect } from "react";
import {
    format,
    differenceInDays,
    differenceInWeeks,
    differenceInMonths,
    differenceInYears,
    addDays,
    addWeeks,
    addMonths,
    addYears,
    startOfWeek,
} from "date-fns";
import { Dropdown, Notification, toast, Dialog, Input, Select, FormItem, Button } from "@/components/ui";
import AddExecTask from "./AddExecTask";
import AddExecSubTask from "./AddExecSubTask";
import AddExecSubTaskDetails from "./AddExecSubTaskDetails";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import EditExecTask from "./EditExecTask";
import EditExecSubTask from "./EditExecSubTask";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { IoIosOptions } from "react-icons/io";
import EditExecSubTaskDetails from "./EditExecSubTaskDetails";
import { ConfirmDialog } from "@/components/shared";
import { apiDeleteCrmExecSubTask, apiDeleteCrmExecSubTaskDetail, apiDeleteCrmExecTask, apiDownloadExecChart, apiUpdateCrmExecSubTask, apiUpdateCrmExecSubTaskDetail, apiUpdateCrmExecTask, apiGetCrmFileManagerCreateProjectFolder, apiGetCrmFileManagerShareFiles } from "@/services/CrmService";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { IoIosInformationCircleOutline } from "react-icons/io";

import Tippy from '@tippyjs/react';
import { followCursor } from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css'; // Optional for animations
import 'tippy.js/animations/shift-away.css';
import AffectionDetails from "./AffectionDetails";
import { toPng } from 'html-to-image';
import { HiOutlineDownload, HiShare } from 'react-icons/hi';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import jsPDF from 'jspdf';

interface Delay {
    name: string;
    start: Date;
    end: Date;
}

interface Task {
    id: number;
    text: string;
    start: Date;
    end: Date;
    delays?: Delay[];
    subtasks?: Task[];
}

type TimelineDayView = {
    monthHeaders: { month: string; span: number }[];
    dayHeaders: { day: string; date: Date }[];
};

type TimelineOtherView = { label: string; date: Date }[];

interface GanttChartProps {
    execData: any;
    onRefreshData?: () => void;
}

const GanttChart = ({ execData, onRefreshData }: GanttChartProps) => {
    const [hoveredDelay, setHoveredDelay] = useState<{ start: Date, end: Date } | null>(null);
    const [view, setView] = useState<"days" | "weeks" | "months" | "years">("days");
    const headerRef = useRef<HTMLDivElement>(null);
    const chartAreaRef = useRef<HTMLDivElement>(null);
    const [localExecData, setLocalExecData] = useState(execData);
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [dialogIsOpen1, setIsOpen1] = useState(false)
    const [dialogIsOpen2, setIsOpen2] = useState(false)
    const [dialogIsOpen3, setIsOpen3] = useState(false)
    const [dialogIsOpen4, setIsOpen4] = useState(false)
    const [dialogIsOpen5, setIsOpen5] = useState(false)
    const [dialogIsOpen6, setIsOpen6] = useState(false)
    const [dialogIsOpen7, setIsOpen7] = useState(false)
    const [dialogIsOpen8, setIsOpen8] = useState(false)
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any>({});
    const [selectedSubTask, setSelectedSubTask] = useState<any>({});
    const [selectedDetail, setSelectedDetail] = useState<any>({});
    const [selectedExecData, setSelectedExecData] = useState<any>([]);
    const cardRef = useRef<any>(null);
    const queryParams = new URLSearchParams(location.search);
    const project_id = queryParams.get('project_id')
    const org_id = localStorage.getItem("orgId")

    // Sync local data when prop changes
    useEffect(() => {
        setLocalExecData(execData);
    }, [execData]);

    // Function to update local state instead of reloading
    const updateLocalExecData = (updatedData: any) => {
        setLocalExecData(updatedData);
    };

    const openDialog1 = (task: any) => {
        setSelectedTask(task);
        setIsOpen1(true)
    }

    const onDialogClose1 = () => {

        setIsOpen1(false)
    }

    const openDialog2 = (task: any, subtask: any) => {
        setSelectedTask(task);
        setSelectedSubTask(subtask);
        setIsOpen2(true)
    }

    const onDialogClose2 = () => {
        setIsOpen2(false)
    }

    const openDialog4 = (task: any, subtask: any, detail: any) => {
        setSelectedTask(task);
        setSelectedSubTask(subtask);
        setSelectedDetail(detail);
        setIsOpen4(true)
    }

    const onDialogClose4 = () => {
        setIsOpen4(false)
    }

    const openDialog5 = (task: any, subtask: any, detail: any) => {
        setSelectedTask(task);
        setSelectedSubTask(subtask);
        setSelectedDetail(detail);
        setIsOpen5(true)
    }

    const onDialogClose5 = () => {
        setIsOpen5(false)
    }
    const openDialog6 = (task: any) => {
        setSelectedTask(task);
        setIsOpen6(true)
    }

    const onDialogClose6 = () => {
        setIsOpen6(false)
    }

    const openDialog7 = (task: any, subtask: any) => {
        setSelectedTask(task);
        setSelectedSubTask(subtask);
        setIsOpen7(true)
    }

    const onDialogClose7 = () => {
        setIsOpen7(false)
    }

    const openDialog8 = (task: any, subtask: any) => {
        setSelectedTask(task);
        setSelectedSubTask(subtask);
        setIsOpen8(true)
    }

    const onDialogClose8 = () => {
        setIsOpen8(false)
    }

    const openShareDialog = () => setShareDialogOpen(true)
    const closeShareDialog = () => setShareDialogOpen(false)

    const openDialog3 = (task: any, subtask: any, execData: any) => {
        setSelectedTask(task);
        setSelectedSubTask(subtask);
        setSelectedExecData(execData);
        setIsOpen3(true)
    }

    const onDialogClose3 = () => {
        setIsOpen3(false)
    }

    const openDialog = (task: any) => {
        setSelectedTask(task);
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    // Wrapper functions for Add components that don't need parameters
    const openAddSubTaskDialog = () => {
        setIsOpen(true)
    }

    const openAddSubTaskDetailsDialog = () => {
        setIsOpen3(true)
    }

    //delay drag start------------------------------------------------------

    // Add these to your component state
    const [dragging, setDragging] = useState<{
        type: 'left' | 'right' | null;
        taskId: string | null;
        subtaskId: string | null;
        subtask_comment: string | null;
        subtask_type: string | null;
        color: string | null;
        detailId: string | null;
        startX: number | null;
        originalStartDate: Date | null;
        originalEndDate: Date | null;
    }>({
        type: null,
        taskId: null,
        subtaskId: null,
        subtask_comment: null,
        subtask_type: null,
        color: null,
        detailId: null,
        startX: null,
        originalStartDate: null,
        originalEndDate: null
    });

    const [tempDates, setTempDates] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    // Helper function to find a detail by IDs
    const findDetail = (taskId: string, subtaskId: string, detailId: string) => {
        const task = localExecData.find((t: any) => t.task_id === taskId);
        if (!task) return null;

        const subtask = task.subtasks?.find((st: any) => st.sub_task_id === subtaskId);
        if (!subtask) return null;

        return subtask.sub_task_details?.find((d: any) => d.subtask_details_id === detailId);
    };

    // Helper function to update detail in local state
    const updateDetailInLocalState = (taskId: string, subtaskId: string, detailId: string, updatedDetail: any) => {
        const newData = localExecData.map((task: any) => {
            if (task.task_id === taskId) {
                return {
                    ...task,
                    subtasks: task.subtasks?.map((subtask: any) => {
                        if (subtask.sub_task_id === subtaskId) {
                            return {
                                ...subtask,
                                sub_task_details: subtask.sub_task_details?.map((detail: any) => {
                                    if (detail.subtask_details_id === detailId) {
                                        return { ...detail, ...updatedDetail };
                                    }
                                    return detail;
                                })
                            };
                        }
                        return subtask;
                    })
                };
            }
            return task;
        });
        setLocalExecData(newData);
    };

    // Helper function to update subtask in local state
    const updateSubtaskInLocalState = (taskId: string, subtaskId: string, updatedSubtask: any) => {
        const newData = localExecData.map((task: any) => {
            if (task.task_id === taskId) {
                return {
                    ...task,
                    subtasks: task.subtasks?.map((subtask: any) => {
                        if (subtask.sub_task_id === subtaskId) {
                            return { ...subtask, ...updatedSubtask };
                        }
                        return subtask;
                    })
                };
            }
            return task;
        });
        setLocalExecData(newData);
    };

    // Helper function to update task in local state
    const updateTaskInLocalState = (taskId: string, updatedTask: any) => {
        const newData = localExecData.map((task: any) => {
            if (task.task_id === taskId) {
                return { ...task, ...updatedTask };
            }
            return task;
        });
        setLocalExecData(newData);
    };

    // Helper function to handle refreshing data after adding new items
    const refreshExecData = () => {
        if (onRefreshData) {
            onRefreshData();
        }
    };

    // Add these functions to your component
    const handleDragStart = (
        e: React.MouseEvent,
        type: 'left' | 'right',
        taskId: string,
        subtaskId: string,
        detailId: string,
        subtask_comment: string,
        subtask_type: string,
        color: string,
        originalStartDate: Date,
        originalEndDate: Date
    ) => {
        e.stopPropagation();
        setDragging({
            type,
            taskId,
            subtaskId,
            subtask_comment,
            subtask_type,
            color,
            detailId,
            startX: e.clientX,
            originalStartDate,
            originalEndDate
        });
        setTempDates({ start: originalStartDate, end: originalEndDate });
    };

    const handleDragMove = (e: MouseEvent) => {
        if (!dragging.type || !dragging.startX || !dragging.taskId || !dragging.subtaskId || !dragging.detailId) return;

        const deltaX = e.clientX - dragging.startX;
        const deltaDays = Math.round(deltaX / dayWidth);

        if (deltaDays === 0) return;

        if (dragging.type === 'left') {
            const newStartDate = addDays(dragging.originalStartDate as Date, deltaDays);
            // Ensure new start date is before end date
            if (newStartDate < (tempDates.end || dragging.originalEndDate as Date)) {
                setTempDates({
                    start: newStartDate,
                    end: tempDates.end || dragging.originalEndDate
                });
            }
        } else {
            const newEndDate = addDays(dragging.originalEndDate as Date, deltaDays);
            // Ensure new end date is after start date
            if (newEndDate > (tempDates.start || dragging.originalStartDate as Date)) {
                setTempDates({
                    start: tempDates.start || dragging.originalStartDate,
                    end: newEndDate
                });
            }
        }
    };

    const handleDragEnd = async () => {
        if (!dragging.type || !dragging.taskId || !dragging.subtaskId || !dragging.detailId) {
            setDragging({
                type: null,
                taskId: null,
                subtaskId: null,
                subtask_comment: null,
                subtask_type: null,
                color: null,
                detailId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null
            });
            setTempDates({ start: null, end: null });
            return;
        }

        // Here you would call your API to update the dates
        try {
            const detail = findDetail(dragging.taskId, dragging.subtaskId, dragging.detailId);
            if (!detail) return;

            const newStartDate = tempDates.start || dragging.originalStartDate;
            const newEndDate = tempDates.end || dragging.originalEndDate;

            if (!newStartDate || !newEndDate) return;
            const data = {
                user_id: localStorage.getItem('userId') || '',
                org_id,
                project_id: project_id || '',
                task_id: dragging?.taskId,
                subtask_id: dragging?.subtaskId,
                subtask_details_start_date: newStartDate,
                subtask_details_end_date: newEndDate,
                subtask_details_id: dragging?.detailId,
                subtask_comment: dragging?.subtask_comment,
                subtask_type: dragging?.subtask_type,
                color: dragging?.color,
            }

            console.log(data)
            const response = await apiUpdateCrmExecSubTaskDetail(data)

            if (response.code === 200) {
                // Update local state instead of reloading
                updateDetailInLocalState(dragging.taskId, dragging.subtaskId, dragging.detailId, {
                    subtask_details_start_date: newStartDate,
                    subtask_details_end_date: newEndDate
                });

                // Show success notification
                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Dates updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="danger" duration={2000}>
                        Error updating dates: {response.errorMessage || 'Unknown error'}
                    </Notification>,
                    { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error updating dates:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error updating dates
                </Notification>,
                { placement: 'top-end' }
            );
        } finally {
            setDragging({
                type: null,
                taskId: null,
                subtaskId: null,
                subtask_comment: null,
                subtask_type: null,
                color: null,
                detailId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null
            });
            setTempDates({ start: null, end: null });
        }
    };

    // Add event listeners in useEffect
    useEffect(() => {
        if (dragging.type) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            return () => {
                document.removeEventListener('mousemove', handleDragMove);
                document.removeEventListener('mouseup', handleDragEnd);
            };
        }
    }, [dragging, tempDates]);


    //delay drag end ------------------------------------------------------------------


    //subtask drag start ----------------------------------------------------------
    // Add this new state for subtask dragging only
    const [subtaskDragging, setSubtaskDragging] = useState<{
        type: 'left' | 'right' | null;
        taskId: string | null;
        subtaskId: string | null;
        startX: number | null;
        originalStartDate: Date | null;
        originalEndDate: Date | null;
        subtask_name: string | null;
        color: string | null;
    }>({
        type: null,
        taskId: null,
        subtaskId: null,
        startX: null,
        originalStartDate: null,
        originalEndDate: null,
        subtask_name: null,
        color: null,
    });

    const [subtaskTempDates, setSubtaskTempDates] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    // Helper function to find a subtask by IDs
    const findSubtask = (taskId: string, subtaskId: string) => {
        const task = localExecData.find((t: any) => t.task_id === taskId);
        if (!task) return null;
        return task.subtasks?.find((st: any) => st.sub_task_id === subtaskId);
    };

    // Separate handler for subtask drag start
    const handleSubtaskDragStart = (
        e: React.MouseEvent,
        type: 'left' | 'right',
        taskId: string,
        subtaskId: string,
        originalStartDate: Date,
        originalEndDate: Date,
        subtask_name: string,
        color: string
    ) => {
        e.stopPropagation();
        setSubtaskDragging({
            type,
            taskId,
            subtaskId,
            startX: e.clientX,
            originalStartDate,
            originalEndDate,
            subtask_name,
            color,
        });
        setSubtaskTempDates({ start: originalStartDate, end: originalEndDate });
    };

    // Separate handler for subtask drag movement
    // const handleSubtaskDragMove = (e: MouseEvent) => {
    //     console.log("subtask dragging : ",subtaskDragging);
    //     if (!subtaskDragging.type || !subtaskDragging.startX || !subtaskDragging.taskId || !subtaskDragging.subtaskId) return;

    //     const deltaX = e.clientX - subtaskDragging.startX;
    //     const deltaDays = Math.round(deltaX / dayWidth);

    //     if (deltaDays === 0) return;

    //     if (subtaskDragging.type === 'left') {
    //         const newStartDate = addDays(subtaskDragging.originalStartDate as Date, deltaDays);
    //         if (newStartDate < (subtaskTempDates.end || subtaskDragging.originalEndDate as Date)) {
    //             setSubtaskTempDates({
    //                 start: newStartDate,
    //                 end: subtaskTempDates.end || subtaskDragging.originalEndDate
    //             });
    //         }
    //     } else {
    //         const newEndDate = addDays(subtaskDragging.originalEndDate as Date, deltaDays);
    //         if (newEndDate > (subtaskTempDates.start || subtaskDragging.originalStartDate as Date)) {
    //             setSubtaskTempDates({
    //                 start: subtaskTempDates.start || subtaskDragging.originalStartDate,
    //                 end: newEndDate
    //             });
    //         }
    //     }
    // };

    const handleSubtaskDragMove = (e: MouseEvent) => {
        // Get parent task dates
        const task = localExecData.find((t: any) => t.task_id === subtaskDragging.taskId);
        const taskStart = safeParseDate(task?.start_date);
        const taskEnd = safeParseDate(task?.end_date);

        if (!subtaskDragging.type || !subtaskDragging.startX || !subtaskDragging.taskId || !subtaskDragging.subtaskId) return;

        const deltaX = e.clientX - subtaskDragging.startX;
        const deltaDays = Math.round(deltaX / dayWidth);

        if (deltaDays === 0) return;

        if (subtaskDragging.type === 'left') {
            let newStartDate = addDays(subtaskDragging.originalStartDate as Date, deltaDays);

            // clamp inside parent task
            if (newStartDate < taskStart) {
                newStartDate = taskStart;
            }

            if (newStartDate < (subtaskTempDates.end || subtaskDragging.originalEndDate as Date)) {
                setSubtaskTempDates({
                    start: newStartDate,
                    end: subtaskTempDates.end || subtaskDragging.originalEndDate
                });
            }
        } else {
            let newEndDate = addDays(subtaskDragging.originalEndDate as Date, deltaDays);

            // clamp inside parent task
            if (newEndDate > taskEnd) {
                newEndDate = taskEnd;
            }

            if (newEndDate > (subtaskTempDates.start || subtaskDragging.originalStartDate as Date)) {
                setSubtaskTempDates({
                    start: subtaskTempDates.start || subtaskDragging.originalStartDate,
                    end: newEndDate
                });
            }
        }

    }

    // Separate handler for subtask drag end
    const handleSubtaskDragEnd = async () => {
        if (!subtaskDragging.type || !subtaskDragging.taskId || !subtaskDragging.subtaskId) {
            setSubtaskDragging({
                type: null,
                taskId: null,
                subtaskId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                subtask_name: null,
                color: null,
            });
            setSubtaskTempDates({ start: null, end: null });
            return;
        }

        try {
            const subtask = findSubtask(subtaskDragging.taskId, subtaskDragging.subtaskId);
            if (!subtask) return;

            const newStartDate = subtaskTempDates.start || subtaskDragging.originalStartDate;
            const newEndDate = subtaskTempDates.end || subtaskDragging.originalEndDate;

            if (!newStartDate || !newEndDate) return;

            // Call your API to update subtask dates
            const data = {
                user_id: localStorage.getItem('userId') || '',
                org_id,
                project_id: project_id || '',
                task_id: subtaskDragging.taskId,
                subtask_id: subtaskDragging.subtaskId,
                subtask_start_date: newStartDate,
                subtask_end_date: newEndDate,
                subtask_name: subtaskDragging?.subtask_name,
                color: subtaskDragging?.color
                // Include other necessary fields
            };

            console.log('Would update subtask with:', data);
            const response = await apiUpdateCrmExecSubTask(data)

            if (response.code === 200) {
                // Update local state instead of reloading
                updateSubtaskInLocalState(subtaskDragging.taskId, subtaskDragging.subtaskId, {
                    sub_task_start_date: newStartDate,
                    sub_task_end_date: newEndDate
                });
                // after update again get updated data
                refreshExecData()

                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Subtask dates updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="info" duration={2000}>
                        Subtask must remain within the start and end dates of its parent task!
                    </Notification>,
                    { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error updating subtask dates:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error updating subtask dates
                </Notification>,
                { placement: 'top-end' }
            );
        } finally {
            setSubtaskDragging({
                type: null,
                taskId: null,
                subtaskId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                subtask_name: null,
                color: null,
            });
            setSubtaskTempDates({ start: null, end: null });
        }
    };

    // Add to your existing useEffect hooks
    useEffect(() => {
        if (subtaskDragging.type) {
            document.addEventListener('mousemove', handleSubtaskDragMove);
            document.addEventListener('mouseup', handleSubtaskDragEnd);
            return () => {
                document.removeEventListener('mousemove', handleSubtaskDragMove);
                document.removeEventListener('mouseup', handleSubtaskDragEnd);
            };
        }
    }, [subtaskDragging, subtaskTempDates]);

    //subtask drag end ----------------------------------------------------------
    //move delay drag start ----------------------------------------------------------

    const [dragStartTimer, setDragStartTimer] = useState<NodeJS.Timeout | null>(null);

    // Add this new state for move dragging
    const [moveDragging, setMoveDragging] = useState<{
        isMoving: boolean;
        taskId: string | null;
        subtaskId: string | null;
        detailId: string | null;
        startX: number | null;
        originalStartDate: Date | null;
        originalEndDate: Date | null;
        durationDays: number | null;
    }>({
        isMoving: false,
        taskId: null,
        subtaskId: null,
        detailId: null,
        startX: null,
        originalStartDate: null,
        originalEndDate: null,
        durationDays: null
    });

    const [moveTempDates, setMoveTempDates] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });


    // Handler for move drag start
    const handleMoveDragStart = (
        e: React.MouseEvent,
        taskId: string,
        subtaskId: string,
        detailId: string,
        originalStartDate: Date,
        originalEndDate: Date
    ) => {
        const isInteractiveElement = (e.target as HTMLElement).closest('.interactive-element');
        if (isInteractiveElement) return;

        // Clear any existing timer
        if (dragStartTimer) {
            clearTimeout(dragStartTimer);
            setDragStartTimer(null);
            return;
        }

        // Set a new timer
        setDragStartTimer(setTimeout(() => {
            e.stopPropagation();
            const durationDays = differenceInDays(originalEndDate, originalStartDate);

            setMoveDragging({
                isMoving: true,
                taskId,
                subtaskId,
                detailId,
                startX: e.clientX,
                originalStartDate,
                originalEndDate,
                durationDays
            });
            setMoveTempDates({ start: originalStartDate, end: originalEndDate });
        }, 200)); // 200ms delay before drag starts
    };

    // Handler for move drag movement
    const handleMoveDragMove = (e: MouseEvent) => {
        if (!moveDragging.isMoving || !moveDragging.startX || !moveDragging.taskId ||
            !moveDragging.subtaskId || !moveDragging.detailId || !moveDragging.durationDays) return;

        const deltaX = e.clientX - moveDragging.startX;
        const deltaDays = Math.round(deltaX / dayWidth);

        if (deltaDays === 0) return;

        const newStartDate = addDays(moveDragging.originalStartDate as Date, deltaDays);
        const newEndDate = addDays(newStartDate, moveDragging.durationDays);

        setMoveTempDates({
            start: newStartDate,
            end: newEndDate
        });
    };

    // Handler for move drag end
    const handleMoveDragEnd = async () => {
        if (!moveDragging.isMoving || !moveDragging.taskId ||
            !moveDragging.subtaskId || !moveDragging.detailId) {
            setMoveDragging({
                isMoving: false,
                taskId: null,
                subtaskId: null,
                detailId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                durationDays: null
            });
            setMoveTempDates({ start: null, end: null });
            return;
        }

        try {
            const detail = findDetail(moveDragging.taskId, moveDragging.subtaskId, moveDragging.detailId);
            if (!detail) return;

            const newStartDate = moveTempDates.start || moveDragging.originalStartDate;
            const newEndDate = moveTempDates.end || moveDragging.originalEndDate;

            if (!newStartDate || !newEndDate) return;
            const data = {
                user_id: localStorage.getItem('userId') || '',
                org_id,
                project_id: project_id || '',
                task_id: moveDragging.taskId,
                subtask_id: moveDragging.subtaskId,
                subtask_details_start_date: newStartDate,
                subtask_details_end_date: newEndDate,
                subtask_details_id: moveDragging.detailId,

                subtask_comment: detail.subtask_comment,
                subtask_type: detail.subtask_type,
                color: detail.color,
            };

            const response = await apiUpdateCrmExecSubTaskDetail(data);

            if (response.code === 200) {
                // Update local state instead of reloading
                updateDetailInLocalState(moveDragging.taskId, moveDragging.subtaskId, moveDragging.detailId, {
                    subtask_details_start_date: newStartDate,
                    subtask_details_end_date: newEndDate
                });
                // after update again get updated data
                refreshExecData()

                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Delay position updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="danger" duration={2000}>
                        Error updating delay position: {response.errorMessage || 'Unknown error'}
                    </Notification>,
                    { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error updating delay position:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error updating delay position
                </Notification>,
                { placement: 'top-end' }
            );
        } finally {
            setMoveDragging({
                isMoving: false,
                taskId: null,
                subtaskId: null,
                detailId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                durationDays: null
            });
            setMoveTempDates({ start: null, end: null });
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        // If timer exists, it means this is a click (not a drag)
        if (dragStartTimer) {
            clearTimeout(dragStartTimer);
            setDragStartTimer(null);
            // Handle click logic here if needed
        }
    };

    useEffect(() => {
        return () => {
            if (dragStartTimer) {
                clearTimeout(dragStartTimer);
            }
        };
    }, [dragStartTimer]);

    // Add event listeners in useEffect
    useEffect(() => {
        if (moveDragging.isMoving) {
            document.addEventListener('mousemove', handleMoveDragMove);
            document.addEventListener('mouseup', handleMoveDragEnd);
            return () => {
                document.removeEventListener('mousemove', handleMoveDragMove);
                document.removeEventListener('mouseup', handleMoveDragEnd);
            };
        }
    }, [moveDragging, moveTempDates]);

    //move delay drag end ----------------------------------------------------------

    // TASK drag start (resize + move) --------------------------------------------
    const [taskDragging, setTaskDragging] = useState<{
        type: 'left' | 'right' | null;
        taskId: string | null;
        startX: number | null;
        originalStartDate: Date | null;
        originalEndDate: Date | null;
        task_name: string | null;
        color: string | null;
    }>({
        type: null,
        taskId: null,
        startX: null,
        originalStartDate: null,
        originalEndDate: null,
        task_name: null,
        color: null,
    });

    const [taskTempDates, setTaskTempDates] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });

    const handleTaskDragStart = (
        e: React.MouseEvent,
        type: 'left' | 'right',
        taskId: string,
        originalStartDate: Date,
        originalEndDate: Date,
        task_name: string,
        color: string
    ) => {
        e.stopPropagation();
        setTaskDragging({
            type,
            taskId,
            startX: e.clientX,
            originalStartDate,
            originalEndDate,
            task_name,
            color,
        });
        setTaskTempDates({ start: originalStartDate, end: originalEndDate });
    };

    const handleTaskDragMove = (e: MouseEvent) => {
        if (!taskDragging.type || !taskDragging.startX || !taskDragging.taskId) return;
        const deltaX = e.clientX - taskDragging.startX;
        const deltaDays = Math.round(deltaX / dayWidth);
        if (deltaDays === 0) return;

        if (taskDragging.type === 'left') {
            const newStartDate = addDays(taskDragging.originalStartDate as Date, deltaDays);
            if (newStartDate < (taskTempDates.end || taskDragging.originalEndDate as Date)) {
                setTaskTempDates({
                    start: newStartDate,
                    end: taskTempDates.end || taskDragging.originalEndDate
                });
            }
        } else {
            const newEndDate = addDays(taskDragging.originalEndDate as Date, deltaDays);
            if (newEndDate > (taskTempDates.start || taskDragging.originalStartDate as Date)) {
                setTaskTempDates({
                    start: taskTempDates.start || taskDragging.originalStartDate,
                    end: newEndDate
                });
            }
        }
    };

    const handleTaskDragEnd = async () => {
        if (!taskDragging.type || !taskDragging.taskId) {
            setTaskDragging({
                type: null,
                taskId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                task_name: null,
                color: null,
            });
            setTaskTempDates({ start: null, end: null });
            return;
        }

        try {
            const newStartDate = taskTempDates.start || taskDragging.originalStartDate;
            const newEndDate = taskTempDates.end || taskDragging.originalEndDate;
            if (!newStartDate || !newEndDate) return;

            const data = {
                user_id: localStorage.getItem('userId') || '',
                org_id,
                project_id: project_id || '',
                task_id: taskDragging.taskId,
                task_name: taskDragging.task_name,
                start_date: newStartDate,
                end_date: newEndDate,
                color: taskDragging.color,
            };

            const response = await apiUpdateCrmExecTask(data);
            if (response.code === 200) {
                updateTaskInLocalState(taskDragging.taskId, {
                    start_date: newStartDate,
                    end_date: newEndDate,
                });
                refreshExecData();
                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Task dates updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="info" duration={2500}>
                        {response.errorMessage || 'Unable to update task dates'}
                    </Notification>,
                    { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error updating task dates:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error updating task dates
                </Notification>,
                { placement: 'top-end' }
            );
        } finally {
            setTaskDragging({
                type: null,
                taskId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                task_name: null,
                color: null,
            });
            setTaskTempDates({ start: null, end: null });
        }
    };

    // Move whole task horizontally (press-hold to avoid misclicks)
    const [taskMoveDragging, setTaskMoveDragging] = useState<{
        isMoving: boolean;
        taskId: string | null;
        startX: number | null;
        originalStartDate: Date | null;
        originalEndDate: Date | null;
        durationDays: number | null;
        task_name: string | null;
        color: string | null;
    }>({
        isMoving: false,
        taskId: null,
        startX: null,
        originalStartDate: null,
        originalEndDate: null,
        durationDays: null,
        task_name: null,
        color: null,
    });

    const [taskDragStartTimer, setTaskDragStartTimer] = useState<NodeJS.Timeout | null>(null);
    const [taskMoveTempDates, setTaskMoveTempDates] = useState<{ start: Date | null; end: Date | null; }>({ start: null, end: null });

    const handleTaskMoveStart = (
        e: React.MouseEvent,
        taskId: string,
        originalStartDate: Date,
        originalEndDate: Date,
        task_name: string,
        color: string
    ) => {
        const isInteractive = (e.target as HTMLElement).closest('.interactive-element');
        if (isInteractive) return;
        if (taskDragStartTimer) {
            clearTimeout(taskDragStartTimer);
            setTaskDragStartTimer(null);
            return;
        }
        setTaskDragStartTimer(setTimeout(() => {
            e.stopPropagation();
            const durationDays = differenceInDays(originalEndDate, originalStartDate);
            setTaskMoveDragging({
                isMoving: true,
                taskId,
                startX: e.clientX,
                originalStartDate,
                originalEndDate,
                durationDays,
                task_name,
                color,
            });
            setTaskMoveTempDates({ start: originalStartDate, end: originalEndDate });
        }, 200));
    };

    const handleTaskMoveMove = (e: MouseEvent) => {
        if (!taskMoveDragging.isMoving || !taskMoveDragging.startX || !taskMoveDragging.durationDays) return;
        const deltaX = e.clientX - taskMoveDragging.startX;
        const deltaDays = Math.round(deltaX / dayWidth);
        if (deltaDays === 0) return;
        const newStartDate = addDays(taskMoveDragging.originalStartDate as Date, deltaDays);
        const newEndDate = addDays(newStartDate, taskMoveDragging.durationDays);
        setTaskMoveTempDates({ start: newStartDate, end: newEndDate });
    };

    const handleTaskMoveEnd = async () => {
        if (!taskMoveDragging.isMoving || !taskMoveDragging.taskId) {
            setTaskMoveDragging({
                isMoving: false,
                taskId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                durationDays: null,
                task_name: null,
                color: null,
            });
            setTaskMoveTempDates({ start: null, end: null });
            return;
        }

        try {
            const newStartDate = taskMoveTempDates.start || taskMoveDragging.originalStartDate;
            const newEndDate = taskMoveTempDates.end || taskMoveDragging.originalEndDate;
            if (!newStartDate || !newEndDate) return;
            const data = {
                user_id: localStorage.getItem('userId') || '',
                org_id,
                project_id: project_id || '',
                task_id: taskMoveDragging.taskId,
                task_name: taskMoveDragging.task_name,
                start_date: newStartDate,
                end_date: newEndDate,
                color: taskMoveDragging.color,
            };
            const response = await apiUpdateCrmExecTask(data);
            if (response.code === 200) {
                updateTaskInLocalState(taskMoveDragging.taskId, {
                    start_date: newStartDate,
                    end_date: newEndDate,
                });
                refreshExecData();
                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Task position updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="danger" duration={2000}>
                        {response.errorMessage || 'Error updating task position'}
                    </Notification>,
                    { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error updating task position:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error updating task position
                </Notification>,
                { placement: 'top-end' }
            );
        } finally {
            setTaskMoveDragging({
                isMoving: false,
                taskId: null,
                startX: null,
                originalStartDate: null,
                originalEndDate: null,
                durationDays: null,
                task_name: null,
                color: null,
            });
            setTaskMoveTempDates({ start: null, end: null });
        }
    };

    const handleTaskClick = (e: React.MouseEvent) => {
        if (taskDragStartTimer) {
            clearTimeout(taskDragStartTimer);
            setTaskDragStartTimer(null);
        }
    };

    useEffect(() => {
        if (taskDragging.type) {
            document.addEventListener('mousemove', handleTaskDragMove);
            document.addEventListener('mouseup', handleTaskDragEnd);
            return () => {
                document.removeEventListener('mousemove', handleTaskDragMove);
                document.removeEventListener('mouseup', handleTaskDragEnd);
            };
        }
    }, [taskDragging, taskTempDates]);

    useEffect(() => {
        if (taskMoveDragging.isMoving) {
            document.addEventListener('mousemove', handleTaskMoveMove);
            document.addEventListener('mouseup', handleTaskMoveEnd);
            return () => {
                document.removeEventListener('mousemove', handleTaskMoveMove);
                document.removeEventListener('mouseup', handleTaskMoveEnd);
            };
        }
    }, [taskMoveDragging, taskMoveTempDates]);

    useEffect(() => {
        return () => {
            if (taskDragStartTimer) clearTimeout(taskDragStartTimer);
        };
    }, [taskDragStartTimer]);

    // TASK drag end --------------------------------------------------------------
    const safeParseDate = (date: Date | string): Date => {
        if (date instanceof Date) return date;
        try {
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
        } catch {
            return new Date();
        }
    };

    // Synchronize scrolling between header and chart area
    useEffect(() => {
        const header = headerRef.current;
        const chartArea = chartAreaRef.current;

        if (!header || !chartArea) return;

        const handleScroll = () => {
            header.scrollLeft = chartArea.scrollLeft;
        };

        chartArea.addEventListener('scroll', handleScroll);
        return () => chartArea.removeEventListener('scroll', handleScroll);
    }, []);

    const getEarliestStartDate = (execData: any): Date => {
        let allDates: Date[] = [];

        const extractDates = (taskList: any) => {
            taskList.forEach((task: any) => {
                // Push the task's start date
                allDates.push(safeParseDate(task?.start_date || task?.subtask_details_start_date));

                // If the task has subtasks, process them
                if (task.subtasks) {
                    task.subtasks.forEach((subtask: any) => {
                        allDates.push(safeParseDate(subtask?.start_date || subtask?.subtask_details_start_date));

                        // If subtask has sub_task_details, extract their dates
                        if (subtask.sub_task_details) {
                            subtask.sub_task_details.forEach((detail: any) => {
                                allDates.push(safeParseDate(detail?.subtask_details_start_date));
                            });
                        }
                    });

                    // Recursively process deeper subtasks (if needed)
                    extractDates(task.subtasks);
                }

                // In case current task has sub_task_details too (not just subtasks)
                if (task.sub_task_details) {
                    task.sub_task_details.forEach((detail: any) => {
                        allDates.push(safeParseDate(detail?.subtask_details_start_date));
                    });
                }
            });
        };

        extractDates(execData);

        // Convert all dates to Date objects if they're strings
        const dateObjects = allDates.map(d => {
            if (typeof d === 'string') {
                return new Date(d);
            }
            return d;
        });

        return allDates.length
            ? new Date(Math.min(...dateObjects.map(d => d.getTime())))
            : new Date();
    };

    const getLatestEndDate = (execData: any): Date => {
        let allDates: Date[] = [];

        const extractDates = (taskList: any) => {
            taskList.forEach((task: any) => {
                // Push task's main end date
                allDates.push(safeParseDate(task?.end_date));

                // If the task has subtasks, process them
                if (task.subtasks) {
                    task.subtasks.forEach((subtask: any) => {
                        allDates.push(safeParseDate(subtask?.sub_task_end_date));

                        // If subtask has sub_task_details, extract their end dates
                        if (subtask.sub_task_details) {
                            subtask.sub_task_details.forEach((detail: any) => {
                                allDates.push(safeParseDate(detail?.subtask_details_end_date));
                            });
                        }
                    });

                    // Recursively process deeper subtasks (if needed)
                    extractDates(task.subtasks);
                }

                // In case current task has sub_task_details too (rare, but safe to include)
                if (task.sub_task_details) {
                    task.sub_task_details.forEach((detail: any) => {
                        allDates.push(safeParseDate(detail?.subtask_details_end_date));
                    });
                }
            });
        };

        extractDates(execData);

        // Convert all dates to Date objects if they're strings
        const dateObjects = allDates.map(d => {
            if (typeof d === 'string') {
                return new Date(d);
            }
            return d;
        });

        return allDates.length
            ? new Date(Math.max(...dateObjects.map(d => d.getTime())) + 1 * 24 * 60 * 60 * 1000)
            : new Date();
    };


    const startDate = getEarliestStartDate(localExecData);
    const endDate = getLatestEndDate(localExecData);
    const dayWidth = view === "days" ? 28 : view === "weeks" ? 30 : view === "months" ? 40 : 60;

    const generateTimeline = (): TimelineDayView | TimelineOtherView => {
        if (view !== "days") {
            const timeline: TimelineOtherView = [];
            let current = new Date(startDate);

            while (current <= endDate) {
                let label = "";
                let nextDate = new Date(current);

                if (view === "weeks") {
                    const weekStart = startOfWeek(current);
                    label = `W${format(weekStart, "w")} ${format(weekStart, "MMM")}`;
                    nextDate = addWeeks(current, 1);
                } else if (view === "months") {
                    label = format(current, "MMM yyyy");
                    nextDate = addMonths(current, 1);
                } else {
                    label = format(current, "yyyy");
                    nextDate = addYears(current, 1);
                }

                timeline.push({ label, date: new Date(current) });
                current = nextDate;
            }
            return timeline;
        }

        const monthHeaders: { month: string; span: number }[] = [];
        const dayHeaders: { day: string; date: Date }[] = [];
        let current = new Date(startDate);
        let currentMonth = format(current, "MMM yyyy");
        let monthStart = new Date(current);
        let daysInMonth = 0;

        while (current <= endDate) {
            const month = format(current, "MMM yyyy");

            if (month !== currentMonth) {
                monthHeaders.push({ month: currentMonth, span: daysInMonth });
                currentMonth = month;
                monthStart = new Date(current);
                daysInMonth = 0;
            }

            dayHeaders.push({ day: format(current, "d"), date: new Date(current) });
            daysInMonth++;
            current = addDays(current, 1);
        }

        if (daysInMonth > 0) {
            monthHeaders.push({ month: currentMonth, span: daysInMonth });
        }

        return { monthHeaders, dayHeaders };
    };

    const renderTimelineHeader = () => {
        const timeline = generateTimeline();

        if (view === "days") {
            const daysTimeline = timeline as TimelineDayView;
            return (
                <>
                    <div className="relative flex border-b border-gray-200 dark:border-gray-600">
                        {daysTimeline.monthHeaders.map(({ month, span }, i) => localExecData.length > 0 && (
                            <div
                                key={`month-${i}`}
                                className="text-center text-xs font-medium py-1 border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                style={{ width: `${span * dayWidth}px`, minWidth: `${span * dayWidth}px` }}
                            >
                                {month}
                            </div>
                        ))}
                    </div>
                    <div className="relative flex border-b border-gray-300 dark:border-gray-600">
                        {daysTimeline.dayHeaders.map(({ day, date }, index) => {
                            const isHighlighted = hoveredDelay &&
                                date >= hoveredDelay.start &&
                                date <= hoveredDelay.end;
                            const isLastDayOfDelay = hoveredDelay &&
                                index < daysTimeline.dayHeaders.length - 1 &&
                                date.getTime() === hoveredDelay.end.getTime() &&
                                daysTimeline.dayHeaders[index + 1].date > hoveredDelay.end;
                            const dayName = format(date, "EEE");

                            return (
                                <div
                                    key={date.toString()}
                                    className={`text-center text-xs border-r border-gray-300 dark:border-gray-600 relative text-gray-900 dark:text-gray-100 ${isHighlighted || isLastDayOfDelay ? 'bg-blue-300 dark:bg-blue-600 font-bold' : ''
                                        }`}
                                    style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                                >

                                    {localExecData.length > 0 && <div>

                                        <div>{day}</div>
                                        <div className="text-[0.6rem] opacity-70">{dayName}</div>
                                        <div
                                            className={`absolute top-0 bottom-0 w-px ${isHighlighted || isLastDayOfDelay ? 'bg-blue-700 dark:bg-blue-400' : 'bg-gray-400 dark:bg-gray-500 opacity-30'
                                                }`}
                                            style={{ left: "50%", transform: "translateX(-50%)" }}
                                        />

                                    </div>}
                                </div>
                            );
                        })}
                    </div>
                    {/* Enhanced highlight line */}
                    <div className="relative flex h-2 border-b border-gray-300 dark:border-gray-600">
                        {daysTimeline.dayHeaders.map(({ date }, index) => {
                            const isHighlighted = hoveredDelay &&
                                date >= hoveredDelay.start &&
                                date <= hoveredDelay.end;
                            const isLastDayOfDelay = hoveredDelay &&
                                index < daysTimeline.dayHeaders.length - 1 &&
                                date.getTime() === hoveredDelay.end.getTime() &&
                                daysTimeline.dayHeaders[index + 1].date > hoveredDelay.end;

                            return (
                                <div
                                    key={`highlight-${date.toString()}`}
                                    className={`border-r border-gray-300 dark:border-gray-600 ${isHighlighted || isLastDayOfDelay ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                    style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                                />
                            );
                        })}
                    </div>
                </>
            );
        } else {
            const otherTimeline = timeline as TimelineOtherView;
            return (
                <div className="relative flex border-b border-gray-300 dark:border-gray-600">
                    {otherTimeline.map(({ label, date }) => (
                        <div
                            key={date.toString()}
                            className="text-center text-xs border-r border-gray-300 dark:border-gray-600 relative text-gray-900 dark:text-gray-100"
                            style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px` }}
                        >
                            {label}
                            <div
                                className="absolute top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-500 opacity-30"
                                style={{ left: "50%", transform: "translateX(-50%)" }}
                            />
                        </div>
                    ))}
                </div>
            );
        }
    };

    const getLeftPosition = (date: Date) => {
        let diff = 0;
        if (view === "days") {
            diff = differenceInDays(date, startDate);
        } else if (view === "weeks") {
            diff = differenceInWeeks(startDate, date) * -1;
        } else if (view === "months") {
            diff = differenceInMonths(date, startDate);
        } else if (view === "years") {
            diff = differenceInYears(date, startDate);
        }
        return diff * dayWidth;
    };

    const getWidth = (start: Date, end: Date) => {
        let diff = 0;
        if (view === "days") {
            diff = differenceInDays(end, start);
        } else if (view === "weeks") {
            diff = differenceInWeeks(start, end) * -1;
        } else if (view === "months") {
            diff = differenceInMonths(end, start);
        } else if (view === "years") {
            diff = differenceInYears(end, start);
        }
        return Math.max(1, diff + 1) * dayWidth;
    };

    const handleDeleteDetail = async () => {

        try {

            const data: any = {
                org_id: org_id,
                project_id: project_id,
                task_id: selectedTask?.task_id,
                subtask_id: selectedSubTask?.sub_task_id || "",
                subtask_details_id: selectedDetail?.subtask_details_id
            }

            const res = await apiDeleteCrmExecSubTaskDetail(data);

            if (res.code === 200) {
                // Remove detail from local state
                const newData = localExecData.map((task: any) => {
                    if (task.task_id === selectedTask?.task_id) {
                        return {
                            ...task,
                            subtasks: task.subtasks?.map((subtask: any) => {
                                if (subtask.sub_task_id === selectedSubTask?.sub_task_id) {
                                    return {
                                        ...subtask,
                                        sub_task_details: subtask.sub_task_details?.filter((detail: any) =>
                                            detail.subtask_details_id !== selectedDetail?.subtask_details_id
                                        )
                                    };
                                }
                                return subtask;
                            })
                        };
                    }
                    return task;
                });
                setLocalExecData(newData);

                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Detail deleted successfully
                    </Notification>, { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="danger" duration={2000}>
                        Error deleting detail: {res.errorMessage || 'Unknown error'}
                    </Notification>, { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error deleting detail:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error deleting Detail
                </Notification>, { placement: 'top-end' }
            );
        }
    }

    const handleDeleteSubtask = async () => {

        try {

            const data: any = {
                org_id: org_id,
                project_id: project_id,
                task_id: selectedTask?.task_id,
                subtask_id: selectedSubTask?.sub_task_id || ""
            }

            const res = await apiDeleteCrmExecSubTask(data);

            if (res.code === 200) {
                // Remove subtask from local state
                const newData = localExecData.map((task: any) => {
                    if (task.task_id === selectedTask?.task_id) {
                        return {
                            ...task,
                            subtasks: task.subtasks?.filter((subtask: any) =>
                                subtask.sub_task_id !== selectedSubTask?.sub_task_id
                            )
                        };
                    }
                    return task;
                });
                setLocalExecData(newData);

                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Subtask deleted successfully
                    </Notification>, { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="danger" duration={2000}>
                        Error deleting subtask: {res.errorMessage || 'Unknown error'}
                    </Notification>, { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error deleting subtask:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error deleting Subtask
                </Notification>, { placement: 'top-end' }
            );
        }
    }

    const handleDeleteTask = async () => {

        try {

            const data: any = {
                org_id: org_id,
                project_id: project_id,
                task_id: selectedTask?.task_id,
            }

            const res = await apiDeleteCrmExecTask(data);

            if (res.code === 200) {
                // Remove task from local state
                const newData = localExecData.filter((task: any) =>
                    task.task_id !== selectedTask?.task_id
                );
                setLocalExecData(newData);

                toast.push(
                    <Notification closable type="success" duration={2000}>
                        Task deleted successfully
                    </Notification>, { placement: 'top-end' }
                );
            } else {
                toast.push(
                    <Notification closable type="danger" duration={2000}>
                        Error deleting task: {res.errorMessage || 'Unknown error'}
                    </Notification>, { placement: 'top-end' }
                );
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error deleting Task
                </Notification>, { placement: 'top-end' }
            );
        }
    }

    const handleDownload = async () => {
        try {
            const node = cardRef.current as HTMLElement | null;
            if (!node) return;

            // Sync to far left so header/body align and full range is visible on capture
            if (chartAreaRef.current) chartAreaRef.current.scrollLeft = 0;
            if (headerRef.current) headerRef.current.scrollLeft = 0;

            await new Promise(requestAnimationFrame);

            // Collect key elements that impose scroll clipping
            const chart = chartAreaRef.current as HTMLElement | null;
            const header = headerRef.current as HTMLElement | null;
            const scrollRow = node.querySelector('div.flex.overflow-x-auto') as HTMLElement | null;

            const original = {
                width: node.style.width,
                height: node.style.height,
                overflow: node.style.overflow,
                maxHeight: node.style.maxHeight,
            };

            const originalChart = chart ? {
                width: chart.style.width,
                height: chart.style.height,
                overflow: chart.style.overflow,
                maxHeight: chart.style.maxHeight,
            } : null;

            const originalHeader = header ? {
                width: header.style.width,
                overflow: header.style.overflow,
            } : null;

            const originalScrollRow = scrollRow ? {
                width: scrollRow.style.width,
                overflow: scrollRow.style.overflow,
            } : null;

            // Expand to exact content width (avoid extra empty months)
            // 1) Allow inner scrollables to not clip
            if (chart) {
                chart.style.overflow = 'visible';
                chart.style.maxHeight = 'none';
            }
            if (scrollRow) {
                scrollRow.style.overflow = 'visible';
            }
            if (header) {
                header.style.overflow = 'visible';
            }

            await new Promise(requestAnimationFrame);

            // 2) Compute timeline width precisely from headers count * dayWidth
            const tl = generateTimeline();
            const timelineWidth = view === 'days'
                ? (tl as TimelineDayView).dayHeaders.length * dayWidth
                : (tl as TimelineOtherView).length * dayWidth;

            // 3) Compute left static columns width using the chart area's offset
            const leftStaticWidth = chart ? chart.offsetLeft : 0;

            // 4) Apply exact widths so export includes just content
            const targetWidth = Math.ceil(leftStaticWidth + timelineWidth);
            const fullHeight = node.scrollHeight;

            // Widen the chart area content width to timeline only
            if (chart) chart.style.width = `${timelineWidth}px`;

            // Also expand header's timeline section to the same width
            const headerFlex = header ? (header.querySelector(':scope > div.flex') as HTMLElement | null) : null;
            const headerTimeline = headerFlex && headerFlex.children && headerFlex.children.length >= 3 ? (headerFlex.children[2] as HTMLElement) : null;
            const originalHeaderTimeline = headerTimeline ? { width: headerTimeline.style.width } : null;
            if (headerTimeline) headerTimeline.style.width = `${timelineWidth}px`;

            node.style.width = `${targetWidth}px`;
            node.style.height = `${fullHeight}px`;
            node.style.overflow = 'visible';
            node.style.maxHeight = 'none';

            // High-DPI render while avoiding canvas size limits
            const pixelRatio = Math.min(2, Math.max(1, Math.floor(window.devicePixelRatio || 1)));

            const dataUrl = await toPng(node, {
                cacheBust: true,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('color-scheme') === 'dark' ? '#1f2937' : '#f3f4f6',
                pixelRatio,
                width: targetWidth,
                height: fullHeight,
                style: {
                    transform: 'none',
                },
                // Filter out interactive dropdown portals if any are mounted inside
                filter: (domNode) => {
                    if (!(domNode instanceof Element)) return true;
                    // Exclude tippy/tooltips and dropdown menus that might float
                    if (domNode.classList.contains('tippy-box')) return false;
                    if (domNode.getAttribute('role') === 'tooltip') return false;
                    return true;
                }
            });

            // Restore styles
            node.style.width = original.width;
            node.style.height = original.height;
            node.style.overflow = original.overflow;
            node.style.maxHeight = original.maxHeight;

            if (chart && originalChart) {
                chart.style.width = originalChart.width;
                chart.style.height = originalChart.height;
                chart.style.overflow = originalChart.overflow;
                chart.style.maxHeight = originalChart.maxHeight;
            }

            if (header && originalHeader) {
                header.style.width = originalHeader.width;
                header.style.overflow = originalHeader.overflow;
            }

            if (scrollRow && originalScrollRow) {
                scrollRow.style.width = originalScrollRow.width;
                scrollRow.style.overflow = originalScrollRow.overflow;
            }

            if (headerTimeline && originalHeaderTimeline) {
                headerTimeline.style.width = originalHeaderTimeline.width;
            }

            const link = document.createElement('a');
            const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
            link.download = `Execution_Timeline_${dateStr}.png`;
            link.href = dataUrl;
            link.click();

            toast.push(
                <Notification closable type="success" duration={2000}>
                    Timeline downloaded
                </Notification>,
                { placement: 'top-end' }
            );
        } catch (error) {
            console.error('Error downloading timeline:', error);
            toast.push(
                <Notification closable type="danger" duration={2500}>
                    Failed to download timeline
                </Notification>,
                { placement: 'top-end' }
            );
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const node = cardRef.current as HTMLElement | null;
            if (!node) return;

            if (chartAreaRef.current) chartAreaRef.current.scrollLeft = 0;
            if (headerRef.current) headerRef.current.scrollLeft = 0;
            await new Promise(requestAnimationFrame);

            const chart = chartAreaRef.current as HTMLElement | null;
            const header = headerRef.current as HTMLElement | null;
            const scrollRow = node.querySelector('div.flex.overflow-x-auto') as HTMLElement | null;

            const original = {
                width: node.style.width,
                height: node.style.height,
                overflow: node.style.overflow,
                maxHeight: node.style.maxHeight,
            };
            const originalChart = chart ? {
                width: chart.style.width,
                height: chart.style.height,
                overflow: chart.style.overflow,
                maxHeight: chart.style.maxHeight,
            } : null;
            const originalHeader = header ? {
                width: header.style.width,
                overflow: header.style.overflow,
            } : null;
            const originalScrollRow = scrollRow ? {
                width: scrollRow.style.width,
                overflow: scrollRow.style.overflow,
            } : null;

            // Allow inner scrollables to not clip
            if (chart) {
                chart.style.overflow = 'visible';
                chart.style.maxHeight = 'none';
            }
            if (scrollRow) {
                scrollRow.style.overflow = 'visible';
            }
            if (header) {
                header.style.overflow = 'visible';
            }

            await new Promise(requestAnimationFrame);

            // Compute exact target width
            const tl = generateTimeline();
            const timelineWidth = view === 'days'
                ? (tl as TimelineDayView).dayHeaders.length * dayWidth
                : (tl as TimelineOtherView).length * dayWidth;
            const leftStaticWidth = chart ? chart.offsetLeft : 0;
            const targetWidth = Math.ceil(leftStaticWidth + timelineWidth);
            const fullHeight = node.scrollHeight;

            if (chart) chart.style.width = `${timelineWidth}px`;
            const headerFlex = header ? (header.querySelector(':scope > div.flex') as HTMLElement | null) : null;
            const headerTimeline = headerFlex && headerFlex.children && headerFlex.children.length >= 3 ? (headerFlex.children[2] as HTMLElement) : null;
            const originalHeaderTimeline = headerTimeline ? { width: headerTimeline.style.width } : null;
            if (headerTimeline) headerTimeline.style.width = `${timelineWidth}px`;

            node.style.width = `${targetWidth}px`;
            node.style.height = `${fullHeight}px`;
            node.style.overflow = 'visible';
            node.style.maxHeight = 'none';

            const pixelRatio = Math.min(2, Math.max(1, Math.floor(window.devicePixelRatio || 1)));
            const dataUrl = await toPng(node, {
                cacheBust: true,
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('color-scheme') === 'dark' ? '#1f2937' : '#f3f4f6',
                pixelRatio,
                width: targetWidth,
                height: fullHeight,
                style: { transform: 'none' },
                filter: (domNode) => {
                    if (!(domNode instanceof Element)) return true;
                    if (domNode.classList.contains('tippy-box')) return false;
                    if (domNode.getAttribute('role') === 'tooltip') return false;
                    return true;
                }
            });

            // Restore styles
            node.style.width = original.width;
            node.style.height = original.height;
            node.style.overflow = original.overflow;
            node.style.maxHeight = original.maxHeight;
            if (chart && originalChart) {
                chart.style.width = originalChart.width;
                chart.style.height = originalChart.height;
                chart.style.overflow = originalChart.overflow;
                chart.style.maxHeight = originalChart.maxHeight;
            }
            if (header && originalHeader) {
                header.style.width = originalHeader.width;
                header.style.overflow = originalHeader.overflow;
            }
            if (scrollRow && originalScrollRow) {
                scrollRow.style.width = originalScrollRow.width;
                scrollRow.style.overflow = originalScrollRow.overflow;
            }
            if (headerTimeline && originalHeaderTimeline) {
                headerTimeline.style.width = originalHeaderTimeline.width;
            }

            // Create PDF sized exactly to content to avoid scaling artifacts
            const pdf = new jsPDF({ orientation: targetWidth >= fullHeight ? 'l' : 'p', unit: 'px', format: [targetWidth, fullHeight] });
            pdf.addImage(dataUrl, 'PNG', 0, 0, targetWidth, fullHeight);
            const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
            pdf.save(`Execution_Timeline_${dateStr}.pdf`);

            toast.push(
                <Notification closable type="success" duration={2000}>
                    PDF downloaded
                </Notification>,
                { placement: 'top-end' }
            );
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.push(
                <Notification closable type="danger" duration={2500}>
                    Failed to download PDF
                </Notification>,
                { placement: 'top-end' }
            );
        }
    };

    // Helper to safely sort by date or name
    const sortByDateOrName = (arr: any, dateKey: string, nameKey: string) => {
        return [...arr].sort((a, b) => {
            const dateA = a[dateKey] ? new Date(a[dateKey]).getTime() : 0;
            const dateB = b[dateKey] ? new Date(b[dateKey]).getTime() : 0;
            if (dateA !== dateB) return dateA - dateB;
            // fallback to name if dates are equal or missing
            if (a[nameKey] && b[nameKey]) return a[nameKey].localeCompare(b[nameKey]);
            return 0;
        });
    };

    // Sort tasks by start_date (or task_name as fallback)
    const sortedTasks = sortByDateOrName(localExecData, 'start_date', 'task_name').map(task => ({
        ...task,
        // Sort subtasks by sub_task_start_date (or sub_task_name as fallback)
        subtasks: task.subtasks
            ? sortByDateOrName(task.subtasks, 'sub_task_start_date', 'sub_task_name')
            : [],
    }));

    return (
        <div className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">

            <div className="flex items-center justify-end mb-3">

                {/* ["days", "weeks", "months", "years"] */}

                {/* <div className="mb-4 flex gap-4">
                    {(["days", "weeks"] as const).map((v) => (
                        <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`px-4 py-2 rounded ${view === v ? "bg-blue-500 text-white" : "bg-gray-300"}`}
                        >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                </div> */}

                <div className="flex items-center justify-end gap-3">

                    <AddExecTask onAddSuccess={refreshExecData} />

                    <div className="flex items-center gap-2">
                        <Button variant='solid' size='sm' className='rounded-lg' onClick={openShareDialog}>
                            Share to Client
                        </Button>
                        <Dropdown renderTitle={<HiOutlineDownload className="cursor-pointer text-xl" />} placement='bottom-end'>
                            <Dropdown.Item eventKey="png" onClick={handleDownload}>
                                <div className="text-sm">Download PNG</div>
                            </Dropdown.Item>
                            <Dropdown.Item eventKey="pdf" onClick={handleDownloadPdf}>
                                <div className="text-sm">Download PDF</div>
                            </Dropdown.Item>
                        </Dropdown>
                    </div>

                </div>


            </div>

            <div className="relative overflow-hidden border border-gray-900 dark:border-gray-600 rounded-lg"
                ref={cardRef}
            >
                <Dialog
                    isOpen={shareDialogOpen}
                    onClose={closeShareDialog}
                    onRequestClose={closeShareDialog}
                    className={`pb-3`}
                >
                    <h3 className='mb-4'>Share To Client</h3>
                    <Formik
                        initialValues={{
                            client_name: '',
                            client_email: '',
                            type: 'Client',
                            project_id,
                            folder_name: 'Execution Timeline',
                            user_id: localStorage.getItem('userId'),
                            org_id,
                            file_id: 'execution_timeline',
                        }}
                        validationSchema={Yup.object({
                            client_name: Yup.string().required('Required'),
                            client_email: Yup.string().email('Invalid email address').required('Required'),
                        })}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            try {
                                // 1) Capture full PNG data URL
                                const node = cardRef.current as HTMLElement | null;
                                if (!node) return;

                                // Reuse PNG capture by calling the same logic but returning data URL instead of downloading
                                const getPng = async (): Promise<string> => {
                                    const chart = chartAreaRef.current as HTMLElement | null;
                                    const header = headerRef.current as HTMLElement | null;
                                    const scrollRow = node.querySelector('div.flex.overflow-x-auto') as HTMLElement | null;

                                    if (chartAreaRef.current) chartAreaRef.current.scrollLeft = 0;
                                    if (headerRef.current) headerRef.current.scrollLeft = 0;
                                    await new Promise(requestAnimationFrame);

                                    const original = {
                                        width: node.style.width,
                                        height: node.style.height,
                                        overflow: node.style.overflow,
                                        maxHeight: node.style.maxHeight,
                                    };
                                    const originalChart = chart ? {
                                        width: chart.style.width,
                                        height: chart.style.height,
                                        overflow: chart.style.overflow,
                                        maxHeight: chart.style.maxHeight,
                                    } : null;
                                    const originalHeader = header ? {
                                        width: header.style.width,
                                        overflow: header.style.overflow,
                                    } : null;
                                    const originalScrollRow = scrollRow ? {
                                        width: scrollRow.style.width,
                                        overflow: scrollRow.style.overflow,
                                    } : null;

                                    if (chart) {
                                        chart.style.overflow = 'visible';
                                        chart.style.maxHeight = 'none';
                                    }
                                    if (scrollRow) {
                                        scrollRow.style.overflow = 'visible';
                                    }
                                    if (header) {
                                        header.style.overflow = 'visible';
                                    }
                                    await new Promise(requestAnimationFrame);

                                    const tl = generateTimeline();
                                    const timelineWidth = view === 'days'
                                        ? (tl as TimelineDayView).dayHeaders.length * dayWidth
                                        : (tl as TimelineOtherView).length * dayWidth;
                                    const leftStaticWidth = chart ? chart.offsetLeft : 0;
                                    const targetWidth = Math.ceil(leftStaticWidth + timelineWidth);
                                    const fullHeight = node.scrollHeight;

                                    if (chart) chart.style.width = `${timelineWidth}px`;
                                    const headerFlex = header ? (header.querySelector(':scope > div.flex') as HTMLElement | null) : null;
                                    const headerTimeline = headerFlex && headerFlex.children && headerFlex.children.length >= 3 ? (headerFlex.children[2] as HTMLElement) : null;
                                    const originalHeaderTimeline = headerTimeline ? { width: headerTimeline.style.width } : null;
                                    if (headerTimeline) headerTimeline.style.width = `${timelineWidth}px`;

                                    node.style.width = `${targetWidth}px`;
                                    node.style.height = `${fullHeight}px`;
                                    node.style.overflow = 'visible';
                                    node.style.maxHeight = 'none';

                                    const pixelRatio = Math.min(2, Math.max(1, Math.floor(window.devicePixelRatio || 1)));
                                    const dataUrl = await toPng(node, {
                                        cacheBust: true,
                                        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('color-scheme') === 'dark' ? '#1f2937' : '#f3f4f6',
                                        pixelRatio,
                                        width: targetWidth,
                                        height: fullHeight,
                                        style: { transform: 'none' },
                                        filter: (domNode) => {
                                            if (!(domNode instanceof Element)) return true;
                                            if (domNode.classList.contains('tippy-box')) return false;
                                            if (domNode.getAttribute('role') === 'tooltip') return false;
                                            return true;
                                        }
                                    });

                                    // restore
                                    node.style.width = original.width;
                                    node.style.height = original.height;
                                    node.style.overflow = original.overflow;
                                    node.style.maxHeight = original.maxHeight;
                                    if (chart && originalChart) {
                                        chart.style.width = originalChart.width;
                                        chart.style.height = originalChart.height;
                                        chart.style.overflow = originalChart.overflow;
                                        chart.style.maxHeight = originalChart.maxHeight;
                                    }
                                    if (header && originalHeader) {
                                        header.style.width = originalHeader.width;
                                        header.style.overflow = originalHeader.overflow;
                                    }
                                    if (scrollRow && originalScrollRow) {
                                        scrollRow.style.width = originalScrollRow.width;
                                        scrollRow.style.overflow = originalScrollRow.overflow;
                                    }
                                    if (headerTimeline && originalHeaderTimeline) {
                                        headerTimeline.style.width = originalHeaderTimeline.width;
                                    }
                                    return dataUrl;
                                };

                                const pngDataUrl = await getPng();

                                // 2) Convert data URL to Blob and create File
                                const res = await fetch(pngDataUrl);
                                const blob = await res.blob();
                                const fileName = `Execution_Timeline_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.png`;
                                const file = new File([blob], fileName, { type: 'image/png' });
                                console.log('file Name', file);

                                // 3) Upload to project file manager
                                const project_id_for_share = project_id || '';
                                const uploadData = new FormData();
                                uploadData.append('project_id', project_id_for_share);
                                uploadData.append('folder_name', 'Execution Timeline');
                                uploadData.append('files', file);
                                uploadData.append('org_id', org_id || '');

                                console.log('Upload data:', uploadData);
                                const uploadResp = await apiGetCrmFileManagerCreateProjectFolder(uploadData);
                                console.log('Upload response:', uploadResp);
                                
                                if (uploadResp.code !== 200) {
                                    throw new Error(uploadResp.errorMessage || `Upload failed with code: ${uploadResp.code}`);
                                }

                                // 4) Get the uploaded file ID from response
                                const uploadedFileId =
                                    uploadResp?.data?.[0]?.fileId || // <-- this matches backend
                                    uploadResp?.data?.fileId ||
                                    uploadResp?.fileId;

                                console.log('Uploaded file ID:', uploadedFileId);
                                if (!uploadedFileId) {
                                    throw new Error('No file ID returned from upload: ' + JSON.stringify(uploadResp));
                                }

                                // 5) Share using the file manager share API
                                const sharePayload = {
                                    client_name: values.client_name,
                                    client_email: values.client_email,
                                    file_id: uploadedFileId,
                                    type: 'Client',
                                    project_id: project_id_for_share,
                                    folder_name: 'Execution Timeline',
                                    user_id: localStorage.getItem('userId'),
                                    org_id,
                                };

                                console.log('Sharing payload:', sharePayload);
                                const shareResp = await apiGetCrmFileManagerShareFiles(sharePayload);
                                console.log('Share response:', shareResp);
                                
                                if (shareResp.code === 200) {
                                    toast.push(
                                        <Notification closable type="success" duration={2000}>
                                            Execution Timeline shared with client successfully
                                        </Notification>,
                                        { placement: 'top-end' }
                                    );
                                    resetForm();
                                    closeShareDialog();
                                } else {
                                    throw new Error(shareResp.errorMessage || `Share failed with code: ${shareResp.code}`);
                                }
                            } catch (err) {
                                console.error('Share error:', err);
                                toast.push(
                                    <Notification closable type="danger" duration={2000}>
                                        Failed to share timeline: {err instanceof Error ? err.message : 'Unknown error'}
                                    </Notification>,
                                    { placement: 'top-end' }
                                );
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ errors, touched }) => (
                            <Form>
                                <FormItem label='Client Name' asterisk invalid={!!(errors.client_name && touched.client_name)} errorMessage={errors.client_name}>
                                    <Field name="client_name" component={Input} />
                                </FormItem>
                                <FormItem label='Client Email' asterisk invalid={!!(errors.client_email && touched.client_email)} errorMessage={errors.client_email}>
                                    <Field name="client_email" component={Input} />
                                </FormItem>
                                <div className='flex justify-end'>
                                    <Button type='submit' variant='solid' size='sm'>Send</Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Dialog>
                <div
                    className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 overflow-hidden"
                    ref={headerRef}
                >
                    <div className="flex">
                        <div className="w-[22rem] shrink-0 border-r border-gray-300 dark:border-gray-600"></div>
                        <div className="w-[12rem] shrink-0 border-r border-gray-300 dark:border-gray-600"></div>
                        <div className="flex-1 min-w-max">
                            {renderTimelineHeader()}
                        </div>
                    </div>
                </div>

                <div className="flex overflow-x-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {/* LEFT COLUMN: Task color bar */}
                    <div className="w-2 shrink-0 pr-[0.10rem] h-full sticky left-0 bg-slate-100 dark:bg-slate-700 z-10">
                        {sortedTasks.map((task: any) => {
                            const subtaskCount = task.subtasks?.length || 1;
                            const totalHeight = subtaskCount * 65 + (subtaskCount - 1) * 1;
                            return (
                                <div
                                    key={task.task_id}
                                    className="capitalize pl-2 font-bold text-lg border-b border-gray-200 dark:border-gray-600 flex items-center justify-between mb-2"
                                    style={{
                                        height: `${totalHeight}px`,
                                        backgroundColor: task?.color || "#DC2626",
                                        opacity: 0.5
                                    }}
                                >

                                </div>
                            );
                        })}
                    </div>

                    {/* LEFT COLUMN: Task names */}
                    <div className="w-[11.5rem] shrink-0 pr-[0.10rem] h-full sticky left-0 bg-slate-100 dark:bg-slate-700 z-10">
                        {sortedTasks.map((task: any) => {
                            const subtaskCount = task.subtasks?.length || 1;
                            const totalHeight = subtaskCount * 65 + (subtaskCount - 1) * 1;
                            return (
                                <div
                                    key={task.task_id}
                                    className="capitalize pl-2 font-bold text-lg border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center justify-between mb-2"
                                    style={{ height: `${totalHeight}px` }}
                                >

                                    <span>

                                        <span
                                            className="break-all"
                                            style={{ color: task?.color || "#DC2626" }}
                                        >
                                            {task.task_name}
                                        </span>
                                        <span className={`flex text-[0.5rem] `}>

                                            <span>{format(task?.start_date, "MMM d yyyy")}</span>
                                            <span>-</span>
                                            <span>{format(task?.end_date, "MMM d yyyy")}</span>
                                        </span>

                                    </span>

                                    <span className="">

                                        <Dropdown renderTitle={<PiDotsThreeOutlineVerticalFill className="cursor-pointer mr-2" />} placement='bottom-end' >

                                            <Dropdown.Item eventKey="c" onClick={() => openDialog1(task)}><span><MdEdit /></span><div className="text-sm">Edit Task</div></Dropdown.Item>
                                            <Dropdown.Item eventKey="a" onClick={() => openDialog(task)}><span><MdAddCircle /></span><div className="text-sm">Add SubTask</div></Dropdown.Item>
                                            <Dropdown.Item eventKey="a" onClick={() => openDialog6(task)}><span><MdDelete /></span><div className="text-sm">Delete</div></Dropdown.Item>
                                            {/* <Dropdown.Item eventKey="b" onClick={() => openDialog2()}><div className="text-sm">Delete</div></Dropdown.Item> */}

                                        </Dropdown>
                                    </span>

                                </div>
                            );
                        })}
                    </div>

                    {/* LEFT COLUMN: Subtask names */}
                    <div className="w-[22rem] shrink-0 min-h-screen border-r-2 border-slate-500 dark:border-slate-400 sticky left-48 bg-slate-100 dark:bg-slate-700 z-10">
                        {sortedTasks.map((task: any) => {
                            const subtaskCount = Math.max(1, task.subtasks?.length || 0);
                            return (
                                <div
                                    key={`subtask-names-${task.task_id}`}
                                    className="bg-slate-100 dark:bg-slate-700 mb-2"
                                    style={{ height: `${subtaskCount * 65 + (subtaskCount - 1) * 1}px` }}
                                >
                                    {task.subtasks && task.subtasks.length > 0 ? (
                                        task.subtasks.map((subtask: any, subIndex: any) => {
                                            const maxLength = 100;
                                            let subtask_text = subtask.sub_task_name.length > maxLength
                                                ? subtask.sub_task_name.slice(0, maxLength - 3) + '...'
                                                : subtask.sub_task_name;


                                            return (
                                                <div
                                                    key={`${subtask.sub_task_id}-${subIndex}-name`}
                                                    className="text-wrap text-md flex items-center justify-between bg-slate-200 dark:bg-slate-600 text-gray-900 dark:text-gray-100 capitalize"
                                                    style={{
                                                        height: '65px',
                                                        marginTop: subIndex > 0 ? '1px' : '0'
                                                    }}
                                                >

                                                    <span className="flex h-full w-full justify-between items-center gap-2">


                                                        <div
                                                            className="w-[4%] h-full"
                                                            style={{
                                                                backgroundColor: subtask?.color || "#1E40AF",
                                                                opacity: 0.6
                                                            }}
                                                        >

                                                        </div>

                                                        <span className="flex w-[96%] justify-between items-center">
                                                            {/* <span className={`font-semibold text-${subtask?.color ? subtask?.color : "blue-800"}`}>{subtask_text}</span> */}
                                                            <span>

                                                                <span
                                                                    className="font-semibold"
                                                                    style={{ color: subtask?.color || "#1E40AF" }}
                                                                >
                                                                    {subtask_text}
                                                                </span>
                                                                <span className={`flex text-[0.5rem] `}>

                                                                    <span>{format(subtask?.sub_task_start_date, "MMM d yyyy")}</span>
                                                                    <span>-</span>
                                                                    <span>{format(subtask?.sub_task_end_date, "MMM d yyyy")}</span>
                                                                </span>

                                                            </span>
                                                            <span className="flex items-center gap-2  mr-4">
                                                                <Dropdown renderTitle={<PiDotsThreeVerticalBold className="cursor-pointer font-bold" />} placement='bottom-end' >

                                                                    <Dropdown.Item eventKey="c" onClick={() => openDialog2(task, subtask)}><span><MdEdit /></span><div className="text-sm">Edit Sub Task</div></Dropdown.Item>
                                                                    <Dropdown.Item eventKey="a" onClick={() => openDialog3(task, subtask, execData)}><span><MdAddCircle /></span><div className="text-sm">Add Details</div></Dropdown.Item>
                                                                    <Dropdown.Item eventKey="d" onClick={() => openDialog7(task, subtask)}><span><MdDelete /></span><div className="text-sm">Delete</div></Dropdown.Item>
                                                                    {/* <Dropdown.Item eventKey="b" onClick={() => openDialog2()}><div className="text-sm">Delete</div></Dropdown.Item> */}

                                                                </Dropdown>

                                                                <div>
                                                                    <span className="cursor-pointer  hover:text-blue-500" onClick={() => openDialog8(task, subtask)}><IoIosInformationCircleOutline /></span>

                                                                </div>

                                                            </span>

                                                        </span>

                                                    </span>

                                                </div>
                                            )
                                        }

                                        )
                                    ) : (
                                        // Render an empty row if no subtasks
                                        <div
                                            className="bg-slate-100 dark:bg-slate-700"
                                            style={{ height: '65px' }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className="flex-1 overflow-x-auto h-full overflow-y-hidden bg-slate-200 dark:bg-slate-600 relative"
                        ref={chartAreaRef}
                    >
                        {/* Vertical lines */}
                        {view === "days" && (generateTimeline() as TimelineDayView).dayHeaders.map(({ date }: any, index: any, array: any) => {
                            const isHighlighted = hoveredDelay &&
                                date >= hoveredDelay.start &&
                                date <= hoveredDelay.end;

                            // Check if this is the last day of the delay and there's a next day
                            const isLastDayOfDelay = hoveredDelay &&
                                date.getTime() === hoveredDelay.end.getTime() &&
                                index < array.length;

                            return (
                                <React.Fragment key={date.toString()}>
                                    {/* Original vertical line */}
                                    <div
                                        className={`absolute top-0 bottom-0 w-px ${isHighlighted || isLastDayOfDelay ? 'bg-blue-700 dark:bg-blue-400' : 'bg-gray-400 dark:bg-gray-500 opacity-30'
                                            }`}
                                        style={{
                                            left: `${getLeftPosition(date)}px`,
                                            transform: 'translateX(-50%)',
                                        }}
                                    />
                                    {/* Additional highlighted line - appears for delay dates and one beyond */}
                                    {(isHighlighted || isLastDayOfDelay) && (
                                        <div
                                            className="absolute top-0 bottom-0 w-[0.100rem] bg-blue-500 dark:bg-blue-400 z-10"
                                            style={{
                                                left: `${getLeftPosition(date) + (dayWidth / 2) + 14}px`,
                                                transform: 'translateX(-50%)',
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}

                        <div className="space-y-2 min-w-max min-h-screen relative z-10">
                            {sortedTasks.map((task: any) => {
                                const subtaskCount = task.subtasks?.length || 1;
                                const totalHeight = subtaskCount * 65 + (subtaskCount - 1) * 1;

                                return (
                                    <div
                                        key={task.task_id}
                                        className=""
                                        style={{ height: `${totalHeight}px` }}
                                    >
                                        <div
                                            className="absolute h-full"
                                            style={{
                                                left: `${getLeftPosition((taskDragging.taskId === task.task_id && taskTempDates.start) ? taskTempDates.start : taskMoveDragging.taskId === task.task_id && taskMoveTempDates.start ? taskMoveTempDates.start : task.start_date)}px`,
                                                width: `${getWidth(
                                                    (taskDragging.taskId === task.task_id && taskTempDates.start) ? taskTempDates.start as Date : taskMoveDragging.taskId === task.task_id && taskMoveTempDates.start ? taskMoveTempDates.start as Date : task.start_date,
                                                    (taskDragging.taskId === task.task_id && taskTempDates.end) ? taskTempDates.end as Date : taskMoveDragging.taskId === task.task_id && taskMoveTempDates.end ? taskMoveTempDates.end as Date : task.end_date
                                                )}px`,
                                                height: `${totalHeight}px`,
                                                backgroundColor: task?.color || "#B91C1C",
                                                opacity: 0.5,
                                                zIndex: (taskDragging.taskId === task.task_id || taskMoveDragging.taskId === task.task_id) ? 40 : 'auto',
                                                cursor: 'move'
                                            }}
                                            onMouseDown={(e) => handleTaskMoveStart(
                                                e,
                                                task.task_id,
                                                safeParseDate(task.start_date),
                                                safeParseDate(task.end_date),
                                                task?.task_name,
                                                task?.color
                                            )}
                                            onClick={handleTaskClick}
                                        >
                                            {/* Left resize handle */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-20 hover:bg-white hover:bg-opacity-30"
                                                onMouseDown={(e) => handleTaskDragStart(
                                                    e,
                                                    'left',
                                                    task.task_id,
                                                    safeParseDate(task.start_date),
                                                    safeParseDate(task.end_date),
                                                    task?.task_name,
                                                    task?.color
                                                )}
                                            />
                                            {/* Right resize handle */}
                                            <div
                                                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20 hover:bg-white hover:bg-opacity-30"
                                                onMouseDown={(e) => handleTaskDragStart(
                                                    e,
                                                    'right',
                                                    task.task_id,
                                                    safeParseDate(task.start_date),
                                                    safeParseDate(task.end_date),
                                                    task?.task_name,
                                                    task?.color
                                                )}
                                            />
                                        </div>
                                        {task.subtasks?.map((subtask: any, subIndex: any) => {
                                            const isDraggingThis = subtaskDragging.subtaskId === subtask.sub_task_id;
                                            const startDate = isDraggingThis && subtaskTempDates.start ? subtaskTempDates.start : safeParseDate(subtask.sub_task_start_date);
                                            const endDate = isDraggingThis && subtaskTempDates.end ? subtaskTempDates.end : safeParseDate(subtask.sub_task_end_date);


                                            return (


                                                <div
                                                    key={`${subtask.sub_task_id}-${subIndex}`}
                                                    className={`${subIndex === 0 ? '' : 'mt-[0.07rem]'}`}
                                                    style={{ height: '65px' }}
                                                >
                                                    <div className="relative h-full w-[100%] flex items-center">
                                                        {/* Subtask bar with drag handles */}
                                                        <div
                                                            className="absolute h-[95%]"
                                                            style={{
                                                                left: `${getLeftPosition(startDate)}px`,
                                                                width: `${getWidth(startDate, endDate)}px`,
                                                                zIndex: isDraggingThis ? 50 : 'auto',
                                                                backgroundColor: subtask?.color || "#1E40AF",
                                                                opacity: 0.6
                                                            }}
                                                        >
                                                            {/* Left drag handle */}
                                                            <div
                                                                className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-20 hover:bg-white hover:bg-opacity-30"
                                                                onMouseDown={(e) => handleSubtaskDragStart(
                                                                    e,
                                                                    'left',
                                                                    task.task_id,
                                                                    subtask.sub_task_id,
                                                                    safeParseDate(subtask.sub_task_start_date),
                                                                    safeParseDate(subtask.sub_task_end_date),
                                                                    subtask?.sub_task_name,
                                                                    subtask?.color
                                                                )}
                                                            />

                                                            {/* Right drag handle */}
                                                            <div
                                                                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20 hover:bg-white hover:bg-opacity-30"

                                                                onMouseDown={(e) => handleSubtaskDragStart(
                                                                    e,
                                                                    'right',
                                                                    task.task_id,
                                                                    subtask.sub_task_id,
                                                                    safeParseDate(subtask.sub_task_start_date),
                                                                    safeParseDate(subtask.sub_task_end_date),
                                                                    subtask?.sub_task_name,
                                                                    subtask?.color
                                                                )}
                                                            />
                                                        </div>
                                                        {subtask.sub_task_details?.map((delay: any, index: any) => {

                                                            // Determine which dates to use based on drag state
                                                            let startDate, endDate;

                                                            if (moveDragging.detailId === delay.subtask_details_id && moveDragging.isMoving) {
                                                                // Use move temp dates when moving
                                                                startDate = moveTempDates.start || safeParseDate(delay.subtask_details_start_date);
                                                                endDate = moveTempDates.end || safeParseDate(delay.subtask_details_end_date);
                                                            } else if (dragging.detailId === delay.subtask_details_id) {
                                                                // Use resize temp dates when resizing
                                                                startDate = tempDates.start || safeParseDate(delay.subtask_details_start_date);
                                                                endDate = tempDates.end || safeParseDate(delay.subtask_details_end_date);
                                                            } else {
                                                                // Use original dates otherwise
                                                                startDate = safeParseDate(delay.subtask_details_start_date);
                                                                endDate = safeParseDate(delay.subtask_details_end_date);
                                                            }

                                                            const isBeingDragged = moveDragging.detailId === delay.subtask_details_id ||
                                                                dragging.detailId === delay.subtask_details_id;

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="absolute h-[75%] flex items-center justify-center"
                                                                    style={{
                                                                        left: `${getLeftPosition(startDate)}px`,
                                                                        width: `${getWidth(startDate, endDate)}px`,
                                                                        zIndex: isBeingDragged ? 50 : 'auto',
                                                                        cursor: 'move',
                                                                        backgroundColor: delay.subtask_type === "Delay" ? "#3F3F46" : (delay?.color || "#4ADE80"),
                                                                        opacity: 0.75
                                                                    }}
                                                                    onMouseDown={(e) => {
                                                                        // Only start move drag if not clicking on resize handles
                                                                        if (!(e.target instanceof HTMLElement) || !e.target.classList.contains('cursor-col-resize')) {
                                                                            handleMoveDragStart(
                                                                                e,
                                                                                task.task_id,
                                                                                subtask.sub_task_id,
                                                                                delay.subtask_details_id,
                                                                                safeParseDate(delay.subtask_details_start_date),
                                                                                safeParseDate(delay.subtask_details_end_date)
                                                                            );
                                                                        }
                                                                    }}
                                                                    onClick={handleClick}
                                                                    onMouseEnter={() => setHoveredDelay({ start: startDate, end: endDate })}
                                                                    onMouseLeave={() => setHoveredDelay(null)}
                                                                >
                                                                    {/* Left resize handle (unchanged) */}
                                                                    <div
                                                                        className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-20"
                                                                        onMouseDown={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDragStart(
                                                                                e,
                                                                                'left',
                                                                                task.task_id,
                                                                                subtask.sub_task_id,
                                                                                delay.subtask_details_id,
                                                                                delay.subtask_comment,
                                                                                delay.subtask_type,
                                                                                delay?.color,
                                                                                safeParseDate(delay.subtask_details_start_date),
                                                                                safeParseDate(delay.subtask_details_end_date)
                                                                            );
                                                                        }}
                                                                    />

                                                                    {/* Right resize handle (unchanged) */}
                                                                    <div
                                                                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20"
                                                                        onMouseDown={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDragStart(
                                                                                e,
                                                                                'right',
                                                                                task.task_id,
                                                                                subtask.sub_task_id,
                                                                                delay.subtask_details_id,
                                                                                delay.subtask_comment,
                                                                                delay.subtask_type,
                                                                                delay?.color,
                                                                                safeParseDate(delay.subtask_details_start_date),
                                                                                safeParseDate(delay.subtask_details_end_date)
                                                                            );
                                                                        }}
                                                                    />

                                                                    <Tippy
                                                                        content={`${delay.subtask_comment}: ${format(startDate, "MMM d yyyy")} - ${format(endDate, "MMM d yyyy")}`}
                                                                        followCursor={true}
                                                                        plugins={[followCursor]}
                                                                        placement="top"
                                                                        animation="shift-away"
                                                                        delay={[100, 0]}
                                                                        arrow={true}
                                                                        interactive={true}
                                                                        theme="light-border"
                                                                    >
                                                                        <span className="flex gap-2 items-center flex-wrap">
                                                                            <span
                                                                                className="capitalize text-white text-xs font-medium truncate px-1 cursor-pointer break-all text-ellipsis flex justify-center"
                                                                                style={{
                                                                                    textTransform: 'capitalize',
                                                                                    color: 'white',
                                                                                    fontSize: '0.75rem',
                                                                                    fontWeight: 500,
                                                                                    paddingLeft: '0.25rem',
                                                                                    paddingRight: '0.25rem',
                                                                                    paddingTop: '0.50rem',
                                                                                    cursor: 'pointer',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap',
                                                                                    width: `${getWidth(startDate, endDate)}px`,
                                                                                    display: 'inline-block',
                                                                                }}
                                                                            >
                                                                                <span>
                                                                                    {delay?.subtask_comment}
                                                                                </span>
                                                                            </span>

                                                                            <span className="text-white cursor-pointer hover:text-blue-500 pl-[0.25rem] interactive-element">
                                                                                <Dropdown renderTitle={<IoIosOptions className="cursor-pointer" />} placement='bottom-start'>
                                                                                    <Dropdown.Item eventKey="c" onClick={() => {
                                                                                        openDialog4(task, subtask, delay);
                                                                                    }}>
                                                                                        <span><MdEdit /></span><div className="text-sm">Edit Details</div>
                                                                                    </Dropdown.Item>
                                                                                    <Dropdown.Item eventKey="a" onClick={() => {
                                                                                        openDialog5(task, subtask, delay);
                                                                                    }}>
                                                                                        <span><MdDelete /></span><div className="text-sm">Delete</div>
                                                                                    </Dropdown.Item>
                                                                                </Dropdown>
                                                                            </span>
                                                                        </span>
                                                                    </Tippy>
                                                                </div>
                                                            )
                                                        }

                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <AddExecSubTask task={selectedTask} openDialog={openAddSubTaskDialog} onDialogClose={onDialogClose} dialogIsOpen={dialogIsOpen} setIsOpen={setIsOpen} onAddSuccess={refreshExecData} />
            <EditExecTask
                task={selectedTask}
                openDialog={openDialog1}
                onDialogClose={onDialogClose1}
                dialogIsOpen={dialogIsOpen1}
                setIsOpen={setIsOpen1}
                onUpdateSuccess={updateTaskInLocalState}
            />
            <EditExecSubTask
                task={selectedTask}
                subtask={selectedSubTask}
                openDialog={openDialog2}
                onDialogClose={onDialogClose2}
                dialogIsOpen={dialogIsOpen2}
                setIsOpen={setIsOpen2}
                onUpdateSuccess={updateSubtaskInLocalState}
            />
            <AddExecSubTaskDetails task={selectedTask} subtask={selectedSubTask} openDialog={openAddSubTaskDetailsDialog} onDialogClose={onDialogClose3} dialogIsOpen={dialogIsOpen3} setIsOpen={setIsOpen3} onAddSuccess={refreshExecData} />
            <EditExecSubTaskDetails
                task={selectedTask}
                subtask={selectedSubTask}
                detail={selectedDetail}
                openDialog={openDialog4}
                onDialogClose={onDialogClose4}
                dialogIsOpen={dialogIsOpen4}
                setIsOpen={setIsOpen4}
                onUpdateSuccess={updateDetailInLocalState}
            />
            <AffectionDetails task={selectedTask} subtask={selectedSubTask} openDialog={openDialog8} onDialogClose={onDialogClose8} dialogIsOpen={dialogIsOpen8} setIsOpen={setIsOpen8} />
            <ConfirmDialog
                isOpen={dialogIsOpen5}
                type="danger"
                onClose={onDialogClose5}
                confirmButtonColor="red-600"
                onCancel={onDialogClose5}
                onConfirm={handleDeleteDetail}
                title="Delete Details"
                onRequestClose={onDialogClose5}>
                <p> Are you sure you want to delete this Detail? </p>
            </ConfirmDialog>

            <ConfirmDialog
                isOpen={dialogIsOpen7}
                type="danger"
                onClose={onDialogClose7}
                confirmButtonColor="red-600"
                onCancel={onDialogClose7}
                onConfirm={handleDeleteSubtask}
                title="Delete Subtask"
                onRequestClose={onDialogClose7}>
                <p> Are you sure you want to delete this Subtask? </p>
            </ConfirmDialog>

            <ConfirmDialog
                isOpen={dialogIsOpen6}
                type="danger"
                onClose={onDialogClose6}
                confirmButtonColor="red-600"
                onCancel={onDialogClose6}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                onRequestClose={onDialogClose6}>
                <p> Are you sure you want to delete this Task? </p>
            </ConfirmDialog>
        </div>
    );
};

export default GanttChart;