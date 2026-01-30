'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Plus } from 'lucide-react'
import Modal from './Modal'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'from-gray-600 to-gray-700' },
  { id: 'todo', title: 'To Do', color: 'from-blue-600 to-blue-700' },
  { id: 'inprogress', title: 'In Progress', color: 'from-purple-600 to-purple-700' },
  { id: 'done', title: 'Done', color: 'from-green-600 to-green-700' },
]

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design system setup',
    description: 'Create color palette, typography, and component library',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Add login, signup, and password reset flows',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Write unit tests',
    description: 'Add test coverage for core components and utilities',
    priority: 'medium',
  },
]

const priorityColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/50',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  high: 'bg-red-500/20 text-red-400 border-red-500/50',
}

export default function VibeKanbanDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    backlog: initialTasks,
    todo: [],
    inprogress: [],
    done: [],
  })
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragSource, setDragSource] = useState<string | null>(null)

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task)
    setDragSource(columnId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask || !dragSource || dragSource === targetColumnId) return

    setTasks(prev => {
      const newTasks = { ...prev }
      newTasks[dragSource!] = newTasks[dragSource!].filter(t => t.id !== draggedTask.id)
      newTasks[targetColumnId] = [...newTasks[targetColumnId], draggedTask]
      return newTasks
    })

    setDraggedTask(null)
    setDragSource(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragSource(null)
  }

  const totalTasks = Object.values(tasks).flat().length
  const completedTasks = tasks.done.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="card-glass rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-maia-primary/20"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
            <LayoutGrid className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Vibe Kanban</h3>
            <p className="text-white/60 text-sm">Interactive board with drag-drop tasks</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <LayoutGrid className="w-5 h-5" />
          Try It
        </button>
      </motion.div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Vibe Kanban Board">
        <div className="space-y-6">
          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-maia-accent">Project Progress</h4>
              <span className="text-sm text-white/70">
                {completedTasks} / {totalTasks} tasks completed
              </span>
            </div>
            <div className="h-3 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-maia-primary to-maia-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {columns.map((column) => (
              <div key={column.id}>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${column.color} text-white text-sm font-bold mb-3 text-center`}>
                  {column.title}
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {tasks[column.id].length}
                  </span>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                  className="space-y-2 min-h-[300px] bg-black/30 rounded-lg p-2 border-2 border-dashed border-white/10 transition-colors hover:border-maia-primary/30"
                >
                  {tasks[column.id].map((task) => (
                    <motion.div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.id)}
                      onDragEnd={handleDragEnd}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-glass rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-maia-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-sm">{task.title}</h5>
                        <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">{task.description}</p>
                    </motion.div>
                  ))}
                  {tasks[column.id].length === 0 && (
                    <div className="text-center py-8 text-white/30 text-sm">
                      Drag tasks here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card-glass rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <LayoutGrid className="w-5 h-5" />
              <span>Drag tasks between columns to update their status</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
