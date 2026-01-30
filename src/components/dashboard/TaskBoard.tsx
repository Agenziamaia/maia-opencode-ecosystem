import { useState, DragEvent } from 'react';
import { Task, TaskStatus, ExtendedTask } from '../../lib/types';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: ExtendedTask[];
  onMoveTask?: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskBoard({ tasks, onMoveTask }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: 'bg-gray-100 border-gray-300' },
    { status: 'inprogress', label: 'In Progress', color: 'bg-blue-50 border-blue-300' },
    { status: 'inreview', label: 'In Review', color: 'bg-purple-50 border-purple-300' },
    { status: 'done', label: 'Done', color: 'bg-green-50 border-green-300' },
    { status: 'cancelled', label: 'Cancelled', color: 'bg-red-50 border-red-300' },
  ];

  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    setDraggedTask(task);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (onMoveTask && taskId) {
      onMoveTask(taskId, status);
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: TaskStatus): ExtendedTask[] => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Task Board</h2>
        <div className="text-sm text-gray-600">
          {tasks.filter(t => t.status === 'inprogress').length} in progress
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map(column => (
          <div
            key={column.status}
            className={`rounded-lg border-2 p-4 min-h-[400px] ${column.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{column.label}</h3>
              <span className="px-2 py-1 bg-white rounded-full text-sm font-bold text-gray-700">
                {getTasksByStatus(column.status).length}
              </span>
            </div>

            <div className="space-y-3">
              {getTasksByStatus(column.status).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDragging={draggedTask?.id === task.id}
                  onDragStart={handleDragStart}
                />
              ))}

              {getTasksByStatus(column.status).length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
