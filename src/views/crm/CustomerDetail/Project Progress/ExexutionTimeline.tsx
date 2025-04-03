import React from 'react';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";

// Define a type for delay intervals
interface DelayInterval {
  start: Date;
  end: Date;
}

interface CustomTask extends Task {
  delays?: DelayInterval[];
}

const tasks: CustomTask[] = [
  {
    start: new Date(2024, 3, 1),
    end: new Date(2024, 3, 10),
    name: 'Development Phase',
    id: 'Task 1',
    type: 'task',
    progress: 60,
    styles: { progressColor: '#4caf50', progressSelectedColor: '#388e3c' },
    delays: [
      { start: new Date(2024, 3, 3), end: new Date(2024, 3, 4) },
      { start: new Date(2024, 3, 7), end: new Date(2024, 3, 8) },
    ],
  },
  {
    start: new Date(2024, 3, 1),
    end: new Date(2024, 3, 10),
    name: 'Phase',
    id: 'Task 1',
    type: 'task',
    progress: 60,
    styles: { progressColor: '#6366F1', progressSelectedColor: '#6366F1' },
    delays: [
      { start: new Date(2024, 3, 3), end: new Date(2024, 3, 4) },
      { start: new Date(2024, 3, 7), end: new Date(2024, 3, 8) },
    ],
  },
];

// Function to compute styles for delay overlays
const getCustomStyles = (task: CustomTask) => {
  let background = `linear-gradient(to right, #4caf50 ${task.progress}%, transparent ${task.progress}%)`;

  if (task.delays) {
    task.delays.forEach((delay) => {
      const totalDuration = task.end.getTime() - task.start.getTime();
      const delayStartPos = ((delay.start.getTime() - task.start.getTime()) / totalDuration) * 100;
      const delayEndPos = ((delay.end.getTime() - task.start.getTime()) / totalDuration) * 100;

      background += `, linear-gradient(to right, #6366F1 ${delayStartPos}%, #ff5722 ${delayEndPos}%)`;
    });
  }

  return {
    progressColor: 'transparent', // Hide default progress bar
    progressSelectedColor: 'transparent', // Hide selected state
    background,
  };
};

const CustomGanttChart: React.FC = () => {
  const customizedTasks = tasks.map((task) => ({
    ...task,
    styles: getCustomStyles(task),
  }));

  return (
    <div>
      <Gantt
        tasks={customizedTasks}
        viewMode={ViewMode.Day}
      />
    </div>
  );
};

export default CustomGanttChart;
