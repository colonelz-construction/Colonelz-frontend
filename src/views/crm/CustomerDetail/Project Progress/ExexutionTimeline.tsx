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
import { Tooltip } from "@/components/ui/tooltip";
import { Button, Dropdown, Notification, toast } from "@/components/ui";
import AddExecTask from "./AddExecTask";
import AddExecSubTask from "./AddExecSubTask";
import AddExecSubTaskDetails from "./AddExecSubTaskDetails";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import EditExecTask from "./EditExecTask";
import EditExecSubTask from "./EditExecSubTask";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { PiDotsThreeVerticalDuotone } from "react-icons/pi";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";
import { IoIosOptions } from "react-icons/io";
import EditExecSubTaskDetails from "./EditExecSubTaskDetails";
import { ConfirmDialog } from "@/components/shared";
import { apiDeleteCrmExecSubTask, apiDeleteCrmExecSubTaskDetail, apiDeleteCrmExecTask } from "@/services/CrmService";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";

import Tippy from '@tippyjs/react';
import { followCursor } from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css'; // Optional for animations
import 'tippy.js/animations/shift-away.css';
import domtoimage from 'dom-to-image-more';



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

const GanttChart = ({ execData }: any) => {
    console.log(execData)
    const [hoveredDelay, setHoveredDelay] = useState<{ start: Date, end: Date } | null>(null);
    const [view, setView] = useState<"days" | "weeks" | "months" | "years">("days");
    const headerRef = useRef<HTMLDivElement>(null);
    const chartAreaRef = useRef<HTMLDivElement>(null);
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [dialogIsOpen1, setIsOpen1] = useState(false)
    const [dialogIsOpen2, setIsOpen2] = useState(false)
    const [dialogIsOpen3, setIsOpen3] = useState(false)
    const [dialogIsOpen4, setIsOpen4] = useState(false)
    const [dialogIsOpen5, setIsOpen5] = useState(false)
    const [dialogIsOpen6, setIsOpen6] = useState(false)
    const [dialogIsOpen7, setIsOpen7] = useState(false)
    const [selectedTask, setSelectedTask] = useState<any>({});
    const [selectedSubTask, setSelectedSubTask] = useState<any>({});
    const [selectedDetail, setSelectedDetail] = useState<any>({});
    const cardRef = useRef<any>(null);
    const queryParams = new URLSearchParams(location.search);
    const project_id = queryParams.get('project_id')

    const org_id = localStorage.getItem("orgId")

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

    const openDialog3 = (task: any, subtask: any) => {
        setSelectedTask(task);
        setSelectedSubTask(subtask);
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
            ? new Date(Math.max(...dateObjects.map(d => d.getTime())))
            : new Date();
    };


    const startDate = getEarliestStartDate(execData);
    const endDate = getLatestEndDate(execData);
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
                    <div className="relative flex border-b border-gray-200">
                        {daysTimeline.monthHeaders.map(({ month, span }, i) => execData.length > 0 && (
                            <div
                                key={`month-${i}`}
                                className="text-center text-xs font-medium py-1 border-r border-gray-200"
                                style={{ minWidth: `${span * dayWidth}px` }}
                            >
                                {month}
                            </div>
                        ))}
                    </div>
                    <div className="relative flex border-b border-gray-300">
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
                                    className={`text-center text-xs border-r border-gray-300 relative ${isHighlighted || isLastDayOfDelay ? 'bg-blue-300 font-bold' : ''
                                        }`}
                                    style={{ minWidth: `${dayWidth}px` }}
                                >

                                    {execData.length > 0 && <div>

                                        <div>{day}</div>
                                        <div className="text-[0.6rem] opacity-70">{dayName}</div>
                                        <div
                                            className={`absolute top-0 bottom-0 w-px ${isHighlighted || isLastDayOfDelay ? 'bg-blue-700' : 'bg-gray-400 opacity-30'
                                                }`}
                                            style={{ left: "50%", transform: "translateX(-50%)" }}
                                        />

                                    </div>}
                                </div>
                            );
                        })}
                    </div>
                    {/* Enhanced highlight line */}
                    <div className="relative flex h-2 border-b border-gray-300">
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
                                    className={`border-r border-gray-300 ${isHighlighted || isLastDayOfDelay ? 'bg-blue-500' : 'bg-gray-100'
                                        }`}
                                    style={{ minWidth: `${dayWidth}px` }}
                                />
                            );
                        })}
                    </div>
                </>
            );
        } else {
            const otherTimeline = timeline as TimelineOtherView;
            return (
                <div className="relative flex border-b border-gray-300">
                    {otherTimeline.map(({ label, date }) => (
                        <div
                            key={date.toString()}
                            className="text-center text-xs border-r border-gray-300 relative"
                            style={{ minWidth: `${dayWidth}px` }}
                        >
                            {label}
                            <div
                                className="absolute top-0 bottom-0 w-px bg-gray-400 opacity-30"
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


            toast.push(
                <Notification closable type="success" duration={2000}>
                    Detail deleted successfully
                </Notification>, { placement: 'top-end' }
            )

            window.location.reload()


        } catch (error) {
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error deleting Detail
                </Notification>, { placement: 'top-end' }
            )
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


            toast.push(
                <Notification closable type="success" duration={2000}>
                    Detail deleted successfully
                </Notification>, { placement: 'top-end' }
            )

            window.location.reload()


        } catch (error) {
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error deleting Detail
                </Notification>, { placement: 'top-end' }
            )
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


            toast.push(
                <Notification closable type="success" duration={2000}>
                    Task deleted successfully
                </Notification>, { placement: 'top-end' }
            )

            window.location.reload()


        } catch (error) {
            toast.push(
                <Notification closable type="danger" duration={2000}>
                    Error deleting Task
                </Notification>, { placement: 'top-end' }
            )
        }

    }



    const handleDownload = () => {
        const node = cardRef.current;
      
        if (!node) return;
      
        // Save original styles
        const originalStyle = {
          height: node.style.height,
          overflow: node.style.overflow,
        };
      
        // Expand to full scroll content
        node.style.height = `${node.scrollHeight}px`;
        node.style.overflow = 'visible';
      
        domtoimage.toPng(node, {
          width: node.scrollWidth,
          height: node.scrollHeight,
          style: {
            transform: 'scale(1)', // ensures scaling doesn't crop
          },
        })
          .then((dataUrl: string) => {
            const link = document.createElement('a');
            link.download = 'ui-snapshot.png';
            link.href = dataUrl;
            link.click();
      
            // Restore original styles
            node.style.height = originalStyle.height;
            node.style.overflow = originalStyle.overflow;
          })
          .catch((error:any) => {
            console.error('UI download failed:', error);
            // Restore styles on failure too
            node.style.height = originalStyle.height;
            node.style.overflow = originalStyle.overflow;
          });
      };


    return (
        <div className="w-full p-4 bg-gray-100 rounded-lg">

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

                    <AddExecTask />
                    <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                    Download UI as PNG
                    </button>

                </div>


            </div>

            <div className="relative overflow-hidden border border-gray-900 rounded-lg"
                ref={cardRef}
            >
                <div
                    className="sticky top-0 z-20 bg-gray-100 border-b border-gray-300 overflow-hidden"
                    ref={headerRef}
                >
                    <div className="flex">
                        <div className="w-[22rem] shrink-0 border-r border-gray-300"></div>
                        <div className="w-[12rem] shrink-0 border-r border-gray-300"></div>
                        <div className="flex-1 min-w-max">
                            {renderTimelineHeader()}
                        </div>
                    </div>
                </div>

                <div className="flex overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div className="w-2 shrink-0 pr-[0.10rem] h-full sticky left-0 bg-slate-100 z-10">
                        {execData.map((task: any) => {
                            const subtaskCount = task.subtasks?.length || 1;
                            const totalHeight = subtaskCount * 65 + (subtaskCount - 1) * 1;
                            return (
                                <div
                                    key={task.task_id}
                                    className={`capitalize pl-2 font-bold text-lg border-b border-gray-200 bg-${task?.color ? task?.color : "rose-600"} bg-opacity-50 flex items-center justify-between mb-2`}
                                    style={{ height: `${totalHeight}px` }}
                                >

                                </div>
                            );
                        })}
                    </div>
                    <div className="w-[11.5rem] shrink-0 pr-[0.10rem] h-full sticky left-0 bg-slate-100 z-10">
                        {execData.map((task: any) => {
                            const subtaskCount = task.subtasks?.length || 1;
                            const totalHeight = subtaskCount * 65 + (subtaskCount - 1) * 1;
                            return (
                                <div
                                    key={task.task_id}
                                    className="capitalize pl-2 font-bold text-lg border-b border-gray-200 bg-white flex items-center justify-between mb-2"
                                    style={{ height: `${totalHeight}px` }}
                                >

                                    <span className={`break-all text-${task?.color ? task?.color : "rose-600"}`}>{task.task_name}</span>
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

                    <div className="w-[22rem] shrink-0 min-h-screen border-r-2 border-slate-500 sticky left-48 bg-slate-100 z-10">
                        {execData.map((task: any) => {
                            const subtaskCount = task.subtasks?.length || 0;
                            const totalHeight = subtaskCount * 65 + (subtaskCount - 1) * 1;
                            return (
                                <div
                                    key={`subtask-names-${task.task_id}`}
                                    className="bg-slate-100 mb-2"
                                    style={{ height: `${totalHeight}px` }}
                                >
                                    {task.subtasks?.map((subtask: any, subIndex: any) => {
                                        const maxLength = 100;
                                        let subtask_text = subtask.sub_task_name.length > maxLength
                                            ? subtask.sub_task_name.slice(0, maxLength - 3) + '...'
                                            : subtask.sub_task_name;


                                        return (
                                            <div
                                                key={`${subtask.sub_task_id}-${subIndex}-name`}
                                                className="text-wrap text-md flex items-center justify-between bg-slate-200 capitalize"
                                                style={{
                                                    height: '65px',
                                                    marginTop: subIndex > 0 ? '1px' : '0'
                                                }}
                                            >

                                                <span className="flex h-full w-full justify-between items-center gap-2">


                                                    <div className={`w-[4%] h-full bg-${subtask?.color ? subtask?.color : "blue-800"} bg-opacity-60`}>

                                                    </div>

                                                    <span className="flex w-[96%] justify-between items-center">
                                                        <span className={`font-semibold text-${subtask?.color ? subtask?.color : "blue-800"}`}>{subtask_text}</span>
                                                        <span className="">

                                                            <Dropdown renderTitle={<PiDotsThreeVerticalBold className="cursor-pointer font-bold mr-4" />} placement='bottom-end' >

                                                                <Dropdown.Item eventKey="c" onClick={() => openDialog2(task, subtask)}><span><MdEdit /></span><div className="text-sm">Edit Sub Task</div></Dropdown.Item>
                                                                <Dropdown.Item eventKey="a" onClick={() => openDialog3(task, subtask)}><span><MdAddCircle /></span><div className="text-sm">Add Details</div></Dropdown.Item>
                                                                <Dropdown.Item eventKey="d" onClick={() => openDialog7(task, subtask)}><span><MdDelete /></span><div className="text-sm">Delete</div></Dropdown.Item>
                                                                {/* <Dropdown.Item eventKey="b" onClick={() => openDialog2()}><div className="text-sm">Delete</div></Dropdown.Item> */}

                                                            </Dropdown>
                                                        </span>

                                                    </span>

                                                </span>

                                            </div>
                                        )
                                    }

                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className="flex-1 overflow-x-auto h-full overflow-y-hidden bg-slate-200 relative"
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
                                        className={`absolute top-0 bottom-0 w-px ${isHighlighted || isLastDayOfDelay ? 'bg-blue-700' : 'bg-gray-400 opacity-30'
                                            }`}
                                        style={{
                                            left: `${getLeftPosition(date)}px`,
                                            transform: 'translateX(-50%)',
                                        }}
                                    />
                                    {/* Additional highlighted line - appears for delay dates and one beyond */}
                                    {(isHighlighted || isLastDayOfDelay) && (
                                        <div
                                            className="absolute top-0 bottom-0 w-[0.100rem] bg-blue-500 z-10"
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
                            {execData.map((task: any) => {
                                const subtaskCount = task.subtasks?.length || 1;
                                const totalHeight = subtaskCount * 65 + (subtaskCount - 1) * 1;

                                return (
                                    <div
                                        key={task.task_id}
                                        className=""
                                        style={{ height: `${totalHeight}px` }}
                                    >
                                        <div
                                            className={`absolute h-full bg-${task?.color ? task?.color : "rose-800"} bg-opacity-50 `}
                                            style={{
                                                left: `${getLeftPosition(task.start_date)}px`,
                                                width: `${getWidth(task.start_date, task.end_date)}px`,
                                                height: `${totalHeight}px`
                                            }}
                                        />
                                        {task.subtasks?.map((subtask: any, subIndex: any) => (


                                            <div
                                                key={`${subtask.sub_task_id}-${subIndex}`}
                                                className={`${subIndex === 0 ? '' : 'mt-[0.07rem]'}`}
                                                style={{ height: '65px' }}
                                            >
                                                <div className="relative h-full w-[100%] flex items-center">
                                                    <div
                                                        className={`absolute h-[95%] bg-${subtask?.color ? subtask?.color : "blue-800"} bg-opacity-60 `}
                                                        style={{
                                                            left: `${getLeftPosition(subtask.sub_task_start_date)}px`,
                                                            width: `${getWidth(subtask.sub_task_start_date, subtask.sub_task_end_date)}px`,
                                                        }}
                                                    />
                                                    {subtask.sub_task_details?.map((delay: any, index: any) => (
                                                        <div
                                                            key={index}
                                                            className={` absolute h-[75%] ${delay.subtask_type == "Delay" ? "bg-zinc-700" : delay?.color ? "bg-" + delay?.color : "bg-green-400 bg-opacity-80"}  flex items-center justify-center`}
                                                            style={{
                                                                left: `${getLeftPosition(delay.subtask_details_start_date)}px`,
                                                                width: `${getWidth(delay.subtask_details_start_date, delay.subtask_details_end_date)}px`,
                                                            }}
                                                            onMouseEnter={() => setHoveredDelay({ start: safeParseDate(delay.subtask_details_start_date), end: safeParseDate(delay.subtask_details_end_date) })}
                                                            onMouseLeave={() => setHoveredDelay(null)}
                                                        >
                                                            <Tippy
                                                                content={`${delay.subtask_comment}: ${format(delay.subtask_details_start_date, "MMM d yyyy")} - ${format(delay.subtask_details_end_date, "MMM d yyyy")}`}
                                                                followCursor={true}
                                                                plugins={[followCursor]}
                                                                placement="top"
                                                                animation="shift-away"
                                                                delay={[100, 0]}
                                                                arrow={true}
                                                                interactive={true}
                                                                theme="light-border"
                                                            >
                                                                <span className="flex gap-2 items-center flex-wrap"
                                                                >
                                                                    <span
                                                                        className="capitalize text-white text-xs font-medium truncate px-1 cursor-pointer break-all text-ellipsis flex justify-center"
                                                                        style={{
                                                                            textTransform: 'capitalize',
                                                                            color: 'white',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 500,
                                                                            paddingLeft: '0.25rem',
                                                                            paddingRight: '0.25rem',
                                                                            paddingTop: '0.50rem', cursor: 'pointer',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            width: `${getWidth(delay.subtask_details_start_date, delay.subtask_details_end_date)}px`,
                                                                            display: 'inline-block',
                                                                        }}
                                                                    >
                                                                        <span>
                                                                            {delay?.subtask_comment}
                                                                        </span>

                                                                    </span>

                                                                    <span className="text-white cursor-pointer hover:text-blue-500 pl-[0.25rem]">
                                                                        <Dropdown renderTitle={<IoIosOptions className="cursor-pointer" />} placement='bottom-start' >

                                                                            <Dropdown.Item eventKey="c" onClick={() => openDialog4(task, subtask, delay)}><span><MdEdit /></span><div className="text-sm">Edit Details</div></Dropdown.Item>
                                                                            <Dropdown.Item eventKey="a" onClick={() => openDialog5(task, subtask, delay)}><span><MdDelete /></span><div className="text-sm">Delete</div></Dropdown.Item>
                                                                            {/* <Dropdown.Item eventKey="b" onClick={() => openDialog2()}><div className="text-sm">Delete</div></Dropdown.Item> */}

                                                                        </Dropdown>
                                                                    </span>



                                                                </span>
                                                            </Tippy>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <AddExecSubTask task={selectedTask} openDialog={openDialog} onDialogClose={onDialogClose} dialogIsOpen={dialogIsOpen} setIsOpen={setIsOpen} />
            <EditExecTask task={selectedTask} openDialog={openDialog1} onDialogClose={onDialogClose1} dialogIsOpen={dialogIsOpen1} setIsOpen={setIsOpen1} />
            <EditExecSubTask task={selectedTask} subtask={selectedSubTask} openDialog={openDialog2} onDialogClose={onDialogClose2} dialogIsOpen={dialogIsOpen2} setIsOpen={setIsOpen2} />
            <AddExecSubTaskDetails task={selectedTask} subtask={selectedSubTask} openDialog={openDialog3} onDialogClose={onDialogClose3} dialogIsOpen={dialogIsOpen3} setIsOpen={setIsOpen3} />
            <EditExecSubTaskDetails task={selectedTask} subtask={selectedSubTask} detail={selectedDetail} openDialog={openDialog4} onDialogClose={onDialogClose4} dialogIsOpen={dialogIsOpen4} setIsOpen={setIsOpen4} />
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