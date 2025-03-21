'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'

const taskSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    assignedTo: z.number().positive("Please select an assignee")
})

type TaskInput = z.infer<typeof taskSchema>

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    onTaskCreated: () => void
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const form = useForm<TaskInput>({
        resolver: zodResolver(taskSchema)
    })

    if (!isOpen) return null

    const onSubmit = async (data: TaskInput) => {
        try {
            setIsLoading(true)
            const token = localStorage.getItem('token')
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/task`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            onTaskCreated()
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-950/85 flex items-center justify-center">
            <div className="p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...form.register("title")}
                            placeholder="Task title"
                            className="w-full p-2 border rounded"
                        />
                        {form.formState.errors.title && (
                            <p>{form.formState.errors.title.message}</p>
                        )}
                    </div>
                    <div>
                        <textarea
                            {...form.register("description")}
                            placeholder="Task description"
                            className="w-full p-2 border rounded"
                        />
                        {form.formState.errors.description && (
                            <p>{form.formState.errors.description.message}</p>
                        )}
                    </div>
                    <div>
                        <input
                            type="number"
                            {...form.register("assignedTo", { valueAsNumber: true })}
                            placeholder="Assign to user ID"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                        >
                            {isLoading ? "Creating..." : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}