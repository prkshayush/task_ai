type Task = {
    id: number
    title: string
    description: string
    user_id: number
    assigned_to: number | null
    status: string
    created_at: string
    updated_at: string
}

type TaskCreatedEvent = {
    type: 'task_created'
    task: Task
}

type TaskStatusUpdatedEvent = {
    type: 'task_status_updated'
    task_id: number
    status: string
}

type WSEvent = TaskCreatedEvent | TaskStatusUpdatedEvent

class WebSocketService {
    private ws: WebSocket | null = null
    private url: string
    private isConnecting: boolean = false

    constructor() {
        const wsProtocol = process.env.NEXT_PUBLIC_API_URL?.startsWith('https') ? 'wss' : 'ws'
        this.url = `${wsProtocol}://${process.env.NEXT_PUBLIC_API_URL?.replace('https://', '').replace('http://', '')}/ws`
    }

    connect(onTaskCreated: (task: Task) => void, onStatusUpdated: (taskId: number, status: string) => void) {
        if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) return;
        
        this.isConnecting = true
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
            console.log('WebSocket Connected')
        }

        this.ws.onmessage = (event) => {
            const data: WSEvent = JSON.parse(event.data)
            
            switch (data.type) {
                case 'task_created':
                    onTaskCreated(data.task)
                    break
                case 'task_status_updated':
                    onStatusUpdated(data.task_id, data.status)
                    break
                default:
                    console.log('Unknown event:', data)
            }
        }

        this.ws.onclose = () => {
            console.log('WebSocket Disconnected')
            setTimeout(() => this.connect(onTaskCreated, onStatusUpdated), 5000)
        }
    }

    disconnect() {
        this.ws?.close()
    }
}

export const wsService = new WebSocketService()