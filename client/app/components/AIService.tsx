'use client'

import { useState } from 'react'
import axios from 'axios'
import { Message } from '@/lib/types/message'
import { Task } from '@/lib/types/task'

interface AIServiceProps {
    tasks: Task[]
  }

export function AIService({ tasks }: AIServiceProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleTaskAnalysis = async (taskId: number) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task || isLoading) return

        try {
            setIsLoading(true)
            const userMessage: Message = { 
                role: 'user', 
                content: `Analyze task: ${task.title}`
            }
            setMessages(prev => [...prev, userMessage])

            const response = await axios.post('/api/ai-service', {
                prompt: `Analyze this task concisely:
                        Title: ${task.title}
                        Description: ${task.description}
                        
                        Provide only:
                        1. 3-4 key subtasks (one line each)
                        2. 2-3 Task suggestions (one line each)
                        
                        Keep response under 100 words.`
            })

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.data.response
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('AI analysis failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4">
            {isOpen ? (
                <div className="w-96 rounded-lg shadow-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Task Analysis</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500">×</button>
                    </div>
                    <div className="mb-4">
                        <select 
                            onChange={(e) => handleTaskAnalysis(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                            disabled={isLoading}
                        >
                            <option value="" className='bg-gray-900'>Select a task to analyze...</option>
                            {tasks?.map(task => (
                                <option className='bg-gray-900' key={task.id} value={task.id}>
                                    {task.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="h-80 overflow-y-auto mb-4 space-y-2">
                        {messages.map((msg, i) => (
                            <div key={i} className={`p-2 rounded ${
                                msg.role === 'assistant' ? 'bg-blue-500' : 'bg-gray-800'
                            }`}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
                >
                    Analyze Tasks
                </button>
            )}
        </div>
    )
}