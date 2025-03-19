export interface Task {
    id: number
    title: string
    description: string
    user_id: number
    assigned_to: number | null
    status: string
    created_at: string
    updated_at: string
}