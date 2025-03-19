'use client'

import axios from 'axios'

interface TaskStatusSelectProps {
    currentStatus: 'pending' | 'in_progress' | 'completed'
    taskId: number
    onStatusChange: (id: number, status: string) => void
}

export function TaskStatusSelect({ currentStatus, taskId, onStatusChange }: TaskStatusSelectProps) {
    const statuses = ['pending', 'in_progress', 'completed']
    
    const handleChange = async (newStatus: string) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            onStatusChange(taskId, newStatus)
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    return (
        <select 
            value={currentStatus}
            onChange={(e) => handleChange(e.target.value)}
            className="text-xs border rounded p-1"
        >
            {statuses.map(status => (
                <option key={status} value={status}>
                    {status.replace('_', ' ')}
                </option>
            ))}
        </select>
    )
}