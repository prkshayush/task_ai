'use client'

import { useEffect, useState } from 'react'
import { Task } from '@/lib/types/task'
import { TaskCard } from '../components/TaskCard'
import { CreateTaskModal } from '../components/CreateTaskModal'
import axios from 'axios'
import { wsService } from '@/lib/websocket'

export default function Dashboard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {  headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setTasks(response.data)
        } catch (error) {
            console.error('Failed to fetch tasks:', error)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])
    
    useEffect(() => {
        wsService.connect(
            (task) => {
                setTasks(prev => [...prev, task])
            },
            // Handle task status updated
            (taskId, newStatus) => {
                setTasks(prev => prev.map(task => 
                    task.id === taskId 
                        ? { ...task, status: newStatus }
                        : task
                ))
            }
        )

        return () => wsService.disconnect()
    }, [])

    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            fetchTasks()
        } catch (error) {
            console.error('Failed to update task status:', error)
        }
    }

    const columns = {
        pending: tasks?.filter(task => task.status.toLowerCase() === 'pending'),
        in_progress: tasks?.filter(task => task.status.toLowerCase() === 'in_progress'),
        completed: tasks?.filter(task => task.status.toLowerCase() === 'completed')
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tasks</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Create Task
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {Object.entries(columns).map(([status, tasks]) => (
                    <div key={status} className="p-4 rounded-lg">
                        <h3 className="text-lg font-medium capitalize mb-4">
                            {status.replace('_', ' ')} ({tasks?.length})
                        </h3>
                        <div className="space-y-2">
                            {tasks?.map(task => (
                                <TaskCard 
                                    key={task.id} 
                                    task={task}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <CreateTaskModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTaskCreated={fetchTasks}
            />
        </div>
    )
}