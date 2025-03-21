'use client'

import { Task } from '@/lib/types/task'
import { TaskStatusSelect } from "./TaskStatusSelect"
import { useState } from 'react'
import axios from 'axios'

interface TaskCardProps {
    task: Task
    onStatusChange: (id: number, status: string) => void
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
    const [assignTo, setAssignTo] = useState<string>('')
    const [isAssigning, setIsAssigning] = useState(false)

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsAssigning(true)
            const token = localStorage.getItem('token')
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task/${task.id}/assign`,
                { assigned_to: parseInt(assignTo) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setAssignTo('')
        } catch (error) {
            console.error('Failed to assign task:', error)
        } finally {
            setIsAssigning(false)
        }
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800'
    }

    const normalizedStatus = task.status.toLowerCase() as keyof typeof statusColors

    return (
        <div className="p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{task.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[normalizedStatus]}`}>
                {task.status}
            </span>
        </div>
        <p className="text-gray-400 text-sm mb-3">{task.description}</p>
        <div className="flex justify-between gap-4 items-center text-xs text-gray-400">
            <div className="flex items-center gap-2">
                <span>Assigned to: {task.assigned_to ?? 'Unassigned'}</span>
                <form onSubmit={handleAssign} className="flex items-center gap-1">
                    <input
                        type="number"
                        value={assignTo}
                        onChange={(e) => setAssignTo(e.target.value)}
                        placeholder="User ID"
                        className="w-20 px-1 py-1 border rounded overflow-y-hidden"
                    />
                    <button
                        type="submit"
                        disabled={isAssigning || !assignTo}
                        className="px-2 py-1 bg-blue-500 text-gray-100 rounded disabled:opacity-80"
                    >
                        Assign
                    </button>
                </form>
            </div>
            <TaskStatusSelect
                currentStatus={normalizedStatus}
                taskId={task.id}
                onStatusChange={onStatusChange}
            />
        </div>
    </div>
    )
}