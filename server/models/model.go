package models

import "time"

type User struct {
	ID       int    `db:"id" json:"id"`
	Username string `db:"username" json:"username"`
	Password string `db:"password" json:"password"`
}

type Status string

const (
	InProgress Status = "in_progress"
	Completed  Status = "completed"
	Pending    Status = "pending"
)

type Task struct {
    ID          int        `db:"id" json:"id"`
    Title       string     `db:"title" json:"title"`
    Description string     `db:"description" json:"description"`
    UserID      int        `db:"user_id" json:"user_id"`
    AssignedTo  *int       `db:"assigned_to" json:"assigned_to"`
    Status      Status     `db:"status" json:"status"`
    CreatedAt   time.Time  `db:"created_at" json:"created_at"`
    UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
}
